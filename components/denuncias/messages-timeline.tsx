"use client"

import { MessageSquare, Send } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/date-utils"
import type { Mensaje } from "@/lib/types"

interface MessagesTimelineProps {
  mensajes: Mensaje[]
}

export function MessagesTimeline({ mensajes }: MessagesTimelineProps) {
  const sortedMensajes = [...mensajes].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-primary" />
          Historial de Conversación
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedMensajes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay mensajes registrados para esta denuncia.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="space-y-4">
              {sortedMensajes.map((mensaje) => (
                <div
                  key={mensaje.id}
                  className={cn(
                    "flex flex-col gap-1",
                    mensaje.direccion === "saliente" ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      mensaje.direccion === "saliente"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm">{mensaje.contenido}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {mensaje.direccion === "saliente" ? "Enviado" : "Recibido"} -{" "}
                    {formatDateTime(mensaje.timestamp)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Textarea
                placeholder="Escribir mensaje..."
                className="min-h-[80px] resize-none"
              />
              <Button size="icon" className="shrink-0">
                <Send className="h-4 w-4" />
                <span className="sr-only">Enviar mensaje</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
