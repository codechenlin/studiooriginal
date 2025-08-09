"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Wand2, RefreshCw, AlertTriangle } from "lucide-react";
import { getCampaignInsightsAction } from "@/app/dashboard/actions";
import { type EmailCampaignInsightsOutput } from "@/ai/flows/email-campaign-insights";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";

const mockAnalyticsData = JSON.stringify({
  totalEmailsSent: 15000,
  openRate: "22.5%",
  clickThroughRate: "3.1%",
  bounceRate: "1.2%",
  unsubscribeRate: "0.8%",
  topPerformingLinks: [
    { url: "/features/new-editor", clicks: 250 },
    { url: "/pricing", clicks: 120 },
  ],
  engagementByDay: {
    Monday: "15%",
    Tuesday: "25%",
    Wednesday: "23%",
    Thursday: "18%",
    Friday: "10%",
  },
  deviceOpenRate: {
    desktop: "40%",
    mobile: "60%",
  }
});

function InsightsSkeleton() {
    return (
        <div className="space-y-4">
            <div>
                <Skeleton className="h-6 w-1/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-1" />
            </div>
             <div>
                <Skeleton className="h-6 w-1/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-1" />
            </div>
        </div>
    )
}

export function InsightsCard() {
  const [isPending, startTransition] = useTransition();
  const [insights, setInsights] = useState<EmailCampaignInsightsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInsights = () => {
    startTransition(async () => {
      setError(null);
      setInsights(null);
      const result = await getCampaignInsightsAction({
        emailAnalyticsData: mockAnalyticsData,
      });

      if (result.success && result.data) {
        setInsights(result.data);
      } else {
        setError(result.error || "Failed to generate insights.");
      }
    });
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg min-h-[300px] flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="text-primary" />
            <span>Perspectivas con IA</span>
          </CardTitle>
          <CardDescription>
            Deja que nuestra IA analice los datos de tu campaña para mejoras.
          </CardDescription>
        </div>
         <Button onClick={handleGenerateInsights} disabled={isPending} size="sm" variant="outline" className="shrink-0">
            {isPending ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="mr-2 h-4 w-4" />
            )}
            Generar
          </Button>
      </CardHeader>
      <CardContent className="flex-grow">
        {isPending && <InsightsSkeleton />}
        {error && (
            <div className="text-destructive-foreground bg-destructive/80 p-4 rounded-md flex items-center gap-4">
                <AlertTriangle />
                <div>
                    <h4 className="font-bold">Error</h4>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        )}
        {insights && (
            <div className="space-y-6 text-sm">
                <div>
                    <h3 className="font-semibold text-lg mb-2 text-primary">Perspectivas Clave</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{insights.insights}</p>
                </div>
                <Separator />
                <div>
                    <h3 className="font-semibold text-lg mb-2 text-accent">Sugerencias</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{insights.suggestions}</p>
                </div>
            </div>
        )}
        {!isPending && !insights && !error && (
            <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                <Lightbulb className="size-10 mb-4"/>
                <p>Haz clic en "Generar" para obtener perspectivas de IA sobre el rendimiento de tu campaña reciente.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
