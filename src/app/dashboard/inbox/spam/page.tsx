
"use client";

import React from 'react';
import { MailWarning, Database, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export default function SpamPage() {
  return (
    <main className="flex-1 p-4 md:p-8 bg-background relative overflow-hidden">
      {/* Background Animation */}
      <div 
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px), radial-gradient(hsl(var(--accent) / 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px, 30px 30px',
          backgroundPosition: '0 0, 15px 15px',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-transparent via-transparent to-orange-900/40 opacity-50"/>


      <div className="relative z-10">
        <header className="mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500 flex items-center gap-3">
                <MailWarning className="size-8"/>
                Bandeja de Spam
              </h1>
               <div className="flex items-end gap-1 h-8">
                  <span className="w-1 h-2/5 bg-amber-500 rounded-full animate-pulse" style={{animationDelay: '0s'}}/>
                  <span className="w-1 h-full bg-amber-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}/>
                  <span className="w-1 h-3/5 bg-amber-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}/>
              </div>
            </div>
          <p className="text-muted-foreground mt-1">
            Revisa los correos clasificados como no deseados por nuestro sistema de IA.
          </p>
        </header>

        <Card className="bg-card/80 backdrop-blur-sm border-amber-500/30 shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10" />
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4 relative z-10">
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
              <Input placeholder="Buscar en spam..." className="pl-10 bg-background/70" />
            </div>
          </CardContent>
        </Card>
        
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
             <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-amber-500/20 rounded-full animate-spin" style={{ animationDuration: '7s' }}></div>
                <div className="absolute inset-4 border border-amber-500/10 rounded-full animate-spin" style={{ animationDuration: '9s', animationDirection: 'reverse' }}></div>
                <div className="absolute inset-8 bg-amber-500/5 rounded-full animate-pulse"></div>
                <MailWarning className="relative z-10 size-20 text-amber-400" style={{ filter: 'drop-shadow(0 0 10px #f59e0b)' }}/>
            </div>
            <h2 className="text-2xl font-bold text-amber-300 mt-8">Bandeja de Spam Vacía</h2>
            <p className="text-amber-200/70 mt-2 max-w-md">
              Nuestro sistema de IA no ha detectado correos sospechosos. Cuando lo haga, aparecerán aquí para tu revisión.
            </p>
        </div>
      </div>
    </main>
  );
}
