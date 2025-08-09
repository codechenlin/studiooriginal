"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartData = [
  { device: "Móvil", visitors: 62, fill: "url(#chart-gradient-2)" },
  { device: "Escritorio", visitors: 38, fill: "url(#chart-gradient-3)" },
]

const chartConfig = {
  visitors: {
    label: "Visitantes",
  },
  Móvil: {
    label: "Móvil",
    color: "hsl(var(--chart-2))",
  },
  Escritorio: {
    label: "Escritorio",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function EngagementSourcesChart() {
  return (
    <Card className="flex flex-col bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader className="items-center pb-0">
        <CardTitle>Fuentes de Interacción</CardTitle>
        <CardDescription>Aperturas por dispositivo</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <defs>
              <linearGradient id="chart-gradient-2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="chart-gradient-3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="device"
              innerRadius={60}
              strokeWidth={5}
            />
            <ChartLegend
                content={<ChartLegendContent nameKey="device" />}
                className="-translate-y-[20px] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
