import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { fetchAsegurados, createAsegurado } from "@/lib/supabase-queries"

export async function GET() {
  try {
    const sb = createServerSupabaseClient()
    const data = await fetchAsegurados(sb)
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre_completo, dni, telefono, email, numero_poliza } = body

    if (!nombre_completo || !dni || !telefono) {
      return NextResponse.json(
        { error: "nombre_completo, dni y telefono son obligatorios" },
        { status: 400 }
      )
    }

    const sb = createServerSupabaseClient()
    const asegurado = await createAsegurado(
      { nombre_completo, dni, telefono, email: email || "", numero_poliza: numero_poliza || "" },
      sb
    )
    return NextResponse.json(asegurado, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
