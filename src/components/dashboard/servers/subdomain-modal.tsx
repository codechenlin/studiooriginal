
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-amber-400" />Acción Requerida</DialogTitle>
                    <DialogDescription>
                        No puedes añadir un subdominio porque aún no has verificado un dominio principal.
                        <br /><br />
                        <strong>Ejemplo:</strong> Primero debes verificar `ejemplo.com` antes de poder añadir `marketing.ejemplo.com`.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Entendido</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
