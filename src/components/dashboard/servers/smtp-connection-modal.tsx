
"use client";

import React, { useState, useEffect, useTransition, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, ArrowRight, Copy, ShieldCheck, Search, AlertTriangle, KeyRound, Server as ServerIcon, AtSign, Mail, TestTube2, CheckCircle, Dna, DatabaseZap, Workflow, Lock, Loader2, Info, RefreshCw, Layers, Check, X, Link as LinkIcon, BrainCircuit, HelpCircle, AlertCircle, MailQuestion, CheckCheck, Send, MailCheck, Pause, Eye, Layers2, GitBranch, MailWarning } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { verifyDnsAction, verifyDomainOwnershipAction, validateDomainWithAIAction } from '@/app/dashboard/servers/actions';
import { sendTestEmailAction } from '@/app/dashboard/servers/send-email-actions';
import { analyzeSmtpErrorAction } from '@/app/dashboard/servers/smtp-error-analysis-actions';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { generateDkimKeys, type DkimGenerationOutput } from '@/ai/flows/dkim-generation-flow';
import { type DnsHealthOutput } from '@/ai/flows/dns-verification-flow';
import { type VmcAnalysisOutput } from '@/app/dashboard/demo/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';
import { PauseVerificationModal } from './pause-verification-modal';
import { AddEmailModal } from './add-email-modal';
import { SubdomainModal } from './subdomain-modal';
import { ScoreDisplay } from '@/components/dashboard/score-display';
import { DomainInfoModal } from './domain-info-modal';
import {
  createOrGetDomainAction,
  deleteDomainAction,
  setDomainAsVerified,
  saveDnsChecks,
  updateDkimKey,
} from './db-actions';
import { type Domain } from './types';
import { Separator } from '@/components/ui/separator';


interface SmtpConnectionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onVerificationComplete: (domain: string, dnsStatus: any) => void;
}

type VerificationStatus = 'idle' | 'pending' | 'verifying' | 'verified' | 'failed';
type HealthCheckStatus = 'idle' | 'verifying' | 'verified' | 'failed';
type TestStatus = 'idle' | 'testing' | 'success' | 'failed';
type InfoViewRecord = 'spf' | 'dkim' | 'dmarc' | 'mx' | 'bimi' | 'vmc';
type DeliveryStatus = 'idle' | 'sent' | 'delivered' | 'bounced';

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

