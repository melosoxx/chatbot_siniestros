"use client"

import { useState } from "react"
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchAsegurados } from "@/lib/supabase-queries"
import { useSupabaseQuery } from "@/hooks/use-supabase-query"
import { toast } from "sonner"
import type { Asegurado } from "@/lib/types"

const emptyForm = {
  nombre_completo: "",
  dni: "",
  telefono: "",
  email: "",
  numero_poliza: "",
}

export default function AseguradosPage() {
  const { data: asegurados, loading, refetch } = useSupabaseQuery(fetchAsegurados)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Asegurado | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const filtered = (asegurados || []).filter((a) => {
    const q = search.toLowerCase()
    return (
      a.nombre_completo.toLowerCase().includes(q) ||
      a.dni.toLowerCase().includes(q) ||
      a.telefono.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.numero_poliza.toLowerCase().includes(q)
    )
  })

  const handleCreate = async () => {
    if (!form.nombre_completo || !form.dni || !form.telefono) {
      toast.error("Nombre, DNI y teléfono son obligatorios")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/asegurados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Error al crear asegurado")
        return
      }
      toast.success("Asegurado creado correctamente")
      setCreateOpen(false)
      setForm(emptyForm)
      refetch()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch(`/api/asegurados/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Error al actualizar")
        return
      }
      toast.success("Asegurado actualizado correctamente")
      setEditOpen(false)
      setSelected(null)
      setForm(emptyForm)
      refetch()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch(`/api/asegurados/${selected.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Error al eliminar. Puede tener denuncias asociadas.")
        return
      }
      toast.success("Asegurado eliminado correctamente")
      setDeleteOpen(false)
      setSelected(null)
      refetch()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (asegurado: Asegurado) => {
    setSelected(asegurado)
    setForm({
      nombre_completo: asegurado.nombre_completo,
      dni: asegurado.dni,
      telefono: asegurado.telefono,
      email: asegurado.email,
      numero_poliza: asegurado.numero_poliza,
    })
    setEditOpen(true)
  }

  const openDelete = (asegurado: Asegurado) => {
    setSelected(asegurado)
    setDeleteOpen(true)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asegurados</h1>
          <p className="text-muted-foreground">
            Gestión de asegurados del sistema
          </p>
        </div>
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  const formFields = (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="nombre_completo">Nombre completo *</Label>
        <Input
          id="nombre_completo"
          value={form.nombre_completo}
          onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
          placeholder="Juan Pérez"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="dni">DNI *</Label>
        <Input
          id="dni"
          value={form.dni}
          onChange={(e) => setForm({ ...form, dni: e.target.value })}
          placeholder="12345678"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="telefono">Teléfono *</Label>
        <Input
          id="telefono"
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          placeholder="5491112345678"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="juan@email.com"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="numero_poliza">N° Póliza</Label>
        <Input
          id="numero_poliza"
          value={form.numero_poliza}
          onChange={(e) => setForm({ ...form, numero_poliza: e.target.value })}
          placeholder="POL-001"
        />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asegurados</h1>
          <p className="text-muted-foreground">
            Gestión de asegurados del sistema
          </p>
        </div>

        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open)
            if (!open) setForm(emptyForm)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo asegurado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear nuevo asegurado</DialogTitle>
              <DialogDescription>
                Complete los datos del asegurado. Los campos con * son obligatorios.
              </DialogDescription>
            </DialogHeader>
            {formFields}
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? "Creando..." : "Crear asegurado"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, DNI, teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Nombre</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>N° Póliza</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {search ? "No se encontraron resultados" : "No hay asegurados registrados"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((asegurado) => (
                  <TableRow key={asegurado.id}>
                    <TableCell className="font-medium">{asegurado.nombre_completo}</TableCell>
                    <TableCell>{asegurado.dni}</TableCell>
                    <TableCell>{asegurado.telefono}</TableCell>
                    <TableCell className="text-muted-foreground">{asegurado.email || "—"}</TableCell>
                    <TableCell>{asegurado.numero_poliza || "—"}</TableCell>
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
                          <DropdownMenuItem onClick={() => openEdit(asegurado)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => openDelete(asegurado)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) {
            setSelected(null)
            setForm(emptyForm)
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar asegurado</DialogTitle>
            <DialogDescription>
              Modifique los datos del asegurado.
            </DialogDescription>
          </DialogHeader>
          {formFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar asegurado</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que querés eliminar a {selected?.nombre_completo}? Esta acción no se puede deshacer.
              Si el asegurado tiene denuncias asociadas, no se podrá eliminar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
