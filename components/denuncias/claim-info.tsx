import { AlertTriangle, Calendar, MapPin, FileText, UserCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/date-utils"
import type { DenunciaConDetalles } from "@/lib/types"

interface ClaimInfoProps {
  denuncia: DenunciaConDetalles
}

export function ClaimInfo({ denuncia }: ClaimInfoProps) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Datos del Siniestro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Tipo de siniestro
            </dt>
            <dd className="mt-1">
              <Badge variant="secondary">{denuncia.tipo_siniestro}</Badge>
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Fecha del hecho
            </dt>
            <dd className="mt-1 text-sm">
              {formatDate(denuncia.fecha_hecho)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <MapPin className="h-3 w-3" />
              Ubicación
            </dt>
            <dd className="mt-1 text-sm">{denuncia.ubicacion}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <FileText className="h-3 w-3" />
              Descripción
            </dt>
            <dd className="mt-1 text-sm leading-relaxed">
              {denuncia.descripcion}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <UserCircle className="h-3 w-3" />
              Agente asignado
            </dt>
            <dd className="mt-1 text-sm">
              {denuncia.agente_asignado ? (
                <span className="text-primary">
                  {denuncia.agente_asignado.nombre}
                </span>
              ) : (
                <span className="text-muted-foreground">Sin asignar</span>
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
