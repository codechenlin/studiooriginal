"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const data = [
  { date: "Jan", openRate: 40, clickRate: 24 },
  { date: "Feb", openRate: 30, clickRate: 14 },
  { date: "Mar", openRate: 20, clickRate: 9.8 },
  { date: "Apr", openRate: 27.8, clickRate: 39 },
  { date: "May", openRate: 18.9, clickRate: 48 },
  { date: "Jun", openRate: 23.9, clickRate: 38 },
  { date: "Jul", openRate: 34.9, clickRate: 43 },
]

const chartConfig = {
  openRate: {
    label: "Open Rate",
    color: "hsl(var(--chart-1))",
  },
  clickRate: {
    label: "Click Rate",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function AnalyticsChart() {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle>Engagement Over Time</CardTitle>
        <CardDescription>
          Tracking open and click rates for the last 7 months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart accessibilityLayer data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
              <ChartTooltip
                cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 2, strokeDasharray: '3 3' }}
                content={<ChartTooltipContent indicator="dot" />}
                wrapperStyle={{ backdropFilter: 'blur(4px)', background: 'hsl(var(--background) / 0.8)', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
              />
              <Line
                type="monotone"
                dataKey="openRate"
                stroke="var(--color-openRate)"
                strokeWidth={2}
                dot={{ r: 4, fill: 'var(--color-openRate)' }}
                activeDot={{ r: 8, style: { stroke: 'var(--color-openRate)' } }}
              />
              <Line
                type="monotone"
                dataKey="clickRate"
                stroke="var(--color-clickRate)"
                strokeWidth={2}
                dot={{ r: 4, fill: 'var(--color-clickRate)' }}
                activeDot={{ r: 8, style: { stroke: 'var(--color-clickRate)' } }}
              />
            </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
