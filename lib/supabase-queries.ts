import { getSupabaseClient, createServerSupabaseClient } from "./supabase"
import type {
  Agente,
  Asegurado,
  Denuncia,
  DenunciaConDetalles,
} from "./types"

type SupabaseClient = ReturnType<typeof createServerSupabaseClient>

function getClient(client?: SupabaseClient) {
  return client || getSupabaseClient()
}

// --- Raw data fetchers ---

export async function fetchAgentes(client?: SupabaseClient): Promise<Agente[]> {
  const { data, error } = await getClient(client).from("agentes").select("*")
  if (error) throw error
  return data as Agente[]
}

export async function fetchAsegurados(client?: SupabaseClient): Promise<Asegurado[]> {
  const { data, error } = await getClient(client).from("asegurados").select("*")
  if (error) throw error
  return data as Asegurado[]
}

export async function fetchDenuncias(client?: SupabaseClient): Promise<Denuncia[]> {
  const { data, error } = await getClient(client).from("denuncias").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return data as Denuncia[]
}

// --- Asegurados CRUD ---

export async function createAsegurado(
  asegurado: Omit<Asegurado, "id">,
  client?: SupabaseClient
): Promise<Asegurado> {
  const { data, error } = await getClient(client)
    .from("asegurados")
    .insert(asegurado)
    .select()
    .single()
  if (error) throw error
  return data as Asegurado
}

export async function updateAsegurado(
  id: string,
  updates: Partial<Omit<Asegurado, "id">>,
  client?: SupabaseClient
): Promise<Asegurado> {
  const { data, error } = await getClient(client)
    .from("asegurados")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as Asegurado
}

export async function deleteAsegurado(
  id: string,
  client?: SupabaseClient
): Promise<void> {
  const { error } = await getClient(client)
    .from("asegurados")
    .delete()
    .eq("id", id)
  if (error) throw error
}

// --- Composed queries ---

export async function getDenunciaConDetalles(
  denunciaId: string,
  client?: SupabaseClient
): Promise<DenunciaConDetalles | null> {
  const sb = getClient(client)

  const { data: denuncia, error } = await sb
    .from("denuncias")
    .select("*")
    .eq("id", denunciaId)
    .single()

  if (error || !denuncia) return null

  const [aseguradoRes, agenteRes, archivosRes, mensajesRes, notasRes, historialRes] =
    await Promise.all([
      sb.from("asegurados").select("*").eq("id", denuncia.asegurado_id).single(),
      denuncia.agente_asignado_id
        ? sb.from("agentes").select("*").eq("id", denuncia.agente_asignado_id).single()
        : Promise.resolve({ data: null, error: null }),
      sb.from("archivos").select("*").eq("denuncia_id", denunciaId).order("created_at"),
      sb.from("mensajes").select("*").eq("denuncia_id", denunciaId).order("timestamp"),
      sb.from("notas_internas").select("*").eq("denuncia_id", denunciaId).order("created_at"),
      sb.from("historial_cambios").select("*").eq("denuncia_id", denunciaId).order("created_at"),
    ])

  return {
    ...denuncia,
    asegurado: aseguradoRes.data!,
    agente_asignado: agenteRes.data || null,
    archivos: archivosRes.data || [],
    mensajes: mensajesRes.data || [],
    notas: notasRes.data || [],
    historial: historialRes.data || [],
  } as DenunciaConDetalles
}

export async function getDenunciasConAsegurado(client?: SupabaseClient) {
  const sb = getClient(client)

  const [denunciasRes, aseguradosRes, agentesRes] = await Promise.all([
    sb.from("denuncias").select("*").order("created_at", { ascending: false }),
    sb.from("asegurados").select("id, nombre_completo"),
    sb.from("agentes").select("id, nombre"),
  ])

  const aseguradosMap = new Map(
    (aseguradosRes.data || []).map((a: { id: string; nombre_completo: string }) => [a.id, a.nombre_completo])
  )
  const agentesMap = new Map(
    (agentesRes.data || []).map((a: { id: string; nombre: string }) => [a.id, a.nombre])
  )

  return (denunciasRes.data || []).map((d: Denuncia) => ({
    ...d,
    asegurado_nombre: aseguradosMap.get(d.asegurado_id) || "Desconocido",
    agente_nombre: d.agente_asignado_id
      ? agentesMap.get(d.agente_asignado_id) || "Sin asignar"
      : "Sin asignar",
  }))
}
