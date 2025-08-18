
"use client"

import * as React from "react"
import { Laptop, Smartphone } from "lucide-react"
import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { device: "Escritorio", value: 38, fill: "url(#device-desktop)" },
  { device: "Móvil", value: 62, fill: "url(#device-mobile)" },
];

const chartConfig = {
  value: { label: "Dispositivo" },
  Escritorio: { label: "Escritorio", icon: Laptop, color: "hsl(var(--chart-3))" },
  Móvil: { label: "Móvil", icon: Smartphone, color: "hsl(var(--ai-glow-end))" },
} satisfies ChartConfig

export function DeviceDistributionChart() {
  const totalValue = React.useMemo(() => chartData.reduce((acc, curr) => acc + curr.value, 0), []);
  const mobileData = chartData.find(d => d.device === 'Móvil');

  return (
    <Card className="flex flex-col bg-card/80 backdrop-blur-sm border-border/50 shadow-lg relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-ai-glow-start via-ai-glow-mid to-ai-glow-end opacity-80"/>
        <div className="absolute inset-0 size-full bg-black/95 opacity-5 [mask-image:radial-gradient(ellipse_100%_50%_at_50%_0%,#000_70%,transparent_100%)]"/>
      <CardHeader className="items-center pb-0 z-10">
        <CardTitle>Distribución por Dispositivo</CardTitle>
        <CardDescription>Aperturas en Escritorio vs. Móvil</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px]">
          <PieChart>
            <defs>
                 <linearGradient id="device-mobile" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--ai-glow-start))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--ai-glow-end))" stopOpacity={0.8} />
                </linearGradient>
                 <linearGradient id="device-desktop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1} />
                </linearGradient>
            </defs>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={[{ value: totalValue }]}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={95}
              startAngle={220}
              endAngle={-40}
              fill="hsl(var(--ai-track))"
              stroke="hsl(var(--border) / 0.2)"
              strokeWidth={1}
            />
             <Pie
                data={chartData}
                dataKey="value"
                nameKey="device"
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={95}
                startAngle={220}
                endAngle={-40}
                cornerRadius={8}
                stroke="none"
             >
                {chartData.map((entry, index) => (
                    <React.Fragment key={entry.device} />
                ))}
             </Pie>
             {mobileData && (
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-4xl font-bold" style={{filter: 'drop-shadow(0 0 5px hsl(var(--ai-glow-end)))'}}>
                    {mobileData.value}%
                </text>
             )}
              <text x="50%" y="50%" dy="2em" textAnchor="middle" className="fill-muted-foreground text-sm">
                Móvil
            </text>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <div className="flex justify-center gap-6 p-4 text-sm mt-auto">
        {chartData.map((item) => {
            const Icon = chartConfig[item.device as keyof typeof chartConfig]?.icon;
            return (
                <div key={item.device} className="flex items-center gap-2">
                    {Icon && <Icon className="size-4" style={{color: chartConfig[item.device as keyof typeof chartConfig].color}}/>}
                    <span className="text-muted-foreground">{item.device}:</span>
                    <span className="font-semibold text-foreground">{item.value}%</span>
                </div>
            )
        })}
      </div>
    </Card>
  )
}
