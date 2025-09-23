
"use client";

import React from 'react';
import { MailCheck, Database, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export default function MainInboxPage() {
  return (
    <main className="flex-1 p-4 md:p-8 bg-background relative overflow-hidden">
      {/* Background Animation */}
      <div 
        className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,white_40%,transparent_100%)]"
      />

      <div className="relative z-10">
        <header className="mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent flex items-center gap-3">
                <MailCheck className="size-8"/>
                Buzón Principal
              </h1>
               <div className="relative flex items-center justify-center size-8 ml-2">
                  <Database className="text-primary/70 size-7" />
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
              </div>
            </div>
          <p className="text-muted-foreground mt-1">
            Aquí recibirás todos tus correos importantes y comunicaciones generales.
          </p>
        </header>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg mb-6">
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 flex items-center gap-4 w-full">
              <Select defaultValue="domain1">
                <SelectTrigger className="w-full md:w-[250px] bg-background/70">
                  <div className="flex items-center gap-2">
                    <Database className="size-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domain1">ejemplo.com</SelectItem>
                  <SelectItem value="domain2">mi-negocio.co</SelectItem>
                </SelectContent>
              </Select>
               <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-[250px] bg-background/70">
                   <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las direcciones</SelectItem>
                  <SelectItem value="address1">ventas@ejemplo.com</SelectItem>
                  <SelectItem value="address2">soporte@ejemplo.com</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="relative w-full md:w-auto md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Buscar en el buzón principal..." className="pl-10 bg-background/70" />
            </div>
          </CardContent>
        </Card>

        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
            <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
                <div className="absolute inset-4 border border-primary/10 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
                <div className="absolute inset-8 bg-primary/5 rounded-full animate-pulse"></div>
                <MailCheck className="relative z-10 size-20 text-primary" style={{ filter: 'drop-shadow(0 0 10px hsl(var(--primary)))' }}/>
            </div>
            <h2 className="text-2xl font-bold text-primary-foreground mt-8">Buzón Principal Listo</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
                Los correos electrónicos entrantes aparecerán aquí. ¡Todo está preparado para empezar a recibir comunicaciones!
            </p>
        </div>
      </div>
    </main>
  );
}
