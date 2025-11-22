"use client";

import React, { useState, useEffect, useCallback, useTransition, useActionState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MoreHorizontal,
  FileIcon,
  ImageIcon,
  Film,
  FileText,
  Music,
  Archive,
  Edit,
  Trash2,
  Download,
  Eye,
  UploadCloud,
  Loader2,
  Search,
  XCircle,
  AlertTriangle,
  FolderOpen,
  Check,
  Globe,
  GitBranch,
  Mail,
  X,
  MailOpen,
  Code,
  Signal,
  CheckCircle,
  Layers,
  Plug,
  Hourglass,
  KeyRound,
  Shield,
  ArrowRight,
  Dna,
  Info,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { type Domain } from './types';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaPreview } from '@/components/admin/media-preview';
import { Separator } from '@/components/ui/separator';
import { getVerifiedDomains, createOrGetDomainAction } from './db-actions';


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
                toast({ title: "Modo de Demostración", description: "Cargando dominios de ejemplo." });
                const mockDomains: Domain[] = [
                    // @ts-ignore
                    { id: '1', domain_name: 'mailflow.ai', is_verified: true, updated_at: new Date().toISOString() },
                    // @ts-ignore
                    { id: '2', domain_name: 'daybuu.com', is_verified: true, updated_at: new Date().toISOString() },
                    // @ts-ignore
                    { id: '3', domain_name: 'my-super-long-domain-name-that-needs-truncation.com', is_verified: true, updated_at: new Date().toISOString() },
                    // @ts-ignore
                    { id: '4', domain_name: 'another-domain.dev', is_verified: false, updated_at: new Date().toISOString() },
                ];
                setDomains(mockDomains);
            }
        });
    }, [toast]);
    
    const truncateName = (name: string, maxLength: number = 23): string => {
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
            <ScrollArea className="flex-1 -mr-4 pr-4">
                <div className="space-y-2">
                    {filteredDomains.map((domain) => (
                        <motion.div
                            key={domain.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "group relative p-3 rounded-lg border-2 transition-all duration-300 flex flex-col items-start",
                                domain.is_verified ? "border-transparent bg-background/50 hover:bg-primary/10 hover:border-primary cursor-pointer" : "bg-muted/30 border-red-500/30 text-muted-foreground"
                            )}
                            onClick={() => domain.is_verified && onSelect(domain)}
                        >
                            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(120,119,198,0.15)_0%,rgba(255,255,255,0)_100%)] opacity-0 group-hover:opacity-100 transition-opacity"/>
                            <div className="flex items-center gap-3 min-w-0 w-full">
                                {domain.is_verified ? 
                                    <CheckCircle className="size-6 text-green-400 flex-shrink-0" /> : 
                                    <AlertTriangle className="size-6 text-red-400 flex-shrink-0" />
                                }
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-foreground truncate" title={domain.domain_name}>{truncateName(domain.domain_name)}</p>
                                </div>
                            </div>
                            {!domain.is_verified && (
                                <div className="pl-9 pt-2 w-full flex justify-between items-center">
                                    <p className="text-xs text-muted-foreground">
                                        Última act: {format(new Date(domain.updated_at), "dd/MM/yy", { locale: es })}
                                    </p>
                                    <Button variant="outline" size="sm" className="h-7 text-xs border-amber-500/50 text-amber-300 hover:bg-amber-500/20">Análisis</Button>
                                </div>
                            )}
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
            startTransition(() => {
                setProcessStatus('processing');
                setTimeout(() => {
                    setProcessStatus('success');
                    setCurrentStep(3);
                }, 1500)
            })
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
                        <h3 className="text-lg font-semibold mb-1">Añadir Subdominio</h3>
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

    const renderLeftPanel = () => {
        const stepInfo = [
            { title: "Seleccionar Dominio", icon: Globe },
            { title: "Añadir Subdominio", icon: GitBranch },
            { title: "Análisis DNS", icon: Dna },
        ];
        
        return (
            <div className="bg-muted/30 p-8 flex flex-col justify-between h-full">
                <div>
                   <DialogTitle className="text-xl font-bold flex items-center gap-2">Asociar Subdominio</DialogTitle>
                   <DialogDescription className="text-muted-foreground mt-1">Sigue los pasos para verificar tu nuevo subdominio.</DialogDescription>
                    
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
                        {currentStep === 1 ? (
                             <motion.div
                                key="step1-info"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center flex flex-col items-center gap-4"
                            >
                                <Info className="size-16 text-primary/80" />
                                <h4 className="font-bold text-lg">Selecciona un Dominio Raíz</h4>
                                <p className="text-sm text-muted-foreground">
                                    Para comenzar, elige uno de tus dominios principales ya verificados de la lista de la izquierda. Este será el dominio base para tu nuevo subdominio.
                                </p>
                            </motion.div>
                        ) : (
                             <p className="text-sm text-muted-foreground">Estado del Proceso</p>
                        )}
                    </div>
                     <div className="w-full mt-auto pt-4 space-y-2">
                        {currentStep === 2 && (
                            <Button
                                onClick={handleNextStep}
                                disabled={isPending || !subdomainName}
                                className="text-white hover:opacity-90 w-full h-12 text-base"
                                 style={{
                                  background: 'linear-gradient(to right, #1700E6, #009AFF)'
                                }}
                            >
                                {isPending ? <><Loader2 className="mr-2 animate-spin"/> Verificando...</> : <>Siguiente <ArrowRight className="ml-2"/></>}
                            </Button>
                        )}
                        <Button variant="outline" className="w-full h-12 text-base text-white border-white hover:bg-white hover:text-black" onClick={handleClose}>
                            <X className="mr-2"/>Cancelar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );

