
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SmtpConnectionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SmtpConnectionModal({ isOpen, onOpenChange }: SmtpConnectionModalProps) {
  const { toast } = useToast();
  const [domain, setDomain] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const handleVerifyDomain = () => {
    // Basic domain validation
    if (!domain || !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
      toast({
        title: "Dominio no válido",
        description: "Por favor, introduce un nombre de dominio válido.",
        variant: "destructive",
      });
      return;
    }
    // In a real scenario, here we would generate the TXT record
    // and move to the next step.
    console.log(`Verifying domain: ${domain}`);
    setCurrentStep(2); // Move to next step for demonstration
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state when closing
    setTimeout(() => {
        setCurrentStep(1);
        setDomain('');
    }, 300);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Conectar a Servidor SMTP</DialogTitle>
          <DialogDescription>
            Sigue los pasos para conectar de forma segura tu servidor de correo.
          </DialogDescription>
        </DialogHeader>

        {currentStep === 1 && (
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              <b>Paso 1: Verificar Dominio.</b> Para asegurar la entregabilidad y autenticidad de tus correos, primero debemos verificar que eres el propietario del dominio desde el que quieres enviar.
            </p>
            <div className="space-y-2">
              <Label htmlFor="domain">Tu Dominio</Label>
              <div className="relative">
                 <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                 <Input 
                    id="domain" 
                    placeholder="ejemplo.com" 
                    className="pl-10"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                />
              </div>
            </div>
            <Button className="w-full" onClick={handleVerifyDomain}>
              Verificar Dominio <ArrowRight className="ml-2"/>
            </Button>
          </div>
        )}
        
        {currentStep === 2 && (
             <div className="py-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                    <b>Paso 2: Añadir Registro DNS.</b> Copia el siguiente registro TXT y añádelo a la configuración DNS de tu dominio <b>{domain}</b>.
                </p>
                {/* Placeholder for TXT record display */}
                 <div className="p-4 bg-muted rounded-md text-sm font-mono">
                    <p>_mailflow-verification={domain}</p>
                 </div>
                 <p className="text-xs text-muted-foreground">Una vez añadido, la verificación puede tardar unos minutos o hasta 24 horas en propagarse.</p>
                 <Button className="w-full">Ya he añadido el registro</Button>
             </div>
        )}

        <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
