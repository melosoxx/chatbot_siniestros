"use client"

import { useState, useEffect } from "react"
import {
  Webhook,
  Save,
  Copy,
  Check,
  Loader2,
  Bot,
  MessageSquare,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from "sonner"

const CHATBOT_MODELS = [
  { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4 (Recomendado)" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (Más rápido y económico)" },
]

const STEP_LABELS: Record<string, { title: string; description: string }> = {
  chatbot_prompt_tipo_siniestro: {
    title: "Tipo de siniestro",
    description: "El bot pregunta qué tipo de siniestro quiere denunciar (Robo, Choque, Incendio, etc.)",
  },
  chatbot_prompt_fecha_hecho: {
    title: "Fecha del hecho",
    description: "El bot pregunta cuándo ocurrió el siniestro",
  },
  chatbot_prompt_ubicacion: {
    title: "Ubicación",
    description: "El bot pregunta dónde ocurrió el siniestro",
  },
  chatbot_prompt_descripcion: {
    title: "Descripción",
    description: "El bot pide una descripción detallada de lo que pasó",
  },
}

export default function ConfiguracionPage() {
  // Evolution API state
  const [evolutionUrl, setEvolutionUrl] = useState("")
  const [evolutionApiKey, setEvolutionApiKey] = useState("")
  const [evolutionInstanceName, setEvolutionInstanceName] = useState("")
  const [webhookActivo, setWebhookActivo] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [webhookUrl, setWebhookUrl] = useState("/api/webhook/evolution")

  // Chatbot IA state
  const [chatbotActivo, setChatbotActivo] = useState(false)
  const [chatbotModelo, setChatbotModelo] = useState("claude-sonnet-4-20250514")
  const [chatbotSystemPrompt, setChatbotSystemPrompt] = useState("")
  const [chatbotBienvenida, setChatbotBienvenida] = useState("")
  const [chatbotConfirmacion, setChatbotConfirmacion] = useState("")
  const [chatbotStepPrompts, setChatbotStepPrompts] = useState<Record<string, string>>({
    chatbot_prompt_tipo_siniestro: "",
    chatbot_prompt_fecha_hecho: "",
    chatbot_prompt_ubicacion: "",
    chatbot_prompt_descripcion: "",
  })
  const [savingChatbot, setSavingChatbot] = useState(false)

  useEffect(() => {
    setWebhookUrl(`${window.location.origin}/api/webhook/evolution`)
  }, [])

  useEffect(() => {
    fetch("/api/configuracion")
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          toast.error(`Error cargando config: ${data.error || res.statusText}`, { duration: 10000 })
          return
        }
        // Evolution API
        setEvolutionUrl(data.evolution_api_url || "")
        setEvolutionApiKey(data.evolution_api_key || "")
        setEvolutionInstanceName(data.evolution_instance_name || "")
        setWebhookActivo(data.webhook_activo !== "false")
        // Chatbot IA
        setChatbotActivo(data.chatbot_activo === "true")
        setChatbotModelo(data.chatbot_modelo || "claude-sonnet-4-20250514")
        setChatbotSystemPrompt(data.chatbot_system_prompt || "")
        setChatbotBienvenida(data.chatbot_mensaje_bienvenida || "")
        setChatbotConfirmacion(data.chatbot_mensaje_confirmacion || "")
        setChatbotStepPrompts({
          chatbot_prompt_tipo_siniestro: data.chatbot_prompt_tipo_siniestro || "",
          chatbot_prompt_fecha_hecho: data.chatbot_prompt_fecha_hecho || "",
          chatbot_prompt_ubicacion: data.chatbot_prompt_ubicacion || "",
          chatbot_prompt_descripcion: data.chatbot_prompt_descripcion || "",
        })
      })
      .catch((err) => {
        toast.error(`Error de conexión: ${err.message}`, { duration: 10000 })
      })
      .finally(() => setLoadingConfig(false))
  }, [])

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evolution_api_url: evolutionUrl,
          evolution_api_key: evolutionApiKey,
          evolution_instance_name: evolutionInstanceName,
          webhook_activo: String(webhookActivo),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(`Error guardando: ${data.error || res.statusText}`, { duration: 10000 })
        return
      }

      toast.success("Configuración de Evolution API guardada")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      toast.error(`Error de conexión: ${message}`, { duration: 10000 })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveChatbot = async () => {
    setSavingChatbot(true)
    try {
      const res = await fetch("/api/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatbot_activo: String(chatbotActivo),
          chatbot_modelo: chatbotModelo,
          chatbot_system_prompt: chatbotSystemPrompt,
          chatbot_mensaje_bienvenida: chatbotBienvenida,
          chatbot_mensaje_confirmacion: chatbotConfirmacion,
          ...chatbotStepPrompts,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(`Error guardando: ${data.error || res.statusText}`, { duration: 10000 })
        return
      }

      toast.success("Configuración del chatbot guardada")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      toast.error(`Error de conexión: ${message}`, { duration: 10000 })
    } finally {
      setSavingChatbot(false)
    }
  }

  const updateStepPrompt = (key: string, value: string) => {
    setChatbotStepPrompts((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Conexión con Evolution API y configuración del Chatbot IA
        </p>
      </div>

      {/* Webhook URL Card */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-base">URL de Webhook para Evolution API</CardTitle>
          <CardDescription>
            Copiá esta URL y pegala en la configuración de webhook de tu instancia de Evolution API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-sm font-mono">
              {webhookUrl}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(webhookUrl, "webhook-url")}
            >
              {copied === "webhook-url" ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Esta URL solo funcionará cuando la app esté deployada (ej: en Netlify). En desarrollo local, usá un túnel como ngrok.
          </p>
        </CardContent>
      </Card>

      {/* Evolution API Card */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Conexión con Evolution API</CardTitle>
              <CardDescription>
                Ingresá los datos de tu instancia de Evolution API para enviar y recibir mensajes de WhatsApp
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingConfig ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label>Estado de la conexión</Label>
                  <p className="text-sm text-muted-foreground">
                    Activar o desactivar el envío/recepción de mensajes
                  </p>
                </div>
                <Switch
                  checked={webhookActivo}
                  onCheckedChange={setWebhookActivo}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="evo-url">URL de Evolution API</Label>
                <Input
                  id="evo-url"
                  value={evolutionUrl}
                  onChange={(e) => setEvolutionUrl(e.target.value)}
                  placeholder="https://evolutionapi.naviacloud.com"
                />
                <p className="text-xs text-muted-foreground">
                  La URL base de tu instancia de Evolution API (sin /message ni /instance al final)
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="evo-instance">Nombre de instancia</Label>
                <Input
                  id="evo-instance"
                  value={evolutionInstanceName}
                  onChange={(e) => setEvolutionInstanceName(e.target.value)}
                  placeholder="Ej: mi-instancia"
                />
                <p className="text-xs text-muted-foreground">
                  El nombre de la instancia configurada en Evolution API
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="evo-apikey">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="evo-apikey"
                    type="password"
                    value={evolutionApiKey}
                    onChange={(e) => setEvolutionApiKey(e.target.value)}
                    placeholder="Tu API Key de Evolution API"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(evolutionApiKey, "apikey")}
                  >
                    {copied === "apikey" ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  La clave de autenticación (apikey) de tu instancia
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveConfig} disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Guardar configuración
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chatbot IA Card */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Chatbot IA</CardTitle>
              <CardDescription>
                Configurá el comportamiento del chatbot que responde automáticamente por WhatsApp
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingConfig ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-6">
              {/* Toggle on/off */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label>Chatbot activo</Label>
                  <p className="text-sm text-muted-foreground">
                    Cuando está activo, el bot responde automáticamente a los asegurados por WhatsApp
                  </p>
                </div>
                <Switch
                  checked={chatbotActivo}
                  onCheckedChange={setChatbotActivo}
                />
              </div>

              {/* Model selector */}
              <div className="grid gap-2">
                <Label>Modelo de IA</Label>
                <Select value={chatbotModelo} onValueChange={setChatbotModelo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHATBOT_MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Sonnet es más preciso, Haiku es más rápido y económico
                </p>
              </div>

              {/* System prompt */}
              <div className="grid gap-2">
                <Label htmlFor="system-prompt">Instrucciones generales del bot</Label>
                <Textarea
                  id="system-prompt"
                  value={chatbotSystemPrompt}
                  onChange={(e) => setChatbotSystemPrompt(e.target.value)}
                  placeholder="Sos un asistente virtual de SegurosAR..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Estas instrucciones definen la personalidad y comportamiento general del bot en todas las conversaciones
                </p>
              </div>

              {/* Welcome message */}
              <div className="grid gap-2">
                <Label htmlFor="bienvenida">Mensaje de bienvenida</Label>
                <Textarea
                  id="bienvenida"
                  value={chatbotBienvenida}
                  onChange={(e) => setChatbotBienvenida(e.target.value)}
                  placeholder="¡Hola {nombre}! Soy el asistente virtual..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Primer mensaje que recibe el asegurado. Usá <code className="rounded bg-muted px-1">{"{nombre}"}</code> para insertar el nombre del asegurado
                </p>
              </div>

              {/* Step prompts */}
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <Label>Preguntas del flujo</Label>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Configurá las instrucciones que recibe la IA para cada paso de la conversación. El bot usa estas instrucciones para generar preguntas naturales.
                </p>
                <Accordion type="multiple" className="w-full">
                  {Object.entries(STEP_LABELS).map(([key, { title, description }]) => (
                    <AccordionItem key={key} value={key}>
                      <AccordionTrigger className="text-sm">
                        {title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-2 pt-2">
                          <p className="text-xs text-muted-foreground">{description}</p>
                          <Textarea
                            value={chatbotStepPrompts[key]}
                            onChange={(e) => updateStepPrompt(key, e.target.value)}
                            rows={5}
                            placeholder={`Instrucciones para el paso: ${title}`}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Confirmation message */}
              <div className="grid gap-2">
                <Label htmlFor="confirmacion">Mensaje de confirmación</Label>
                <Textarea
                  id="confirmacion"
                  value={chatbotConfirmacion}
                  onChange={(e) => setChatbotConfirmacion(e.target.value)}
                  placeholder="¡Listo! Tu denuncia fue registrada con el número {numero_denuncia}..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Mensaje final cuando se completa la denuncia. Usá <code className="rounded bg-muted px-1">{"{numero_denuncia}"}</code> para insertar el número
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveChatbot} disabled={savingChatbot}>
                  {savingChatbot ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Guardar configuración del chatbot
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
