import { getSupabaseClient, createServerSupabaseClient } from "./supabase"
import type {
  Agente,
  Asegurado,
  Denuncia,
  DenunciaConDetalles,
  PlantillaMensaje,
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

export async function fetchPlantillasMensajes(client?: SupabaseClient): Promise<PlantillaMensaje[]> {
  const { data, error } = await getClient(client).from("plantillas_mensajes").select("*")
  if (error) throw error
  return data as PlantillaMensaje[]
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

export async function getEstadisticas(client?: SupabaseClient) {
  const { data, error } = await getClient(client).from("denuncias").select("estado")
  if (error) throw error

  const list = data || []
  return {
    total: list.length,
    pendientes: list.filter((d: { estado: string }) => d.estado === "Pendiente").length,
    enRevision: list.filter((d: { estado: string }) => d.estado === "En revisión").length,
    resueltas: list.filter((d: { estado: string }) => d.estado === "Resuelto").length,
    rechazadas: list.filter((d: { estado: string }) => d.estado === "Rechazado").length,
    documentacionIncompleta: list.filter((d: { estado: string }) => d.estado === "Documentación incompleta").length,
  }
}

export async function getDenunciasPorDia(client?: SupabaseClient) {
  const hoy = new Date()
  const treintaDiasAtras = new Date()
  treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30)

  const { data, error } = await getClient(client)
    .from("denuncias")
    .select("created_at")
    .gte("created_at", treintaDiasAtras.toISOString())

  if (error) throw error

  const counts: Record<string, number> = {}
  for (const d of data || []) {
    const day = d.created_at.split("T")[0]
    counts[day] = (counts[day] || 0) + 1
  }

  const dias: { fecha: string; cantidad: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const fecha = new Date(hoy)
    fecha.setDate(fecha.getDate() - i)
    const fechaStr = fecha.toISOString().split("T")[0]
    dias.push({ fecha: fechaStr, cantidad: counts[fechaStr] || 0 })
  }

  return dias
}

export async function getDenunciasPorTipo(client?: SupabaseClient) {
  const { data, error } = await getClient(client).from("denuncias").select("tipo_siniestro")
  if (error) throw error

  const tipos = [
    "Robo",
    "Choque vehicular",
    "Incendio",
    "Inundación",
    "Daño por terceros",
    "Otro",
  ] as const

  return tipos.map((tipo) => ({
    tipo,
    cantidad: (data || []).filter((d: { tipo_siniestro: string }) => d.tipo_siniestro === tipo).length,
  }))
}

export async function getDenunciasActivasPorAgente(client?: SupabaseClient) {
  const sb = getClient(client)

  const [agentesRes, denunciasRes] = await Promise.all([
    sb.from("agentes").select("*"),
    sb.from("denuncias")
      .select("agente_asignado_id, estado")
      .not("estado", "in", '("Resuelto","Rechazado")'),
  ])

  return (agentesRes.data || []).map((agente: Agente) => ({
    ...agente,
    denuncias_activas: (denunciasRes.data || []).filter(
      (d: { agente_asignado_id: string | null }) => d.agente_asignado_id === agente.id
    ).length,
  }))
}
