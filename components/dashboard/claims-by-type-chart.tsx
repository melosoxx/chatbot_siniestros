"use client"

import { Pie, PieChart, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { getDenunciasPorTipo } from "@/lib/supabase-queries"
import { useSupabaseQuery } from "@/hooks/use-supabase-query"

const COLORS = [
  "#10B981", // Emerald - Robo
  "#3B82F6", // Blue - Choque
  "#F59E0B", // Amber - Incendio
  "#06B6D4", // Cyan - Inundación
  "#8B5CF6", // Purple - Daño por terceros
  "#6B7280", // Gray - Otro
]

const chartConfig = {
  cantidad: {
    label: "Cantidad",
  },
  Robo: {
    label: "Robo",
    color: COLORS[0],
  },
  "Choque vehicular": {
    label: "Choque vehicular",
    color: COLORS[1],
  },
  Incendio: {
    label: "Incendio",
    color: COLORS[2],
  },
  Inundación: {
    label: "Inundación",
    color: COLORS[3],
  },
  "Daño por terceros": {
    label: "Daño por terceros",
    color: COLORS[4],
  },
  Otro: {
    label: "Otro",
    color: COLORS[5],
  },
} satisfies ChartConfig

export function ClaimsByTypeChart() {
  const { data, loading } = useSupabaseQuery(getDenunciasPorTipo)

  if (loading || !data) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Denuncias por Tipo</CardTitle>
          <CardDescription>Distribución por tipo de siniestro</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="mx-auto h-[300px] w-[300px] rounded-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((item, index) => ({
    name: item.tipo,
    value: item.cantidad,
    fill: COLORS[index % COLORS.length],
  }))

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Denuncias por Tipo</CardTitle>
        <CardDescription>Distribución por tipo de siniestro</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto h-[300px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
              strokeWidth={2}
              stroke="var(--background)"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="flex-wrap gap-2 [&>*]:basis-1/3 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
