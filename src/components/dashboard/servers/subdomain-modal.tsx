
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubdomainModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  hasVerifiedDomains: boolean;
}

export function SubdomainModal({ isOpen, onOpenChange, hasVerifiedDomains }: SubdomainModalProps) {
    if (hasVerifiedDomains) {
        return null; // Don't show the modal if domains are verified
    }
  
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-zinc-900/80 backdrop-blur-xl border border-amber-400/20 text-white overflow-hidden p-0">
                 <div className="absolute inset-0 z-0 opacity-10 bg-grid-amber-500/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
                 <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-amber-500/10 rounded-full animate-pulse-slow filter blur-3xl -translate-x-1/2 -translate-y-1/2"/>

                <div className="p-8 text-center flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
                      className="relative w-24 h-24 mb-6 flex items-center justify-center"
                    >
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/50 animate-spin-slow" />
                        <div className="absolute inset-2 rounded-full border-2 border-dashed border-amber-400/30 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
                        <AlertTriangle className="size-16 text-amber-400 animate-pulse" style={{ filter: 'drop-shadow(0 0 10px hsl(var(--primary)/0.7))' }}/>
                    </motion.div>
                    
                    <DialogHeader>
                        <DialogTitle className="relative inline-flex items-center justify-center gap-2 text-2xl font-bold mb-2 p-2 rounded-lg bg-black/30 border border-amber-400/20">
                            <Eye className="text-amber-300"/>
                            Acción Requerida
                        </DialogTitle>
                        <DialogDescription className="text-amber-100/80">
                            No puedes añadir un subdominio porque aún no has verificado un dominio principal.
                            <br /><br />
                            <strong className="text-white/90">Ejemplo:</strong> Primero debes verificar `ejemplo.com` antes de poder añadir `marketing.ejemplo.com`.
                        </DialogDescription>
                    </DialogHeader>
                </div>
                <DialogFooter className="p-4 bg-black/20 border-t border-amber-400/20">
                    
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
