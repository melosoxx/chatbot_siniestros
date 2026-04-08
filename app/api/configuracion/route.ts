import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET - Read all Evolution API config
export async function GET() {
  try {
    const sb = createServerSupabaseClient()
    const { data, error } = await sb.from("configuracion").select("clave, valor")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const config: Record<string, string> = {}
    for (const row of data || []) {
      config[row.clave] = row.valor
    }

    return NextResponse.json(config)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Error interno GET: ${message}` }, { status: 500 })
  }
}

// POST - Save Evolution API config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sb = createServerSupabaseClient()

    const keys = [
      "evolution_api_url",
      "evolution_api_key",
      "evolution_instance_name",
      "webhook_activo",
      "webhook_secret",
      // Chatbot IA
      "chatbot_activo",
      "chatbot_modelo",
      "chatbot_system_prompt",
      "chatbot_mensaje_bienvenida",
      "chatbot_prompt_tipo_siniestro",
      "chatbot_prompt_fecha_hecho",
      "chatbot_prompt_ubicacion",
      "chatbot_prompt_descripcion",
      "chatbot_mensaje_confirmacion",
    ]

    const results: Record<string, string> = {}

    for (const key of keys) {
      if (body[key] !== undefined) {
        const { error, count } = await sb
          .from("configuracion")
          .update({ valor: String(body[key]), updated_at: new Date().toISOString() })
          .eq("clave", key)

        if (error) {
          return NextResponse.json(
            { error: `Error saving ${key}: ${error.message}`, code: error.code, details: error.details, hint: error.hint },
            { status: 500 }
          )
        }
        results[key] = `updated (count: ${count})`
      }
    }

    return NextResponse.json({ status: "saved", results })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Error interno POST: ${message}` }, { status: 500 })
  }
}
