
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Hourglass, PlayCircle, X, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { type Domain } from './types';

interface ContinueProcessModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  domain: Domain;
  onContinue: () => void;
  onGoBack: () => void;
}

export function ContinueProcessModal({ isOpen, onOpenChange, domain, onContinue, onGoBack }: ContinueProcessModalProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && domain) {
      const calculateTimeLeft = () => {
        const updatedAt = domain.dns_checks?.updated_at ? new Date(domain.dns_checks.updated_at) : new Date(domain.created_at);
        const expiresAt = updatedAt.getTime() + 48 * 60 * 60 * 1000;
        const now = new Date().getTime();
        const remaining = Math.max(0, expiresAt - now);
        setTimeLeft(Math.floor(remaining / 1000));
      };

      calculateTimeLeft();
      timer = setInterval(calculateTimeLeft, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, domain]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-zinc-900/80 backdrop-blur-xl border-amber-500/20 text-white overflow-hidden" showCloseButton={false}>
        <div className="absolute inset-0 z-0 opacity-10 bg-grid-amber-500/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-amber-500/10 rounded-full animate-pulse-slow filter blur-3xl -translate-x-1/2 -translate-y-1/2"/>

        <DialogHeader className="z-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative p-3 rounded-full bg-amber-900/50 border-2 border-amber-500/50">
              <div className="absolute inset-0 rounded-full animate-[hud-spin_20s_linear_infinite] border-2 border-dashed border-amber-400/30" />
              <div className="absolute inset-1 rounded-full animate-[hud-spin_15s_linear_infinite] border-2 border-dashed border-amber-400/20" style={{animationDirection: 'reverse'}}/>
              <PlayCircle className="relative size-12 text-amber-300" style={{ filter: 'drop-shadow(0 0 15px #f59e0b)' }}/>
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold">Continuar Verificación</DialogTitle>
          <DialogDescription className="text-amber-200/70 pt-2">
            Tienes un proceso de verificación pausado para el dominio <strong className="text-white">{domain.domain_name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 z-10 flex flex-col items-center gap-4">
          <div className="text-center p-4 rounded-lg bg-black/30 border border-amber-400/20">
            <p className="text-sm font-semibold text-amber-200 uppercase tracking-widest">Tiempo Restante para Continuar</p>
            <p className="font-mono text-5xl font-bold text-white tracking-wider">{formatTime(timeLeft)}</p>
          </div>
          <div className="p-3 bg-red-500/10 text-red-200/90 rounded-lg border border-red-400/20 text-xs flex items-start gap-3">
            <AlertTriangle className="size-8 text-red-400 shrink-0 mt-1" />
            <p>
              Si el contador llega a cero, tu progreso se perderá y deberás iniciar una nueva verificación con nuevos códigos y claves.
            </p>
          </div>
        </div>

        <DialogFooter className="z-10 pt-4 flex justify-between w-full">
            <Button variant="outline" className="text-white border-white/30 hover:bg-purple-500 hover:border-purple-400 hover:text-white" onClick={onGoBack}>
                <ArrowLeft className="mr-2"/> Volver al listado
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="text-white border-white/30 hover:bg-white hover:text-black" onClick={() => onOpenChange(false)}>
                <X className="mr-2"/> Cerrar
              </Button>
              <Button className="bg-amber-600 text-white hover:bg-amber-500" onClick={onContinue}>
                <PlayCircle className="mr-2"/> Continuar
              </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
