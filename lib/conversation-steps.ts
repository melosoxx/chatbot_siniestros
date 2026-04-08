import type { PasoConversacion } from "./types"

export interface ConversationStep {
  key: PasoConversacion
  nextStep: PasoConversacion
  field: "tipo_siniestro" | "fecha_hecho" | "ubicacion" | "descripcion" | null
  configKey: string
}

export const CONVERSATION_STEPS: ConversationStep[] = [
  { key: "bienvenida",     nextStep: "tipo_siniestro", field: null,             configKey: "chatbot_mensaje_bienvenida" },
  { key: "tipo_siniestro", nextStep: "fecha_hecho",    field: "tipo_siniestro", configKey: "chatbot_prompt_tipo_siniestro" },
  { key: "fecha_hecho",    nextStep: "ubicacion",      field: "fecha_hecho",    configKey: "chatbot_prompt_fecha_hecho" },
  { key: "ubicacion",      nextStep: "descripcion",    field: "ubicacion",      configKey: "chatbot_prompt_ubicacion" },
  { key: "descripcion",    nextStep: "confirmacion",   field: "descripcion",    configKey: "chatbot_prompt_descripcion" },
  { key: "confirmacion",   nextStep: "completado",     field: null,             configKey: "chatbot_mensaje_confirmacion" },
]

export function getStep(paso: PasoConversacion): ConversationStep | undefined {
  return CONVERSATION_STEPS.find((s) => s.key === paso)
}

export function getNextStep(paso: PasoConversacion): ConversationStep | undefined {
  const current = getStep(paso)
  if (!current) return undefined
  return getStep(current.nextStep)
}
