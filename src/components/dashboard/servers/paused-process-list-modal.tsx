
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlayCircle, Hourglass, Globe, X, CheckCircle, XCircle, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Domain } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const CountdownTimer = ({ expiryDate }: { expiryDate: Date }) => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = expiryDate.getTime() - now;

            if (distance < 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                clearInterval(timer);
            } else {
                setTimeLeft({
                    hours: Math.floor(distance / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expiryDate]);
    
    return (
        <div className="flex items-center gap-2 font-mono text-sm text-amber-200">
            <Hourglass className="size-4 text-amber-400" />
            <span>
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
        </div>
    );
};

interface PausedProcessListModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  pausedProcesses: Domain[];
  onSelectDomain: (domain: Domain) => void;
  onGoBack: () => void;
}

export function PausedProcessListModal({ isOpen, onOpenChange, pausedProcesses, onSelectDomain, onGoBack }: PausedProcessListModalProps) {
    const cardVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.3,
                ease: 'easeOut',
            },
        }),
        exit: { opacity: 0, y: -10 },
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-4xl w-full h-[99vh] flex flex-col bg-zinc-900/90 backdrop-blur-xl border border-primary/20 text-white overflow-hidden p-0">
                <style>{`
                    @keyframes icon-pulse-wave {
                        0% { transform: scale(0.8); opacity: 0; }
                        50% { opacity: 1; }
                        100% { transform: scale(1.5); opacity: 0; }
                    }
                `}</style>
                <div className="absolute inset-0 z-0 opacity-10 bg-grid-primary/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
                
                <DialogHeader className="z-10 p-6 text-center shrink-0">
                    <div className="flex justify-center mb-4">
                        <div className="relative p-3 rounded-full bg-primary/20 border-2 border-primary/30">
                            <div className="absolute inset-0 rounded-full animate-ping border-2 border-primary/50" />
                            <PlayCircle className="relative size-12 text-primary" style={{ filter: 'drop-shadow(0 0 10px hsl(var(--primary)))' }}/>
                        </div>
                    </div>
                    <DialogTitle className="text-2xl font-bold">Procesos Pausados</DialogTitle>
                    <DialogDescription className="text-primary-foreground/70">
                        Selecciona un dominio para continuar con el proceso de verificación donde lo dejaste.
                    </DialogDescription>
                </DialogHeader>

                <div className="z-10 flex-1 px-6 pb-2 min-h-0">
                     <div className="relative h-full w-full bg-black/30 rounded-lg border border-primary/20 flex flex-col p-4">
                        <ScrollArea className="flex-1 custom-scrollbar -mr-4 pr-4">
                            <motion.div layout className="space-y-3">
                                <AnimatePresence>
                                    {pausedProcesses.map((process, index) => {
                                         const expiryDate = new Date(new Date(process.dns_checks?.updated_at || process.created_at).getTime() + 48 * 60 * 60 * 1000);
                                        return (
                                            <motion.div
                                                key={process.id}
                                                layout
                                                variants={cardVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                custom={index}
                                                className="group p-4 rounded-lg border border-primary/20 bg-black/30 flex items-center justify-between gap-4 transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Globe className="size-5 text-primary/80"/>
                                                    <span className="font-semibold text-base">{process.domain_name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {process.is_verified ? (
                                                        <div className="flex items-center gap-2 text-sm text-green-300">
                                                            <CheckCircle className="size-5" />
                                                            <span className="font-bold">Verificado</span>
                                                        </div>
                                                    ) : (
                                                         <div className="flex items-center gap-2 text-sm text-red-400">
                                                            <XCircle className="size-5" />
                                                            <span className="font-bold">Inválido</span>
                                                        </div>
                                                    )}
                                                    <CountdownTimer expiryDate={expiryDate} />
                                                     <Button variant="outline" className="h-9 px-3 text-xs bg-black/20 border-cyan-400/30 text-cyan-300 hover:bg-cyan-900/40 hover:text-cyan-200">
                                                        <Code className="mr-2"/>
                                                        Análisis
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => onSelectDomain(process)}
                                                        className="bg-primary/80 text-white hover:bg-primary"
                                                    >
                                                        <PlayCircle className="mr-2"/>
                                                        Continuar
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        </ScrollArea>
                    </div>
                </div>
                 <DialogFooter className="p-4 border-t border-primary/20 z-10 flex justify-between w-full">
                    <Button variant="ghost" className="text-white hover:bg-white/10" onClick={onGoBack}>
                        Regresar
                    </Button>
                    <Button variant="outline" className="text-white border-white/30 hover:bg-white hover:text-black" onClick={() => onOpenChange(false)}>
                        <X className="mr-2"/> Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

