import { User, Phone, Mail, FileText } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Asegurado } from "@/lib/types"

interface InsuredInfoProps {
  asegurado: Asegurado
}

export function InsuredInfo({ asegurado }: InsuredInfoProps) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-primary" />
          Datos del Asegurado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Nombre completo
            </dt>
            <dd className="mt-1 text-sm">{asegurado.nombre_completo}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">DNI</dt>
            <dd className="mt-1 text-sm">{asegurado.dni}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <Phone className="h-3 w-3" />
              Teléfono
            </dt>
            <dd className="mt-1 text-sm">{asegurado.telefono}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <Mail className="h-3 w-3" />
              Email
            </dt>
            <dd className="mt-1 text-sm">{asegurado.email}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <FileText className="h-3 w-3" />
              Número de póliza
            </dt>
            <dd className="mt-1 text-sm font-medium text-primary">
              {asegurado.numero_poliza}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
