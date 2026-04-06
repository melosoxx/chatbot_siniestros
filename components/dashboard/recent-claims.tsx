"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge, PriorityBadge } from "@/components/status-badge"
import { getDenunciasConAsegurado } from "@/lib/supabase-queries"
import { useSupabaseQuery } from "@/hooks/use-supabase-query"
import { formatDateTime } from "@/lib/date-utils"

export function RecentClaims() {
  const { data: allDenuncias, loading } = useSupabaseQuery(getDenunciasConAsegurado)

  if (loading || !allDenuncias) {
    return (
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Denuncias Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const denuncias = [...allDenuncias]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5)

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Denuncias Recientes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/denuncias" className="gap-1">
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {denuncias.map((denuncia) => (
            <Link
              key={denuncia.id}
              href={`/denuncias/${denuncia.id}`}
              className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-primary">
                    {denuncia.numero_denuncia}
                  </span>
                  <StatusBadge estado={denuncia.estado} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {denuncia.asegurado_nombre} - {denuncia.tipo_siniestro}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge prioridad={denuncia.prioridad} />
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(denuncia.created_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
