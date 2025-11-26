
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, PlayCircle, Loader2, X, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getPausedProcess } from './db-actions';
import { type Domain } from './types';

interface ProcessSelectorModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectNew: () => void;
  onSelectContinue: () => void;
}

export function ProcessSelectorModal({ isOpen, onOpenChange, onSelectNew, onSelectContinue }: ProcessSelectorModalProps) {
    const [pausedProcess, setPausedProcess] = useState<Domain | null>(null);
    const [isLoading, startLoading] = useTransition();

    useEffect(() => {
        if (isOpen) {
            startLoading(async () => {
                const result = await getPausedProcess();
                if (result.success) {
                    setPausedProcess(result.data || null);
                } else {
                    // Handle error silently, button will be disabled
                    console.error(result.error);
                }
            });
        }
    }, [isOpen]);

    const cardVariants = {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="sm:max-w-2xl bg-zinc-900/80 backdrop-blur-xl border border-primary/20 text-white overflow-hidden p-0">
                 <div className="absolute inset-0 z-0 opacity-10 bg-grid-primary/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
                 <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary/10 rounded-full animate-pulse-slow filter blur-3xl -translate-x-1/2 -translate-y-1/2"/>

                <DialogHeader className="p-6 text-center z-10">
                    <DialogTitle className="text-2xl font-bold">Selecciona una Acción</DialogTitle>
                    <DialogDescription className="text-primary-foreground/70">
                        Puedes iniciar una nueva verificación de dominio o continuar con un proceso que hayas pausado anteriormente.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 z-10">
                    <motion.button
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        whileHover="animate"
                        onClick={onSelectNew}
                        className="relative group p-6 rounded-2xl border-2 border-green-500/30 bg-green-900/20 text-center transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-green-500/20 hover:border-green-400"
                    >
                        <div className="absolute inset-0 bg-grid-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <PlusCircle className="mx-auto size-16 text-green-400 mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_#22c55e]"/>
                        <h3 className="font-bold text-lg text-white">Verificar Nuevo Dominio</h3>
                        <p className="text-sm text-green-200/70 mt-1">Inicia el proceso de verificación desde cero para un nuevo dominio.</p>
                    </motion.button>
                    
                    <motion.button
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        whileHover={!pausedProcess && !isLoading ? "animate" : undefined}
                        onClick={onSelectContinue}
                        disabled={!pausedProcess || isLoading}
                        className={cn(
                            "relative group p-6 rounded-2xl border-2 text-center transition-all duration-300 overflow-hidden",
                            !pausedProcess || isLoading ? "border-amber-500/30 bg-amber-900/20 cursor-not-allowed" : "border-amber-500/30 bg-amber-900/20 hover:shadow-2xl hover:shadow-amber-500/20 hover:border-amber-400"
                        )}
                    >
                         {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="animate-spin text-amber-300"/>
                            </div>
                         ) : !pausedProcess ? (
                             <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                <div className="relative w-10 h-10 mb-2">
                                     <div className="absolute inset-0 border-2 border-dashed border-red-500 rounded-full animate-spin-slow"/>
                                     <AlertTriangle className="absolute inset-0 m-auto text-red-500 size-6"/>
                                </div>
                                <p className="text-xs font-semibold text-red-400">No hay procesos pausados</p>
                             </div>
                         ) : null}

                        <div className={cn("transition-opacity", isLoading || !pausedProcess ? "opacity-30" : "")}>
                           <PlayCircle className="mx-auto size-16 text-amber-400 mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_#f59e0b]"/>
                            <h3 className="font-bold text-lg text-white">Continuar Proceso</h3>
                            <p className="text-sm text-amber-200/70 mt-1">Retoma la verificación de un dominio que dejaste pendiente.</p>
                            {pausedProcess && (
                                <div className="mt-3 text-xs bg-black/30 border border-amber-500/20 rounded-md p-2 text-amber-200">
                                    Pausado: <span className="font-mono">{pausedProcess.domain_name}</span>
                                </div>
                            )}
                        </div>
                    </motion.button>
                </div>

                <DialogFooter className="z-10 p-6">
                    <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => onOpenChange(false)}>
                        <X className="mr-2"/>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
