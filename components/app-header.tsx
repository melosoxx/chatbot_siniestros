"use client"

import { useState, useEffect } from "react"
import { Bell, LogOut, User } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { fetchDenuncias } from "@/lib/supabase-queries"
import type { Denuncia } from "@/lib/types"

const breadcrumbMap: Record<string, string> = {
  "/": "Dashboard",
  "/denuncias": "Denuncias",
  "/agentes": "Agentes",
  "/configuracion": "Configuración",
}

function getBreadcrumbs(pathname: string, denuncias: Denuncia[]) {
  const paths = pathname.split("/").filter(Boolean)
  const breadcrumbs: { label: string; href: string }[] = []

  if (pathname === "/") {
    return [{ label: "Dashboard", href: "/" }]
  }

  let currentPath = ""
  for (const path of paths) {
    currentPath += `/${path}`

    // Check if it's a dynamic route (denuncia detail)
    if (path.startsWith("SIN-") || path.startsWith("den-")) {
      const denuncia = denuncias.find(d => d.id === path || d.numero_denuncia === path)
      breadcrumbs.push({
        label: denuncia?.numero_denuncia || path,
        href: currentPath,
      })
    } else {
      breadcrumbs.push({
        label: breadcrumbMap[currentPath] || path,
        href: currentPath,
      })
    }
  }

  return breadcrumbs
}

export function AppHeader() {
  const pathname = usePathname()
  const [denuncias, setDenuncias] = useState<Denuncia[]>([])

  useEffect(() => {
    fetchDenuncias().then(setDenuncias).catch(() => {})
  }, [])

  const breadcrumbs = getBreadcrumbs(pathname, denuncias)
  const pendingCount = denuncias.filter(d => d.estado === "Pendiente").length

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <BreadcrumbItem key={crumb.href}>
              {index < breadcrumbs.length - 1 ? (
                <>
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          {pendingCount > 0 && (
            <Badge className="absolute -right-1 -top-1 size-5 justify-center rounded-full p-0 text-[10px]">
              {pendingCount}
            </Badge>
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  MG
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium leading-none">María García</p>
                <p className="text-xs leading-none text-muted-foreground">
                  maria.garcia@segurosar.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Mi perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
