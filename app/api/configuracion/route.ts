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
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
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
    ]

    for (const key of keys) {
      if (body[key] !== undefined) {
        const { error } = await sb
          .from("configuracion")
          .upsert(
            { clave: key, valor: String(body[key]), updated_at: new Date().toISOString() },
            { onConflict: "clave" }
          )

        if (error) {
          return NextResponse.json({ error: `Error saving ${key}: ${error.message}` }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ status: "saved" })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
