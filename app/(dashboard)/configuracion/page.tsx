"use client"

import { useState, useEffect } from "react"
import {
  AlertTriangle,
  MessageSquare,
  Webhook,
  Plus,
  Edit,
  Trash2,
  Save,
  Copy,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchPlantillasMensajes } from "@/lib/supabase-queries"
import { useSupabaseQuery } from "@/hooks/use-supabase-query"
import { toast } from "sonner"

const tiposSiniestro = [
  { id: 1, nombre: "Robo", activo: true },
  { id: 2, nombre: "Choque vehicular", activo: true },
  { id: 3, nombre: "Incendio", activo: true },
  { id: 4, nombre: "Inundación", activo: true },
  { id: 5, nombre: "Daño por terceros", activo: true },
  { id: 6, nombre: "Otro", activo: true },
]

const estados = [
  { id: 1, nombre: "Pendiente", color: "amber" },
  { id: 2, nombre: "En revisión", color: "blue" },
  { id: 3, nombre: "Documentación incompleta", color: "orange" },
  { id: 4, nombre: "Resuelto", color: "emerald" },
  { id: 5, nombre: "Rechazado", color: "red" },
]

export default function ConfiguracionPage() {
  const [evolutionUrl, setEvolutionUrl] = useState("")
  const [evolutionApiKey, setEvolutionApiKey] = useState("")
  const [evolutionInstanceName, setEvolutionInstanceName] = useState("")
  const [webhookActivo, setWebhookActivo] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [tipoDialogOpen, setTipoDialogOpen] = useState(false)
  const [plantillaDialogOpen, setPlantillaDialogOpen] = useState(false)
  const { data: plantillasMensajes } = useSupabaseQuery(fetchPlantillasMensajes)

  // Load config from Supabase on mount
  useEffect(() => {
    fetch("/api/configuracion")
      .then((res) => res.json())
      .then((config) => {
        setEvolutionUrl(config.evolution_api_url || "")
        setEvolutionApiKey(config.evolution_api_key || "")
        setEvolutionInstanceName(config.evolution_instance_name || "")
        setWebhookActivo(config.webhook_activo !== "false")
      })
      .catch(() => {
        toast.error("Error cargando configuración")
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

      if (!res.ok) throw new Error("Error al guardar")

      toast.success("Configuración guardada correctamente")
    } catch {
      toast.error("Error guardando configuración")
    } finally {
      setSaving(false)
    }
  }

  // Build the webhook URL to show to the user
  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/webhook/evolution`
    : "/api/webhook/evolution"

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Configuración general del sistema de gestión de siniestros
        </p>
      </div>

      <Tabs defaultValue="tipos" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="tipos" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Tipos de Siniestro
          </TabsTrigger>
          <TabsTrigger value="plantillas" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="webhook" className="gap-2">
            <Webhook className="h-4 w-4" />
            Evolution API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tipos" className="mt-6">
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tipos de Siniestro</CardTitle>
                <CardDescription>
                  Gestione los tipos de siniestro disponibles en el sistema
                </CardDescription>
              </div>
              <Dialog open={tipoDialogOpen} onOpenChange={setTipoDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo tipo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nuevo tipo de siniestro</DialogTitle>
                    <DialogDescription>
                      Agregue un nuevo tipo de siniestro al sistema
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tipo-nombre">Nombre del tipo</Label>
                      <Input id="tipo-nombre" placeholder="Ej: Granizo" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setTipoDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setTipoDialogOpen(false)}>
                      Crear tipo
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Nombre</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tiposSiniestro.map((tipo) => (
                    <TableRow key={tipo.id}>
                      <TableCell className="font-medium">{tipo.nombre}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            tipo.activo
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : "border-red-500/30 bg-red-500/10 text-red-400"
                          }
                        >
                          {tipo.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="mt-6 bg-card">
            <CardHeader>
              <CardTitle>Estados de Denuncia</CardTitle>
              <CardDescription>
                Estados disponibles para las denuncias (solo lectura)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {estados.map((estado) => (
                  <Badge
                    key={estado.id}
                    variant="outline"
                    className={`border-${estado.color}-500/30 bg-${estado.color}-500/10 text-${estado.color}-400`}
                    style={{
                      borderColor: `var(--${estado.color === "amber" ? "status-pending" : estado.color === "blue" ? "status-in-review" : estado.color === "orange" ? "status-incomplete" : estado.color === "emerald" ? "status-resolved" : "status-rejected"})`,
                      backgroundColor: `color-mix(in srgb, var(--${estado.color === "amber" ? "status-pending" : estado.color === "blue" ? "status-in-review" : estado.color === "orange" ? "status-incomplete" : estado.color === "emerald" ? "status-resolved" : "status-rejected"}) 10%, transparent)`,
                      color: `var(--${estado.color === "amber" ? "status-pending" : estado.color === "blue" ? "status-in-review" : estado.color === "orange" ? "status-incomplete" : estado.color === "emerald" ? "status-resolved" : "status-rejected"})`,
                    }}
                  >
                    {estado.nombre}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plantillas" className="mt-6">
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Plantillas de Mensajes</CardTitle>
                <CardDescription>
                  Plantillas predefinidas para respuestas rápidas en WhatsApp
                </CardDescription>
              </div>
              <Dialog open={plantillaDialogOpen} onOpenChange={setPlantillaDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva plantilla
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Nueva plantilla de mensaje</DialogTitle>
                    <DialogDescription>
                      Cree una nueva plantilla para respuestas rápidas
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="plantilla-nombre">Nombre</Label>
                      <Input id="plantilla-nombre" placeholder="Ej: Saludo inicial" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="plantilla-contenido">Contenido</Label>
                      <Textarea
                        id="plantilla-contenido"
                        placeholder="Escriba el contenido de la plantilla..."
                        className="min-h-[120px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPlantillaDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setPlantillaDialogOpen(false)}>
                      Crear plantilla
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(plantillasMensajes || []).map((plantilla) => (
                  <div
                    key={plantilla.id}
                    className="flex flex-col gap-2 rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-primary">{plantilla.nombre}</h4>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plantilla.contenido}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhook" className="mt-6 space-y-6">
          {/* Webhook URL info card */}
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

          {/* Evolution API Config */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Conexión con Evolution API</CardTitle>
              <CardDescription>
                Ingresá los datos de tu instancia de Evolution API para enviar y recibir mensajes de WhatsApp
              </CardDescription>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
