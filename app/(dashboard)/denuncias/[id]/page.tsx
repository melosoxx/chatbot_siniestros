import { notFound } from "next/navigation"

import { getDenunciaConDetalles } from "@/lib/supabase-queries"
import { createServerSupabaseClient } from "@/lib/supabase"
import { ClaimHeader } from "@/components/denuncias/claim-header"
import { InsuredInfo } from "@/components/denuncias/insured-info"
import { ClaimInfo } from "@/components/denuncias/claim-info"
import { AttachmentsSection } from "@/components/denuncias/attachments-section"
import { MessagesTimeline } from "@/components/denuncias/messages-timeline"
import { InternalNotes } from "@/components/denuncias/internal-notes"
import { ActivityHistory } from "@/components/denuncias/activity-history"

interface ClaimDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ClaimDetailPage({ params }: ClaimDetailPageProps) {
  const { id } = await params
  const denuncia = await getDenunciaConDetalles(id, createServerSupabaseClient())

  if (!denuncia) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <ClaimHeader denuncia={denuncia} />

      <div className="grid gap-6 lg:grid-cols-2">
        <InsuredInfo asegurado={denuncia.asegurado} />
        <ClaimInfo denuncia={denuncia} />
      </div>

      <AttachmentsSection archivos={denuncia.archivos} />

      <div className="grid gap-6 lg:grid-cols-2">
        <MessagesTimeline mensajes={denuncia.mensajes} />
        <div className="flex flex-col gap-6">
          <InternalNotes notas={denuncia.notas} />
          <ActivityHistory historial={denuncia.historial} />
        </div>
      </div>
    </div>
  )
}
