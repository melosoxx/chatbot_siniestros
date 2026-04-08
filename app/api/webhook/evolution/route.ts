import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { parseWebhookPayload, sendTextMessage, getEvolutionConfig } from "@/lib/evolution-api"
import { handleIncomingMessage } from "@/lib/conversation-engine"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Parse the Evolution API webhook payload
    const msg = parseWebhookPayload(body)

    // Not a text message we care about (could be status update, etc.)
    if (!msg) {
      return NextResponse.json({ status: "ignored" })
    }

    const sb = createServerSupabaseClient()

    // Deduplication: skip if we already processed this message
    if (msg.messageId) {
      const { data: existing } = await sb
        .from("mensajes")
        .select("id")
        .eq("external_id", msg.messageId)
        .limit(1)
        .maybeSingle()

      if (existing) {
        return NextResponse.json({ status: "duplicate", messageId: msg.messageId })
      }
    }

    // Check if chatbot is active
    const { data: chatbotConfig } = await sb
      .from("configuracion")
      .select("valor")
      .eq("clave", "chatbot_activo")
      .single()

    const chatbotActivo = chatbotConfig?.valor === "true"

    // Find the asegurado by phone number (partial match to handle country code differences)
    const { data: asegurado } = await sb
      .from("asegurados")
      .select("id, nombre_completo, telefono")
      .or(`telefono.ilike.%${msg.phone.slice(-10)}%`)
      .limit(1)
      .single()

    if (!asegurado) {
      console.log(`[Webhook] Mensaje de número desconocido: ${msg.phone}`)

      // If chatbot is active, send a "not registered" message
      if (chatbotActivo) {
        try {
          const evoConfig = await getEvolutionConfig()
          await sendTextMessage(
            msg.phone,
            "No encontramos tu número en nuestro sistema. Por favor contactá a tu asegurador para registrarte.",
            evoConfig
          )
        } catch (sendErr) {
          console.error("[Webhook] Error enviando mensaje a número desconocido:", sendErr)
        }
      }

      return NextResponse.json({ status: "unknown_sender", phone: msg.phone })
    }

    // If chatbot is NOT active, fall back to old behavior (just save message)
    if (!chatbotActivo) {
      const { data: denuncia } = await sb
        .from("denuncias")
        .select("id")
        .eq("asegurado_id", asegurado.id)
        .not("estado", "in", '("Resuelto","Rechazado")')
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (!denuncia) {
        return NextResponse.json({ status: "no_active_claim", asegurado_id: asegurado.id })
      }

      const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      await sb.from("mensajes").insert({
        id: msgId,
        denuncia_id: denuncia.id,
        contenido: msg.messageText,
        direccion: "entrante",
        timestamp: new Date(msg.timestamp * 1000).toISOString(),
      })

      return NextResponse.json({ status: "saved", message_id: msgId, denuncia_id: denuncia.id })
    }

    // --- Chatbot IA active: handle with conversation engine ---

    const { reply, denunciaId } = await handleIncomingMessage(
      { id: asegurado.id, nombre_completo: asegurado.nombre_completo, telefono: asegurado.telefono },
      msg.messageText,
      msg.messageId
    )

    // Send the reply via WhatsApp
    try {
      const evoConfig = await getEvolutionConfig()
      await sendTextMessage(msg.phone, reply, evoConfig)
    } catch (sendErr) {
      console.error("[Webhook] Error enviando respuesta por WhatsApp:", sendErr)
      // Message is already saved in DB by the engine, just the WhatsApp delivery failed
    }

    return NextResponse.json({ status: "replied", denuncia_id: denunciaId })
  } catch (err) {
    console.error("[Webhook] Error procesando webhook:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Evolution API may send a GET to verify the webhook
export async function GET() {
  return NextResponse.json({ status: "ok", service: "SegurosAR Webhook" })
}
