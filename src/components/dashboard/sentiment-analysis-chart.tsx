"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartConfig, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

const chartData = [
  { sentiment: "Positivo", value: 75, fill: "url(#sentiment-positive)", color: "hsl(var(--chart-2))" },
  { sentiment: "Neutral", value: 15, fill: "url(#sentiment-neutral)", color: "hsl(var(--chart-3))" },
  { sentiment: "Negativo", value: 10, fill: "url(#sentiment-negative)", color: "hsl(var(--chart-5))" },
];

const chartConfig = {
  value: { label: "Sentimiento" },
  Positivo: { label: "Positivo", color: "hsl(var(--chart-2))" },
  Neutral: { label: "Neutral", color: "hsl(var(--chart-3))" },
  Negativo: { label: "Negativo", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

export function SentimentAnalysisChart() {
  const totalValue = React.useMemo(() => chartData.reduce((acc, curr) => acc + curr.value, 0), []);

  return (
    <Card className="flex flex-col bg-card/80 backdrop-blur-sm border-border/50 shadow-lg relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary opacity-80"/>
      <CardHeader className="items-center pb-0 z-10">
        <CardTitle>Análisis de Sentimiento</CardTitle>
        <CardDescription>Respuesta de la Audiencia</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[320px]"
        >
          <PieChart>
             <defs>
              <radialGradient id="sentiment-positive" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
              </radialGradient>
              <radialGradient id="sentiment-neutral" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
              </radialGradient>
              <radialGradient id="sentiment-negative" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--chart-5))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3} />
              </radialGradient>
            </defs>
            
            {/* Background Tracks */}
            <Pie data={[{ value: 100 }]} dataKey="value" cx="50%" cy="50%" innerRadius={80 - 5} outerRadius={80} startAngle={90} endAngle={450} fill="hsl(var(--ai-track))" stroke="hsl(var(--border) / 0.2)" strokeWidth={1} />
            <Pie data={[{ value: 100 }]} dataKey="value" cx="50%" cy="50%" innerRadius={70 - 5} outerRadius={70} startAngle={90} endAngle={450} fill="hsl(var(--ai-track))" stroke="hsl(var(--border) / 0.2)" strokeWidth={1} />
            <Pie data={[{ value: 100 }]} dataKey="value" cx="50%" cy="50%" innerRadius={60 - 5} outerRadius={60} startAngle={90} endAngle={450} fill="hsl(var(--ai-track))" stroke="hsl(var(--border) / 0.2)" strokeWidth={1} />

            {/* Data Pies */}
            <Pie data={[chartData[0]]} dataKey="value" nameKey="sentiment" cx="50%" cy="50%" innerRadius={80 - 5} outerRadius={80} startAngle={90} endAngle={90 + (chartData[0].value / totalValue) * 360} cornerRadius={5} fill={chartData[0].fill} style={{ filter: `drop-shadow(0 0 5px ${chartData[0].color})` }} />
            <Pie data={[chartData[1]]} dataKey="value" nameKey="sentiment" cx="50%" cy="50%" innerRadius={70 - 5} outerRadius={70} startAngle={90} endAngle={90 + (chartData[1].value / totalValue) * 360} cornerRadius={5} fill={chartData[1].fill} style={{ filter: `drop-shadow(0 0 5px ${chartData[1].color})` }} />
            <Pie data={[chartData[2]]} dataKey="value" nameKey="sentiment" cx="50%" cy="50%" innerRadius={60 - 5} outerRadius={60} startAngle={90} endAngle={90 + (chartData[2].value / totalValue) * 360} cornerRadius={5} fill={chartData[2].fill} style={{ filter: `drop-shadow(0 0 5px ${chartData[2].color})` }} />
          </PieChart>
           <ChartLegend content={<ChartLegendContent nameKey="sentiment" />} className="flex-col items-start gap-2 text-sm" />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
