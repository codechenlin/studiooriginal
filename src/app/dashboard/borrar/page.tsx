
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Aperture, Atom, BrainCircuit, Dna, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// --- Preloader Designs ---

function Preloader1() {
  return (
    <div className="w-full h-full bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="relative flex flex-col items-center justify-center text-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-spin" style={{ animationDuration: '3s', animationTimingFunction: 'linear' }}></div>
          <div className="absolute inset-2 border-4 border-accent/20 rounded-full animate-spin" style={{ animationDuration: '2.5s', animationDirection: 'reverse', animationTimingFunction: 'ease-in-out' }}></div>
          <div className="absolute inset-4 flex items-center justify-center">
            <Atom className="text-primary size-12 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-lg font-semibold text-foreground tracking-widest uppercase">Cargando</p>
        <p className="text-sm text-muted-foreground">Inicializando interfaz...</p>
      </div>
    </div>
  );
}

function Preloader2() {
  return (
    <div className="w-full h-full bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='hsl(var(--foreground))'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`}}></div>
      <div className="flex flex-col items-center gap-4">
        <div className="w-2 h-16 bg-primary animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-16 bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-16 bg-accent animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        <div className="w-2 h-16 bg-accent animate-pulse" style={{ animationDelay: '0.6s' }}></div>
      </div>
      <p className="absolute bottom-8 text-lg font-light text-muted-foreground tracking-[0.2em]">ANALIZANDO DATOS</p>
    </div>
  );
}

function Preloader3() {
    return (
        <div className="w-full h-full bg-background flex items-center justify-center relative">
            <div className="grid grid-cols-3 gap-2">
                {[...Array(9)].map((_, i) => (
                    <div
                        key={i}
                        className="w-8 h-8 bg-primary/20 animate-pulse rounded-full"
                        style={{ animationDelay: `${i * 0.1}s`, animationDuration: '1.5s' }}
                    />
                ))}
            </div>
            <p className="absolute bottom-10 text-center text-muted-foreground">
                Construyendo el futuro...
            </p>
        </div>
    );
}

function Preloader4() {
    return (
        <div className="w-full h-full bg-background flex items-center justify-center relative font-mono">
            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent animate-pulse">
                MAILFLOW
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-48 h-48 border-t-2 border-b-2 border-accent rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
            </div>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-l-2 border-r-2 border-primary rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
            </div>
        </div>
    )
}

// --- Loading Modal Designs ---

function LoadingModal1({ trigger }: { trigger: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xs bg-card/80 backdrop-blur-sm border-border/20 text-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-primary animate-spin"></div>
            <div className="absolute inset-0 rounded-full border-4 border-accent animate-spin opacity-50" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Procesando...</h3>
          <p className="text-sm text-muted-foreground">Por favor espera un momento.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LoadingModal2({ trigger }: { trigger: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm border-none p-0 overflow-hidden">
                <div className="p-8 text-center flex flex-col items-center">
                    <BrainCircuit className="size-16 text-primary mb-4 animate-pulse" />
                    <DialogTitle className="text-xl">La IA está pensando</DialogTitle>
                    <DialogDescription>Analizando patrones y generando insights para ti.</DialogDescription>
                </div>
                <div className="h-2 w-full bg-primary/20 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent animate-indeterminate-progress"></div>
                </div>
            </DialogContent>
            <style jsx>{`
                @keyframes indeterminate-progress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-indeterminate-progress {
                    animation: indeterminate-progress 1.5s infinite ease-in-out;
                }
            `}</style>
        </Dialog>
    );
}

function LoadingModal3({ trigger }: { trigger: React.ReactNode }) {
  const bars = Array.from({ length: 5 });
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-sm bg-black/80 backdrop-blur-xl border-zinc-700 text-white p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-end justify-center gap-2 h-12">
            {bars.map((_, i) => (
              <div 
                key={i} 
                className="w-3 bg-gradient-to-b from-primary to-accent rounded-full animate-sound-bar" 
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">Estableciendo conexión segura</h3>
            <p className="text-zinc-400 text-sm">Validando credenciales...</p>
          </div>
        </div>
      </DialogContent>
      <style jsx>{`
        @keyframes sound-bar {
          0%, 100% { height: 0.5rem; }
          50% { height: 3rem; }
        }
        .animate-sound-bar {
          animation: sound-bar 1.2s infinite ease-in-out;
        }
      `}</style>
    </Dialog>
  );
}

function LoadingModal4({ trigger }: { trigger: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-xs bg-card/80 backdrop-blur-sm p-8">
                <div className="flex flex-col items-center text-center gap-4">
                    <Dna className="size-14 text-primary animate-spin" style={{ animationDuration: '3s' }}/>
                    <h3 className="text-lg font-semibold">Compilando datos...</h3>
                    <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full w-3/4 animate-pulse"></div>
                    </div>
                    <p className="text-xs text-muted-foreground">Esto podría tardar unos segundos.</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function BorrarPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
        <header className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent flex items-center justify-center gap-3">
                <Wand2 />
                Muestrario de Diseños
            </h1>
            <p className="text-muted-foreground mt-2">Selecciona un diseño para Preloaders y Ventanas Modales de Carga.</p>
        </header>

        <section>
            <h2 className="text-2xl font-semibold mb-6 pb-2 border-b-2 border-primary/50 flex items-center gap-2"><Loader2/>Preloaders (Página Completa)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                    <CardHeader><CardTitle>Diseño 1: Atómico</CardTitle></CardHeader>
                    <CardContent className="h-64"><Preloader1 /></CardContent>
                </Card>
                <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                    <CardHeader><CardTitle>Diseño 2: Barras de datos</CardTitle></CardHeader>
                    <CardContent className="h-64"><Preloader2 /></CardContent>
                </Card>
                <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                    <CardHeader><CardTitle>Diseño 3: Cuadrícula Pulsante</CardTitle></CardHeader>
                    <CardContent className="h-64"><Preloader3 /></CardContent>
                </Card>
                 <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                    <CardHeader><CardTitle>Diseño 4: Giroscópico</CardTitle></CardHeader>
                    <CardContent className="h-64"><Preloader4 /></CardContent>
                </Card>
            </div>
        </section>

        <section className="mt-16">
            <h2 className="text-2xl font-semibold mb-6 pb-2 border-b-2 border-accent/50 flex items-center gap-2"><Sparkles/>Ventanas Modales de Carga</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Card className="text-center flex flex-col justify-center items-center p-6 bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                    <CardTitle className="mb-4">Diseño 1: Orbital</CardTitle>
                    <LoadingModal1 trigger={<Button>Ver Modal</Button>} />
                </Card>
                <Card className="text-center flex flex-col justify-center items-center p-6 bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                    <CardTitle className="mb-4">Diseño 2: IA Pensando</CardTitle>
                    <LoadingModal2 trigger={<Button>Ver Modal</Button>} />
                </Card>
                 <Card className="text-center flex flex-col justify-center items-center p-6 bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                    <CardTitle className="mb-4">Diseño 3: Barra de Sonido</CardTitle>
                    <LoadingModal3 trigger={<Button>Ver Modal</Button>} />
                </Card>
                  <Card className="text-center flex flex-col justify-center items-center p-6 bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                    <CardTitle className="mb-4">Diseño 4: ADN Compilando</CardTitle>
                    <LoadingModal4 trigger={<Button>Ver Modal</Button>} />
                </Card>
            </div>
        </section>
    </div>
  )
}
