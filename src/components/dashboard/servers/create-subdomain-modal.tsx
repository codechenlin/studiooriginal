
"use client";

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Globe,
  GitBranch,
  Dna,
  ArrowRight,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Search,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { type Domain } from './types';
import { getVerifiedDomains } from './db-actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface CreateSubdomainModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const renderLoading = () => (
    <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-black/20">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        ))}
    </div>
);

function DomainList({ onSelect, renderLoading }: { onSelect: (domain: Domain) => void; renderLoading: () => React.ReactNode }) {
    const { toast } = useToast();
    const [domains, setDomains] = useState<Domain[]>([]);
    const [isLoading, startLoading] = useTransition();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        startLoading(async () => {
            const result = await getVerifiedDomains();
            if (result.success && result.data) {
                setDomains(result.data);
            } else {
                toast({ title: "Error al cargar dominios", description: result.error, variant: 'destructive' });
            }
        });
    }, [toast]);

    const truncateName = (name: string, maxLength: number = 25): string => {
        if (!name || name.length <= maxLength) return name || '';
        return `${name.substring(0, maxLength)}...`;
    };
    
    const filteredDomains = domains.filter(domain => domain.domain_name && domain.domain_name.toLowerCase().includes(searchTerm.toLowerCase()));


    if (isLoading) {
        return <>{renderLoading()}</>;
    }

    return (
        <div className="flex flex-col h-full">
             <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar dominio..."
                    className="pl-10 bg-background/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-2">
                    {filteredDomains.map((domain) => (
                        <motion.div
                            key={domain.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative p-3 rounded-lg border-2 border-transparent bg-background/50 transition-all duration-300 hover:bg-primary/10 hover:border-primary cursor-pointer"
                            onClick={() => onSelect(domain)}
                        >
                            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(120,119,198,0.15)_0%,rgba(255,255,255,0)_100%)] opacity-0 group-hover:opacity-100 transition-opacity"/>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                    {domain.is_verified ? 
                                        <CheckCircle className="size-6 text-green-400 flex-shrink-0" /> : 
                                        <AlertTriangle className="size-6 text-red-400 flex-shrink-0" />
                                    }
                                    <div className="min-w-0">
                                      <p className="font-semibold text-foreground truncate" title={domain.domain_name}>{truncateName(domain.domain_name, 25)}</p>
                                      <p className="text-xs text-muted-foreground">{domain.is_verified ? 'Verificado' : 'Verificación pendiente'}</p>
                                    </div>
                                </div>
                                {domain.is_verified && (
                                    <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        Seleccionar
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

export function CreateSubdomainModal({ isOpen, onOpenChange }: CreateSubdomainModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [subdomainName, setSubdomainName] = useState('');
    const [isPending, startTransition] = useTransition();
    const [processStatus, setProcessStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

    const handleSelectDomain = (domain: Domain) => {
        setSelectedDomain(domain);
        setCurrentStep(2);
        setProcessStatus('idle');
    };
    
    const handleNextStep = () => {
        if (currentStep === 2 && subdomainName) {
            setProcessStatus('processing');
            setTimeout(() => {
                setProcessStatus('success');
                setCurrentStep(3);
            }, 1500)
        }
    }

    const resetState = () => {
        setCurrentStep(1);
        setSelectedDomain(null);
        setSubdomainName('');
        setProcessStatus('idle');
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(resetState, 300);
    };

    const cardAnimation = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.3 }
    };
    
    const renderLeftPanel = () => {
        const stepInfo = [
            { title: "Seleccionar Dominio", icon: Globe },
            { title: "Crear Subdominio", icon: GitBranch },
            { title: "Análisis DNS", icon: Dna },
        ];
        
        return (
            <div className="bg-muted/30 p-8 flex flex-col justify-between h-full">
                <div>
                   <DialogTitle className="text-xl font-bold flex items-center gap-2">Crear Subdominio</DialogTitle>
                   <DialogDescription className="text-muted-foreground mt-1">Sigue los pasos para configurar tu nuevo subdominio.</DialogDescription>
                    
                    <ul className="space-y-4 mt-8">
                      {stepInfo.map((step, index) => (
                          <li key={index} className="flex items-center gap-4">
                             <div className={cn(
                                  "size-10 rounded-full flex items-center justify-center border-2 transition-all",
                                  currentStep === index + 1 && "bg-primary/10 border-primary text-primary animate-pulse",
                                  currentStep > index + 1 && "bg-green-500/20 border-green-500 text-green-400",
                                  currentStep < index + 1 && "bg-muted/50 border-border"
                             )}>
                                 <step.icon className="size-5" />
                             </div>
                             <span className={cn(
                                 "font-semibold transition-colors",
                                 currentStep === index + 1 && "text-primary",
                                 currentStep > index + 1 && "text-green-400",
                                 currentStep < index + 1 && "text-muted-foreground"
                             )}>{step.title}</span>
                          </li>
                      ))}
                    </ul>
                     <Separator className="my-6" />
                     <div className="p-3 bg-amber-500/10 text-amber-200/90 rounded-lg border border-amber-400/20 text-xs flex items-start gap-3">
                        <AlertTriangle className="size-10 text-amber-400 shrink-0"/>
                        <p>
                            <strong>¡Atención!</strong> Antes de poder iniciar sesión con una dirección de correo SMTP asociada a un subdominio, es crucial que verifiques el estado y la configuración del mismo.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="flex flex-col h-full">
                        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2"><Eye className="size-5" />Seleccionar Dominio Principal</h3>
                        <p className="text-sm text-muted-foreground mb-4">Elige el dominio verificado al que se asociará tu nuevo subdominio.</p>
                        <DomainList onSelect={handleSelectDomain} renderLoading={renderLoading} />
                    </div>
                );
            case 2:
                return (
                    <div className="flex flex-col h-full justify-center">
                        <h3 className="text-lg font-semibold mb-1">Crear Subdominio</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Introduce el nombre para tu subdominio (ej: "marketing"). Se creará como:
                            <span className="font-mono text-primary p-1 bg-primary/10 rounded-md ml-1">{subdomainName || '...'}.{selectedDomain?.domain_name}</span>
                        </p>
                        <Input 
                            value={subdomainName}
                            onChange={(e) => setSubdomainName(e.target.value)}
                            placeholder="ej: marketing"
                        />
                    </div>
                );
            case 3:
                return (
                     <div className="flex flex-col h-full justify-center text-center">
                         <CheckCircle className="size-16 mx-auto text-green-400 mb-4"/>
                        <h3 className="text-lg font-semibold mb-1">Análisis Completado</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            El dominio principal <span className="font-bold">{selectedDomain?.domain_name}</span> está apto para la creación de subdominios.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    const StatusIndicator = () => {
      const statusConfig = {
          idle: { text: 'EN ESPERA', color: 'bg-blue-500' },
          processing: { text: 'PROCESANDO', color: 'bg-amber-500' },
          success: { text: 'COMPLETADO', color: 'bg-green-500' },
          error: { text: 'ERROR', color: 'bg-red-500' }
      };
      const currentConfig = statusConfig[processStatus];
      return (
        <div className="flex items-center justify-center gap-2 mb-4 p-2 rounded-lg bg-black/10 border border-white/5">
          <div className="relative flex items-center justify-center w-4 h-4">
            <div className={cn('absolute w-full h-full rounded-full', currentConfig.color, processStatus !== 'processing' && 'animate-pulse')} style={{filter: `blur(4px)`}}/>
            {processStatus === 'processing' ? <Loader2 className='w-4 h-4 text-amber-300 animate-spin'/> : <div className={cn('w-2 h-2 rounded-full', currentConfig.color)} /> }
          </div>
          <p className="text-xs font-semibold tracking-wider text-white/80">{currentConfig.text}</p>
        </div>
      );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl p-0 grid grid-cols-1 md:grid-cols-3 gap-0 h-[98vh]" showCloseButton={false}>
                {/* Left Panel */}
                <div className="hidden md:block md:col-span-1 h-full">
                  {renderLeftPanel()}
                </div>

                {/* Center Panel */}
                <div className="md:col-span-1 h-full p-8 flex flex-col justify-start">
                    <AnimatePresence mode="wait">
                        <motion.div key={currentStep} {...cardAnimation} className="flex flex-col h-full">
                           {renderStepContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right Panel */}
                <div className="md:col-span-1 h-full p-8 border-l bg-muted/20 flex flex-col items-center text-center">
                    <StatusIndicator />
                    <div className="w-full flex-grow flex flex-col justify-center">
                        <p className="text-sm text-muted-foreground">Estado del Proceso</p>
                    </div>
                     <div className="w-full mt-auto pt-4 space-y-2">
                         <Button
                            onClick={handleNextStep}
                            disabled={isPending}
                            className="w-full h-12 text-base text-white hover:opacity-90"
                             style={{
                              background: 'linear-gradient(to right, #1700E6, #009AFF)'
                            }}
                             onMouseOver={(e) => { e.currentTarget.style.background = 'linear-gradient(to right, #00CE07, #A6EE00)'; }}
                             onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(to right, #1700E6, #009AFF)'; }}
                          >
                           <RefreshCw className="mr-2"/>
                           Actualizar
                          </Button>
                        <Button variant="outline" className="w-full h-12 text-base text-white border-white hover:bg-white hover:text-black" onClick={handleClose}>
                            <X className="mr-2"/>Cancelar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
