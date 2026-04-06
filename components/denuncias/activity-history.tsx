import { History, RefreshCw, UserPlus, AlertCircle, StickyNote } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/date-utils"
import type { HistorialCambio } from "@/lib/types"

interface ActivityHistoryProps {
  historial: HistorialCambio[]
}

const iconMap = {
  estado: RefreshCw,
  asignacion: UserPlus,
  prioridad: AlertCircle,
  nota: StickyNote,
}

const colorMap = {
  estado: "text-blue-400 bg-blue-500/10",
  asignacion: "text-emerald-400 bg-emerald-500/10",
  prioridad: "text-amber-400 bg-amber-500/10",
  nota: "text-purple-400 bg-purple-500/10",
}

export function ActivityHistory({ historial }: ActivityHistoryProps) {
  const sortedHistorial = [...historial].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" />
          Historial de Cambios
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedHistorial.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay cambios registrados para esta denuncia.
          </p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 h-full w-px bg-border" />
            <div className="space-y-6">
              {sortedHistorial.map((item) => {
                const Icon = iconMap[item.tipo]
                const colorClass = colorMap[item.tipo]

                return (
                  <div key={item.id} className="relative flex gap-4 pl-10">
                    <div
                      className={cn(
                        "absolute left-0 flex h-8 w-8 items-center justify-center rounded-full",
                        colorClass
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                      <p className="text-sm">{item.descripcion}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.autor}</span>
                        <span>-</span>
                        <span>
                          {formatDateTime(item.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
