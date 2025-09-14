
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, ArrowRight, Copy, Check, ShieldCheck, Loader2, AlertTriangle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { verifyDnsAction } from '@/app/dashboard/servers/actions';

interface SmtpConnectionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type VerificationStatus = 'idle' | 'pending' | 'verifying' | 'verified' | 'failed';

const generateVerificationCode = () => `demo_${Math.random().toString(36).substring(2, 10)}`;

export function SmtpConnectionModal({ isOpen, onOpenChange }: SmtpConnectionModalProps) {
  const { toast } = useToast();
  const [domain, setDomain] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');

  const txtRecordName = `_foxmiu-verification`;
  const txtRecordValue = `${domain},code=${verificationCode}`;

  const handleStartVerification = () => {
    if (!domain || !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
      toast({
        title: "Dominio no válido",
        description: "Por favor, introduce un nombre de dominio válido.",
        variant: "destructive",
      });
      return;
    }
    setVerificationCode(generateVerificationCode());
    setVerificationStatus('pending');
    setCurrentStep(2);
  };
  
  const handleCheckVerification = async () => {
    setVerificationStatus('verifying');
    const result = await verifyDnsAction({
      domain,
      expectedTxt: txtRecordValue,
    });
    
    if (result.success) {
      setVerificationStatus('verified');
    } else {
      setVerificationStatus('failed');
      toast({
        title: "Verificación Fallida",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "¡Copiado!",
        description: "El registro ha sido copiado al portapapeles.",
        className: 'bg-success-login border-none text-white'
    });
  }

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
        setCurrentStep(1);
        setDomain('');
        setVerificationCode('');
        setVerificationStatus('idle');
    }, 300);
  }
  
  const renderStepContent = () => {
    switch (currentStep) {
        case 1:
            return (
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
                    <Button className="w-full" onClick={handleStartVerification}>
                    Verificar Dominio <ArrowRight className="ml-2"/>
                    </Button>
                </div>
            )
        case 2:
            const cardAnimation = {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -20 },
            };
            return (
                 <div className="py-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        <b>Paso 2: Añadir Registro DNS.</b> Copia el siguiente registro TXT y añádelo a la configuración DNS de tu dominio <b>{domain}</b>.
                    </p>

                    <div className="space-y-3">
                        <div className="p-3 bg-muted/50 rounded-md text-sm font-mono border">
                            <Label className="text-xs font-sans text-muted-foreground">REGISTRO</Label>
                            <p className="flex justify-between items-center">{txtRecordName} <Copy className="size-4 cursor-pointer" onClick={() => handleCopy(txtRecordName)}/></p>
                        </div>
                         <div className="p-3 bg-muted/50 rounded-md text-sm font-mono border">
                            <Label className="text-xs font-sans text-muted-foreground">VALOR</Label>
                            <p className="flex justify-between items-center break-all">{txtRecordValue} <Copy className="size-4 cursor-pointer ml-2" onClick={() => handleCopy(txtRecordValue)}/></p>
                        </div>
                    </div>
                    
                    <AnimatePresence mode="wait">
                    {verificationStatus === 'pending' && (
                        <motion.div key="pending" {...cardAnimation}>
                             <Button className="w-full" onClick={handleCheckVerification}>
                                Ya he añadido el registro, verificar ahora
                            </Button>
                        </motion.div>
                    )}
                    {verificationStatus === 'verifying' && (
                        <motion.div key="verifying" {...cardAnimation} className="p-4 bg-blue-500/10 text-blue-300 rounded-lg flex items-center justify-center gap-3 text-center">
                            <div className="relative size-12">
                               <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full"/>
                               <div className="absolute inset-0 border-t-2 border-blue-400 rounded-full animate-spin"/>
                               <Search className="absolute inset-0 m-auto size-6"/>
                            </div>
                            <div>
                                <h4 className="font-bold">Verificando...</h4>
                                <p className="text-xs">Buscando el registro DNS en el dominio.</p>
                            </div>
                        </motion.div>
                    )}
                     {verificationStatus === 'verified' && (
                        <motion.div key="verified" {...cardAnimation} className="p-4 bg-green-500/10 text-green-400 rounded-lg flex flex-col items-center gap-3 text-center">
                            <ShieldCheck className="size-10" />
                            <h4 className="font-bold">¡Dominio Verificado!</h4>
                            <p className="text-xs">El registro TXT se encontró correctamente.</p>
                             <Button className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white" onClick={() => setCurrentStep(3)}>
                                Continuar <ArrowRight className="ml-2"/>
                            </Button>
                        </motion.div>
                    )}
                    {verificationStatus === 'failed' && (
                        <motion.div key="failed" {...cardAnimation} className="p-4 bg-red-500/10 text-red-400 rounded-lg flex flex-col items-center gap-3 text-center">
                            <AlertTriangle className="size-10" />
                            <h4 className="font-bold">Verificación Fallida</h4>
                            <p className="text-xs">No pudimos encontrar el registro. La propagación de DNS puede tardar. Por favor, inténtalo de nuevo en unos minutos.</p>
                             <Button variant="outline" className="w-full mt-2" onClick={handleCheckVerification}>
                                Reintentar Verificación
                            </Button>
                        </motion.div>
                    )}
                    </AnimatePresence>
                 </div>
            )
        default: return null;
    }
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
        {renderStepContent()}
        <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
