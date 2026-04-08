import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { updateAsegurado, deleteAsegurado } from "@/lib/supabase-queries"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const sb = createServerSupabaseClient()
    const asegurado = await updateAsegurado(id, body, sb)
    return NextResponse.json(asegurado)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sb = createServerSupabaseClient()
    await deleteAsegurado(id, sb)
    return NextResponse.json({ status: "deleted" })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
