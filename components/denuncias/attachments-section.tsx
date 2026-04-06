"use client"

import { Paperclip, Download, Image, FileText } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Archivo } from "@/lib/types"

interface AttachmentsSectionProps {
  archivos: Archivo[]
}

export function AttachmentsSection({ archivos }: AttachmentsSectionProps) {
  if (archivos.length === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Paperclip className="h-5 w-5 text-primary" />
            Archivos Adjuntos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay archivos adjuntos para esta denuncia.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Paperclip className="h-5 w-5 text-primary" />
          Archivos Adjuntos ({archivos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {archivos.map((archivo) => (
            <div
              key={archivo.id}
              className="group flex flex-col overflow-hidden rounded-lg border border-border bg-muted/50"
            >
              <div className="relative aspect-video bg-muted">
                {archivo.tipo === "imagen" ? (
                  <img
                    src={archivo.url}
                    alt={archivo.nombre_archivo}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="flex min-w-0 items-center gap-2">
                  {archivo.tipo === "imagen" ? (
                    <Image className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate text-sm">
                    {archivo.nombre_archivo}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Descargar</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
