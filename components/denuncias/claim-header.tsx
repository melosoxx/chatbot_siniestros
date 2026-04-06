"use client"

import { ArrowLeft, MessageSquare } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { StatusBadge, PriorityBadge } from "@/components/status-badge"
import { formatDateTime } from "@/lib/date-utils"
import type { DenunciaConDetalles } from "@/lib/types"

interface ClaimHeaderProps {
  denuncia: DenunciaConDetalles
}

export function ClaimHeader({ denuncia }: ClaimHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/denuncias">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            {denuncia.numero_denuncia}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 pl-10">
          <StatusBadge estado={denuncia.estado} />
          <PriorityBadge prioridad={denuncia.prioridad} />
          <span className="text-sm text-muted-foreground">
            Creada el {formatDateTime(denuncia.created_at)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pl-10 sm:pl-0">
        <Button variant="outline" size="sm">
          <MessageSquare className="mr-2 h-4 w-4" />
          Enviar mensaje
        </Button>
        <Button size="sm">Cambiar estado</Button>
      </div>
    </div>
  )
}
