
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SubdomainDisplayModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  fullSubdomain: string;
  isAvailable: boolean | null;
}

export function SubdomainDisplayModal({ isOpen, onOpenChange, fullSubdomain, isAvailable }: SubdomainDisplayModalProps) {
    
    const truncateSubdomain = (name: string, maxLength: number = 60): string => {
        if (name.length <= maxLength) {
            return name;
        }
        return `${name.substring(0, maxLength)}...`;
    };
    
    const truncatedSubdomain = truncateSubdomain(fullSubdomain);

    const statusConfig = isAvailable === null
        ? {
            title: "Nombre Inválido",
            description: "El formato del subdominio no es válido. Revisa los caracteres permitidos.",
            icon: AlertTriangle,
            color: "#E18700", // Orange
        }
        : isAvailable
        ? {
            title: "Subdominio Disponible",
            description: "¡Excelente! Este subdominio está libre y listo para ser configurado.",
            icon: CheckCircle,
            color: "#00CB07", // Green
        }
        : {
            title: "Subdominio en Uso",
            description: "Este subdominio ya está registrado en otra cuenta. Por favor, elige uno diferente.",
            icon: XCircle,
            color: "#F00000", // Red
        };

    const Icon = statusConfig.icon;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-4xl w-full bg-black/80 backdrop-blur-xl border text-white overflow-hidden p-0" style={{borderColor: statusConfig.color+'4D'}}>
                 <style>{`
                    @keyframes grid-pan { 0% { background-position: 0% 0%; } 100% { background-position: 100% 100%; } }
                    .animated-grid { background-image: linear-gradient(to right, hsl(190 100% 50% / 0.1) 1px, transparent 1px), linear-gradient(to bottom, hsl(190 100% 50% / 0.1) 1px, transparent 1px); background-size: 3rem 3rem; animation: grid-pan 60s linear infinite; }
                    
                    @keyframes hud-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    
                    .character-cell {
                        background: radial-gradient(circle, ${statusConfig.color}33, transparent 70%);
                        border: 1px solid ${statusConfig.color}4D;
                        box-shadow: inset 0 0 10px ${statusConfig.color}1A;
                    }
                `}</style>

                <div className="absolute inset-0 z-0 opacity-20 animated-grid"/>
                <div className="p-8 space-y-8 z-10">
                    <div className="text-center p-6 rounded-lg border-2 border-dashed" style={{borderColor: statusConfig.color+'80', background: `radial-gradient(ellipse at center, ${statusConfig.color}1A, transparent 70%)`}}>
                        <Icon className="mx-auto size-16 mb-4" style={{color: statusConfig.color, filter: `drop-shadow(0 0 10px ${statusConfig.color})`}}/>
                        <h3 className="text-2xl font-bold" style={{color: statusConfig.color}}>{statusConfig.title}</h3>
                        <p className="text-sm text-white/70">{statusConfig.description}</p>
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
                 <DialogFooter className="p-4 bg-black/30 border-t" style={{borderColor: statusConfig.color+'4D'}}>
                    <Button onClick={() => onOpenChange(false)} className="w-full text-white" style={{backgroundColor: statusConfig.color}}>Entendido</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
