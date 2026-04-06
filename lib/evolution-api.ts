import { createServerSupabaseClient } from "./supabase"

// --- Config from Supabase ---

export interface EvolutionConfig {
  apiUrl: string
  apiKey: string
  instanceName: string
  webhookActivo: boolean
}

export async function getEvolutionConfig(): Promise<EvolutionConfig> {
  const sb = createServerSupabaseClient()
  const { data, error } = await sb
    .from("configuracion")
    .select("clave, valor")
    .in("clave", [
      "evolution_api_url",
      "evolution_api_key",
      "evolution_instance_name",
      "webhook_activo",
    ])

  if (error) throw error

  const map = new Map((data || []).map((r: { clave: string; valor: string }) => [r.clave, r.valor]))

  return {
    apiUrl: map.get("evolution_api_url") || "",
    apiKey: map.get("evolution_api_key") || "",
    instanceName: map.get("evolution_instance_name") || "",
    webhookActivo: map.get("webhook_activo") === "true",
  }
}

// --- Send message via Evolution API ---

export async function sendTextMessage(
  phone: string,
  message: string,
  config?: EvolutionConfig
) {
  const cfg = config || (await getEvolutionConfig())

  if (!cfg.apiUrl || !cfg.apiKey || !cfg.instanceName) {
    throw new Error("Evolution API no está configurada. Complete la configuración en Ajustes.")
  }

  const url = `${cfg.apiUrl}/message/sendText/${cfg.instanceName}`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: cfg.apiKey,
    },
    body: JSON.stringify({
      number: phone,
      text: message,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Evolution API error ${res.status}: ${body}`)
  }

  return res.json()
}

// --- Parse incoming webhook payload ---

export interface IncomingWhatsAppMessage {
  remoteJid: string
  phone: string
  pushName: string
  messageText: string
  messageId: string
  timestamp: number
}

export function parseWebhookPayload(body: Record<string, unknown>): IncomingWhatsAppMessage | null {
  // Evolution API sends different event types - we only care about messages
  const event = body.event as string | undefined
  if (event !== "messages.upsert") return null

  const data = body.data as Record<string, unknown> | undefined
  if (!data) return null

  const key = data.key as Record<string, unknown> | undefined
  const message = data.message as Record<string, unknown> | undefined

  if (!key || !message) return null

  // Skip messages sent by us
  if (key.fromMe) return null

  const remoteJid = (key.remoteJid as string) || ""
  // Extract phone number from JID (format: 5491112345678@s.whatsapp.net)
  const phone = remoteJid.replace("@s.whatsapp.net", "").replace("@g.us", "")

  // Get message text from different message types
  const conversation = message.conversation as string | undefined
  const extendedText = message.extendedTextMessage as Record<string, unknown> | undefined
  const messageText = conversation || (extendedText?.text as string) || ""

  if (!messageText) return null

  return {
    remoteJid,
    phone,
    pushName: (data.pushName as string) || "",
    messageText,
    messageId: (key.id as string) || "",
    timestamp: (data.messageTimestamp as number) || Math.floor(Date.now() / 1000),
  }
}
