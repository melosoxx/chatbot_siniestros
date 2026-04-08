import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

// Modelos disponibles para selección desde el dashboard
export const AVAILABLE_MODELS = [
  { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4 (Recomendado)" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (Más rápido y económico)" },
] as const

const DEFAULT_MODEL = "claude-sonnet-4-20250514"

export async function generateResponse(
  systemPrompt: string,
  messages: ChatMessage[],
  model?: string
): Promise<string> {
  const response = await client.messages.create({
    model: model || DEFAULT_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  const textBlock = response.content.find((block) => block.type === "text")
  return textBlock ? textBlock.text : ""
}
