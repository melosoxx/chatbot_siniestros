"use client"

import {
  FileText,
  Clock,
  Search,
  FileWarning,
  CheckCircle,
  XCircle,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getEstadisticas } from "@/lib/supabase-queries"
import { useSupabaseQuery } from "@/hooks/use-supabase-query"

const stats = [
  {
    title: "Total Denuncias",
    icon: FileText,
    key: "total" as const,
    className: "text-foreground",
    bgClass: "bg-muted",
  },
  {
    title: "Pendientes",
    icon: Clock,
    key: "pendientes" as const,
    className: "text-amber-400",
    bgClass: "bg-amber-500/10",
  },
  {
    title: "En Revisión",
    icon: Search,
    key: "enRevision" as const,
    className: "text-blue-400",
    bgClass: "bg-blue-500/10",
  },
  {
    title: "Doc. Incompleta",
    icon: FileWarning,
    key: "documentacionIncompleta" as const,
    className: "text-orange-400",
    bgClass: "bg-orange-500/10",
  },
  {
    title: "Resueltas",
    icon: CheckCircle,
    key: "resueltas" as const,
    className: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
  },
  {
    title: "Rechazadas",
    icon: XCircle,
    key: "rechazadas" as const,
    className: "text-red-400",
    bgClass: "bg-red-500/10",
  },
]

export function StatsCards() {
  const { data: estadisticas, loading } = useSupabaseQuery(getEstadisticas)

  if (loading || !estadisticas) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.key} className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => (
        <Card key={stat.key} className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${stat.bgClass}`}>
              <stat.icon className={`h-4 w-4 ${stat.className}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.className}`}>
              {estadisticas[stat.key]}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
