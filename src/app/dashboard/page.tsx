
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { StatCard } from "@/components/dashboard/stat-card";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { Users, Mail, BarChart, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SentimentAnalysisChart } from "@/components/dashboard/sentiment-analysis-chart";
import { DeviceDistributionChart } from "@/components/dashboard/device-distribution-chart";
import { useToast } from '@/hooks/use-toast';
import { OnboardingModal } from '@/components/dashboard/onboarding-modal';
import { HelpButton } from '@/components/dashboard/help-button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    const isWelcome = searchParams.get('welcome') === 'true';
    if (isWelcome) {
      setShowOnboarding(true);
      toast({
        title: "Activación de cuenta",
        description: "Tu cuenta ha sido activada correctamente.",
        className: 'bg-gradient-to-r from-success-start to-success-end border-none text-white',
        duration: 5000,
      });
    }
  }, [searchParams, toast]);

  return (
    <>
      <OnboardingModal isOpen={showOnboarding} onOpenChange={setShowOnboarding} />
      <div className="flex-1 p-4 md:gap-8 md:p-8 bg-background">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                Bienvenido, Usuario
            </h1>
            <p className="text-muted-foreground">Aquí están las últimas novedades de tus campañas.</p>
            </div>
            <HelpButton />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 pt-4">
            <StatCard 
            title="Total de Suscriptores"
            value="12,405"
            description="+20.1% desde el último mes"
            Icon={Users}
            color="from-primary to-purple-400"
            />
            <StatCard 
            title="Correos Enviados"
            value="72,130"
            description="En los últimos 30 días"
            Icon={Mail}
            color="from-sky-500 to-accent"
            />
            <StatCard 
            title="Tasa de Apertura Prom."
            value="24.5%"
            description="+2.1% desde el último mes"
            Icon={BarChart}
            color="from-orange-500 to-amber-400"
            />
            <StatCard 
            title="Tasa de Clics Prom."
            value="4.2%"
            description="+0.5% desde el último mes"
            Icon={CheckCircle}
            color="from-green-500 to-emerald-400"
            />
        </div>

        <Separator className="my-8"/>

        <div className="grid grid-cols-1 gap-4 md:gap-8">
            <AnalyticsChart />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <SentimentAnalysisChart />
                <DeviceDistributionChart />
            </div>
        </div>

        <div className="grid gap-4 md:gap-8 mt-8">
            <InsightsCard />
        </div>
      </div>
    </>
  );
}
