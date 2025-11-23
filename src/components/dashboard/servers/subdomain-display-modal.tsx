"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Fingerprint, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface SubdomainDisplayModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  fullSubdomain: string;
}

export function SubdomainDisplayModal({ isOpen, onOpenChange, fullSubdomain }: SubdomainDisplayModalProps) {
    
    const truncateSubdomain = (name: string, maxLength: number = 60): string => {
        if (name.length <= maxLength) {
            return name;
        }
        return `${name.substring(0, maxLength)}...`;
    };
    
    const truncatedSubdomain = truncateSubdomain(fullSubdomain);

    const recommendationColor = "#00ADEC";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-4xl w-full bg-black/80 backdrop-blur-xl border text-white overflow-hidden p-0" style={{borderColor: recommendationColor+'4D'}}>
                 <style>{`
                    .animated-grid {
                        background-image:
                            linear-gradient(to right, hsl(190 100% 50% / 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, hsl(190 100% 50% / 0.1) 1px, transparent 1px);
                        background-size: 3rem 3rem;
                    }
                    .scan-line-info {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 3px;
                        background: radial-gradient(ellipse 50% 100% at 50% 0%, ${recommendationColor}80, transparent 80%);
                        animation: scan-info 5s infinite linear;
                    }
                    @keyframes scan-info {
                        0% { transform: translateY(-10px); }
                        100% { transform: translateY(100vh); }
                    }
                `}</style>
                
                <DialogHeader className="sr-only">
                    <DialogTitle>Detalles del Subdominio</DialogTitle>
                    <DialogDescription>Información y recomendaciones para el subdominio.</DialogDescription>
                </DialogHeader>

                <div className="absolute inset-0 z-0 opacity-20 animated-grid"/>
                <div className="p-8 space-y-8 z-10">
                    <div className="text-center p-6 rounded-lg border-2 border-dashed" style={{borderColor: recommendationColor+'80', background: `radial-gradient(ellipse at center, ${recommendationColor}1A, transparent 70%)`}}>
                        <BrainCircuit className="mx-auto size-16 mb-4" style={{color: recommendationColor, filter: `drop-shadow(0 0 10px ${recommendationColor})`}}/>
                        <h3 className="text-2xl font-bold" style={{color: recommendationColor}}>Recomendación de la IA</h3>
                        <p className="text-sm text-white/70 mt-2 max-w-2xl mx-auto">
                            Para maximizar la entregabilidad y evitar que tus correos sean marcados como spam, es crucial que los nombres de subdominios no sean excesivamente largos. Un subdominio largo puede ser una señal de alerta para los filtros de correo.
                        </p>
                         <p className="text-sm text-white/70 mt-2 max-w-2xl mx-auto">
                            <strong className="text-white">Recomendamos mantener los nombres de subdominio por debajo de los 60 caracteres.</strong>
                        </p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative p-6 rounded-lg bg-black/40 border border-white/10"
                    >
                         <div className="absolute inset-2 border border-dashed border-white/10 rounded-md animate-pulse" />
                         <div className="absolute w-full h-full top-0 left-0 overflow-hidden">
                            <div className="scan-line-info" />
                        </div>
                        <div className="relative text-center">
                            <Label className="text-xs text-cyan-300 uppercase tracking-widest flex items-center justify-center gap-2">
                                <Fingerprint className="size-4"/>
                                Identificador de Subdominio
                            </Label>
                            <p className="text-3xl font-mono break-all mt-2" title={fullSubdomain}>
                                {truncatedSubdomain}
                            </p>
                        </div>
                    </motion.div>
                    
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="p-4 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between"
                    >
                        <h4 className="text-sm font-semibold text-cyan-300">Conteo de Caracteres</h4>
                        <div className="px-4 py-2 rounded-md font-mono text-2xl font-bold character-cell">
                            {fullSubdomain.length}
                        </div>
                    </motion.div>
                </div>
                 <DialogFooter className="p-4 bg-black/30 border-t" style={{borderColor: recommendationColor+'4D'}}>
                    <Button onClick={() => onOpenChange(false)} className="w-full text-white" style={{backgroundColor: recommendationColor}}>Entendido</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
