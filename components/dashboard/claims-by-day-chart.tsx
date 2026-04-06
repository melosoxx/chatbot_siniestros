"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { getDenunciasPorDia } from "@/lib/supabase-queries"
import { useSupabaseQuery } from "@/hooks/use-supabase-query"

const chartConfig = {
  cantidad: {
    label: "Denuncias",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ClaimsByDayChart() {
  const { data, loading } = useSupabaseQuery(getDenunciasPorDia)

  if (loading || !data) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Denuncias por Día</CardTitle>
          <CardDescription>Últimos 30 días</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  // Format the data for display
  const formattedData = data.map((item) => ({
    ...item,
    fechaCorta: new Date(item.fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
    }),
  }))

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Denuncias por Día</CardTitle>
        <CardDescription>Últimos 30 días</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            accessibilityLayer
            data={formattedData}
            margin={{ left: -20, right: 12 }}
          >
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="fechaCorta"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <defs>
              <linearGradient id="fillCantidad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="cantidad"
              type="natural"
              fill="url(#fillCantidad)"
              fillOpacity={0.4}
              stroke="var(--chart-1)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
