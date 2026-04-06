"use client"

import { useState } from "react"
import { StickyNote, Plus } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDateTime } from "@/lib/date-utils"
import type { NotaInterna } from "@/lib/types"

interface InternalNotesProps {
  notas: NotaInterna[]
}

export function InternalNotes({ notas }: InternalNotesProps) {
  const [showForm, setShowForm] = useState(false)
  const [newNote, setNewNote] = useState("")

  const sortedNotas = [...notas].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <StickyNote className="h-5 w-5 text-primary" />
          Notas Internas
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar nota
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {showForm && (
            <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
              <Textarea
                placeholder="Escribir nota interna..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false)
                    setNewNote("")
                  }}
                >
                  Cancelar
                </Button>
                <Button size="sm">Guardar nota</Button>
              </div>
            </div>
          )}

          {sortedNotas.length === 0 && !showForm ? (
            <p className="text-sm text-muted-foreground">
              No hay notas internas para esta denuncia.
            </p>
          ) : (
            <div className="space-y-4">
              {sortedNotas.map((nota) => (
                <div
                  key={nota.id}
                  className="flex gap-3 rounded-lg border border-border p-4"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-muted text-xs">
                      {getInitials(nota.autor)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{nota.autor}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(nota.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {nota.contenido}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
