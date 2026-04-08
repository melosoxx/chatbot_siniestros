import { createServerSupabaseClient } from "./supabase"
import { generateResponse, type ChatMessage } from "./claude"
import { getStep, CONVERSATION_STEPS } from "./conversation-steps"
import type { PasoConversacion, Conversacion, Mensaje } from "./types"

// --- Config loader ---

async function loadChatbotConfig(): Promise<Record<string, string>> {
  const sb = createServerSupabaseClient()
  const { data, error } = await sb
    .from("configuracion")
    .select("clave, valor")
    .like("clave", "chatbot_%")

  if (error) throw error

  const config: Record<string, string> = {}
  for (const row of data || []) {
    config[row.clave] = row.valor
  }
  return config
}

// --- Conversation state helpers ---

async function getActiveConversation(aseguradoId: string): Promise<Conversacion | null> {
  const sb = createServerSupabaseClient()
  const { data } = await sb
    .from("conversaciones")
    .select("*")
    .eq("asegurado_id", aseguradoId)
    .eq("activa", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  return data as Conversacion | null
}

async function createConversation(aseguradoId: string): Promise<Conversacion> {
  const sb = createServerSupabaseClient()
  const id = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  const { data, error } = await sb
    .from("conversaciones")
    .insert({
      id,
      asegurado_id: aseguradoId,
      paso_actual: "bienvenida",
      datos_parciales: {},
      activa: true,
    })
    .select()
    .single()

  if (error) throw error
  return data as Conversacion
}

async function updateConversation(
  id: string,
  updates: Partial<Pick<Conversacion, "paso_actual" | "datos_parciales" | "activa" | "denuncia_id">>
) {
  const sb = createServerSupabaseClient()
  const { error } = await sb
    .from("conversaciones")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
}

// --- Denuncia helpers ---

async function createDenuncia(aseguradoId: string): Promise<string> {
  const sb = createServerSupabaseClient()
  const id = `den-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const numero = `DEN-${Date.now()}`

  const { error } = await sb.from("denuncias").insert({
    id,
    numero_denuncia: numero,
    estado: "Pendiente",
    prioridad: "Media",
    asegurado_id: aseguradoId,
  })

  if (error) throw error
  return id
}

async function updateDenunciaField(denunciaId: string, field: string, value: string) {
  const sb = createServerSupabaseClient()
  const { error } = await sb
    .from("denuncias")
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq("id", denunciaId)

  if (error) throw error
}

async function getDenunciaNumero(denunciaId: string): Promise<string> {
  const sb = createServerSupabaseClient()
  const { data } = await sb
    .from("denuncias")
    .select("numero_denuncia")
    .eq("id", denunciaId)
    .single()

  return data?.numero_denuncia || "N/A"
}

// --- Message helpers ---

export async function saveMessage(
  denunciaId: string,
  contenido: string,
  direccion: "entrante" | "saliente",
  externalId?: string
): Promise<string> {
  const sb = createServerSupabaseClient()
  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  const row: Record<string, unknown> = {
    id,
    denuncia_id: denunciaId,
    contenido,
    direccion,
    timestamp: new Date().toISOString(),
  }
  if (externalId) row.external_id = externalId

  const { error } = await sb.from("mensajes").insert(row)

  if (error) throw error
  return id
}

async function getRecentMessages(denunciaId: string, limit = 20): Promise<Mensaje[]> {
  const sb = createServerSupabaseClient()
  const { data, error } = await sb
    .from("mensajes")
    .select("*")
    .eq("denuncia_id", denunciaId)
    .order("timestamp", { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data || []) as Mensaje[]
}

// --- JSON extraction from Claude response ---

interface ExtractionResult {
  extracted: boolean
  value?: string
}

function parseExtraction(response: string): { text: string; extraction: ExtractionResult } {
  const lines = response.trim().split("\n")
  const lastLine = lines[lines.length - 1].trim()

  try {
    // Try to parse the last line as JSON
    const json = JSON.parse(lastLine) as ExtractionResult
    if (typeof json.extracted === "boolean") {
      // Remove the JSON line from the user-facing text
      const text = lines.slice(0, -1).join("\n").trim()
      return { text, extraction: json }
    }
  } catch {
    // Not JSON — the whole response is text
  }

  return { text: response.trim(), extraction: { extracted: false } }
}

// --- Special commands ---

const CANCEL_KEYWORDS = ["cancelar", "cancel", "salir", "exit"]
const RESTART_KEYWORDS = ["reiniciar", "restart", "empezar de nuevo", "nueva denuncia"]

function matchesKeyword(text: string, keywords: string[]): boolean {
  const normalized = text.trim().toLowerCase()
  return keywords.some((kw) => normalized === kw || normalized.startsWith(kw + " "))
}

// --- Tipo siniestro validation ---

const TIPOS_SINIESTRO_VALIDOS = [
  "Robo",
  "Choque vehicular",
  "Incendio",
  "Inundación",
  "Daño por terceros",
  "Otro",
]

function validateTipoSiniestro(value: string): string | null {
  // Exact match
  const exact = TIPOS_SINIESTRO_VALIDOS.find(
    (t) => t.toLowerCase() === value.toLowerCase()
  )
  if (exact) return exact

  // Partial/fuzzy match
  const partial = TIPOS_SINIESTRO_VALIDOS.find(
    (t) => t.toLowerCase().includes(value.toLowerCase()) || value.toLowerCase().includes(t.toLowerCase())
  )
  return partial || null
}

// --- Safe Claude call with timeout ---

async function safeGenerateResponse(
  systemPrompt: string,
  messages: ChatMessage[],
  model?: string
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await generateResponse(systemPrompt, messages, model)
    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[ChatbotIA] Error llamando a Claude:", message)

    if (message.includes("abort") || message.includes("timeout")) {
      return "Estamos teniendo problemas técnicos. Por favor intentá de nuevo en unos minutos."
    }
    if (message.includes("rate") || message.includes("429")) {
      return "Estamos recibiendo muchas consultas en este momento. Intentá de nuevo en unos minutos."
    }
    return "Ocurrió un error procesando tu mensaje. Por favor intentá de nuevo."
  } finally {
    clearTimeout(timeout)
  }
}

// --- Main engine ---

export async function handleIncomingMessage(
  asegurado: { id: string; nombre_completo: string; telefono: string },
  messageText: string,
  externalMessageId?: string
): Promise<{ reply: string; denunciaId: string }> {
  const config = await loadChatbotConfig()
  const modelo = config.chatbot_modelo || undefined

  // 0. Check for cancel/restart commands on active conversation
  const existingConv = await getActiveConversation(asegurado.id)

  if (existingConv && matchesKeyword(messageText, CANCEL_KEYWORDS)) {
    await updateConversation(existingConv.id, { activa: false })
    const denunciaId = existingConv.denuncia_id || ""
    if (denunciaId) {
      await saveMessage(denunciaId, messageText, "entrante")
      const reply = "Tu denuncia fue cancelada. Si necesitás hacer una nueva, escribime en cualquier momento."
      await saveMessage(denunciaId, reply, "saliente")
      return { reply, denunciaId }
    }
    return { reply: "Tu denuncia fue cancelada. Si necesitás hacer una nueva, escribime en cualquier momento.", denunciaId: "" }
  }

  if (existingConv && matchesKeyword(messageText, RESTART_KEYWORDS)) {
    await updateConversation(existingConv.id, { activa: false })
    if (existingConv.denuncia_id) {
      await saveMessage(existingConv.denuncia_id, messageText, "entrante")
      const reply = "Reiniciando tu denuncia. Empecemos de nuevo."
      await saveMessage(existingConv.denuncia_id, reply, "saliente")
    }
    // Fall through to create a new conversation below
  }

  // 1. Get or create conversation
  let conversacion = existingConv && !matchesKeyword(messageText, RESTART_KEYWORDS)
    ? existingConv
    : null
  const isNew = !conversacion

  if (!conversacion) {
    conversacion = await createConversation(asegurado.id)
  }

  // 2. Create denuncia if needed (so we can link messages)
  if (!conversacion.denuncia_id) {
    const denunciaId = await createDenuncia(asegurado.id)
    conversacion.denuncia_id = denunciaId
    await updateConversation(conversacion.id, { denuncia_id: denunciaId })
  }

  const denunciaId = conversacion.denuncia_id!

  // 3. Handle welcome step (no user input needed, just send greeting)
  if (isNew && conversacion.paso_actual === "bienvenida") {
    const bienvenida = (config.chatbot_mensaje_bienvenida || "¡Hola! Soy el asistente de SegurosAR.")
      .replace("{nombre}", asegurado.nombre_completo.split(" ")[0])

    // Save the incoming message and the welcome reply
    await saveMessage(denunciaId, messageText, "entrante", externalMessageId)

    // Advance to the first question
    const firstQuestionStep = getStep("tipo_siniestro")!
    await updateConversation(conversacion.id, { paso_actual: "tipo_siniestro" })

    // Generate the first question using Claude
    const systemPrompt = config.chatbot_system_prompt || ""
    const stepPrompt = config[firstQuestionStep.configKey] || ""

    const firstQuestion = await safeGenerateResponse(
      `${systemPrompt}\n\n${stepPrompt}`,
      [{ role: "user", content: messageText }],
      modelo
    )

    const { text: questionText } = parseExtraction(firstQuestion)
    const reply = `${bienvenida}\n\n${questionText}`

    await saveMessage(denunciaId, reply, "saliente")
    return { reply, denunciaId }
  }

  // 4. Save incoming message
  await saveMessage(denunciaId, messageText, "entrante", externalMessageId)

  // 5. Get current step
  const currentStep = getStep(conversacion.paso_actual as PasoConversacion)

  if (!currentStep || conversacion.paso_actual === "completado") {
    // Conversation already done — start a new one
    await updateConversation(conversacion.id, { activa: false })
    const newConv = await createConversation(asegurado.id)
    const newDenunciaId = await createDenuncia(asegurado.id)
    await updateConversation(newConv.id, { denuncia_id: newDenunciaId })

    const bienvenida = (config.chatbot_mensaje_bienvenida || "¡Hola!")
      .replace("{nombre}", asegurado.nombre_completo.split(" ")[0])

    await saveMessage(newDenunciaId, bienvenida, "saliente")
    await updateConversation(newConv.id, { paso_actual: "tipo_siniestro" })

    return { reply: bienvenida, denunciaId: newDenunciaId }
  }

  // 6. Build messages history for context
  const recentMessages = await getRecentMessages(denunciaId)
  const chatHistory: ChatMessage[] = recentMessages.map((m) => ({
    role: m.direccion === "entrante" ? "user" as const : "assistant" as const,
    content: m.contenido,
  }))

  // 7. Call Claude with system prompt + step prompt
  const systemPrompt = config.chatbot_system_prompt || ""
  const stepPrompt = config[currentStep.configKey] || ""

  const response = await safeGenerateResponse(
    `${systemPrompt}\n\n${stepPrompt}`,
    chatHistory,
    modelo
  )

  const { text: replyText, extraction } = parseExtraction(response)

  // 8. If data was extracted, validate and save it, then advance
  if (extraction.extracted && extraction.value && currentStep.field) {
    let extractedValue = extraction.value

    // Validate tipo_siniestro against valid values
    if (currentStep.field === "tipo_siniestro") {
      const validated = validateTipoSiniestro(extractedValue)
      if (!validated) {
        // Invalid type — stay on this step and ask again
        const clarification = `No reconozco "${extractedValue}" como tipo de siniestro. Los tipos válidos son: ${TIPOS_SINIESTRO_VALIDOS.join(", ")}. ¿Cuál es el tuyo?`
        await saveMessage(denunciaId, clarification, "saliente")
        return { reply: clarification, denunciaId }
      }
      extractedValue = validated
    }

    // Update datos_parciales
    const newDatos = { ...conversacion.datos_parciales, [currentStep.field]: extractedValue }

    // Update the denuncia field directly
    await updateDenunciaField(denunciaId, currentStep.field, extractedValue)

    // Check if this is the last data step (descripcion -> confirmacion)
    if (currentStep.nextStep === "confirmacion") {
      // All data collected — finalize
      const numeroDenuncia = await getDenunciaNumero(denunciaId)
      const confirmacion = (config.chatbot_mensaje_confirmacion || "Tu denuncia fue registrada.")
        .replace("{numero_denuncia}", numeroDenuncia)

      await updateConversation(conversacion.id, {
        paso_actual: "completado",
        datos_parciales: newDatos,
        activa: false,
      })

      // Update denuncia estado
      await updateDenunciaField(denunciaId, "estado", "En revisión")

      const finalReply = `${replyText}\n\n${confirmacion}`
      await saveMessage(denunciaId, finalReply, "saliente")
      return { reply: finalReply, denunciaId }
    }

    // Advance to next step
    await updateConversation(conversacion.id, {
      paso_actual: currentStep.nextStep,
      datos_parciales: newDatos,
    })

    // Generate the next question
    const nextStep = getStep(currentStep.nextStep)
    if (nextStep) {
      const nextStepPrompt = config[nextStep.configKey] || ""
      const nextResponse = await safeGenerateResponse(
        `${systemPrompt}\n\n${nextStepPrompt}`,
        [...chatHistory, { role: "assistant", content: replyText }],
        modelo
      )
      const { text: nextQuestionText } = parseExtraction(nextResponse)
      const fullReply = `${replyText}\n\n${nextQuestionText}`
      await saveMessage(denunciaId, fullReply, "saliente")
      return { reply: fullReply, denunciaId }
    }

    await saveMessage(denunciaId, replyText, "saliente")
    return { reply: replyText, denunciaId }
  }

  // 9. Data not extracted — stay on same step, Claude already asked for clarification
  await saveMessage(denunciaId, replyText, "saliente")
  return { reply: replyText, denunciaId }
}
