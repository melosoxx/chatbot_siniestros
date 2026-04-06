import { StatsCards } from "@/components/dashboard/stats-cards"
import { ClaimsByDayChart } from "@/components/dashboard/claims-by-day-chart"
import { ClaimsByTypeChart } from "@/components/dashboard/claims-by-type-chart"
import { RecentClaims } from "@/components/dashboard/recent-claims"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general del sistema de gestión de siniestros
        </p>
      </div>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <ClaimsByDayChart />
        <ClaimsByTypeChart />
      </div>

      <RecentClaims />
    </div>
  )
}
