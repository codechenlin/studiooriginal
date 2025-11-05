
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Hourglass, Pause, Play, AlertTriangle, X, PowerOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface PauseVerificationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onPause: () => void;
  onCancelProcess: () => void;
}

export function PauseVerificationModal({ isOpen, onOpenChange, onPause, onCancelProcess }: PauseVerificationModalProps) {
  const [timeLeft, setTimeLeft] = useState(48 * 60 * 60);

  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);
  
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-zinc-900/80 backdrop-blur-xl border-purple-500/20 text-white overflow-hidden" showCloseButton={false}>
        <div className="absolute inset-0 z-0 opacity-10 bg-grid-purple-500/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full animate-pulse-slow filter blur-3xl -translate-x-1/2 -translate-y-1/2"/>

        <DialogHeader className="z-10 text-center">
            <div className="flex justify-center mb-4">
                 <div className="relative p-3 rounded-full bg-purple-900/50 border-2 border-purple-500/50">
                   <div className="absolute inset-0 rounded-full animate-[hud-spin_20s_linear_infinite] border-2 border-dashed border-purple-400/30" />
                   <div className="absolute inset-1 rounded-full animate-[hud-spin_15s_linear_infinite] border-2 border-dashed border-purple-400/20" style={{animationDirection: 'reverse'}}/>
                   <Pause className="relative size-12 text-purple-300" style={{ filter: 'drop-shadow(0 0 15px #AD00EC)' }}/>
                </div>
            </div>
            <DialogTitle className="text-2xl font-bold">Pausar Proceso de Verificación</DialogTitle>
            <DialogDescription className="text-purple-200/70 pt-2">
                Puedes pausar y continuar más tarde. Tu progreso (códigos y claves) se guardará por 48 horas.
            </DialogDescription>
        </DialogHeader>

        <div className="py-6 z-10 flex flex-col items-center gap-4">
             <div className="text-center p-4 rounded-lg bg-black/30 border border-purple-400/20">
                <p className="text-sm font-semibold text-purple-200 uppercase tracking-widest">Tiempo Restante</p>
                <p className="font-mono text-5xl font-bold text-white tracking-wider">{formatTime(timeLeft)}</p>
            </div>
             <div className="p-3 bg-amber-500/10 text-amber-200/90 rounded-lg border border-amber-400/20 text-xs flex items-start gap-3">
                <AlertTriangle className="size-8 text-amber-400 shrink-0 mt-1" />
                <p>
                    Si no retomas el proceso en las próximas 48 horas, tu progreso se perderá y deberás iniciar una nueva verificación con nuevos códigos y claves.
                </p>
            </div>
        </div>

        <DialogFooter className="z-10 pt-4 grid grid-cols-3 gap-2">
            <Button variant="outline" className="text-white border-white/30 hover:bg-white hover:text-black" onClick={() => onOpenChange(false)}>
                <X className="mr-2"/> Cerrar
            </Button>
            <Button variant="destructive" onClick={onCancelProcess}>
                <PowerOff className="mr-2"/> Cancelar Proceso
            </Button>
            <Button className="bg-purple-600 text-white hover:bg-purple-500" onClick={onPause}>
                <Pause className="mr-2"/> Pausar Proceso
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
