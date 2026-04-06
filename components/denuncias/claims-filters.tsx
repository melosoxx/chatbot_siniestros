"use client"

import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { fetchAgentes } from "@/lib/supabase-queries"
import { useSupabaseQuery } from "@/hooks/use-supabase-query"
import type { EstadoDenuncia, TipoSiniestro, Prioridad } from "@/lib/types"

const estados: EstadoDenuncia[] = [
  "Pendiente",
  "En revisión",
  "Documentación incompleta",
  "Resuelto",
  "Rechazado",
]

const tiposSiniestro: TipoSiniestro[] = [
  "Robo",
  "Choque vehicular",
  "Incendio",
  "Inundación",
  "Daño por terceros",
  "Otro",
]

const prioridades: Prioridad[] = ["Alta", "Media", "Baja"]

interface ClaimsFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  estadoFilter: string
  onEstadoChange: (value: string) => void
  tipoFilter: string
  onTipoChange: (value: string) => void
  agenteFilter: string
  onAgenteChange: (value: string) => void
  prioridadFilter: string
  onPrioridadChange: (value: string) => void
  onClearFilters: () => void
}

export function ClaimsFilters({
  searchTerm,
  onSearchChange,
  estadoFilter,
  onEstadoChange,
  tipoFilter,
  onTipoChange,
  agenteFilter,
  onAgenteChange,
  prioridadFilter,
  onPrioridadChange,
  onClearFilters,
}: ClaimsFiltersProps) {
  const { data: agentes } = useSupabaseQuery(fetchAgentes)

  const hasFilters =
    searchTerm ||
    estadoFilter !== "all" ||
    tipoFilter !== "all" ||
    agenteFilter !== "all" ||
    prioridadFilter !== "all"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI o póliza..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-2 h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select value={estadoFilter} onValueChange={onEstadoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {estados.map((estado) => (
              <SelectItem key={estado} value={estado}>
                {estado}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tipoFilter} onValueChange={onTipoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de siniestro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {tiposSiniestro.map((tipo) => (
              <SelectItem key={tipo} value={tipo}>
                {tipo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={agenteFilter} onValueChange={onAgenteChange}>
          <SelectTrigger>
            <SelectValue placeholder="Agente asignado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los agentes</SelectItem>
            <SelectItem value="unassigned">Sin asignar</SelectItem>
            {(agentes || [])
              .filter((a) => a.activo)
              .map((agente) => (
                <SelectItem key={agente.id} value={agente.id}>
                  {agente.nombre}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select value={prioridadFilter} onValueChange={onPrioridadChange}>
          <SelectTrigger>
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las prioridades</SelectItem>
            {prioridades.map((prioridad) => (
              <SelectItem key={prioridad} value={prioridad}>
                {prioridad}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
