
"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartConfig } from "@/components/ui/chart"

const chartData = [
  { sentiment: "Positivo", value: 75, fill: "url(#sentiment-positive)" },
  { sentiment: "Neutral", value: 15, fill: "url(#sentiment-neutral)" },
  { sentiment: "Negativo", value: 10, fill: "url(#sentiment-negative)" },
];

const chartConfig = {
  value: { label: "Sentimiento" },
  Positivo: { label: "Positivo", color: "hsl(var(--chart-2))" },
  Neutral: { label: "Neutral", color: "hsl(var(--chart-3))" },
  Negativo: { label: "Negativo", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

export function SentimentAnalysisChart() {
  const radius = [65, 55, 45];
  const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="flex flex-col bg-card/80 backdrop-blur-sm border-border/50 shadow-lg relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-ai-glow-start via-ai-glow-mid to-ai-glow-end opacity-80"/>
        <div className="absolute inset-0 size-full bg-black/95 opacity-5 [mask-image:radial-gradient(ellipse_100%_50%_at_50%_0%,#000_70%,transparent_100%)]"/>
      <CardHeader className="items-center pb-0 z-10">
        <CardTitle>Análisis de Sentimiento</CardTitle>
        <CardDescription>Respuesta de la Audiencia</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px]">
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
            {chartData.map((entry, index) => (
               <React.Fragment key={entry.sentiment}>
                    <Pie
                        data={[{ value: 100 }]}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={radius[index] - 5}
                        outerRadius={radius[index]}
                        startAngle={90}
                        endAngle={450}
                        fill="hsl(var(--ai-track))"
                        stroke="hsl(var(--border) / 0.2)"
                        strokeWidth={1}
                    />
                    <Pie
                        data={[entry]}
                        dataKey="value"
                        nameKey="sentiment"
                        cx="50%"
                        cy="50%"
                        innerRadius={radius[index] - 5}
                        outerRadius={radius[index]}
                        startAngle={90}
                        endAngle={90 + (entry.value / totalValue) * 360}
                        cornerRadius={5}
                        filter={`drop-shadow(0 0 5px ${entry.fill.replace('url(#sentiment-', 'hsl(var(--chart-').replace(')','')})`}
                    />
               </React.Fragment>
            ))}
          </PieChart>
        </ChartContainer>
      </CardContent>
       <div className="flex flex-col items-center justify-center p-4 text-sm gap-2 mt-auto">
         {chartData.map((item) => (
            <div key={item.sentiment} className="flex items-center gap-2 w-32">
                <div className="w-2 h-2 rounded-full" style={{ background: item.fill.replace('url(#sentiment-', 'hsl(var(--chart-').replace(')','') }}/>
                <span className="text-muted-foreground flex-1">{item.sentiment}</span>
                <span className="font-semibold text-foreground">{item.value}%</span>
            </div>
         ))}
       </div>
    </Card>
  )
}
