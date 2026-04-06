import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { sendTextMessage, getEvolutionConfig } from "@/lib/evolution-api"

export async function POST(request: NextRequest) {
  try {
    const { denuncia_id, contenido, telefono } = await request.json()

    if (!denuncia_id || !contenido || !telefono) {
      return NextResponse.json(
        { error: "Faltan campos: denuncia_id, contenido, telefono" },
        { status: 400 }
      )
    }

    // Get Evolution API config from Supabase
    const config = await getEvolutionConfig()

    if (!config.webhookActivo) {
      return NextResponse.json(
        { error: "El webhook está desactivado" },
        { status: 400 }
      )
    }

    // Send via Evolution API
    await sendTextMessage(telefono, contenido, config)

    // Save outgoing message to Supabase
    const sb = createServerSupabaseClient()
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    const { error } = await sb.from("mensajes").insert({
      id: msgId,
      denuncia_id,
      contenido,
      direccion: "saliente",
      timestamp: new Date().toISOString(),
    })

    if (error) {
      console.error("[SendMessage] Error guardando mensaje:", error)
      return NextResponse.json({ error: "Mensaje enviado pero error al guardar" }, { status: 500 })
    }

    return NextResponse.json({ status: "sent", message_id: msgId })
  } catch (err) {
    console.error("[SendMessage] Error:", err)
    const message = err instanceof Error ? err.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
