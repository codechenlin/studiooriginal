"use client";

import React, { useState, useEffect, useCallback, useTransition, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
  Dna,
  Info,
  ArrowRight,
  Workflow,
  RefreshCw,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { type Domain } from './types';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaPreview } from '@/components/admin/media-preview';
import { Separator } from '@/components/ui/separator';
import {
  createOrGetDomainAction,
} from './db-actions';
import { DomainInfoModal } from './domain-info-modal';
import { DnsStatusModal } from '@/components/dashboard/servers/dns-status-modal';
import { DomainManagerModal } from '@/components/dashboard/servers/domain-manager-modal';
import { AddEmailModal } from '@/components/dashboard/servers/add-email-modal';
import { DomainVerificationSuccessModal } from '@/components/dashboard/servers/domain-verification-success-modal';
import { verifyDnsAction, verifyDomainOwnershipAction, validateDomainWithAIAction } from '@/app/dashboard/servers/actions';
import { sendTestEmailAction } from '@/app/dashboard/servers/send-email-actions';
import { analyzeSmtpErrorAction } from '@/app/dashboard/servers/smtp-error-analysis-actions';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { generateDkimKeys, type DkimGenerationOutput } from '@/ai/flows/dkim-generation-flow';
import { type DnsHealthOutput } from '@/ai/flows/dns-verification-flow';
import { type VmcAnalysisOutput } from '@/app/dashboard/demo/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';
import { PauseVerificationModal } from './pause-verification-modal';
import { ScoreDisplay } from '@/components/dashboard/score-display';
import { SubdomainDisplayModal } from './subdomain-display-modal';
import {
  setDomainAsVerified,
  updateDkimKey,
  saveDnsChecks,
  updateDomainVerificationCode,
} from '@/app/dashboard/servers/db-actions';

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
    const [domains, setDomains] = useState<Domain[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setIsLoading(true);
        // MOCK DATA: Replace with real data fetching when ready
        const mockDomains: Domain[] = [
            // @ts-ignore
            { id: '1', domain_name: 'mailflow.ai', is_verified: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            // @ts-ignore
            { id: '2', domain_name: 'daybuu.com', is_verified: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            // @ts-ignore
            { id: '3', domain_name: 'my-super-long-domain-name-that-needs-truncation_plus_10_ch.com', is_verified: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            // @ts-ignore
            { id: '4', domain_name: 'analytics.data.info', is_verified: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            // @ts-ignore
            { id: '5', domain_name: 'mi-dominio-fallido.dev', is_verified: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ];
        setTimeout(() => {
            setDomains(mockDomains);
            setIsLoading(false);
        }, 1200);
    }, []);
    
    const truncateName = (name: string, maxLength: number = 19): string => {
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
                                "group relative p-3 rounded-lg border-2 transition-all duration-300 flex items-center justify-between",
                                domain.is_verified ? "border-transparent bg-background/50 hover:bg-primary/10 hover:border-primary cursor-pointer" : "bg-muted/30 border-red-500/30 text-muted-foreground"
                            )}
                            onClick={() => domain.is_verified && onSelect(domain)}
                        >
                            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(120,119,198,0.15)_0%,rgba(255,255,255,0)_100%)] opacity-0 group-hover:opacity-100 transition-opacity"/>
                            <div className="flex items-center gap-3 min-w-0">
                                {domain.is_verified ? 
                                    <CheckCircle className="size-6 text-green-400 flex-shrink-0" /> : 
                                    <AlertTriangle className="size-6 text-red-400 flex-shrink-0" />
                                }
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-foreground truncate" title={domain.domain_name}>{truncateName(domain.domain_name, 23)}</p>
                                   {!domain.is_verified && (
                                     <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                        <span className="text-amber-300">Última comprobación: {formatDistanceToNow(new Date(domain.updated_at), { addSuffix: true, locale: es })}</span>
                                    </div>
                                   )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

const initialState: {
  success: boolean;
  message: string;
  status: 'idle' | 'DOMAIN_CREATED' | 'DOMAIN_FOUND' | 'DOMAIN_TAKEN' | 'INVALID_INPUT' | 'ERROR';
  domain: Domain | null;
} = {
  success: false,
  message: '',
  status: 'idle',
  domain: null,
};

function SubmitButtonContent({ isPending }: { isPending: boolean }) {
  return (
    <>
      {isPending ? <><Loader2 className="mr-2 animate-spin" /> Verificando...</> : <>Siguiente <ArrowRight className="ml-2"/></>}
    </>
  );
}

type VerificationStatus = 'idle' | 'pending' | 'verifying' | 'verified' | 'failed';
type HealthCheckStatus = 'idle' | 'verifying' | 'verified' | 'failed';
type InfoViewRecord = 'spf' | 'dkim' | 'dmarc' | 'mx' | 'bimi' | 'vmc';

export function CreateSubdomainModal({ isOpen, onOpenChange }: CreateSubdomainModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [subdomainName, setSubdomainName] = useState('');
    const [processStatus, setProcessStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [isSubdomainAvailable, setIsSubdomainAvailable] = useState<boolean | null>(null);
    const [isSubdomainDetailModalOpen, setIsSubdomainDetailModalOpen] = useState(false);
    
    const [state, formAction] = useActionState(createOrGetDomainAction, initialState);

    const { toast } = useToast();
    
    const [healthCheckStatus, setHealthCheckStatus] = useState<HealthCheckStatus>('idle');
    const [dnsAnalysis, setDnsAnalysis] = useState<DnsHealthOutput | VmcAnalysisOutput | null>(null);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [healthCheckStep, setHealthCheckStep] = useState<'mandatory' | 'optional'>('mandatory');
    const [acceptedDkimKey, setAcceptedDkimKey] = useState<string | null>(null);
    const [showDkimAcceptWarning, setShowDkimAcceptWarning] = useState(false);
    const [dkimData, setDkimData] = useState<DkimGenerationOutput | null>(null);
    const [isGeneratingDkim, setIsGeneratingDkim] = useState(false);
    const [activeInfoModal, setActiveInfoModal] = useState<InfoViewRecord | null>(null);
    
    const handleSelectDomain = (domain: Domain) => {
        setSelectedDomain(domain);
        setCurrentStep(2);
        setProcessStatus('idle');
    };

    const handleNextStep = () => {
        if (currentStep === 2 && subdomainName) {
            setProcessStatus('processing');
            setTimeout(() => {
                const isTaken = Math.random() > 0.5; // Simulate availability
                setIsSubdomainAvailable(!isTaken);
                setProcessStatus('success');
                if(!isTaken) {
                   setCurrentStep(3);
                }
            }, 1500)
        }
    }

    const resetState = () => {
        setCurrentStep(1);
        setSelectedDomain(null);
        setSubdomainName('');
        setProcessStatus('idle');
        setIsSubdomainAvailable(null);
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
    
    const fullSubdomain = `${subdomainName.toLowerCase()}.${selectedDomain?.domain_name || ''}`;
    
    const truncateName = (name: string, maxLength: number): string => {
        if (!name || name.length <= maxLength) {
            return name || '';
        }
        return `${name.substring(0, maxLength)}...`;
    };

    const renderLeftPanel = () => {
        const stepInfo = [
            { title: "Seleccionar Dominio", icon: Globe },
            { title: "Añadir Subdominio", icon: GitBranch },
            { title: "Análisis DNS", icon: Dna },
        ];
        
        const currentStepTitle = {
            1: 'Paso 1: Elige un Dominio',
            2: 'Paso 2: Define tu Subdominio',
            3: 'Paso 3: Análisis de Dominio'
        }[currentStep] || 'Crear Subdominio';
        
        const currentStepDesc = {
            1: 'Selecciona el dominio principal verificado.',
            2: 'Crea el prefijo para tu nuevo subdominio.',
            3: 'Verifica la salud DNS del dominio principal.'
        }[currentStep] || 'Sigue los pasos para la configuración.';


        return (
            <div className="bg-muted/30 p-8 flex flex-col justify-between h-full">
                <div>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2"><Workflow /> {currentStepTitle}</DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-1">{currentStepDesc}</DialogDescription>
                    
                    <ul className="space-y-4 mt-8">
                        {stepInfo.map((step, index) => {
                            const stepNumber = index + 1;
                            const isCompleted = currentStep > stepNumber;
                            const isActive = currentStep === stepNumber;
                            return (
                                <li key={index} className="flex items-center gap-4">
                                   <div className={cn(
                                        "size-10 rounded-full flex items-center justify-center border-2 transition-all",
                                        isActive && "bg-primary/10 border-primary text-primary animate-pulse",
                                        isCompleted && "bg-green-500/20 border-green-500 text-green-400",
                                        !isActive && !isCompleted && "bg-muted/50 border-border"
                                   )}>
                                       <step.icon className="size-5" />
                                   </div>
                                   <span className={cn(
                                       "font-semibold transition-colors",
                                       isActive && "text-primary",
                                       isCompleted && "text-green-400",
                                       !isActive && !isCompleted && "text-muted-foreground"
                                   )}>{step.title}</span>
                                </li>
                            );
                        })}
                    </ul>
                    
                    <Separator className="my-8" />
                    
                    {currentStep === 1 && (
                        <div className="p-3 bg-amber-500/10 text-amber-200/90 rounded-lg border border-amber-400/20 text-xs flex items-start gap-3">
                            <AlertTriangle className="size-10 text-amber-400 shrink-0" />
                            <p>
                                <strong className="font-bold text-amber-300">Importante:</strong> Antes de poder asociar correos electrónicos SMTP a un subdominio, es fundamental verificarlo correctamente.
                            </p>
                        </div>
                    )}

                    {(currentStep === 2 || currentStep === 3) && selectedDomain && (
                      <div className="p-3 rounded-lg border border-white/10 bg-black/20 text-center">
                          <p className="text-xs text-muted-foreground">Dominio Seleccionado</p>
                          <div className="flex items-center justify-center gap-2 mt-1">
                              <Workflow className="size-5 text-primary animate-spin-slow" />
                              <span className="font-semibold text-base text-white/90">{truncateName(selectedDomain.domain_name || '', 20)}</span>
                          </div>
                      </div>
                    )}
                </div>
            </div>
        )
    };

     const renderRecordStatus = (name: string, status: HealthCheckStatus, recordKey: InfoViewRecord) => (
        <div className="p-3 bg-muted/50 rounded-md text-sm border flex justify-between items-center">
            <span className='font-semibold'>{name}</span>
            <div className="flex items-center gap-2">
              {status === 'verifying' ? <Loader2 className="animate-spin text-primary" /> : (status === 'verified' ? <CheckCircle className="text-green-500"/> : (status === 'idle' ? <div className="size-5" /> : <AlertTriangle className="text-red-500"/>))}
              <div className="relative">
                <Button size="sm" variant="outline" className="h-7" onClick={() => {}}>Instrucciones</Button>
                {recordKey === 'dkim' && showDkimAcceptWarning && (
                   <div className="absolute -top-1 -right-1">
                      <div className="relative size-3 rounded-full flex items-center justify-center text-xs font-bold text-white bg-red-500">
                          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping"></div>
                      </div>
                  </div>
                )}
              </div>
            </div>
        </div>
      );

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
                    <div className="flex flex-col h-full justify-start pt-1">
                        <div className="text-left mb-4">
                             <h3 className="text-lg font-semibold">Añadir Subdominio</h3>
                             <p className="text-sm text-muted-foreground">Introduce el prefijo para tu subdominio.</p>
                        </div>
                        <div className="space-y-4">
                            <Input 
                                value={subdomainName}
                                onChange={(e) => {
                                  if (e.target.value.length <= 21) {
                                    setSubdomainName(e.target.value);
                                  }
                                }}
                                placeholder="ej: marketing"
                                maxLength={21}
                            />
                            {subdomainName.length === 21 && (
                                <div className="p-2 text-xs rounded-md flex items-center gap-2 bg-red-500/10 text-red-400">
                                    <AlertTriangle className="size-4 shrink-0" />
                                    <span>Solo se permiten 21 caracteres como máximo.</span>
                                </div>
                            )}
                            <div className="p-3 bg-black/20 rounded-md border border-white/10 text-center space-y-3">
                                <p className="text-xs text-muted-foreground">Tu subdominio será:</p>
                                <div className="font-mono text-lg truncate" title={fullSubdomain}>
                                    <strong style={{color: '#AD00EC'}}>{subdomainName.toLowerCase()}</strong>
                                    <span className="text-white">.{selectedDomain?.domain_name}</span>
                                </div>
                                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setIsSubdomainDetailModalOpen(true)}>Mostrar Subdominio</Button>
                            </div>
                            <div className="p-2 text-xs rounded-md flex items-start gap-2 bg-green-500/10 text-green-400 border border-green-500/20">
                                <CheckCircle className="size-4 shrink-0 mt-0.5" />
                                <span><strong className="font-bold">Permitido:</strong> todas las letras (a-z), números del (0-9) y guiones (-).</span>
                            </div>
                            <div className="p-2 text-xs rounded-md flex items-start gap-2 bg-red-500/10 text-red-400 border border-red-500/20">
                                <XCircle className="size-4 shrink-0 mt-0.5" />
                                <span><strong className="font-bold">Prohibido:</strong> espacios, acentos, símbolos especiales, puntos, comas, ni empezar/terminar con guion.</span>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                 return (
                     <div className="flex flex-col h-full">
                      <h3 className="text-lg font-semibold mb-1">Salud del Dominio</h3>
                      <p className="text-sm text-muted-foreground">Nuestra IA analizará los registros DNS de tu dominio para asegurar una alta entregabilidad.</p>
                      <div className="space-y-3 mt-4 flex-grow">
                          {healthCheckStep === 'mandatory' ? (
                          <>
                            <h4 className='font-semibold text-sm'>Registros Obligatorios</h4>
                            {renderRecordStatus('SPF', 'idle', 'spf')}
                            {renderRecordStatus('DKIM', 'idle', 'dkim')}
                            {renderRecordStatus('DMARC', 'idle', 'dmarc')}
                          </>
                          ) : (
                          <>
                             <h4 className='font-semibold text-sm'>Registros Opcionales</h4>
                             {renderRecordStatus('MX', 'idle', 'mx')}
                             {renderRecordStatus('BIMI', 'idle', 'bimi')}
                             {renderRecordStatus('VMC', 'idle', 'vmc')}
                          </>
                          )}
                           
                           {dnsAnalysis && (
                               <div className="pt-4 flex justify-center">
                                <div className="relative">
                                    <button
                                        className="ai-core-button relative inline-flex items-center justify-center overflow-hidden rounded-lg p-3 group hover:bg-[#00ADEC]"
                                        onClick={() => {
                                            setIsAnalysisModalOpen(true);
                                            setShowNotification(false);
                                        }}
                                    >
                                        <div className="ai-core-border-animation group-hover/hidden"></div>
                                        <div className="ai-core group-hover/scale-125"></div>
                                        <div className="relative z-10 flex items-center justify-center gap-2 text-white">
                                            <div className="flex gap-1 items-end h-4">
                                                <span className="w-0.5 h-2/5 bg-white rounded-full thinking-dot-animation" style={{animationDelay: '0s'}}/>
                                                <span className="w-0.5 h-full bg-white rounded-full thinking-dot-animation" style={{animationDelay: '0.2s'}}/>
                                                <span className="w-0.5 h-3/5 bg-white rounded-full thinking-dot-animation" style={{animationDelay: '0.4s'}}/>
                                            </div>
                                            <span className="text-sm font-semibold">Análisis de la IA</span>
                                        </div>
                                    </button>
                                     {showNotification && (
                                        <div 
                                            className="absolute -top-1 -right-1 size-5 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce"
                                            style={{ backgroundColor: '#F00000' }}
                                        >
                                            !
                                        </div>
                                    )}
                                </div>
                               </div>
                           )}

                      </div>
                      </div>
                  );
            default:
                return null;
        }
    };

    const StatusIndicator = ({isPending}: {isPending: boolean}) => {
        let status: 'idle' | 'processing' | 'success' | 'error' = 'idle';
        let text = 'ESTADO DEL SISTEMA';
        
        if (currentStep === 2) {
            status = processStatus;
            if (processStatus === 'processing') text = 'VERIFICANDO SUBDOMINIO';
            else if (processStatus === 'success' && isSubdomainAvailable === true) { text = 'SUBDOMINIO DISPONIBLE'; status = 'success'; }
            else if (processStatus === 'success' && !isSubdomainAvailable) { text = 'SUBDOMINIO EN USO'; status = 'error'; }
            else { text = 'ESPERANDO ACCIÓN'; }
        }
        
        const ledColor = { idle: 'bg-blue-500', processing: 'bg-amber-500', success: 'bg-green-500', error: 'bg-red-500' }[status];
    
        return (
          <div className="flex items-center justify-center gap-2 mb-4 p-2 rounded-lg bg-black/10 border border-white/5">
            <div className="relative flex items-center justify-center w-4 h-4">
              <div className={cn('absolute w-full h-full rounded-full', ledColor, status !== 'processing' && 'animate-pulse')} style={{filter: `blur(4px)`}}/>
              {status === 'processing' ? <Loader2 className='w-4 h-4 text-amber-300 animate-spin'/> : <div className={cn('w-2 h-2 rounded-full', ledColor)} /> }
            </div>
            <p className="text-xs font-semibold tracking-wider text-white/80">{text}</p>
          </div>
        );
      };

    const renderRightPanelContent = () => {
        
        return (
            <div className="relative p-6 border-l h-full flex flex-col items-center text-center bg-muted/20">
                <StatusIndicator isPending={false}/>
                <div className="w-full flex-grow flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`step-content-${currentStep}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="w-full flex flex-col justify-between flex-grow"
                        >
                            {currentStep === 1 && (
                                <div className="text-center flex-grow flex flex-col justify-center">
                                    <div className="flex justify-center mb-4"><Info className="size-16 text-primary/80" /></div>
                                    <h4 className="font-bold text-lg">Selecciona un Dominio Raíz</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Para comenzar, elige uno de tus dominios principales ya verificados de la lista de la izquierda. Este será el dominio base para tu nuevo subdominio.
                                    </p>
                                </div>
                            )}
                             {currentStep === 2 && (
                                <div className="text-center flex-grow flex flex-col justify-center">
                                  {processStatus === 'processing' ? (
                                    <div className="relative w-24 h-24 mx-auto mb-4">
                                      <motion.div
                                        className="absolute inset-0 border-2 border-dashed rounded-full"
                                        style={{ borderColor: '#1700E6' }}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                      />
                                      <motion.div
                                        className="absolute inset-2 border-2 border-dashed rounded-full"
                                        style={{ borderColor: '#009AFF' }}
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                                      />
                                      <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" style={{filter: 'blur(10px)'}} />
                                      <Code className="size-12 text-primary/80 absolute inset-0 m-auto" />
                                    </div>
                                  ) : processStatus === 'success' && isSubdomainAvailable ? (
                                    <div className="relative w-24 h-24 mx-auto mb-4">
                                        <CheckCircle className="size-24 text-green-400" style={{filter: 'drop-shadow(0 0 10px #00CB07)'}}/>
                                    </div>
                                  ) : processStatus === 'success' && !isSubdomainAvailable ? (
                                     <div className="relative w-24 h-24 mx-auto mb-4">
                                        <AlertTriangle className="size-24 text-red-500" style={{filter: 'drop-shadow(0 0 10px #F00000)'}}/>
                                    </div>
                                  ) : (
                                    <div className="flex justify-center mb-4"><GitBranch className="size-16 text-primary/80" /></div>
                                  )}
                                  <h4 className="font-bold text-lg">
                                    {processStatus === 'processing' ? 'Verificando Disponibilidad...' : 
                                    (processStatus === 'success' && isSubdomainAvailable) ? '¡Subdominio Disponible!' : 
                                    (processStatus === 'success' && !isSubdomainAvailable) ? 'Subdominio no Disponible' : 'Define tu Subdominio'}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {processStatus === 'processing' ? 'La IA está comprobando si el subdominio está disponible en la red.' : 
                                    (processStatus === 'success' && isSubdomainAvailable) ? 'Puedes continuar con la configuración.' :
                                    (processStatus === 'success' && !isSubdomainAvailable) ? 'Este subdominio ya está en uso. Por favor, elige otro.' :
                                    'Introduce el prefijo del subdominio que deseas verificar.'}
                                  </p>
                                  {processStatus === 'success' && !isSubdomainAvailable && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="group mt-4 text-amber-300 border-amber-500/50 hover:bg-[#00ADEC] hover:border-[#00ADEC] hover:text-white"
                                      onClick={() => { setProcessStatus('idle'); setIsSubdomainAvailable(null); }}
                                    >
                                      <RefreshCw className="mr-2 size-4 text-amber-300 group-hover:text-white" />
                                      Intentar con otro nombre
                                    </Button>
                                  )}
                                </div>
                              )}
                             {currentStep === 3 && (
                                <div className="text-center flex-grow flex flex-col justify-center">
                                    <div className="flex justify-center mb-4"><Dna className="size-16 text-primary/80" /></div>
                                    <h4 className="font-bold text-lg">Análisis de Dominio Principal</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Realizaremos un análisis de los registros DNS del dominio principal para asegurar que esté en óptimas condiciones para la creación de subdominios.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
                 <div className="w-full mt-auto pt-4 space-y-2">
                    {currentStep === 2 && (
                        <Button
                            onClick={handleNextStep}
                            disabled={processStatus === 'processing' || !subdomainName || (processStatus === 'success' && !isSubdomainAvailable)}
                            className="text-white hover:opacity-90 w-full h-12 text-base"
                             style={{
                              background: 'linear-gradient(to right, #1700E6, #009AFF)'
                            }}
                        >
                            {processStatus === 'processing' ? <><Loader2 className="mr-2 animate-spin"/> Verificando...</> : isSubdomainAvailable ? <>Siguiente <ArrowRight className="ml-2"/></> : <><Search className="mr-2"/>Verificar Ahora</>}
                        </Button>
                    )}
                    <Button variant="outline" className="w-full h-12 text-base border-[#F00000] text-white hover:bg-[#F00000] hover:text-white" onClick={handleClose}>
                        <X className="mr-2"/>Cancelar
                    </Button>
                </div>
            </div>
        )
    };

    return (
        <>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl p-0 grid grid-cols-1 md:grid-cols-3 gap-0 h-[98vh]" showCloseButton={false}>
                <div className="hidden md:block md:col-span-1 h-full">
                  {renderLeftPanel()}
                </div>
                <div className="md:col-span-1 h-full p-8 flex flex-col justify-start">
                    <AnimatePresence mode="wait">
                        <motion.div key={currentStep} {...cardAnimation} className="flex flex-col h-full">
                           {renderStepContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="md:col-span-1 h-full">
                  {renderRightPanelContent()}
                </div>
            </DialogContent>
        </Dialog>
        <SubdomainDisplayModal isOpen={isSubdomainDetailModalOpen} onOpenChange={setIsSubdomainDetailModalOpen} fullSubdomain={fullSubdomain} />
        </>
    );
}
