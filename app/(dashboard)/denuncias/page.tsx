"use client"

import { useState, useMemo } from "react"
import { LayoutGrid, List } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ClaimsTable } from "@/components/denuncias/claims-table"
import { ClaimsKanban } from "@/components/denuncias/claims-kanban"
import { ClaimsFilters } from "@/components/denuncias/claims-filters"
import { ClaimsPagination } from "@/components/denuncias/claims-pagination"
import { getDenunciasConAsegurado, fetchAsegurados } from "@/lib/supabase-queries"
import { useSupabaseQuery } from "@/hooks/use-supabase-query"

export default function DenunciasPage() {
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table")
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("all")
  const [tipoFilter, setTipoFilter] = useState("all")
  const [agenteFilter, setAgenteFilter] = useState("all")
  const [prioridadFilter, setPrioridadFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data: allDenuncias, loading: loadingDenuncias } = useSupabaseQuery(getDenunciasConAsegurado)
  const { data: asegurados, loading: loadingAsegurados } = useSupabaseQuery(fetchAsegurados)

  const loading = loadingDenuncias || loadingAsegurados

  const filteredDenuncias = useMemo(() => {
    if (!allDenuncias) return []
    return allDenuncias.filter((denuncia) => {
      // Search filter
      if (searchTerm) {
        const asegurado = asegurados?.find(
          (a) => a.id === denuncia.asegurado_id
        )
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          denuncia.asegurado_nombre.toLowerCase().includes(searchLower) ||
          asegurado?.dni.toLowerCase().includes(searchLower) ||
          asegurado?.numero_poliza.toLowerCase().includes(searchLower) ||
          denuncia.numero_denuncia.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Estado filter
      if (estadoFilter !== "all" && denuncia.estado !== estadoFilter) {
        return false
      }

      // Tipo filter
      if (tipoFilter !== "all" && denuncia.tipo_siniestro !== tipoFilter) {
        return false
      }

      // Agente filter
      if (agenteFilter !== "all") {
        if (agenteFilter === "unassigned" && denuncia.agente_asignado_id) {
          return false
        }
        if (
          agenteFilter !== "unassigned" &&
          denuncia.agente_asignado_id !== agenteFilter
        ) {
          return false
        }
      }

      // Prioridad filter
      if (prioridadFilter !== "all" && denuncia.prioridad !== prioridadFilter) {
        return false
      }

      return true
    })
  }, [
    allDenuncias,
    asegurados,
    searchTerm,
    estadoFilter,
    tipoFilter,
    agenteFilter,
    prioridadFilter,
  ])

  // Sort by date (newest first)
  const sortedDenuncias = useMemo(() => {
    return [...filteredDenuncias].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [filteredDenuncias])

  // Pagination
  const totalPages = Math.ceil(sortedDenuncias.length / pageSize)
  const paginatedDenuncias = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedDenuncias.slice(start, start + pageSize)
  }, [sortedDenuncias, currentPage, pageSize])

  const handleClearFilters = () => {
    setSearchTerm("")
    setEstadoFilter("all")
    setTipoFilter("all")
    setAgenteFilter("all")
    setPrioridadFilter("all")
    setCurrentPage(1)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Denuncias</h1>
          <p className="text-muted-foreground">
            Gestión de denuncias de siniestros
          </p>
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Denuncias</h1>
          <p className="text-muted-foreground">
            Gestión de denuncias de siniestros
          </p>
        </div>

        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as "table" | "kanban")}
        >
          <TabsList>
            <TabsTrigger value="table" className="gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Tabla</span>
            </TabsTrigger>
            <TabsTrigger value="kanban" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ClaimsFilters
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value)
          setCurrentPage(1)
        }}
        estadoFilter={estadoFilter}
        onEstadoChange={(value) => {
          setEstadoFilter(value)
          setCurrentPage(1)
        }}
        tipoFilter={tipoFilter}
        onTipoChange={(value) => {
          setTipoFilter(value)
          setCurrentPage(1)
        }}
        agenteFilter={agenteFilter}
        onAgenteChange={(value) => {
          setAgenteFilter(value)
          setCurrentPage(1)
        }}
        prioridadFilter={prioridadFilter}
        onPrioridadChange={(value) => {
          setPrioridadFilter(value)
          setCurrentPage(1)
        }}
        onClearFilters={handleClearFilters}
      />

      {viewMode === "table" ? (
        <>
          <ClaimsTable denuncias={paginatedDenuncias} />
          {sortedDenuncias.length > 0 && (
            <ClaimsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={sortedDenuncias.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      ) : (
        <ClaimsKanban denuncias={sortedDenuncias} />
      )}
    </div>
  )
}
