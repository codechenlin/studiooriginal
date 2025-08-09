
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, PlusCircle } from "lucide-react";
import Link from "next/link";


export default function CampaignsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground flex items-center gap-2">
            <History className="size-8"/>
            Historial de Campañas
          </h1>
          <p className="text-muted-foreground">Aquí puedes ver todas tus campañas pasadas y su rendimiento.</p>
        </div>
        <Link href="/dashboard/campaigns/create">
            <Button className="bg-gradient-to-r from-primary to-accent/80 hover:opacity-90 transition-opacity">
                <PlusCircle className="mr-2" />
                Crear Nueva Campaña
            </Button>
        </Link>
      </div>
      <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl flex-1">
        <CardHeader>
            <CardTitle>Mis Campañas</CardTitle>
            <CardDescription>Aún no has enviado ninguna campaña. ¡Crea una para empezar!</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center py-20 text-muted-foreground">
                <p>El historial de tus campañas aparecerá aquí.</p>
            </div>
        </CardContent>
      </Card>
    </main>
  );
}
