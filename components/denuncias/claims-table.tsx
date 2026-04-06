"use client"

import Link from "next/link"
import { Eye, MoreHorizontal, UserPlus, AlertCircle } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge, PriorityBadge } from "@/components/status-badge"
import { formatDate } from "@/lib/date-utils"
import type { Denuncia } from "@/lib/types"

interface ClaimsTableProps {
  denuncias: (Denuncia & {
    asegurado_nombre: string
    agente_nombre: string
  })[]
}

export function ClaimsTable({ denuncias }: ClaimsTableProps) {
  if (denuncias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No hay denuncias</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No se encontraron denuncias con los filtros seleccionados.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Nro. Denuncia</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Asegurado</TableHead>
            <TableHead>Tipo de Siniestro</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Agente</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {denuncias.map((denuncia) => (
            <TableRow key={denuncia.id}>
              <TableCell className="font-medium text-primary">
                <Link
                  href={`/denuncias/${denuncia.id}`}
                  className="hover:underline"
                >
                  {denuncia.numero_denuncia}
                </Link>
              </TableCell>
              <TableCell>
                {formatDate(denuncia.created_at)}
              </TableCell>
              <TableCell>{denuncia.asegurado_nombre}</TableCell>
              <TableCell>{denuncia.tipo_siniestro}</TableCell>
              <TableCell>
                <StatusBadge estado={denuncia.estado} />
              </TableCell>
              <TableCell>
                <span
                  className={
                    denuncia.agente_nombre === "Sin asignar"
                      ? "text-muted-foreground"
                      : ""
                  }
                >
                  {denuncia.agente_nombre}
                </span>
              </TableCell>
              <TableCell>
                <PriorityBadge prioridad={denuncia.prioridad} />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menú</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/denuncias/${denuncia.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalle
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Asignar agente
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
