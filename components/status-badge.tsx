import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { EstadoDenuncia, Prioridad } from "@/lib/types"

const estadoStyles: Record<EstadoDenuncia, string> = {
  Pendiente: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "En revisión": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Documentación incompleta": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Resuelto: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Rechazado: "bg-red-500/20 text-red-400 border-red-500/30",
}

const prioridadStyles: Record<Prioridad, string> = {
  Alta: "bg-red-500/20 text-red-400 border-red-500/30",
  Media: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Baja: "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

interface StatusBadgeProps {
  estado: EstadoDenuncia
  className?: string
}

export function StatusBadge({ estado, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(estadoStyles[estado], "border", className)}
    >
      {estado}
    </Badge>
  )
}

interface PriorityBadgeProps {
  prioridad: Prioridad
  className?: string
}

export function PriorityBadge({ prioridad, className }: PriorityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(prioridadStyles[prioridad], "border", className)}
    >
      {prioridad}
    </Badge>
  )
}
