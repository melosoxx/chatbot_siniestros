// Types for the Claims Management System

export type TipoSiniestro = 
  | "Robo"
  | "Choque vehicular"
  | "Incendio"
  | "Inundación"
  | "Daño por terceros"
  | "Otro"

export type EstadoDenuncia = 
  | "Pendiente"
  | "En revisión"
  | "Documentación incompleta"
  | "Resuelto"
  | "Rechazado"

export type Prioridad = "Alta" | "Media" | "Baja"

export type RolAgente = "admin" | "agente"

export type DireccionMensaje = "entrante" | "saliente"

export interface Asegurado {
  id: string
  nombre_completo: string
  dni: string
  telefono: string
  email: string
  numero_poliza: string
}

export interface Agente {
  id: string
  nombre: string
  email: string
  rol: RolAgente
  activo: boolean
  avatar?: string
}

export interface Archivo {
  id: string
  denuncia_id: string
  nombre_archivo: string
  tipo: "imagen" | "documento"
  url: string
  created_at: string
}

export interface Mensaje {
  id: string
  denuncia_id: string
  contenido: string
  direccion: DireccionMensaje
  timestamp: string
  external_id?: string | null
}

export interface NotaInterna {
  id: string
  denuncia_id: string
  contenido: string
  autor: string
  autor_id: string
  created_at: string
}

export interface HistorialCambio {
  id: string
  denuncia_id: string
  tipo: "estado" | "asignacion" | "prioridad" | "nota"
  descripcion: string
  autor: string
  created_at: string
}

export interface Denuncia {
  id: string
  numero_denuncia: string
  tipo_siniestro: TipoSiniestro
  estado: EstadoDenuncia
  prioridad: Prioridad
  descripcion: string
  fecha_hecho: string
  ubicacion: string
  agente_asignado_id: string | null
  asegurado_id: string
  created_at: string
  updated_at: string
}

// Extended types for views with joined data
export interface DenunciaConDetalles extends Denuncia {
  asegurado: Asegurado
  agente_asignado: Agente | null
  archivos: Archivo[]
  mensajes: Mensaje[]
  notas: NotaInterna[]
  historial: HistorialCambio[]
}

export interface PlantillaMensaje {
  id: string
  nombre: string
  contenido: string
  created_at: string
}

export interface ConfiguracionWebhook {
  url: string
  token: string
  activo: boolean
}

// Chatbot IA

export type PasoConversacion =
  | "bienvenida"
  | "tipo_siniestro"
  | "fecha_hecho"
  | "ubicacion"
  | "descripcion"
  | "confirmacion"
  | "completado"

export interface Conversacion {
  id: string
  asegurado_id: string
  denuncia_id: string | null
  paso_actual: PasoConversacion
  datos_parciales: Partial<{
    tipo_siniestro: string
    fecha_hecho: string
    ubicacion: string
    descripcion: string
  }>
  activa: boolean
  created_at: string
  updated_at: string
}
