
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe, ArrowRight, Dna, DatabaseZap, Check, X, GitBranch, Loader2, AlertTriangle, CheckCircle, Info, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { DomainList } from './domain-list';
import { type Domain } from './types';
import { DnsStatusModal } from './dns-status-modal';

interface CreateSubdomainModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const LoadingPlaceholder = () => (
    <div className="flex flex-col items-center justify-center text-center text-cyan-200/50 h-full p-4">
        <div className="relative w-28 h-28 mb-4 flex items-center justify-center">
            <motion.div
                className="absolute inset-2 border-2 border-dashed rounded-full"
                style={{ borderColor: '#1700E6' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="absolute inset-5 border-2 border-dashed rounded-full"
                style={{ borderColor: '#009AFF' }}
                animate={{ rotate: -360 }}
                transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
            />
             <motion.div
                className="absolute inset-0 z-0 rounded-full"
                style={{
                    boxShadow: `0 0 0px #1700E6`,
                    filter: `blur(15px)`,
                    background: `#1700E6`
                }}
                animate={{
                    transform: ['scale(0.3)', 'scale(0.4)', 'scale(0.3)'],
                    opacity: [0, 0.3, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Globe className="relative z-10 size-12 text-cyan-200" />
        </div>
        <h4 className="font-semibold text-white/80">Buscando Dominios Verificados...</h4>
        <p className="text-xs">Sincronizando con la red de dominios para continuar.</p>
    </div>
);

const StatusIndicator = () => {
    return (
      <div className="flex items-center justify-center gap-2 mb-4 p-2 rounded-lg bg-black/10 border border-white/5 w-full">
        <div className="relative flex items-center justify-center w-4 h-4">
          <div className="absolute w-full h-full rounded-full bg-blue-500 animate-pulse" style={{filter: `blur(4px)`}}/>
          <div className="w-2 h-2 rounded-full bg-blue-500" />
        </div>
        <p className="text-xs font-semibold tracking-wider text-white/80">ESTADO DEL SISTEMA</p>
      </div>
    );
};

export function CreateSubdomainModal({ isOpen, onOpenChange }: CreateSubdomainModalProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [subdomainName, setSubdomainName] = useState('');
  const [isDnsModalOpen, setIsDnsModalOpen] = useState(false);

  const handleDomainSelect = (domain: Domain) => {
    if (domain.is_verified) {
      setSelectedDomain(domain);
      setCurrentStep(2);
    } else {
      toast({
        title: "Dominio no verificado",
        description: "Solo puedes añadir subdominios a dominios que ya han sido verificados.",
        variant: "destructive"
      });
    }
  };

  const handleNextStep = () => {
    if (currentStep === 2 && !subdomainName.trim()) {
      toast({ title: "Nombre requerido", description: "Por favor, introduce un nombre para el subdominio.", variant: 'destructive' });
      return;
    }
    setCurrentStep(currentStep + 1);
  };
  
  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
        setCurrentStep(1);
        setSelectedDomain(null);
        setSubdomainName('');
    }, 300);
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <DomainList onSelect={handleDomainSelect} renderLoading={() => <LoadingPlaceholder />} />;
      case 2:
        return (
          <div className="text-center p-8 flex flex-col items-center justify-center h-full">
            <motion.div initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}}>
              <h3 className="text-lg font-semibold">Asignar Subdominio</h3>
              <p className="text-sm text-muted-foreground mt-2">Introduce el nombre para tu subdominio.</p>
              <div className="mt-6 flex items-center justify-center gap-2 max-w-md mx-auto">
                <Input
                  placeholder="marketing"
                  value={subdomainName}
                  onChange={(e) => setSubdomainName(e.target.value)}
                  className="text-right"
                />
                <span className="text-muted-foreground">.</span>
                <span className="font-semibold">{selectedDomain?.domain_name}</span>
              </div>
            </motion.div>
          </div>
        );
      case 3:
        return (
             <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                <motion.div initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}}>
                    <div className="relative w-24 h-24 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-pulse"/>
                        <Dna className="size-24 text-cyan-300"/>
                    </div>
                    <h3 className="text-lg font-semibold">Análisis DNS del Dominio Principal</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                        Verificaremos la salud del dominio principal <strong>{selectedDomain?.domain_name}</strong> para asegurar la correcta entregabilidad del nuevo subdominio <strong>{subdomainName}.{selectedDomain?.domain_name}</strong>.
                    </p>
                     <Button className="mt-6" onClick={() => setIsDnsModalOpen(true)}>
                        Iniciar Análisis
                    </Button>
                </motion.div>
            </div>
        );
      default:
        return null;
    }
  };

  const stepTitles = ["Seleccionar Dominio Principal", "Asignar Subdominio", "Análisis DNS"];

  return (
    <>
      <DnsStatusModal isOpen={isDnsModalOpen} onOpenChange={setIsDnsModalOpen} status="ok" />
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className="max-w-5xl p-0 grid grid-cols-1 md:grid-cols-3 gap-0 h-[600px]">
           <DialogHeader className="sr-only">
            <DialogTitle>Crear Subdominio</DialogTitle>
            <DialogDescription>
              Un asistente para guiarte en la creación y configuración de un nuevo subdominio.
            </DialogDescription>
          </DialogHeader>
          {/* Left Panel: Steps */}
          <div className="hidden md:block col-span-1 bg-muted/30 p-8">
            <h2 className="text-lg font-bold flex items-center gap-2"><GitBranch /> Crear Subdominio</h2>
            <p className="text-sm text-muted-foreground mt-1">Sigue los pasos para configurar tu nuevo subdominio.</p>
            <ul className="space-y-6 mt-8">
              {stepTitles.map((title, index) => (
                <li key={index} className="flex items-center gap-4">
                  <div className={cn(
                    "size-10 rounded-full flex items-center justify-center border-2 transition-all",
                    currentStep > index + 1 ? "bg-green-500/20 border-green-500 text-green-400" :
                    currentStep === index + 1 ? "bg-primary/10 border-primary text-primary animate-pulse" :
                    "bg-muted/50 border-border"
                  )}>
                    {currentStep > index + 1 ? <Check /> : <span>{index + 1}</span>}
                  </div>
                  <span className={cn(
                    "font-semibold",
                    currentStep > index + 1 && "text-green-400",
                    currentStep === index + 1 && "text-primary",
                    currentStep < index + 1 && "text-muted-foreground"
                  )}>{title}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Right Panel: Content */}
          <div className="md:col-span-2 flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-center">Seleccionar Dominio</h3>
              <p className="text-sm text-center text-muted-foreground">Elige un dominio verificado para asociar tu nuevo subdominio.</p>
               <div className="mt-4">
                 <StatusIndicator />
              </div>
              <div className="relative w-full h-px my-4 bg-gradient-to-r from-transparent via-primary/30 to-transparent">
                <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]"/>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>
            </div>
            <DialogFooter className="p-4 border-t bg-muted/20">
              <Button variant="outline" onClick={handleClose}><X className="mr-2" />Cancelar</Button>
              {currentStep > 1 && <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}><ArrowLeft className="mr-2" />Anterior</Button>}
              {currentStep < 3 && <Button onClick={handleNextStep} disabled={(currentStep === 1 && !selectedDomain) || (currentStep === 2 && !subdomainName.trim())}><ArrowRight className="mr-2" />Siguiente</Button>}
              {currentStep === 3 && <Button onClick={handleClose}><Check className="mr-2" />Finalizar</Button>}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
