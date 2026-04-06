import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { parseWebhookPayload } from "@/lib/evolution-api"

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

    // Find the asegurado by phone number (partial match to handle country code differences)
    const { data: asegurado } = await sb
      .from("asegurados")
      .select("id, telefono")
      .or(`telefono.ilike.%${msg.phone.slice(-10)}%`)
      .limit(1)
      .single()

    if (!asegurado) {
      // Unknown sender - log but don't create a denuncia
      console.log(`[Webhook] Mensaje de número desconocido: ${msg.phone}`)
      return NextResponse.json({ status: "unknown_sender", phone: msg.phone })
    }

    // Find the most recent active denuncia for this asegurado
    const { data: denuncia } = await sb
      .from("denuncias")
      .select("id")
      .eq("asegurado_id", asegurado.id)
      .not("estado", "in", '("Resuelto","Rechazado")')
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!denuncia) {
      console.log(`[Webhook] Sin denuncia activa para asegurado: ${asegurado.id}`)
      return NextResponse.json({ status: "no_active_claim", asegurado_id: asegurado.id })
    }

    // Save the incoming message
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const { error } = await sb.from("mensajes").insert({
      id: msgId,
      denuncia_id: denuncia.id,
      contenido: msg.messageText,
      direccion: "entrante",
      timestamp: new Date(msg.timestamp * 1000).toISOString(),
    })

    if (error) {
      console.error("[Webhook] Error guardando mensaje:", error)
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
    }

    return NextResponse.json({ status: "saved", message_id: msgId, denuncia_id: denuncia.id })
  } catch (err) {
    console.error("[Webhook] Error procesando webhook:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Evolution API may send a GET to verify the webhook
export async function GET() {
  return NextResponse.json({ status: "ok", service: "SegurosAR Webhook" })
}
