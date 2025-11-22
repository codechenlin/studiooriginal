
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  ArrowLeft,
  Dna,
  RefreshCw,
  BrainCircuit
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { type Domain } from './types';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaPreview } from '@/components/admin/media-preview';
import { DnsStatusModal } from './dns-status-modal';
import { Separator } from '@/components/ui/separator';
// import { createOrGetDomainAction } from './db-actions';

// Mock Data
const mockDomains: Domain[] = [
    // @ts-ignore
    { id: '1', domain_name: 'mailflow.ai', is_verified: true, emails: [{address: 'ventas@mailflow.ai', connected: true}, {address: 'soporte@mailflow.ai', connected: true}, {address: 'info@mailflow.ai', connected: false}]},
    // @ts-ignore
    { id: '2', domain_name: 'daybuu.com', is_verified: true, emails: [{address: 'contacto@daybuu.com', connected: true}]},
    // @ts-ignore
    { id: '3', domain_name: 'my-super-long-domain-name-that-needs-truncation.com', is_verified: true, emails: [{address: 'test@my-super-long-domain-name-that-needs-truncation.com', connected: false}]},
    // @ts-ignore
    { id: '4', domain_name: 'another-domain.dev', is_verified: false, emails: []},
];

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

function DomainList({ onSelect, renderLoading }: { onSelect: (domain: Domain) => void; renderLoading: () => React.ReactNode; }) {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setIsLoading(true);
        // Simulate fetching data
        setTimeout(() => {
            setDomains(mockDomains);
            setIsLoading(false);
        }, 1500);
    }, []);
    
    const truncateName = (name: string, maxLength: number = 25): string => {
        if (!name || name.length <= maxLength) {
            return name || '';
        }
        return `${name.substring(0, maxLength)}...`;
    };
    
    const filteredDomains = domains.filter(domain => domain.domain_name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (isLoading) {
        return <>{renderLoading()}</>;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="relative mb-4 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Buscar por nombre..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
             <div className="text-xs text-amber-300/80 p-3 mb-4 rounded-lg bg-amber-500/10 border border-amber-400/20 flex items-start gap-3">
                <AlertTriangle className="size-8 text-amber-400 shrink-0"/>
                <div>
                    <strong className="text-amber-300">¡Atención!</strong> Antes de poder iniciar sesión con una dirección de correo SMTP asociada a un subdominio, es crucial que verifiques el estado y la configuración del mismo.
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-2">
                    {filteredDomains.map((domain) => (
                        <motion.div
                            key={domain.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "group relative p-3 rounded-lg border-2 transition-all duration-300 flex items-center justify-between",
                                domain.is_verified ? "border-transparent bg-background/50 hover:bg-primary/10 hover:border-primary cursor-pointer" : "bg-muted/30 border-muted text-muted-foreground"
                            )}
                            onClick={() => domain.is_verified && onSelect(domain)}
                        >
                            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(120,119,198,0.15)_0%,rgba(255,255,255,0)_100%)] opacity-0 group-hover:opacity-100 transition-opacity"/>
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
                        </motion.div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

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
  
    const stepInfo = [
      { title: "Seleccionar Dominio Principal", icon: Globe },
      { title: "Asignar Subdominio", icon: GitBranch },
      { title: "Análisis DNS", icon: Dna },
    ];
  
  const StatusIndicator = () => {
    let text = 'ESTADO DEL SISTEMA';
    switch(currentStep) {
        case 1: text = 'BUSCANDO DOMINIOS'; break;
        case 2: text = 'ASIGNANDO SUBDOMINIO'; break;
        case 3: text = 'LISTO PARA ANÁLISIS'; break;
    }

    return (
        <div className="flex items-center justify-center gap-2 mb-4 p-2 rounded-lg bg-black/10 border border-white/5">
             <div className="relative flex items-center justify-center w-4 h-4">
                <div className="absolute w-full h-full rounded-full bg-amber-500 animate-pulse" style={{filter: `blur(4px)`}}/>
                <div className="w-2 h-2 rounded-full bg-amber-500" />
             </div>
            <p className="text-xs font-semibold tracking-wider text-white/80">{text}</p>
        </div>
    );
  };

  return (
    <>
      <DnsStatusModal isOpen={isDnsModalOpen} onOpenChange={setIsDnsModalOpen} status="ok" />
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className="max-w-5xl p-0 grid grid-cols-1 md:grid-cols-3 gap-0 h-[98vh]">
           <DialogHeader className="sr-only">
            <DialogTitle>Crear Subdominio</DialogTitle>
            <DialogDescription>
              Un asistente para guiarte en la creación y configuración de un nuevo subdominio.
            </DialogDescription>
          </DialogHeader>
          <div className="hidden md:block col-span-1 bg-muted/30 p-8">
            <h2 className="text-lg font-bold flex items-center gap-2"><GitBranch /> Crear Subdominio</h2>
            <p className="text-sm text-muted-foreground mt-1">Sigue los pasos para configurar tu nuevo subdominio.</p>
            <ul className="space-y-6 mt-8">
              {stepInfo.map((step, index) => {
                  const stepNumber = index + 1;
                  const isActive = currentStep === stepNumber;
                  const isCompleted = currentStep > stepNumber;
                  return (
                    <li key={index} className="flex items-center gap-4">
                      <div className={cn(
                        "size-10 rounded-full flex items-center justify-center border-2 transition-all",
                        isCompleted ? "bg-green-500/20 border-green-500 text-green-400" :
                        isActive ? "bg-primary/10 border-primary text-primary animate-pulse" :
                        "bg-muted/50 border-border"
                      )}>
                        {isCompleted ? <Check /> : <step.icon className="size-5" />}
                      </div>
                      <span className={cn(
                        "font-semibold",
                        isCompleted && "text-green-400",
                        isActive && "text-primary",
                        !isActive && !isCompleted && "text-muted-foreground"
                      )}>{step.title}</span>
                    </li>
                  )
              })}
            </ul>
             <div className="relative w-full h-px my-8" style={{ background: 'linear-gradient(to right, transparent, #E18700, transparent)' }}>
                <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{backgroundColor: '#E18700', boxShadow: '0 0 8px #E18700'}}/>
            </div>
             <div className="mt-8 space-y-3">
                <Label>Búsqueda Rápida de Dominio</Label>
                <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input placeholder="Buscar por nombre..." className="pl-10"/>
                </div>
                 <div className="mt-4 p-3 bg-amber-500/10 text-amber-200/90 rounded-lg border border-amber-400/20 text-xs flex items-start gap-3">
                    <AlertTriangle className="size-8 text-amber-400 shrink-0 mt-1" />
                    <p>
                        <strong className="text-amber-300">¡Atención!</strong> Antes de poder iniciar sesión con una dirección de correo SMTP asociada a un subdominio, es crucial que verifiques el estado y la configuración del mismo.
                    </p>
                </div>
            </div>
          </div>
          
          <div className="md:col-span-2 flex flex-col">
              <div className="p-4 border-b flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0 flex items-center gap-2">
                    <h3 className="font-semibold text-left truncate flex items-center gap-2">
                        <Eye className="size-4 text-muted-foreground"/>
                        {stepInfo[currentStep - 1].title}
                    </h3>
                </div>
              </div>
              
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>
            </div>
            <DialogFooter className="p-4 border-t bg-muted/20">
                 <Button
                    variant="outline"
                    className="border-white text-white hover:bg-[#F00000] hover:border-[#F00000]"
                    onClick={handleClose}
                >
                  <X className="mr-2" />
                  Cancelar
                </Button>
              <div className="flex gap-2">
                {currentStep > 1 && <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}><ArrowLeft className="mr-2" />Anterior</Button>}
                {currentStep < 3 && 
                    <Button 
                        onClick={handleNextStep}
                        className="bg-gradient-to-r from-[#1700E6] to-[#009AFF] text-white hover:bg-gradient-to-r hover:from-[#00CE07] hover:to-[#A6EE00]"
                    >
                        <RefreshCw className="mr-2" />
                        Actualizar
                    </Button>
                }
                {currentStep === 3 && <Button onClick={handleClose}><Check className="mr-2" />Finalizar</Button>}
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      </>
  );
}

    