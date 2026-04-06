"use client"

import Link from "next/link"
import { useMemo } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { PriorityBadge } from "@/components/status-badge"
import { formatDate } from "@/lib/date-utils"
import type { Denuncia, EstadoDenuncia } from "@/lib/types"

const estadoConfig: Record<
  EstadoDenuncia,
  { label: string; color: string; bgColor: string }
> = {
  Pendiente: {
    label: "Pendiente",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  "En revisión": {
    label: "En revisión",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  "Documentación incompleta": {
    label: "Doc. Incompleta",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
  Resuelto: {
    label: "Resuelto",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  Rechazado: {
    label: "Rechazado",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
}

const estadoOrder: EstadoDenuncia[] = [
  "Pendiente",
  "En revisión",
  "Documentación incompleta",
  "Resuelto",
  "Rechazado",
]

interface ClaimsKanbanProps {
  denuncias: (Denuncia & {
    asegurado_nombre: string
    agente_nombre: string
  })[]
}

export function ClaimsKanban({ denuncias }: ClaimsKanbanProps) {
  const columns = useMemo(() => {
    return estadoOrder.map((estado) => ({
      estado,
      config: estadoConfig[estado],
      denuncias: denuncias.filter((d) => d.estado === estado),
    }))
  }, [denuncias])

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4">
        {columns.map((column) => (
          <div
            key={column.estado}
            className="flex w-[300px] shrink-0 flex-col rounded-lg border border-border bg-muted/30"
          >
            <div
              className={`flex items-center justify-between rounded-t-lg px-4 py-3 ${column.config.bgColor}`}
            >
              <h3 className={`font-semibold ${column.config.color}`}>
                {column.config.label}
              </h3>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${column.config.bgColor} ${column.config.color}`}
              >
                {column.denuncias.length}
              </span>
            </div>
            <div className="flex flex-col gap-2 p-2">
              {column.denuncias.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Sin denuncias
                </div>
              ) : (
                column.denuncias.map((denuncia) => (
                  <Link
                    key={denuncia.id}
                    href={`/denuncias/${denuncia.id}`}
                    className="block"
                  >
                    <Card className="cursor-pointer bg-card transition-all hover:border-primary/50 hover:shadow-md">
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className="flex items-center justify-between text-sm">
                          <span className="text-primary">
                            {denuncia.numero_denuncia}
                          </span>
                          <PriorityBadge prioridad={denuncia.prioridad} />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-sm font-medium">
                          {denuncia.asegurado_nombre}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {denuncia.tipo_siniestro}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {denuncia.agente_nombre}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(denuncia.created_at)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