export function SmtpConnectionModal({ isOpen, onOpenChange, onVerificationComplete }: SmtpConnectionModalProps) {
  const { toast } = useToast();
  const [domain, setDomain] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  
  const [healthCheckStatus, setHealthCheckStatus] = useState<HealthCheckStatus>('idle');
  const [dnsAnalysis, setDnsAnalysis] = useState<DnsHealthOutput | VmcAnalysisOutput | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [healthCheckStep, setHealthCheckStep] = useState<'mandatory' | 'optional'>('mandatory');
  const [finalDnsStatus, setFinalDnsStatus] = useState<any>({});


  const [optionalRecordStatus, setOptionalRecordStatus] = useState({
      mx: 'idle' as HealthCheckStatus,
      bimi: 'idle' as HealthCheckStatus,
      vmc: 'idle' as HealthCheckStatus
  });

  const [activeInfoModal, setActiveInfoModal] = useState<InfoViewRecord | null>(null);
  const [dkimData, setDkimData] = useState<DkimGenerationOutput | null>(null);
  const [isGeneratingDkim, setIsGeneratingDkim] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  
  const [isSmtpErrorAnalysisModalOpen, setIsSmtpErrorAnalysisModalOpen] = useState(false);
  const [smtpErrorAnalysis, setSmtpErrorAnalysis] = useState<string | null>(null);
  
  const [acceptedDkimKey, setAcceptedDkimKey] = useState<string | null>(null);
  const [showDkimAcceptWarning, setShowDkimAcceptWarning] = useState(false);
  const [showKeyAcceptedToast, setShowKeyAcceptedToast] = useState(false);
  
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [hasVerifiedDomains, setHasVerifiedDomains] = useState(false); // New state for subdomain feature
  const [isSubdomainModalOpen, setIsSubdomainModalOpen] = useState(false); // New state for subdomain modal
  const [isAddEmailModalOpen, setIsAddEmailModalOpen] = useState(false);
  const [isMxWarningModalOpen, setIsMxWarningModalOpen] = useState(false);
  
  const [state, formAction] = useActionState(createOrGetDomainAction, initialState);
  const [isPending, startTransition] = useTransition();

  const [infoModalDomain, setInfoModalDomain] = useState<Domain | null>(null);
  const [isDomainInfoModalOpen, setIsDomainInfoModalOpen] = useState(false);

  const smtpFormSchema = z.object({
    host: z.string().min(1, "El host es requerido."),
    port: z.coerce.number().min(1, "El puerto es requerido."),
    encryption: z.enum(['tls', 'ssl', 'none']),
    username: z.string().email("Debe ser un correo válido."),
    password: z.string().min(1, "La contraseña es requerida."),
    testEmail: z.string().email("El correo de prueba debe ser válido.")
  }).refine(data => !domain || data.username.endsWith(`@${domain}`), {
    message: `El correo debe pertenecer al dominio verificado (${domain})`,
    path: ["username"],
  });

  const form = useForm<z.infer<typeof smtpFormSchema>>({
    resolver: zodResolver(smtpFormSchema),
    defaultValues: {
      host: '',
      port: 587,
      encryption: 'tls',
      username: '',
      password: '',
      testEmail: '',
    },
  });

  const handleSubmitForm = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
    });
  };

  useEffect(() => {
    if (state.status !== 'idle' && !isPending) {
        if(state.status === 'DOMAIN_FOUND' && state.domain) {
            setInfoModalDomain(state.domain);
            setIsDomainInfoModalOpen(true);
        } else if (state.success && state.domain) {
            setDomain(state.domain.domain_name);
            setVerificationCode(state.domain.verification_code || '');
            setVerificationStatus('pending');
            setCurrentStep(2);
        } else if (!state.success && state.status !== 'DOMAIN_TAKEN') {
            toast({ title: "Error", description: state.message, variant: "destructive" });
        }
    }
  }, [state, isPending, toast]);

  const txtRecordValue = verificationCode;

  const truncateDomain = (name: string, maxLength: number = 20): string => {
    if (name.length <= maxLength) {
        return name;
    }
    return `${name.substring(0, maxLength)}...`;
  };

  const handleGenerateDkim = async (isInitial = false, domainId?: string) => {
    const targetDomainId = domainId || state.domain?.id;
    const currentDomain = domain || state.domain?.domain_name;
    if(!currentDomain || !targetDomainId) return;
    
    setIsGeneratingDkim(true);
    setAcceptedDkimKey(null); // Reset accepted key on new generation
    try {
      const result = await generateDkimKeys({ domain: currentDomain, selector: 'daybuu' });
      setDkimData(result);
      await updateDkimKey(targetDomainId, result.publicKeyRecord);
      if (!isInitial) {
        toast({
          title: "¡Nueva Clave Generada!",
          description: "Se ha generado una nueva clave DKIM con éxito.",
          className: "bg-[#00CB07] text-white border-none",
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error al generar DKIM',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingDkim(false);
    }
  };
  
  const handleCheckVerification = async () => {
    if (!state.domain) return;
    setVerificationStatus('verifying');
    
    const result = await verifyDomainOwnershipAction({
        domain: state.domain.domain_name,
        expectedValue: txtRecordValue,
        recordType: 'TXT',
        name: '@'
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (result.success) {
      await setDomainAsVerified(state.domain.id);
      await handleGenerateDkim(true, state.domain.id);
      setVerificationStatus('verified');
      setHasVerifiedDomains(true); 
      form.setValue('username', `ejemplo@${state.domain.domain_name}`);
    } else {
      setVerificationStatus('failed');
      toast({
        title: "Verificación Fallida",
        description: result.error || "No se pudo encontrar el registro TXT de verificación.",
        variant: "destructive",
      });
    }
  };
  
  const handleCheckHealth = async () => {
    if (!state.domain || !acceptedDkimKey) {
      toast({
        title: "Acción Requerida",
        description: "Debes 'Aceptar y Usar' una clave DKIM antes de verificar la salud del dominio.",
        variant: "destructive",
      });
      setShowDkimAcceptWarning(true);
      return;
    }
    
    setHealthCheckStatus('verifying');
    setDnsAnalysis(null);
    setShowNotification(false);

    try {
      const result = await verifyDnsAction({
        domain: state.domain.domain_name,
        dkimPublicKey: acceptedDkimKey,
      });
      
      setHealthCheckStatus(result.success ? 'verified' : 'failed');
      if (result.success && result.data) {
        setDnsAnalysis(result.data);
        const dnsStatus = {
            spf: result.data.spfStatus === 'verified',
            dkim: result.data.dkimStatus === 'verified',
            dmarc: result.data.dmarcStatus === 'verified',
        };
        setFinalDnsStatus(prev => ({...prev, ...dnsStatus}));
        await saveDnsChecks(state.domain.id, {
            spf_verified: dnsStatus.spf,
            dkim_verified: dnsStatus.dkim,
            dmarc_verified: dnsStatus.dmarc,
        });
        const allVerified = dnsStatus.spf && dnsStatus.dkim && dnsStatus.dmarc;
        if (!allVerified) {
          setShowNotification(true);
        }
      } else {
          toast({
              title: "Análisis Fallido",
              description: result.error || "La IA no pudo procesar los registros. Revisa tu clave de API y la configuración de red.",
              variant: "destructive",
          })
      }
    } catch (error: any) {
       setHealthCheckStatus('failed');
       toast({
            title: "Error en el Análisis",
            description: error.message || "Ocurrió un error inesperado al contactar el servicio de IA.",
            variant: "destructive",
        })
    }
  }

  const handleCheckOptionalHealth = async () => {
    if(!state.domain) return;

    setHealthCheckStatus('verifying');
    setDnsAnalysis(null);
    setShowNotification(false);
    setOptionalRecordStatus({ mx: 'idle', bimi: 'idle', vmc: 'idle' });

    const result = await validateDomainWithAIAction({ domain: state.domain.domain_name });
    
    setHealthCheckStatus('verified');
    if (result.success && result.data) {
      const typedData = result.data as VmcAnalysisOutput;
      setDnsAnalysis(typedData);
      
      const dnsStatus = {
          mx: typedData.mx_is_valid,
          bimi: typedData.bimi_is_valid,
          vmc: typedData.vmc_is_authentic,
      };
      setFinalDnsStatus(prev => ({...prev, ...dnsStatus}));

      await saveDnsChecks(state.domain.id, {
          mx_verified: dnsStatus.mx,
          bimi_verified: dnsStatus.bimi,
          vmc_verified: dnsStatus.vmc,
      });
      
      setOptionalRecordStatus({
        mx: dnsStatus.mx ? 'verified' : 'failed',
        bimi: dnsStatus.bimi ? 'verified' : 'failed',
        vmc: dnsStatus.vmc ? 'verified' : 'failed',
      });
      if (!dnsStatus.mx || !dnsStatus.bimi || !dnsStatus.vmc) {
        setShowNotification(true);
      }
    } else {
      setDnsAnalysis(null);
      setOptionalRecordStatus({ mx: 'failed', bimi: 'failed', vmc: 'failed' });
      console.error("Optional DNS Analysis Error:", result.error);
    }
  };

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast({
        title: "¡Copiado!",
        description: "El registro ha sido copiado al portapapeles.",
        className: 'bg-success-login border-none text-white'
    });
  }

  const resetState = () => {
    setCurrentStep(1);
    setDomain('');
    setVerificationCode('');
    setVerificationStatus('idle');
    setHealthCheckStatus('idle');
    setDnsAnalysis(null);
    form.reset();
    setActiveInfoModal(null);
    setIsCancelConfirmOpen(false);
    setDkimData(null);
    setShowNotification(false);
    setHealthCheckStep('mandatory');
    setOptionalRecordStatus({ mx: 'idle', bimi: 'idle', vmc: 'idle' });
    setSmtpErrorAnalysis(null);
    setAcceptedDkimKey(null);
    setFinalDnsStatus({});
  }

  const handleClose = async (shouldDelete: boolean = false) => {
    if (shouldDelete && state.domain) {
        await deleteDomainAction(state.domain.id);
        toast({
            title: "Proceso Cancelado",
            description: "El registro del dominio ha sido eliminado."
        });
    }
    onOpenChange(false);
    setTimeout(resetState, 300);
  };
  
  const handlePauseProcess = () => {
    toast({
        title: "Proceso Pausado",
        description: "Tu progreso ha sido guardado. Tienes 48 horas para continuar.",
        className: 'bg-gradient-to-r from-[#AD00EC] to-[#1700E6] border-none text-white'
    });
    setIsPauseModalOpen(false);
    handleClose();
  }

  const handleCancelProcess = () => {
    setIsPauseModalOpen(false);
    setIsCancelConfirmOpen(true);
  }
  
  const handleFinish = async () => {
    if (!state.domain) return;
    
    if (!finalDnsStatus.mx) {
      setIsMxWarningModalOpen(true);
    } else {
      await saveDnsChecks(state.domain.id, { is_fully_verified: true });
      onVerificationComplete(state.domain.domain_name, finalDnsStatus);
      handleClose();
    }
  };
  
  const handleContinueAnyway = async () => {
     if (!state.domain) return;
    await saveDnsChecks(state.domain.id, { is_fully_verified: true });
    onVerificationComplete(state.domain.domain_name, finalDnsStatus);
    setIsMxWarningModalOpen(false);
    handleClose();
  };

  const cardAnimation = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
  };

  const DomainStatusIndicator = () => {
    if (currentStep < 2 || !state.domain) return null;
    
    const isConfigFinished = currentStep === 4;

    return (
        <div className="p-3 mb-6 rounded-lg border border-white/10 bg-black/20 text-center">
            <p className="text-xs text-muted-foreground">Dominio en configuración</p>
            <div className="flex items-center justify-center gap-2 mt-1">
                 <motion.div
                    animate={{ rotate: isConfigFinished ? 0 : 360 }}
                    transition={{ duration: 4, repeat: isConfigFinished ? 0 : Infinity, ease: 'linear' }}
                  >
                    {isConfigFinished ? <CheckCircle className="size-5 text-[#00F508]"/> : <Workflow className="size-5 text-primary"/>}
                 </motion.div>
                <span className="font-semibold text-base text-white/90">{truncateDomain(state.domain.domain_name)}</span>
            </div>
        </div>
    )
  }

  const renderLeftPanel = () => {
      const stepInfo = [
          { title: "Verificar Dominio", icon: Globe },
          { title: "Añadir DNS", icon: Dna },
          { title: "Salud del Dominio", icon: ShieldCheck },
      ];
      
      const currentStepTitle = {
          1: 'Paso 1: Introduce tu Dominio',
          2: 'Paso 2: Añadir Registro DNS',
          3: 'Paso 3: Salud del Dominio',
      }[currentStep] || 'Conectar Servidor SMTP';
      
      const currentStepDesc = {
          1: 'Verifica la propiedad de tu dominio.',
          2: 'Añade el registro TXT para la verificación.',
          3: 'Comprueba la salud de tus registros DNS.',
      }[currentStep] || 'Sigue los pasos para una conexión segura.';


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

                  <Separator className="my-6" />

                  {currentStep === 1 && (
                      <div className="p-3 bg-amber-500/10 text-amber-200/90 rounded-lg border border-amber-400/20 text-xs flex items-start gap-3">
                          <AlertTriangle className="size-10 text-amber-400 shrink-0" />
                          <p>
                              <strong className="font-bold text-amber-300">¡Importante!</strong> Es obligatorio verificar la propiedad del dominio y la salud de sus registros DNS para asegurar una alta calidad en la entrega de correos electrónicos.
                          </p>
                      </div>
                  )}

                  {currentStep > 1 && (
                      <div className="mt-8 space-y-4">
                          <DomainStatusIndicator />
                          {currentStep > 1 && currentStep < 4 && (
                             <div className="p-4 rounded-lg bg-black/20 border border-purple-500/20 text-center">
                                <p className="text-xs text-purple-200/80 mb-2">¿Necesitas tiempo? Pausa el proceso y continúa después.</p>
                                <Button
                                    onClick={() => setIsPauseModalOpen(true)}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90"
                                >
                                    <Pause className="mr-2"/> Pausar Proceso
                                </Button>
                             </div>
                          )}
                      </div>
                  )}
              </div>
          </div>
      )
  }

  const renderRecordStatus = (name: string, status: HealthCheckStatus, recordKey: InfoViewRecord) => (
    <div className="p-3 bg-muted/50 rounded-md text-sm border flex justify-between items-center">
        <span className='font-semibold'>{name}</span>
        <div className="flex items-center gap-2">
          {status === 'verifying' ? <Loader2 className="animate-spin text-primary" /> : (status === 'verified' ? <CheckCircle className="text-green-500"/> : (status === 'idle' ? <div className="size-5" /> : <AlertTriangle className="text-red-500"/>))}
          <div className="relative">
            <Button size="sm" variant="outline" className="h-7" onClick={() => setActiveInfoModal(recordKey)}>Instrucciones</Button>
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

  const renderContent = () => {
    return (
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="max-w-6xl p-0 grid grid-cols-1 md:grid-cols-3 gap-0 h-[99vh]" showCloseButton={false}>
          <div className="hidden md:block md:col-span-1 h-full">
            {renderLeftPanel()}
          </div>
          <div className="md:col-span-1 h-full p-8 flex flex-col justify-start">
            <AnimatePresence mode="wait">
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
            >
                {currentStep === 1 && (
                    <form action={handleSubmitForm} id="domain-form" className="flex flex-col h-full">
                        <div className="flex-grow flex flex-col justify-start">
                          <h3 className="text-lg font-semibold mb-1">Introduce tu Dominio</h3>
                          <p className="text-sm text-muted-foreground">Para asegurar la entregabilidad y autenticidad de tus correos, primero debemos verificar que eres el propietario del dominio.</p>
                          <div className="space-y-2 pt-4">
                              <Label htmlFor="domain">Tu Dominio</Label>
                              <div className="relative">
                                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                  <Input id="domain" name="domain" placeholder="ejemplo.com" className="pl-10 h-12 text-base" value={domain} onChange={(e) => setDomain(e.target.value)} />
                              </div>
                              {!state.success && (state.status === 'DOMAIN_TAKEN' || state.status === 'DOMAIN_FOUND') && !isPending && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={cn(
                                    "relative mt-2 p-3 rounded-lg border text-sm flex items-start gap-3 overflow-hidden",
                                    state.status === 'DOMAIN_TAKEN' && "bg-red-900/40 border-red-500/50 text-red-300",
                                    state.status === 'DOMAIN_FOUND' && "bg-amber-900/40 border-amber-500/50 text-amber-300",
                                  )}
                                >
                                  <div className="absolute top-0 left-0 w-full h-1" style={{background: `linear-gradient(to right, ${state.status === 'DOMAIN_TAKEN' ? '#F0000000' : '#E1870000'}, ${state.status === 'DOMAIN_TAKEN' ? '#F00000' : '#E18700'}, ${state.status === 'DOMAIN_TAKEN' ? '#F0000000' : '#E1870000'})`, animation: 'scanner-line 2s infinite linear'}} />
                                  <AlertTriangle className="size-6 shrink-0 mt-0.5" style={{color: state.status === 'DOMAIN_TAKEN' ? '#F00000' : '#E18700'}}/>
                                  <div className="flex-1">
                                    <p>{state.message}</p>
                                    {state.status === 'DOMAIN_FOUND' && state.domain && (
                                      <Button 
                                        className="mt-3 h-8 text-xs text-white hover:opacity-90"
                                         style={{background: 'linear-gradient(to right, #AD00EC, #1700E6)'}}
                                        onClick={() => setIsDomainInfoModalOpen(true)}
                                      >
                                        Mostrar Detalles
                                      </Button>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                          </div>
                        </div>
                    </form>
                )}
                {currentStep === 2 && (
                <div className="flex-grow flex flex-col">
                    <h3 className="text-lg font-semibold mb-1">Añadir Registro DNS</h3>
                    <p className="text-sm text-muted-foreground">Copia el siguiente registro TXT y añádelo a la configuración DNS de tu dominio <b>{truncateDomain(domain)}</b>.</p>
                    <div className="space-y-3 pt-4 flex-grow">
                        <div className="p-3 bg-muted/50 rounded-md text-sm font-mono border">
                            <Label className="text-xs font-sans text-muted-foreground">REGISTRO (HOST)</Label>
                            <div className="flex justify-between items-center">
                                <span>@</span>
                                <Button variant="ghost" size="icon" className="size-7 flex-shrink-0 text-foreground hover:bg-[#00ADEC] hover:text-white" onClick={() => handleCopy('@')}>
                                    <Copy className="size-4"/>
                                </Button>
                            </div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-md text-sm font-mono border">
                            <Label className="text-xs font-sans text-muted-foreground">VALOR</Label>
                            <div className="flex justify-between items-center">
                                <p className="break-all pr-2">{txtRecordValue}</p>
                                <Button variant="ghost" size="icon" className="size-7 flex-shrink-0 text-foreground hover:bg-[#00ADEC] hover:text-white" onClick={() => handleCopy(txtRecordValue)}>
                                    <Copy className="size-4"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                )}
                {currentStep === 3 && (
                    <div className="flex flex-col h-full">
                    <h3 className="text-lg font-semibold mb-1">Salud del Dominio</h3>
                    <p className="text-sm text-muted-foreground">Nuestra IA analizará los registros DNS de tu dominio para asegurar una alta entregabilidad.</p>
                    <div className="space-y-3 mt-4 flex-grow">
                        {healthCheckStep === 'mandatory' ? (
                        <>
                          <h4 className='font-semibold text-sm'>Registros Obligatorios</h4>
                          {renderRecordStatus('SPF', (dnsAnalysis as DnsHealthOutput)?.spfStatus ? ((dnsAnalysis as DnsHealthOutput).spfStatus === 'verified' ? 'verified' : 'failed') : 'idle', 'spf')}
                          {renderRecordStatus('DKIM', (dnsAnalysis as DnsHealthOutput)?.dkimStatus ? ((dnsAnalysis as DnsHealthOutput).dkimStatus === 'verified' ? 'verified' : 'failed') : 'idle', 'dkim')}
                          {renderRecordStatus('DMARC', (dnsAnalysis as DnsHealthOutput)?.dmarcStatus ? ((dnsAnalysis as DnsHealthOutput).dmarcStatus === 'verified' ? 'verified' : 'failed') : 'idle', 'dmarc')}
                          <div className="pt-2 text-xs text-muted-foreground">
                              <h5 className="font-bold text-sm mb-1 flex items-center gap-2">🔗 Cómo trabajan juntos</h5>
                              <p><span className="font-semibold">✉️ SPF:</span> ¿Quién puede enviar?</p>
                              <p><span className="font-semibold">✍️ DKIM:</span> ¿Está firmado y sin cambios?</p>
                              <p><span className="font-semibold">🛡️ DMARC:</span> ¿Qué hacer si falla alguna de las dos comprobaciones SPF y DKIM?</p>
                           </div>
                        </>
                        ) : (
                        <>
                           <h4 className='font-semibold text-sm'>Registros Opcionales</h4>
                           {renderRecordStatus('MX', optionalRecordStatus.mx, 'mx')}
                           {renderRecordStatus('BIMI', optionalRecordStatus.bimi, 'bimi')}
                           {renderRecordStatus('VMC', optionalRecordStatus.vmc, 'vmc')}
                           <div className="pt-2 text-xs text-muted-foreground">
                              <h5 className="font-bold text-sm mb-1 flex items-center gap-2">🔗 Cómo trabajan juntos</h5>
                              <p><span className="font-semibold">📥 MX:</span> ¿Dónde recibo mis correos?</p>
                              <p><span className="font-semibold">🎨 BIMI:</span> ¿Cuál es mi logo oficial?</p>
                              <p><span className="font-semibold">🔐 VMC:</span> ¿Es mi logo una marca registrada?</p>
                          </div>
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
                )}
            </motion.div>
            </AnimatePresence>
          </div>
          <div className="md:col-span-1 h-full">
            {renderRightPanelContent()}
          </div>
      </DialogContent>
    );
  };
  
  const renderRightPanelContent = () => {
    const allMandatoryRecordsVerified = dnsAnalysis && 'spfStatus' in dnsAnalysis && dnsAnalysis.spfStatus === 'verified' && dnsAnalysis.dkimStatus === 'verified' && dnsAnalysis.dmarcStatus === 'verified';
    
    const propagationSuccessMessage = (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-200/90 rounded-lg border border-blue-400/20 text-xs flex items-start gap-3"
        >
          <Globe className="size-10 shrink-0 text-blue-400 mt-1" />
          <p>
            ¡Excelente! La propagación de tus registros DNS obligatorios se ha completado correctamente en toda la red.
          </p>
        </motion.div>
    );

    const propagationWarningMessage = (
         <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-200/90 rounded-lg border border-amber-400/20 text-xs flex items-start gap-3"
        >
            <Eye className="size-10 shrink-0 text-amber-400 mt-1" />
            <p>
                La propagación de los registros DNS puede tardar desde unos minutos hasta 48 horas en algunas ocasiones, también puede causar falsos duplicados recomendamos esperar después de realizar una configuración en sus registros DNS.
            </p>
        </motion.div>
    );
    
    return (
      <div className="relative p-6 border-l h-full flex flex-col items-center text-center bg-muted/20">
        <StatusIndicator isPending={isPending}/>
        <div className="w-full flex-grow flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                  key={`step-content-${currentStep}-${healthCheckStep}-${isPending}-${verificationStatus}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full flex flex-col justify-between flex-grow"
                >
                {currentStep === 1 && (
                  <div className="text-center flex-grow flex flex-col justify-center">
                     {isPending ? (
                      <>
                        <div className="relative w-24 h-24 mx-auto mb-4">
                            <div className="absolute inset-0 border-2 border-dashed border-amber-400/50 rounded-full animate-spin-slow" />
                            <div className="absolute inset-2 border-2 border-dashed border-amber-400/30 animate-pulse" style={{ animationDirection: 'reverse' }} />
                            <Search className="size-16 text-amber-400 animate-pulse absolute inset-0 m-auto" style={{ filter: 'drop-shadow(0 0 10px hsl(var(--primary)/0.7))' }}/>
                        </div>
                        <h4 className="font-bold text-lg">Buscando dominio en la red...</h4>
                        <p className="text-sm text-muted-foreground">Validando y configurando tu espacio de trabajo.</p>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-center mb-4"><Globe className="size-16 text-primary/30" /></div>
                        <h4 className="font-bold">Empecemos</h4>
                        <p className="text-sm text-muted-foreground">Introduce tu dominio para comenzar la verificación.</p>
                      </>
                    )}
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="text-center flex-grow flex flex-col">
                      <div className="relative w-full h-40 flex flex-col justify-center overflow-hidden items-center flex-grow">
                          {verificationStatus === 'verifying' && (
                             <div className="relative w-32 h-32 flex items-center justify-center">
                                <motion.div className="absolute inset-0 border-2 border-dashed rounded-full" style={{ borderColor: '#AD00EC' }} animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
                                <motion.div className="absolute inset-2 border-2 border-dashed rounded-full" style={{ borderColor: '#1700E6' }} animate={{ rotate: -360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} />
                                <Dna className="size-16 text-[#00ADEC]" />
                            </div>
                          )}
                          <div className="z-10 flex flex-col items-center gap-3">
                              {verificationStatus === 'pending' && (
                                  <>
                                      <div className="flex justify-center mb-4"><Dna className="size-16 text-primary/30" /></div>
                                      <h4 className="font-bold">Acción Requerida</h4>
                                      <p className="text-sm text-muted-foreground">Añade el registro TXT y luego verifica.</p>
                                  </>
                              )}
                              {verificationStatus === 'verifying' && (
                                  <>
                                      <h4 className="font-bold text-lg mt-4">Analizando Estructura DNS...</h4>
                                      <p className="text-sm text-muted-foreground">El núcleo de IA está procesando los datos de tu dominio.</p>
                                  </>
                              )}
                              {verificationStatus === 'verified' && (
                                  <>
                                      <ShieldCheck className="size-20 text-green-400" />
                                      <h4 className="font-bold text-lg">¡Dominio Verificado!</h4>
                                      <p className="text-sm text-muted-foreground">El registro TXT se encontró correctamente.</p>
                                  </>
                              )}
                              {verificationStatus === 'failed' && (
                                  <>
                                      <AlertTriangle className="size-16 text-red-400" />
                                      <h4 className="font-bold text-lg">Verificación Fallida</h4>
                                      <p className="text-sm text-muted-foreground">No pudimos encontrar el registro.</p>
                                  </>
                              )}
                          </div>
                      </div>
                  </div>
                )}
                {currentStep === 3 && healthCheckStep === 'mandatory' && (
                  <div className="w-full flex-grow flex flex-col justify-center">
                     {healthCheckStatus === 'verifying' ? (
                       <div className="text-center flex flex-col items-center gap-4">
                           <div className="relative w-24 h-24">
                                <motion.div
                                    className="absolute inset-0 border-2 border-primary/20 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                                />
                                <motion.div
                                    className="absolute inset-2 border-2 border-dashed border-accent/30 rounded-full"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <BrainCircuit className="text-primary size-10" />
                                </div>
                           </div>
                           <p className="font-semibold text-lg text-primary">Análisis Neuronal en Progreso...</p>
                           <p className="text-sm text-muted-foreground">La IA está evaluando los registros DNS obligatorios de tu dominio.</p>
                       </div>
                    ) : !allMandatoryRecordsVerified ? (
                        <div className="text-center">
                            <div className="flex justify-center mb-4"><ShieldCheck className="size-16 text-primary/30" /></div>
                            <h4 className="font-bold">Registros Obligatorios</h4>
                            <p className="text-sm text-muted-foreground">Comprobaremos tus registros para asegurar una alta entregabilidad.</p>
                            {propagationWarningMessage}
                        </div>
                      ) : (
                          <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="relative p-4 rounded-lg bg-black/30 border border-green-500/30 overflow-hidden space-y-3"
                          >
                              <div className="absolute -inset-px rounded-lg" style={{ background: 'radial-gradient(400px circle at center, rgba(0, 203, 7, 0.3), transparent 80%)' }} />
                              <div className="relative z-10 flex flex-col items-center text-center gap-2">
                                  <motion.div animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 1, ease: "easeInOut" }}>
                                      <CheckCheck className="size-8 text-green-400" style={{ filter: 'drop-shadow(0 0 8px #00CB07)'}}/>
                                  </motion.div>
                                  <h4 className="font-bold text-white">¡Éxito! Registros Verificados</h4>
                                  <p className="text-xs text-green-200/80">Todos los registros obligatorios son correctos.</p>
                              </div>
                               {propagationSuccessMessage}
                          </motion.div>
                      )}
                  </div>
                )}
                 {currentStep === 3 && healthCheckStep === 'optional' && (
                     <div className="w-full flex-grow flex flex-col justify-center items-center">
                        {healthCheckStatus === 'idle' && (
                           <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center flex flex-col items-center gap-4"
                            >
                                <div className="flex justify-center mb-2 relative">
                                    <div className="absolute inset-0 -m-4 bg-gradient-to-tr from-primary/10 via-accent/10 to-primary/10 rounded-full blur-xl" />
                                    <Layers2 className="size-20 text-primary/80 relative" />
                                </div>
                                <h4 className="font-bold text-xl">Registros Opcionales</h4>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    Verifica tus registros MX, BIMI y VMC para mejorar la reputación, entregabilidad y visibilidad de tu marca.
                                </p>
                            </motion.div>
                        )}
                        {healthCheckStatus === 'verifying' && (
                           <div className="text-center flex flex-col items-center gap-4">
                               <div className="relative w-24 h-24">
                                    <motion.div
                                        className="absolute inset-0 border-2 border-primary/20 rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                                    />
                                    <motion.div
                                        className="absolute inset-2 border-2 border-dashed border-accent/30 rounded-full"
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <BrainCircuit className="text-primary size-10" />
                                    </div>
                               </div>
                               <p className="font-semibold text-lg text-primary">Análisis Neuronal en Progreso...</p>
                               <p className="text-sm text-muted-foreground">La IA está evaluando los registros DNS opcionales de tu dominio.</p>
                           </div>
                       )}
                        {healthCheckStatus === 'verified' && (
                           <div className="w-full space-y-4">
                                {dnsAnalysis && 'validation_score' in dnsAnalysis && dnsAnalysis.validation_score !== undefined ? (
                                    <ScoreDisplay score={dnsAnalysis.validation_score} />
                                ) : null}
                               {dnsAnalysis && 'mx_is_valid' in dnsAnalysis && (
                                     <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={cn(
                                          "p-3 rounded-lg border text-xs flex items-start gap-3",
                                          (dnsAnalysis as VmcAnalysisOutput).mx_is_valid
                                            ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-400/30 text-green-200/90"
                                            : "bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-400/30 text-red-200/90"
                                        )}
                                    >
                                        {(dnsAnalysis as VmcAnalysisOutput).mx_is_valid ? <Check className="size-8 shrink-0 text-green-400 mt-1" /> : <AlertTriangle className="size-8 shrink-0 text-red-400 mt-1" />}
                                        <p>
                                          {(dnsAnalysis as VmcAnalysisOutput).mx_is_valid
                                            ? "Tu registro MX está correctamente configurado para recibir correos en tu buzón."
                                            : "Tu registro MX no está configurado correctamente. No podrás recibir correos en tu buzón hasta que se solucione."}
                                        </p>
                                    </motion.div>
                                )}
                                {dnsAnalysis && 'mx_points_to_daybuu' in dnsAnalysis && (dnsAnalysis as VmcAnalysisOutput).mx_points_to_daybuu && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={cn(
                                      "p-3 rounded-lg border text-xs flex items-start gap-3",
                                      (dnsAnalysis as VmcAnalysisOutput).mx_priority === 0
                                        ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-400/30 text-green-200/90"
                                        : "bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-400/30 text-red-200/90"
                                    )}
                                  >
                                    {(dnsAnalysis as VmcAnalysisOutput).mx_priority === 0
                                      ? <Check className="size-8 shrink-0 text-green-400 mt-1" />
                                      : <AlertTriangle className="size-8 shrink-0 text-red-400 mt-1" />}
                                    <p>
                                      {(dnsAnalysis as VmcAnalysisOutput).mx_priority === 0
                                        ? "La prioridad 0 es correcta. Tu dominio utilizará daybuu.com como servidor principal."
                                        : `Prioridad ${(dnsAnalysis as VmcAnalysisOutput).mx_priority} incorrecta. Tu dominio usará daybuu.com como servidor de respaldo.`}
                                    </p>
                                  </motion.div>
                                )}
                                {dnsAnalysis && 'mx_points_to_daybuu' in dnsAnalysis && !(dnsAnalysis as VmcAnalysisOutput).mx_points_to_daybuu && (dnsAnalysis as VmcAnalysisOutput).mx_priority === 0 && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-3 rounded-lg border text-xs flex items-start gap-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-400/30 text-amber-200/90"
                                  >
                                    <AlertCircle className="size-8 shrink-0 text-amber-400 mt-1" />
                                    <p>
                                      La prioridad 0 es correcta, pero el registro MX no apunta a daybuu.com.
                                    </p>
                                  </motion.div>
                                )}
                           </div>
                        )}
                    </div>
                )}
                <div className="mt-auto pt-4 flex flex-col gap-2">
                    {currentStep === 1 && (
                      <Button type="submit" form="domain-form" className="w-full h-12 text-base bg-[#2a004f] text-white hover:bg-[#AD00EC] border-2 border-[#BC00FF] hover:border-[#BC00FF]" disabled={!domain || isPending}>
                        <SubmitButtonContent isPending={isPending} />
                      </Button>
                    )}
                    {currentStep === 2 && (verificationStatus === 'pending' || verificationStatus === 'failed') &&
                      <Button
                        className="w-full h-12 text-base bg-[#2a004f] text-white hover:bg-[#AD00EC] border-2 border-[#BC00FF] hover:border-[#BC00FF]"
                        onClick={handleCheckVerification}
                        disabled={verificationStatus === 'verifying'}
                      >
                        {verificationStatus === 'verifying' ? <><Loader2 className="mr-2 animate-spin"/>Verificando...</> : 'Verificar ahora'}
                      </Button>
                    }
                    {currentStep === 2 && verificationStatus === 'verified' && (
                      <Button className="w-full mt-2 bg-green-500 hover:bg-[#00CB07] text-white h-12 text-base border-2 border-[#21F700] hover:border-[#21F700]" onClick={() => setCurrentStep(3)}>
                        Continuar <ArrowRight className="ml-2"/>
                      </Button>
                    )}
                    {currentStep === 3 && (
                        <div className="flex flex-col gap-2">
                            {healthCheckStep === 'mandatory' ? (
                                <Button 
                                    className="w-full h-12 text-base bg-gradient-to-r from-[#1700E6] to-[#009AFF] hover:bg-gradient-to-r hover:from-[#00CE07] hover:to-[#A6EE00] text-white"
                                    onClick={handleCheckHealth} disabled={healthCheckStatus === 'verifying'}
                                >
                                {healthCheckStatus === 'verifying' ? <><Loader2 className="mr-2 animate-spin"/> Analizando...</> : <><Search className="mr-2"/> Analizar Registros Obligatorios</>}
                                </Button>
                            ) : (
                                <Button 
                                    className="w-full h-12 text-base bg-gradient-to-r from-[#1700E6] to-[#009AFF] hover:bg-gradient-to-r hover:from-[#00CE07] hover:to-[#A6EE00] text-white"
                                    onClick={() => handleCheckOptionalHealth()} disabled={healthCheckStatus === 'verifying'}
                                >
                                {healthCheckStatus === 'verifying' ? <><Loader2 className="mr-2 animate-spin"/> Analizando...</> : <><Search className="mr-2"/> Analizar Registros Opcionales</>}
                                </Button>
                            )}
                         
                         {healthCheckStatus === 'verified' && allMandatoryRecordsVerified && healthCheckStep === 'mandatory' && (
                            <Button className="w-full bg-[#2a004f] hover:bg-[#AD00EC] text-white h-12 text-base border-2 border-[#BC00FF] hover:border-[#BC00FF]" onClick={() => {
                              setHealthCheckStep('optional');
                              setHealthCheckStatus('idle'); // Reset status for next step
                              setDnsAnalysis(null);
                              setShowNotification(false);
                            }}>
                                Continuar a Registros Opcionales <ArrowRight className="ml-2"/>
                            </Button>
                         )}

                         {healthCheckStep === 'optional' && (
                             <Button 
                                className="w-full h-12 text-base text-white border-2 bg-green-800 border-green-500 hover:bg-green-700 hover:border-green-400"
                                onClick={handleFinish}>
                                Finalizar y Guardar <Check className="ml-2"/>
                            </Button>
                         )}
                        </div>
                    )}
                     <Button 
                        variant="outline"
                        className={cn(
                          "w-full h-12 text-base bg-transparent transition-colors border-[#F00000] text-white hover:text-white hover:bg-[#F00000]"
                        )}
                        onClick={() => setIsCancelConfirmOpen(true)}
                     >
                        Cancelar
                    </Button>
                </div>
              </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  };
  
  const StatusIndicator = ({isPending}: {isPending: boolean}) => {
    let status: 'idle' | 'processing' | 'success' | 'error' = 'idle';
    let text = 'ESTADO DEL SISTEMA';
    
    if (isPending) {
        status = 'processing';
        text = 'VERIFICANDO DOMINIO';
    } else if (currentStep === 2) {
      if (verificationStatus === 'verifying') { status = 'processing'; text = 'VERIFICANDO DNS';
      } else if (verificationStatus === 'verified') { status = 'success'; text = 'DOMINIO VERIFICADO';
      } else if (verificationStatus === 'failed') { status = 'error'; text = 'FALLO DE VERIFICACIÓN';
      } else { status = 'idle'; text = 'ESPERANDO ACCIÓN'; }
    } else if (currentStep === 3) {
      if (healthCheckStatus === 'verifying') { status = 'processing'; text = 'ANALIZANDO REGISTROS';
      } else if (healthCheckStatus === 'verified') {
          if (healthCheckStep === 'mandatory') {
            const hasError = dnsAnalysis && 'spfStatus' in dnsAnalysis && (dnsAnalysis.spfStatus !== 'verified' || dnsAnalysis.dkimStatus !== 'verified' || dnsAnalysis.dmarcStatus !== 'verified');
            status = hasError ? 'error' : 'success';
            text = hasError ? 'REGISTROS REQUIEREN ATENCIÓN' : 'REGISTROS OBLIGATORIOS OK';
          } else {
             status = 'success';
             text = 'ANÁLISIS OPCIONAL COMPLETO'
          }
        }
       else if (healthCheckStatus === 'failed') {
            status = 'error'; text = 'FALLO EN EL ANÁLISIS';
       }
       else {
        status = 'idle';
        text = 'LISTO PARA CHEQUEO';
      }
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
  
  return (
    <>
      <ToastProvider>
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                setIsCancelConfirmOpen(true);
            }
        }}>
            {renderContent()}
        </Dialog>
        <PauseVerificationModal
          isOpen={isPauseModalOpen}
          onOpenChange={setIsPauseModalOpen}
          onPause={handlePauseProcess}
          onCancelProcess={handleCancelProcess}
          domain={state.domain}
        />
        <AlertDialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Si cancelas ahora, perderás todo el progreso de la configuración y deberás comenzar de nuevo.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsCancelConfirmOpen(false)}>No, continuar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleClose(true)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Sí, salir y eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={isMxWarningModalOpen} onOpenChange={setIsMxWarningModalOpen}>
            <AlertDialogContent className="bg-zinc-900/90 backdrop-blur-xl border border-amber-400/20 text-white">
                 <AlertDialogHeader>
                    <div className="flex justify-center pb-4">
                         <div className="relative w-20 h-20 flex items-center justify-center">
                            <motion.div className="absolute inset-0 border-2 border-dashed border-amber-400/50 rounded-full" animate={{rotate: 360}} transition={{duration: 10, repeat: Infinity, ease: "linear"}} />
                            <motion.div className="absolute inset-2 border-2 border-dashed border-amber-400/30 rounded-full" animate={{rotate: -360}} transition={{duration: 7, repeat: Infinity, ease: "linear"}} />
                            <MailWarning className="text-amber-400 size-10"/>
                        </div>
                    </div>
                     <AlertDialogTitle className="text-center text-xl">Registro MX no Verificado</AlertDialogTitle>
                    <div className="relative py-4">
                      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
                      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300 shadow-[0_0_8px_2px_theme(colors.amber.300)]" />
                   </div>
                    <AlertDialogDescription className="text-center text-amber-100/70 pt-2">
                        ¿Estás seguro de que deseas continuar?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                 <div className="p-4 my-2 rounded-lg bg-black/30 border border-amber-500/30 text-sm text-amber-200/90">
                    Sin un registro MX verificado, <strong className="text-white">no podrás recibir correos</strong> en tu buzón para el dominio <strong className="font-mono text-white">{truncateDomain(domain, 20)}</strong> a través de nuestra plataforma.
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent hover:bg-[#00CB07] hover:border-[#00CB07] hover:text-white">Volver y Verificar</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleContinueAnyway} 
                        className="bg-amber-600 hover:bg-amber-500"
                    >
                        Continuar de todos modos
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <DomainInfoModal domain={infoModalDomain} isOpen={isDomainInfoModalOpen} onOpenChange={setIsDomainInfoModalOpen}/>
        <AddEmailModal isOpen={isAddEmailModalOpen} onOpenChange={setIsAddEmailModalOpen} />
        <SubdomainModal isOpen={isSubdomainModalOpen} onOpenChange={setIsSubdomainModalOpen} />
        <DnsInfoModal
            recordType={activeInfoModal}
            domain={domain}
            isOpen={!!activeInfoModal}
            onOpenChange={() => setActiveInfoModal(null)}
            onCopy={handleCopy}
            dkimData={dkimData}
            isGeneratingDkim={isGeneratingDkim}
            onRegenerateDkim={handleGenerateDkim}
            acceptedKey={acceptedDkimKey}
            onAcceptKey={(key) => {
              setAcceptedDkimKey(key);
              setShowDkimAcceptWarning(false);
              setShowKeyAcceptedToast(true);
              setTimeout(() => setShowKeyAcceptedToast(false), 3000);
            }}
        />
        <AiAnalysisModal 
            isOpen={isAnalysisModalOpen}
            onOpenChange={setIsAnalysisModalOpen}
            analysis={(dnsAnalysis as any)?.detailed_analysis || (dnsAnalysis as any)?.analysis || null}
        />
        <SmtpErrorAnalysisModal
            isOpen={isSmtpErrorAnalysisModalOpen}
            onOpenChange={setIsSmtpErrorAnalysisModalOpen}
            analysis={smtpErrorAnalysis}
        />
        {showKeyAcceptedToast && (
            <div className="fixed top-4 right-4 z-[101] w-80">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <div className="bg-black/70 backdrop-blur-lg border border-green-500/30 rounded-xl p-4 flex items-center gap-4 text-white">
                        <div className="relative p-2 rounded-full bg-green-500/20">
                            <div className="absolute inset-0 rounded-full bg-green-500/50 animate-ping"></div>
                            <CheckCheck className="relative z-10 text-green-300"/>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-green-300">Clave Aceptada</h4>
                            <p className="text-xs text-green-100/80">Lista para la verificación DNS.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
         <ToastViewport />
      </ToastProvider>
    </>
  );
}

// ... Rest of the modals (DnsInfoModal, AiAnalysisModal, SmtpErrorAnalysisModal) remain unchanged ...
// The copy of these modals is omitted for brevity but they are part of the file
function DnsInfoModal({
  recordType,
  domain,
  isOpen,
  onOpenChange,
  onCopy,
  dkimData,
  isGeneratingDkim,
  onRegenerateDkim,
  acceptedKey,
  onAcceptKey,
}: {
  recordType: InfoViewRecord | null;
  domain: string;
  isOpen: boolean;
  onOpenChange: () => void;
  onCopy: (text: string) => void;
  dkimData: DkimGenerationOutput | null;
  isGeneratingDkim: boolean;
  onRegenerateDkim: () => void;
  acceptedKey: string | null;
  onAcceptKey: (key: string) => void;
}) {
    const [confirmRegenerate, setConfirmRegenerate] = useState(false);
    if(!recordType) return null;

    const baseClass = "p-2 bg-black/20 rounded-md font-mono text-xs text-white/80 flex justify-between items-center";
    
    const infoMap: Record<InfoViewRecord, { title: string, description: string }> = {
      spf: {
        title: "Registro SPF",
        description: "SPF es un registro en tu DNS que dice “Estos son los servidores que tienen permiso para enviar correos en nombre de mi dominio”. Si un servidor que no está en la lista intenta enviar correos electrónicos usando tu dominio, el receptor lo marca como sospechoso o lo rechaza. Ejemplo real: Evita que un spammer envíe correos falsos como si fueran tuyos."
      },
      dkim: {
        title: "Registro DKIM",
        description: "DKIM es como una firmar digital para cada correo con un sello único que solo tú puedes poner, El receptor verifica esa firma con una clave pública que está en tu DNS. Si la firma coincide, sabe que el mensaje no fue alterado y que realmente salió de tu dominio. Ejemplo real: Garantiza que el contenido del correo no fue modificado en el camino."
      },
      dmarc: {
        title: "Registro DMARC",
        description: "DMARC es un registro que dice “Si el correo falla SPF o DKIM, haz esto: entrégalo igual, mándalo a spam o recházalo”. También puede enviarte reportes para que sepas si alguien intenta suplantar tu dominio. Ejemplo real: Te da control sobre qué pasa con los correos falsos y te avisa si hay intentos de fraude."
      },
       mx: {
        title: "Registro MX",
        description: "MX es un registro que indica a qué servidor de correo deben entregarse los mensajes enviados a tu dominio. Permite que servicios como Gmail, Yandex, ProtonMail o QQ Mail sepan dónde recibes tus correos electrónicos."
      },
      bimi: {
        title: "Registro BIMI",
        description: "BIMI es un registro que dice “Este es el logotipo oficial de mi marca para mostrar junto a mis correos”. Apunta a un archivo SVG con tu logo y requiere tener SPF, DKIM y DMARC correctos. Formato vectorial puro: No puede contener imágenes incrustadas (JPG, PNG, etc.) ni scripts, fuentes externas o elementos interactivos. Ejemplo real: Hace que tu logo aparezca junto a tus correos en Gmail, Yahoo y otros proveedores compatibles."
      },
      vmc: {
        title: "Certificado VMC",
        description: "Un VMC es un certificado digital que va un paso más allá de BIMI. Verifica que el logotipo que estás usando realmente te pertenece como marca registrada. Es emitido por Autoridades Certificadoras externas, tiene un costo y es un requisito para que Gmail muestre tu logo.\n\nRequisitos previos: Tener configurados correctamente SPF, DKIM y DMARC con política 'quarantine' o 'reject'."
      },
    };

    const renderSpfContent = () => {
        const recordValue = `v=spf1 include:_spf.daybuu.com -all`;
        return (
            <div className="space-y-4 text-sm">
                <p>Añade el siguiente registro TXT a la configuración DNS de tu dominio con tu proveedor (Foxmiu.com, Cloudflare.com, etc.).</p>
                <div className={cn(baseClass, "flex-col items-start gap-1")}>
                    <p className="font-bold text-white/90 flex justify-between w-full"><span>Host/Nombre:</span><Button size="icon" variant="ghost" className="size-6 -mr-2" onClick={() => onCopy('@')}><Copy className="size-4"/></Button></p>
                    <span>@</span>
                </div>
                <div className={cn(baseClass, "flex-col items-start gap-1")}>
                    <p className="font-bold text-white/90">Tipo de Registro:</p>
                    <span>TXT</span>
                </div>
                <div className={cn(baseClass, "flex-col items-start gap-1")}>
                   <p className="font-bold text-white/90">Valor del Registro:</p>
                   <div className="w-full flex justify-between items-center">
                     <span className="truncate">{recordValue}</span>
                     <Button size="icon" variant="ghost" onClick={() => onCopy(recordValue)}><Copy className="size-4"/></Button>
                   </div>
                </div>
                 <div className="text-xs text-amber-300/80 p-3 bg-amber-500/10 rounded-lg border border-amber-400/20">
                    <p className="font-bold mb-1">Importante: Unificación de SPF</p>
                    <p>Si ya usas otros servicios de correo (ej. Daybuu.com, Workspace, etc.), debes unificar los registros. Solo puede existir un registro SPF por dominio. Unifica los valores `include` en un solo registro.</p>
                    <p className="mt-2 font-mono text-white/90">Ejemplo: `v=spf1 include:_spf.daybuu.com include:spf.otrodominio.com -all`</p>
                </div>
            </div>
        );
    };

    const renderDkimContent = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div className="space-y-4">
           <h4 className="font-semibold text-base mb-2">Paso 1: Genera y Acepta tu Clave</h4>
            <p>Una vez aceptada, copia y pega estos valores en la configuración DNS de tu proveedor de dominio.</p>
             <div className="text-xs text-amber-300/80 p-3 bg-amber-500/10 rounded-lg border border-amber-400/20 flex items-start gap-2">
              <AlertTriangle className="size-8 text-amber-400 shrink-0"/>
              <div>
                <p className="font-bold mb-1 text-amber-300">¡Atención!</p>
                <p>Si generas una nueva clave, la anterior dejará de ser válida. Deberás actualizar tu registro DNS con la nueva clave y aceptarla aquí para que la verificación DKIM funcione.</p>
              </div>
            </div>
            <div className={cn(baseClass, "flex-col items-start gap-1")}>
               <div className="font-bold text-white/90 flex justify-between w-full items-center">
                <span>Clave Aceptada:</span>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-semibold", acceptedKey ? "text-green-400" : "text-amber-400")}>
                    {acceptedKey ? "SÍ" : "NO"}
                  </span>
                  <div className="relative flex items-center justify-center w-4 h-4">
                    <div className={cn('absolute w-full h-full rounded-full', acceptedKey ? 'bg-green-500' : 'bg-amber-500', 'animate-pulse')} style={{filter: `blur(4px)`}}/>
                    <div className={cn('w-2 h-2 rounded-full', acceptedKey ? 'bg-green-500' : 'bg-amber-500')} />
                  </div>
                </div>
               </div>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => setConfirmRegenerate(true)} disabled={isGeneratingDkim} className="w-full" variant="outline">
                  {isGeneratingDkim ? <Loader2 className="mr-2 animate-spin"/> : <RefreshCw className="mr-2" />}
                  Generar Nueva
                </Button>
                 <Button 
                    onClick={() => dkimData && onAcceptKey(dkimData.publicKeyRecord)} 
                    disabled={!dkimData || dkimData.publicKeyRecord === acceptedKey} 
                    className="w-full text-white hover:opacity-90 disabled:opacity-50"
                    style={{
                      background: !dkimData || dkimData.publicKeyRecord === acceptedKey ? 'grey' : 'linear-gradient(to right, #00CE07, #A6EE00)',
                    }}
                >
                  <CheckCheck className="mr-2"/>
                  {dkimData?.publicKeyRecord === acceptedKey ? 'Clave Aceptada' : 'Aceptar y Usar esta Clave'}
                </Button>
            </div>
        </div>
        <div className="space-y-4">
           <h4 className="font-semibold text-base mb-2">Paso 2: Añade el Registro a tu DNS</h4>
            <p>Una vez aceptada, copia y pega estos valores en la configuración DNS de tu proveedor de dominio.</p>
            <AnimatePresence>
            {dkimData ? (
                <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} className="space-y-2 overflow-hidden">
                <div className={cn(baseClass, "flex-col items-start gap-1")}>
                    <p className="font-bold text-white/90 flex justify-between w-full"><span>Host/Nombre:</span> <Button size="icon" variant="ghost" className="size-6 -mr-2" onClick={() => onCopy(`${dkimData.selector}._domainkey`)}><Copy className="size-4"/></Button></p>
                    <div className="w-full flex justify-between items-center">
                    <span>{dkimData.selector}._domainkey</span>
                    </div>
                </div>
                <div className={cn(baseClass, "flex-col items-start gap-1")}>
                    <p className="font-bold text-white/90">Tipo de Registro:</p>
                    <span>TXT</span>
                </div>
                <div className={cn(baseClass, "flex-col items-start gap-1")}>
                    <p className="font-bold text-white/90">Valor del Registro:</p>
                    <div className="w-full flex justify-between items-start">
                    <p className="break-all pr-2">{dkimData.publicKeyRecord}</p>
                    <Button size="icon" variant="ghost" className="shrink-0 self-start size-6 -mr-2 flex-shrink-0" onClick={() => onCopy(dkimData.publicKeyRecord)}><Copy className="size-4"/></Button>
                    </div>
                </div>
                </motion.div>
            ) : (
                <div className="flex items-center justify-center p-4">
                    <Loader2 className="animate-spin" />
                    <p className="ml-2">Generando clave DKIM...</p>
                </div>
            )}
            </AnimatePresence>
        </div>
         <AlertDialog open={confirmRegenerate} onOpenChange={setConfirmRegenerate}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Generar Nueva Clave DKIM?</AlertDialogTitle>
                <AlertDialogDescription>
                  Si generas una nueva clave, la anterior dejará de ser válida. Deberás actualizar tu registro DNS con la nueva clave y aceptarla aquí para que la verificación funcione.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                 <AlertDialogCancel className="hover:border-[#F00000] hover:bg-[#F00000] hover:text-white">Cancelar</AlertDialogCancel>
                <Button 
                    onClick={() => { onRegenerateDkim(); setConfirmRegenerate(false); }}
                    className="bg-primary hover:bg-[#00CB07]"
                >
                    Sí, generar nueva
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
    );
    
    const renderDmarcContent = () => {
        const recordValue = `v=DMARC1; p=reject; pct=100; rua=mailto:reportes@${domain}; ruf=mailto:fallas@${domain}; sp=reject; aspf=s; adkim=s`;
        return (
             <div className="grid md:grid-cols-3 gap-6 text-sm">
               <div className="md:col-span-2 space-y-4">
                 <h4 className="font-semibold text-base mb-2">Paso 1: Añade el Registro a tu DNS</h4>
                 <p className="mb-4">Añade un registro DMARC con política `reject` para máxima seguridad y entregabilidad.</p>
                 <div className="space-y-3">
                    <div className={cn(baseClass, "flex-col items-start gap-1")}>
                       <p className="font-bold text-white/90 flex justify-between w-full"><span>Host/Nombre:</span> <Button size="icon" variant="ghost" className="size-6 -mr-2" onClick={() => onCopy('_dmarc')}><Copy className="size-4"/></Button></p>
                       <span>_dmarc</span>
                   </div>
                   <div className={cn(baseClass, "flex-col items-start gap-1")}>
                       <p className="font-bold text-white/90">Tipo de Registro:</p>
                       <span>TXT</span>
                   </div>
                   <div className={cn(baseClass, "flex-col items-start gap-1")}>
                       <p className="font-bold text-white/90">Valor del Registro:</p>
                       <div className="w-full flex justify-between items-start">
                       <p className="break-all pr-2">{recordValue}</p>
                       <Button size="icon" variant="ghost" className="shrink-0 size-6 -mr-2" onClick={() => onCopy(recordValue)}><Copy className="size-4"/></Button>
                       </div>
                   </div>
                 </div>
               </div>
                <div className="md:col-span-1 text-xs text-cyan-300/80 p-4 bg-cyan-500/10 rounded-lg border border-cyan-400/20 space-y-3">
                   <h4 className="font-bold text-base text-white/90 mb-2">Paso 2: Entiende las Etiquetas</h4>
                   <div className="space-y-1">
                       <p><strong className="text-white/90">v=DMARC1</strong> → Versión.</p>
                       <p><strong className="text-white/90">p=reject</strong> → Política estricta que rechaza correos fallidos.</p>
                       <p><strong className="text-white/90">pct=100</strong> → Aplica la política al 100%.</p>
                       <p><strong className="text-white/90">rua=...</strong> → Recibe reportes agregados.</p>
                       <p><strong className="text-white/90">ruf=...</strong> → Recibe reportes forenses.</p>
                       <p><strong className="text-white/90">sp=reject</strong> → Política para subdominios.</p>
                       <p><strong className="text-white/90">aspf=s</strong> → Alineación SPF estricta.</p>
                       <p><strong className="text-white/90">adkim=s</strong> → Alineación DKIM estricta.</p>
                   </div>
                </div>
                 <div className="md:col-span-3 mt-4 p-3 bg-amber-500/10 text-amber-200/90 rounded-lg border border-amber-400/20 text-xs flex items-start gap-3">
                     <MailQuestion className="size-10 shrink-0 text-amber-400 mt-1" />
                     <div>
                         <h5 className="font-bold text-amber-300 mb-1">Paso 3: ¡Importante! Crea los Buzones de Correo</h5>
                         <p>Debes crear los buzones de correo que especificaste en las etiquetas `rua` y `ruf` para poder recibir los informes de DMARC. Puedes personalizarlos, pero asegúrate de que existan y estén en tu registro DNS.</p>
                         <ul className="list-disc pl-4 mt-2 font-mono">
                             <li>`rua=mailto:<strong className="text-white">reportes@{domain}</strong>`</li>
                             <li>`ruf=mailto:<strong className="text-white">fallas@{domain}</strong>`</li>
                         </ul>
                     </div>
                 </div>
           </div>
       );
   }

    const renderMxContent = () => (
      <div className="space-y-4 text-sm">
        <div className="text-xs text-amber-300/80 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-400/20 flex items-start gap-3">
            <AlertTriangle className="size-8 text-amber-400 shrink-0"/>
            <div>
                <p className="font-bold mb-1 text-amber-300">¡Prioridad Máxima!</p>
                <p>Establecer la prioridad en <strong className="text-white">0</strong> asegura que <strong className="text-white">daybuu.com</strong> sea el servidor principal para recibir todos tus correos. Una prioridad más alta (ej: 10, 20) lo designa como respaldo, que solo se activará si el servidor principal falla.</p>
            </div>
        </div>
        <p className="pt-2">Añade este registro MX para usar nuestro servicio de correo entrante.</p>
        <div className={cn(baseClass, "flex-col items-start gap-1")}>
          <p className="font-bold text-white/90 flex justify-between w-full"><span>Host/Nombre:</span><Button size="icon" variant="ghost" className="size-6 -mr-2" onClick={() => onCopy('@')}><Copy className="size-4"/></Button></p>
          <span>@</span>
        </div>
        <div className={cn(baseClass, "flex-col items-start gap-1")}>
          <p className="font-bold text-white/90">Tipo de Registro:</p><span>MX</span>
        </div>
        <div className={cn(baseClass, "flex-col items-start gap-1")}>
          <p className="font-bold text-white/90 flex justify-between w-full"><span>Prioridad:</span><Button size="icon" variant="ghost" className="size-6 -mr-2" onClick={() => onCopy('0')}><Copy className="size-4"/></Button></p>
          <span>0</span>
        </div>
        <div className={cn(baseClass, "flex-col items-start gap-1")}>
          <p className="font-bold text-white/90">Valor/Destino:</p>
          <div className="w-full flex justify-between items-center"><span className="truncate">daybuu.com</span><Button size="icon" variant="ghost" onClick={() => onCopy('daybuu.com')}><Copy className="size-4"/></Button></div>
        </div>
      </div>
    );
    
    const renderBimiContent = () => (
      <div className="space-y-4 text-sm">
        <div className="text-xs text-amber-300/80 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-400/20 flex items-start gap-3">
          <AlertTriangle className="size-8 text-amber-400 shrink-0"/>
          <div>
            <p className="font-bold mb-1 text-amber-300">¡Información Importante!</p>
            <p>Para usar el registro DNS BIMI, prepara tu logotipo como un SVG compatible (sin scripts ni recursos externos). Muchas guías lo llaman “SVG Tiny (P/S)” y recomiendan un diseño simple y legible, el archivo del logotipo debe estar en una URL pública con HTTPS y sin claves.</p>
          </div>
        </div>
        <p className="pt-2">Añade este registro TXT para que los proveedores de correo muestren tu logo.</p>
        <div className={cn(baseClass, "flex-col items-start gap-1")}>
          <p className="font-bold text-white/90 flex justify-between w-full"><span>Host/Nombre:</span><Button size="icon" variant="ghost" className="size-6 -mr-2" onClick={() => onCopy(`daybuu._bimi`)}><Copy className="size-4"/></Button></p>
          <span>daybuu._bimi</span>
        </div>
        <div className={cn(baseClass, "flex-col items-start gap-1")}>
          <p className="font-bold text-white/90">Tipo de Registro:</p><span>TXT</span>
        </div>
        <div className={cn(baseClass, "flex-col items-start gap-1")}>
          <p className="font-bold text-white/90">Valor del Registro:</p>
          <div className="w-full flex justify-between items-center"><span className="truncate">v=BIMI1; l=https://tudominio.com/logo.svg</span><Button size="icon" variant="ghost" onClick={() => onCopy('v=BIMI1; l=https://tudominio.com/logo.svg')}><Copy className="size-4"/></Button></div>
        </div>
      </div>
    );

    const renderVmcContent = () => (
      <div className="space-y-4 text-sm">
        <div className="text-xs text-amber-300/80 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-400/20 flex items-start gap-3">
          <AlertTriangle className="size-8 text-amber-400 shrink-0"/>
          <div>
            <p className="font-bold mb-1 text-amber-300">¡Información Importante!</p>
            <p>Para obtener un certificado VMC para tu dominio y crear un registro DNS tipo VMC, debes solicitarlo a entidades oficiales como DigiCert o Entrust, que son emisores reconocidos y seguros. El requisito fundamental es que tu logotipo esté registrado como marca comercial en una oficina oficial de propiedad intelectual y que tu dominio tenga implementado correctamente la política de autenticación DMARC.</p>
          </div>
        </div>
        <p className="pt-2">Añade el certificado VMC a tu registro BIMI para validación de marca.</p>
        <div className={cn(baseClass, "flex-col items-start gap-1")}>
          <p className="font-bold text-white/90 flex justify-between w-full"><span>Host/Nombre:</span><Button size="icon" variant="ghost" className="size-6 -mr-2" onClick={() => onCopy(`daybuu._bimi`)}><Copy className="size-4"/></Button></p>
          <span>daybuu._bimi</span>
        </div>
        <div className={cn(baseClass, "flex-col items-start gap-1")}>
          <p className="font-bold text-white/90">Tipo de Registro:</p><span>TXT</span>
        </div>
        <div className={cn(baseClass, "flex-col items-start gap-1")}>
          <p className="font-bold text-white/90">Valor del Registro:</p>
          <div className="w-full flex justify-between items-center"><span className="break-all pr-2">v=BIMI1; l=https://tudominio.com/logo.svg; a=https://tudominio.com/certificado.pem</span><Button size="icon" variant="ghost" className="shrink-0" onClick={() => onCopy('v=BIMI1; l=https://tudominio.com/logo.svg; a=https://tudominio.com/certificado.pem')}><Copy className="size-4"/></Button></div>
        </div>
      </div>
    );
    

    const contentMap = {
        spf: { title: "Registro SPF", content: renderSpfContent() },
        dkim: { title: "Registro DKIM", content: renderDkimContent() },
        dmarc: { title: "Registro DMARC", content: renderDmarcContent() },
        mx: { title: "Registro MX", content: renderMxContent() },
        bimi: { title: "Registro BIMI", content: renderBimiContent() },
        vmc: { title: "Certificado VMC", content: renderVmcContent() },
    };

    const { title, content } = contentMap[recordType];
    const { title: infoTitle, description: infoDescription } = infoMap[recordType];
    const isSpecialLayout = recordType === 'dmarc' || recordType === 'dkim';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={cn("bg-black/50 backdrop-blur-xl border-primary/20 text-white", isSpecialLayout ? "sm:max-w-4xl" : "sm:max-w-xl")}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 rounded-full bg-primary/20"><Dna className="text-primary"/></div>
                        Instrucciones para {title}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {content}
                </div>
                <DialogFooter className="sm:justify-between">
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 text-cyan-300">
                                <HelpCircle />
                                Cómo funciona
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-black/70 border-cyan-400/20 text-white backdrop-blur-md">
                            <div className="grid gap-4">
                                <h4 className="font-medium leading-none text-cyan-300">{infoTitle}</h4>
                                <p className="text-sm text-cyan-100/90">{infoDescription}</p>
                            </div>
                        </PopoverContent>
                    </Popover>
                     <Button type="button" variant="outline" onClick={onOpenChange}>
                       Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function AiAnalysisModal({ isOpen, onOpenChange, analysis }: { isOpen: boolean, onOpenChange: (open: boolean) => void, analysis: string | null }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-zinc-900/80 border-cyan-400/20 backdrop-blur-xl text-white overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute h-full w-full bg-[radial-gradient(#00ADEC_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
                </div>
                 <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full animate-pulse-slow filter blur-3xl -translate-x-1/2 -translate-y-1/2"/>

                <DialogHeader className="z-10 flex flex-row justify-between items-center">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2.5 bg-cyan-500/10 border-2 border-cyan-400/20 rounded-full icon-pulse-animation">
                           <BrainCircuit className="text-cyan-400" />
                        </div>
                        Diagnóstico Detallado de la IA
                        <div className="flex items-end gap-0.5 h-6">
                            <span className="w-1 h-2/5 bg-white rounded-full" style={{animation: `sound-wave 1.2s infinite ease-in-out 0s`}}/>
                            <span className="w-1 h-full bg-white rounded-full" style={{animation: `sound-wave 1.2s infinite ease-in-out 0.2s`}}/>
                            <span className="w-1 h-3/5 bg-white rounded-full" style={{animation: `sound-wave 1.2s infinite ease-in-out 0.4s`}}/>
                             <span className="w-1 h-4/5 bg-white rounded-full" style={{animation: `sound-wave 1.2s infinite ease-in-out 0.6s`}}/>
                        </div>
                    </DialogTitle>
                     <div className="flex items-center gap-2 text-sm text-green-300">
                        EN LÍNEA
                        <div className="size-3 rounded-full bg-[#39FF14] animate-pulse" style={{boxShadow: '0 0 8px #39FF14'}} />
                    </div>
                </DialogHeader>
                 <div className="z-10 my-4 p-3 border border-amber-400/30 bg-amber-500/10 rounded-lg flex items-start gap-3">
                    <AlertCircle className="size-8 shrink-0 text-amber-400" />
                    <p className="text-xs text-amber-200/90">
                        <strong>¡Atención!</strong> La propagación de los registros DNS puede tardar desde unos minutos hasta 48 horas. Si acabas de hacer un cambio, un nuevo análisis podría mostrar "falsos duplicados" hasta que la propagación se complete.
                    </p>
                </div>
                 <ScrollArea className="max-h-[50vh] z-10 -mx-6 px-6">
                     <div className="py-4 text-cyan-50 text-sm leading-relaxed whitespace-pre-line bg-black/30 p-4 rounded-lg border border-cyan-400/10 custom-scrollbar break-words">
                        {analysis ? analysis : "No hay análisis disponible en este momento. Por favor, ejecuta el escaneo de nuevo."}
                    </div>
                </ScrollArea>
                <DialogFooter className="z-10 pt-4">
                    <Button 
                        onClick={() => onOpenChange(false)} 
                        className="text-white bg-green-800 hover:bg-[#00CB07]"
                    >
                        Entendido
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function SmtpErrorAnalysisModal({ isOpen, onOpenChange, analysis }: { isOpen: boolean, onOpenChange: (open: boolean) => void, analysis: string | null }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-zinc-900/80 border-cyan-400/20 backdrop-blur-xl text-white overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute h-full w-full bg-[radial-gradient(#F00000_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
                </div>
                 <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-red-500/20 rounded-full animate-pulse-slow filter blur-3xl -translate-x-1/2 -translate-y-1/2"/>

                <DialogHeader className="z-10 flex flex-row justify-between items-center">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2.5 bg-red-500/10 border-2 border-red-400/20 rounded-full icon-pulse-animation">
                           <BrainCircuit className="text-red-400" />
                        </div>
                        Análisis de Error SMTP
                        <div className="flex items-end gap-0.5 h-6">
                            <span className="w-1 h-2/5 bg-white rounded-full" style={{animation: `sound-wave 1.2s infinite ease-in-out 0s`}}/>
                            <span className="w-1 h-full bg-white rounded-full" style={{animation: `sound-wave 1.2s infinite ease-in-out 0.2s`}}/>
                            <span className="w-1 h-3/5 bg-white rounded-full" style={{animation: `sound-wave 1.2s infinite ease-in-out 0.4s`}}/>
                            <span className="w-1 h-4/5 bg-white rounded-full" style={{animation: `sound-wave 1.2s infinite ease-in-out 0.6s`}}/>
                        </div>
                    </DialogTitle>
                     <div className="flex items-center gap-2 text-sm text-green-300">
                        EN LÍNEA
                        <div className="size-3 rounded-full bg-[#39FF14] animate-pulse" style={{boxShadow: '0 0 8px #39FF14'}} />
                    </div>
                </DialogHeader>
                 <ScrollArea className="max-h-[60vh] z-10 -mx-6 px-6">
                     <div className="py-4 text-red-50 text-sm leading-relaxed whitespace-pre-line bg-black/30 p-4 rounded-lg border border-red-400/10 custom-scrollbar break-words">
                        {analysis ? analysis : <div className="flex items-center gap-2"><Loader2 className="animate-spin"/> Generando análisis...</div>}
                    </div>
                </ScrollArea>
                <DialogFooter className="z-10">
                    <Button 
                        onClick={() => onOpenChange(false)} 
                        className="text-white bg-green-800 hover:bg-[#00CB07]"
                    >
                        Entendido
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DeliveryTimeline({ deliveryStatus, testError }: { deliveryStatus: DeliveryStatus, testError: string }) {
    const steps = [
        { name: 'Despachado', status: deliveryStatus !== 'idle' },
        { name: 'Entregado', status: deliveryStatus === 'delivered' },
        { name: 'Rebotado', status: deliveryStatus === 'bounced' }
    ];

    return (
        <div className="mt-4 w-full text-center">
            <div className="flex justify-between items-center px-4">
                {steps.map((step, index) => (
                    <React.Fragment key={step.name}>
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                "size-6 rounded-full flex items-center justify-center border-2 transition-all",
                                step.status && deliveryStatus !== 'bounced' && "bg-green-500 border-green-400",
                                step.status && deliveryStatus === 'bounced' && index < 2 && "bg-green-500 border-green-400",
                                deliveryStatus === 'bounced' && index === 2 && "bg-red-500 border-red-400 animate-pulse"
                            )}>
                                {step.status ? (
                                    <Check className="size-4 text-white" />
                                ) : (
                                    <div className="size-2 rounded-full bg-muted-foreground/50" />
                                )}
                            </div>
                            <p className="text-xs mt-1">{step.name}</p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={cn(
                                "flex-1 h-0.5 mx-2",
                                step.status ? (deliveryStatus === 'bounced' ? 'bg-green-500' : 'bg-green-500') : 'bg-muted-foreground/30'
                            )} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

    