
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, ArrowRight, Copy, ShieldCheck, Search, AlertTriangle, KeyRound, Server as ServerIcon, AtSign, Mail, TestTube2, CheckCircle, Dna, DatabaseZap, Workflow, Lock, Loader2, Info, RefreshCw, Layers, Check, X, Link as LinkIcon, BrainCircuit, HelpCircle, AlertCircle, MailQuestion, CheckCheck, Send, MailCheck, Pause, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion, animate } from 'framer-motion';
import { cn } from '@/lib/utils';
import { verifyDnsAction, verifyDomainOwnershipAction, verifyOptionalDnsAction } from '@/app/dashboard/servers/actions';
import { sendTestEmailAction } from '@/app/dashboard/servers/send-email-actions';
import { analyzeSmtpErrorAction } from '@/app/dashboard/servers/smtp-error-analysis-actions';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { generateDkimKeys, type DkimGenerationOutput } from '@/ai/flows/dkim-generation-flow';
import { type DnsHealthOutput } from '@/ai/flows/dns-verification-flow';
import { type OptionalDnsHealthOutput } from '@/ai/flows/optional-dns-verification-flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';
import { PauseVerificationModal } from './pause-verification-modal';
import { AddEmailModal } from './add-email-modal';
import { SubdomainModal } from './subdomain-modal';
import { ScoreDisplay } from '@/components/dashboard/score-display';

interface SmtpConnectionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type VerificationStatus = 'idle' | 'pending' | 'verifying' | 'verified' | 'failed';
type HealthCheckStatus = 'idle' | 'verifying' | 'verified' | 'failed';
type TestStatus = 'idle' | 'testing' | 'success' | 'failed';
type InfoViewRecord = 'spf' | 'dkim' | 'dmarc' | 'mx' | 'bimi' | 'vmc';
type DeliveryStatus = 'idle' | 'sent' | 'delivered' | 'bounced';

const generateVerificationCode = () => `daybuu-verificacion=${Math.random().toString(36).substring(2, 12)}`;

export function SmtpConnectionModal({ isOpen, onOpenChange }: SmtpConnectionModalProps) {
  const { toast } = useToast();
  const [domain, setDomain] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  
  const [healthCheckStatus, setHealthCheckStatus] = useState<HealthCheckStatus>('idle');
  const [dnsAnalysis, setDnsAnalysis] = useState<DnsHealthOutput | OptionalDnsHealthOutput | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [healthCheckStep, setHealthCheckStep] = useState<'mandatory' | 'optional'>('mandatory');

  const [optionalRecordStatus, setOptionalRecordStatus] = useState({
      mx: 'idle' as HealthCheckStatus,
      bimi: 'idle' as HealthCheckStatus,
      vmc: 'idle' as HealthCheckStatus
  });

  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [activeInfoModal, setActiveInfoModal] = useState<InfoViewRecord | null>(null);
  const [dkimData, setDkimData] = useState<DkimGenerationOutput | null>(null);
  const [isGeneratingDkim, setIsGeneratingDkim] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [testError, setTestError] = useState('');
  const [isConnectionSecure, setIsConnectionSecure] = useState(false);

  const [isSmtpErrorAnalysisModalOpen, setIsSmtpErrorAnalysisModalOpen] = useState(false);
  const [smtpErrorAnalysis, setSmtpErrorAnalysis] = useState<string | null>(null);
  
  const [acceptedDkimKey, setAcceptedDkimKey] = useState<string | null>(null);
  const [showDkimAcceptWarning, setShowDkimAcceptWarning] = useState(false);
  const [showKeyAcceptedToast, setShowKeyAcceptedToast] = useState(false);
  
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>('idle');
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [hasVerifiedDomains, setHasVerifiedDomains] = useState(false); // New state for subdomain feature
  const [isSubdomainModalOpen, setIsSubdomainModalOpen] = useState(false); // New state for subdomain modal
  const [isAddEmailModalOpen, setIsAddEmailModalOpen] = useState(false);


  useEffect(() => {
    if (domain && !dkimData) {
      handleGenerateDkim();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);


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

  const txtRecordValue = verificationCode;

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
    
    const result = await verifyDomainOwnershipAction({
        domain,
        expectedValue: txtRecordValue,
        recordType: 'TXT',
        name: '@'
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (result.success) {
      setVerificationStatus('verified');
      setHasVerifiedDomains(true); 
      form.setValue('username', `ejemplo@${domain}`);
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
    if (!acceptedDkimKey) {
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
        domain,
        dkimPublicKey: acceptedDkimKey,
      });
      
      setHealthCheckStatus(result.success ? 'verified' : 'failed');
      if (result.success && result.data) {
        setDnsAnalysis(result.data);
        const allVerified = result.data.spfStatus === 'verified' && result.data.dkimStatus === 'verified' && result.data.dmarcStatus === 'verified';
        if (!allVerified) {
          setShowNotification(true);
        }
      } else {
          toast({
              title: "Análisis Fallido",
              description: result.error || "La IA no pudo procesar los registros. Revisa tu clave de API de Gemini y la configuración de red.",
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
    setHealthCheckStatus('verifying');
    setDnsAnalysis(null);
    setShowNotification(false);
    setOptionalRecordStatus({ mx: 'idle', bimi: 'idle', vmc: 'idle' });

    const result = await validateDomainWithAI({ domain });
    
    setHealthCheckStatus('verified');
    if (result.success && result.data) {
      const typedData = result.data as VmcAnalysisOutput;
      setDnsAnalysis(typedData);
      setOptionalRecordStatus({
        mx: typedData.mx_is_valid ? 'verified' : 'failed',
        bimi: typedData.bimi_is_valid ? 'verified' : 'failed',
        vmc: typedData.vmc_is_authentic ? 'verified' : 'failed',
      });
      if (!typedData.mx_is_valid || !typedData.bimi_is_valid || !typedData.vmc_is_authentic) {
        setShowNotification(true);
      }
    } else {
      setDnsAnalysis(null);
      setOptionalRecordStatus({ mx: 'failed', bimi: 'failed', vmc: 'failed' });
      console.error("Optional DNS Analysis Error:", result.error);
    }
  };

  const handleGenerateDkim = async () => {
    if (!domain) return;
    setIsGeneratingDkim(true);
    setAcceptedDkimKey(null); // Reset accepted key on new generation
    try {
      const result = await generateDkimKeys({ domain, selector: 'daybuu' });
      setDkimData(result);
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
    setTestStatus('idle');
    setDeliveryStatus('idle');
    form.reset();
    setTestError('');
    setActiveInfoModal(null);
    setIsCancelConfirmOpen(false);
    setDkimData(null);
    setShowNotification(false);
    setHealthCheckStep('mandatory');
    setOptionalRecordStatus({ mx: 'idle', bimi: 'idle', vmc: 'idle' });
    setIsSmtpErrorAnalysisModalOpen(false);
    setSmtpErrorAnalysis(null);
    setAcceptedDkimKey(null);
    setIsConnectionSecure(false);
  }

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetState, 300);
  }
  
  async function onSubmitSmtp(values: z.infer<typeof smtpFormSchema>) {
    setTestStatus('testing');
    setDeliveryStatus('idle');
    setTestError('');
    setSmtpErrorAnalysis(null);
    
    const isSecure = values.encryption !== 'none';
    setIsConnectionSecure(isSecure);

    const result = await sendTestEmailAction({
        host: values.host,
        port: values.port,
        secure: isSecure,
        auth: {
            user: values.username,
            pass: values.password
        },
        from: values.username,
        to: values.testEmail
    });

    if (result.success) {
      setTestStatus('success');
      setDeliveryStatus('delivered');
      toast({
        title: "¡Conexión Exitosa!",
        description: `Correo de prueba despachado a ${values.testEmail}`,
        style: { backgroundColor: '#00CB07', color: 'white' },
        className: 'border-none'
      });
    } else {
       setTestStatus('failed');
       setTestError(result.error || 'Ocurrió un error desconocido.');
       setDeliveryStatus('bounced');
    }
  }

  const handleSmtpErrorAnalysis = async () => {
    if (!testError) return;
    setSmtpErrorAnalysis(null);
    setIsSmtpErrorAnalysisModalOpen(true);
    const result = await analyzeSmtpErrorAction({ error: testError });
    if (result.success && result.data) {
        setSmtpErrorAnalysis(result.data.analysis);
    } else {
        setSmtpErrorAnalysis(result.error || 'No se pudo generar un análisis.');
    }
  };
  
  const handlePauseProcess = () => {
    toast({
        title: "Proceso Pausado",
        description: "Tu progreso ha sido guardado. Tienes 24 horas para continuar.",
        className: 'bg-gradient-to-r from-[#AD00EC] to-[#1700E6] border-none text-white'
    });
    setIsPauseModalOpen(false);
    handleClose();
  }

  const handleCancelProcess = () => {
    setIsPauseModalOpen(false);
    setIsCancelConfirmOpen(true);
  }

  const cardAnimation = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
  };

  const DomainStatusIndicator = () => {
    if (currentStep < 2) return null;
    
    const isConfigFinished = currentStep === 4 && testStatus === 'success';

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
                <span className="font-semibold text-base text-white/90">{domain}</span>
            </div>
        </div>
    )
  }

  const renderLeftPanel = () => {
      const stepInfo = [
          { title: "Verificar Dominio", icon: Globe },
          { title: "Añadir DNS", icon: Dna },
          { title: "Salud del Dominio", icon: ShieldCheck },
          { title: "Configurar SMTP", icon: DatabaseZap },
      ];
      
      const currentStepTitle = {
          1: 'Paso 1: Introduce tu Dominio',
          2: 'Paso 2: Añadir Registro DNS',
          3: 'Paso 3: Salud del Dominio',
          4: 'Paso 4: Configurar SMTP'
      }[currentStep] || 'Conectar Servidor SMTP';
      
      const currentStepDesc = {
          1: 'Verifica la propiedad de tu dominio.',
          2: 'Añade el registro TXT para la verificación.',
          3: 'Comprueba la salud de tus registros DNS.',
          4: 'Configura los detalles de tu servidor de correo.'
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
                  {currentStep > 1 && (
                      <div className="mt-8 space-y-4">
                          <DomainStatusIndicator />
                          <div className="p-4 rounded-lg bg-black/20 border border-purple-500/20 text-center">
                              <p className="text-xs text-purple-200/80 mb-2">¿Necesitas tiempo? Pausa el proceso y continúa después.</p>
                              <Button
                                  onClick={() => setIsPauseModalOpen(true)}
                                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90"
                              >
                                  <Pause className="mr-2"/> Pausar Proceso
                              </Button>
                          </div>
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

  const renderStep4 = () => (
    <>
      <h3 className="text-lg font-semibold mb-1">Configurar Credenciales</h3>
      <p className="text-sm text-muted-foreground">Introduce los datos de tu servidor SMTP para finalizar la conexión.</p>
      <div className="flex-grow space-y-3 pt-4 overflow-y-auto custom-scrollbar -mr-4">
        <div className="px-8">
            <FormField control={form.control} name="host" render={({ field }) => (
                <FormItem className="space-y-1 mb-3"><Label>Host</Label>
                    <FormControl><div className="relative flex items-center"><ServerIcon className="absolute left-3 size-4 text-muted-foreground" /><Input className="pl-10" placeholder="smtp.dominio.com" {...field} /></div></FormControl><FormMessage />
                </FormItem>
            )}/>
        </div>
        <div className="px-8">
            <FormField control={form.control} name="port" render={({ field }) => (
                <FormItem className="space-y-1 mb-3"><Label>Puerto</Label>
                    <FormControl><Input type="number" placeholder="587" {...field} /></FormControl><FormMessage />
                </FormItem>
            )}/>
        </div>
        <div className="px-8">
            <FormField control={form.control} name="encryption" render={({ field }) => (
                <FormItem className="mb-3"><Label>Cifrado</Label><FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-1">
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="tls" id="tls" /></FormControl><Label htmlFor="tls" className="font-normal">TLS</Label></FormItem>
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="ssl" id="ssl" /></FormControl><Label htmlFor="ssl" className="font-normal">SSL</Label></FormItem>
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="none" id="none" /></FormControl><Label htmlFor="none" className="font-normal">Ninguno</Label></FormItem>
                </RadioGroup>
                </FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <div className="px-8">
            <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem className="space-y-1 mb-3"><Label>Usuario (Email)</Label><FormControl><div className="relative flex items-center"><AtSign className="absolute left-3 size-4 text-muted-foreground" /><Input className="pl-10" placeholder={`usuario@${domain}`} {...field} /></div></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <div className="px-8">
            <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem className="space-y-1 mb-3"><Label>Contraseña</Label><FormControl><div className="relative flex items-center"><KeyRound className="absolute left-3 size-4 text-muted-foreground" /><Input className="pl-10" type="password" placeholder="••••••••" {...field} /></div></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
      </div>
    </>
  );

  const renderContent = () => {
    return (
      <Form {...form}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="max-w-6xl p-0 grid grid-cols-1 md:grid-cols-3 gap-0 h-[90vh] max-h-[700px]" showCloseButton={false}>
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
                  <>
                      <h3 className="text-lg font-semibold mb-1">Introduce tu Dominio</h3>
                      <p className="text-sm text-muted-foreground">Para asegurar la entregabilidad y autenticidad de tus correos, primero debemos verificar que eres el propietario del dominio.</p>
                      <div className="space-y-2 pt-4 flex-grow">
                        <Label htmlFor="domain">Tu Dominio</Label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input id="domain" placeholder="ejemplo.com" className="pl-10 h-12 text-base" value={domain} onChange={(e) => setDomain(e.target.value)} />
                        </div>
                      </div>
                  </>
                  )}
                  {currentStep === 2 && (
                  <>
                      <h3 className="text-lg font-semibold mb-1">Añadir Registro DNS</h3>
                      <p className="text-sm text-muted-foreground">Copia el siguiente registro TXT y añádelo a la configuración DNS de tu dominio <b>{domain}</b>.</p>
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
                  </>
                  )}
                  {currentStep === 3 && (
                      <>
                      <h3 className="text-lg font-semibold mb-1">Salud del Dominio</h3>
                      <p className="text-sm text-muted-foreground">Nuestra IA analizará los registros DNS de tu dominio para asegurar una alta entregabilidad.</p>
                      <div className="space-y-3 mt-4 flex-grow">
                          {healthCheckStep === 'mandatory' ? (
                          <>
                            <h4 className='font-semibold text-sm'>Registros Obligatorios</h4>
                            {renderRecordStatus('SPF', (dnsAnalysis as DnsHealthOutput)?.spfStatus || 'idle', 'spf')}
                            {renderRecordStatus('DKIM', (dnsAnalysis as DnsHealthOutput)?.dkimStatus || 'idle', 'dkim')}
                            {renderRecordStatus('DMARC', (dnsAnalysis as DnsHealthOutput)?.dmarcStatus || 'idle', 'dmarc')}
                            <div className="pt-2 text-xs text-muted-foreground">
                                <p><strong>Como trabajan juntos:</strong></p>
                                <p><strong>SPF 📤:</strong> Quién puede enviar?</p>
                                <p><strong>DKIM ✍️:</strong> El correo fue alterado?</p>
                                <p><strong>DMARC 🛡️:</strong> Qué hacer si falla SPF/DKIM?</p>
                            </div>
                          </>
                          ) : (
                          <>
                             <h4 className='font-semibold text-sm'>Registros Opcionales</h4>
                             {renderRecordStatus('MX', optionalRecordStatus.mx, 'mx')}
                             {renderRecordStatus('BIMI', optionalRecordStatus.bimi, 'bimi')}
                             {renderRecordStatus('VMC', optionalRecordStatus.vmc, 'vmc')}
                             <div className="pt-2 text-xs text-muted-foreground">
                                <p><strong>Como trabajan juntos:</strong></p>
                                <p><strong>MX 📬:</strong> Dónde se entregan mis correos?</p>
                                <p><strong>BIMI 🎨:</strong> Que logo representa mi marca?</p>
                                <p><strong>VMC ✅:</strong> Qué certifica que el logo registrado me pertenece?</p>
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
                                        <div className="ai-core-border-animation group-hover:hidden"></div>
                                        <div className="ai-core group-hover:scale-125"></div>
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
                      </>
                  )}
                  {currentStep === 4 && renderStep4()}
              </motion.div>
              </AnimatePresence>
            </div>
            <div className="md:col-span-1 h-full">
              {renderRightPanelContent()}
            </div>
        </DialogContent>
      </Form>
    );
  };
  
  const renderRightPanelContent = () => {
    const allMandatoryRecordsVerified = dnsAnalysis && 'spfStatus' in dnsAnalysis && dnsAnalysis.spfStatus === 'verified' && dnsAnalysis.dkimStatus === 'verified' && dnsAnalysis.dmarcStatus === 'verified';
    const allOptionalRecordsVerified = optionalRecordStatus.mx === 'verified' && optionalRecordStatus.bimi === 'verified' && optionalRecordStatus.vmc === 'verified';
    const mxRecordStatus = dnsAnalysis && 'mx_is_valid' in dnsAnalysis ? (dnsAnalysis as VmcAnalysisOutput).mx_is_valid : undefined;

    const propagationWarning = (
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
    
    const propagationSuccessMessage = (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-cyan-200/90 rounded-lg border border-cyan-400/20 text-xs flex items-start gap-3"
        >
            <Globe className="size-6 shrink-0 text-cyan-400 mt-1" />
            <p>La propagación se ha completado correctamente.</p>
        </motion.div>
    );

    return (
      <div className="relative p-6 border-l h-full flex flex-col items-center text-center bg-muted/20">
        <StatusIndicator />
        <div className="w-full flex-grow flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                  key={`step-content-${currentStep}-${healthCheckStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full flex flex-col justify-between flex-grow"
                >
                {currentStep === 1 && (
                  <div className="text-center flex-grow flex flex-col justify-center">
                    <div className="flex justify-center mb-4"><Globe className="size-16 text-primary/30" /></div>
                    <h4 className="font-bold">Empecemos</h4>
                    <p className="text-sm text-muted-foreground">Introduce tu dominio para comenzar la verificación.</p>
                     <Button
                        className="w-full h-12 text-base mt-4 bg-[#2a004f] hover:bg-[#AD00EC] text-white border-2 border-[#BC00FF] hover:border-[#BC00FF]"
                        onClick={handleStartVerification}
                        disabled={!domain}
                      >
                        Siguiente <ArrowRight className="ml-2"/>
                      </Button>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="text-center flex-grow flex flex-col">
                      <div className="relative w-full h-40 flex flex-col justify-center overflow-hidden items-center flex-grow">
                          <style>{`
                              @keyframes pulse-radar {
                                  0% { transform: scale(0.5); opacity: 0; }
                                  50% { opacity: 1; }
                                  100% { transform: scale(1.2); opacity: 0; }
                              }
                          `}</style>
                          {verificationStatus === 'verifying' && (
                             <div className="absolute w-full h-full flex items-center justify-center">
                               <div className="absolute w-32 h-32 rounded-full bg-primary/10" style={{ animation: `pulse-radar 2s cubic-bezier(0.4, 0, 0.6, 1) infinite` }} />
                               <div className="absolute w-32 h-32 rounded-full bg-primary/10" style={{ animation: `pulse-radar 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`, animationDelay: '1s' }} />
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
                                      <Search className="size-16 text-primary"/>
                                      <h4 className="font-bold text-lg">Verificando...</h4>
                                      <p className="text-sm text-muted-foreground">Buscando el registro DNS.</p>
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
                      {!allMandatoryRecordsVerified ? (
                        <div className="text-center">
                            <div className="flex justify-center mb-4"><ShieldCheck className="size-16 text-primary/30" /></div>
                            <h4 className="font-bold">Registros Obligatorios</h4>
                            <p className="text-sm text-muted-foreground">Comprobaremos tus registros para asegurar una alta entregabilidad.</p>
                            {propagationWarning}
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
                    {healthCheckStatus === 'verifying' ? (
                       <div className="text-center flex flex-col items-center gap-4">
                          <div className="relative w-24 h-24">
                              <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-[hud-spin_2s_linear_infinite]" />
                              <div className="absolute inset-2 border-2 border-accent/20 rounded-full animate-[hud-spin_1.5s_linear_infinite]" style={{animationDirection: 'reverse'}}/>
                              <div className="absolute inset-0 flex items-center justify-center"><BrainCircuit className="text-primary size-10" /></div>
                          </div>
                          <p className="font-semibold text-lg text-primary">Análisis Neuronal en Progreso...</p>
                          <p className="text-sm text-muted-foreground">La IA está evaluando los registros DNS opcionales de tu dominio.</p>
                      </div>
                    ) : (
                       <div className="w-full space-y-4">
                        {(healthCheckStatus === 'verified' && dnsAnalysis && 'validation_score' in dnsAnalysis && dnsAnalysis.validation_score !== undefined) ? (
                            <ScoreDisplay score={dnsAnalysis.validation_score} />
                        ) : null }

                        {allOptionalRecordsVerified && healthCheckStatus === 'verified' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative p-4 rounded-lg bg-black/30 border border-green-500/30 overflow-hidden"
                            >
                                <div className="absolute -inset-px rounded-lg" style={{ background: 'radial-gradient(400px circle at center, rgba(0, 203, 7, 0.3), transparent 80%)' }} />
                                <div className="relative z-10 flex flex-col items-center text-center gap-2">
                                    <motion.div animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 1, ease: "easeInOut" }}>
                                        <CheckCheck className="size-8 text-green-400" style={{ filter: 'drop-shadow(0 0 8px #00CB07)'}}/>
                                    </motion.div>
                                    <h4 className="font-bold text-white">¡Éxito! Registros Verificados</h4>
                                    <p className="text-xs text-green-200/80">Todos los registros opcionales son correctos.</p>
                                </div>
                            </motion.div>
                        ) : healthCheckStatus === 'verified' && mxRecordStatus === false ? (
                           <motion.div
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                className="p-3 rounded-lg border flex items-start gap-3 bg-amber-900/40 border-amber-400/50"
                            >
                                <AlertTriangle className="size-6 shrink-0 text-amber-400 mt-0.5" />
                                <div className="text-left text-xs">
                                    <h5 className="font-bold text-amber-300">Registro MX no Encontrado o Incorrecto</h5>
                                    <p className="text-amber-200/80">No se detectó un registro MX apuntando a daybuu.com. No podrás recibir correos en tu bandeja de entrada hasta que se configure correctamente.</p>
                                </div>
                            </motion.div>
                        ) : healthCheckStatus !== 'verifying' && (
                          <div className="text-center">
                              <div className="flex justify-center mb-4"><Layers className="size-16 text-primary/30" /></div>
                              <h4 className="font-bold">Registros Opcionales</h4>
                              <p className="text-sm text-muted-foreground">Estos registros mejoran la reputación y visibilidad de tu marca.</p>
                              {propagationWarning}
                          </div>
                        )}
                       </div>
                    )}
                  </div>
                )}
                {currentStep === 4 && (
                    <div className="relative z-10 w-full h-full flex flex-col">
                      <div className="absolute inset-0 z-0">
                          <div className="absolute inset-0 bg-black/30" />
                          <div
                              className="absolute inset-0 bg-grid-zinc-400/[0.1] bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
                              style={{ animation: 'scan 5s linear infinite' }}
                          />
                          <style>{`
                              @keyframes scan {
                                  0% { background-position: 0% 0; }
                                  100% { background-position: 0% 256px; }
                              }
                          `}</style>
                      </div>
                      <div className="relative z-10 p-4 border rounded-lg bg-background/30 flex-grow flex flex-col">
                        <p className="text-sm font-semibold mb-2">Verifica tu conexión</p>
                        <p className="text-xs text-muted-foreground mb-3 flex-grow">Enviaremos un correo para asegurar que todo esté configurado correctamente.</p>
                        <FormField control={form.control} name="testEmail" render={({ field }) => (
                            <FormItem>
                                <Label className="text-left">Enviar correo de prueba a:</Label>
                                <FormControl><div className="relative flex items-center"><Mail className="absolute left-3 size-4 text-muted-foreground" /><Input className="pl-10" placeholder="receptor@ejemplo.com" {...field} /></div></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        </div>
                        {deliveryStatus !== 'idle' && isConnectionSecure && <DeliveryTimeline deliveryStatus={deliveryStatus} testError={testError}/>}

                        <AnimatePresence>
                        {testStatus === 'failed' && (
                           <motion.div
                            key="failed-smtp-content"
                            {...cardAnimation}
                            className="mt-4 flex flex-col items-center gap-3"
                           >
                            <div className="p-2 bg-red-500/10 text-red-400 rounded-lg text-center text-xs w-full">
                                <h4 className="font-bold flex items-center justify-center gap-2"><AlertTriangle/>Fallo en la Conexión</h4>
                                <p>{testError}</p>
                            </div>
                            <button
                                onClick={handleSmtpErrorAnalysis}
                                className="relative group/error-btn inline-flex items-center justify-center overflow-hidden rounded-lg p-3 text-white"
                                style={{
                                    background: 'linear-gradient(to right, #F00000, #F07000)',
                                }}
                            >
                                <div className="ai-button-scan absolute inset-0"/>
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                    <div className="flex items-end gap-0.5 h-4">
                                        <span className="w-1 h-2/5 bg-white rounded-full" style={{animation: 'sound-wave 1.2s infinite ease-in-out 0s'}}/>
                                        <span className="w-1 h-full bg-white rounded-full" style={{animation: 'sound-wave 1.2s infinite ease-in-out 0.2s'}}/>
                                        <span className="w-1 h-3/5 bg-white rounded-full" style={{animation: 'sound-wave 1.2s infinite ease-in-out 0.4s'}}/>
                                    </div>
                                    <span className="text-sm font-semibold">Análisis del error con IA</span>
                                </div>
                            </button>
                           </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                )}
                <div className="mt-auto pt-4 flex flex-col gap-2">
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
                             <Button className="w-full bg-[#2a004f] hover:bg-[#AD00EC] text-white h-12 text-base border-2 border-[#BC00FF] hover:border-[#BC00FF]" onClick={() => setCurrentStep(4)}>
                                Siguiente <ArrowRight className="ml-2"/>
                            </Button>
                         )}
                        </div>
                    )}
                    {currentStep === 4 && (testStatus !== 'success' || deliveryStatus !== 'delivered') && (
                         <Button 
                            onClick={form.handleSubmit(onSubmitSmtp)} 
                            className="w-full h-12 text-base text-white bg-gradient-to-r from-[#1700E6] to-[#009AFF] hover:bg-gradient-to-r hover:from-[#00CE07] hover:to-[#A6EE00]"
                            disabled={testStatus === 'testing'}
                         >
                             {testStatus === 'testing' ? <><Loader2 className="mr-2 animate-spin"/> Probando...</> : <><TestTube2 className="mr-2"/> Probar Conexión</>}
                         </Button>
                    )}
                     <Button 
                        variant="outline"
                        className={cn(
                          "w-full h-12 text-base bg-transparent transition-colors",
                           deliveryStatus === 'delivered'
                           ? "border-[#21F700] text-white hover:text-white hover:bg-[#00CB07]"
                           : "border-[#F00000] text-white dark:text-foreground hover:bg-[#F00000] hover:text-white"
                        )}
                        onClick={deliveryStatus === 'delivered' ? handleClose : () => setIsCancelConfirmOpen(true)}
                     >
                        {deliveryStatus === 'delivered' ? 'Finalizar y Guardar' : 'Cancelar'}
                    </Button>
                </div>
              </motion.div>
          </AnimatePresence>
        </div>
      </div>
    )
  }
  
  const StatusIndicator = () => {
    let status: 'idle' | 'processing' | 'success' | 'error' = 'idle';
    let text = 'ESTADO DEL SISTEMA';
    
    if (currentStep === 2) {
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
    } else if (currentStep === 4) {
      if (testStatus === 'testing') { status = 'processing'; text = 'PROBANDO CONEXIÓN';
      } else if (testStatus === 'success') { status = 'success'; text = 'CONEXIÓN ESTABLECIDA';
      } else if (testStatus === 'failed') { status = 'error'; text = 'FALLO DE CONEXIÓN';
      } else { status = 'idle'; text = 'LISTO PARA PRUEBA'; }
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
                    <AlertDialogAction onClick={handleClose} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Sí, salir
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
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
  recordType: InfoViewRecord | null,
  domain: string,
  isOpen: boolean,
  onOpenChange: () => void,
  onCopy: (text: string) => void,
  dkimData: DkimGenerationOutput | null,
  isGeneratingDkim: boolean,
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
        description: "MX es un registro que dice “Aquí es donde deben entregarse los correos que envían a mi dominio”. Indica el servidor de correo que recibe tus mensajes. Ejemplo real: Permite que Daybuu, Outlook o cualquier otro servicio sepa a qué servidor entregar tus correos electrónicos.",
      },
      bimi: {
        title: "Registro BIMI",
        description: "BIMI es un registro que dice “Este es el logotipo oficial de mi marca para mostrar junto a mis correos”. Apunta a un archivo SVG con tu logo y requiere tener SPF, DKIM y DMARC correctos. Formato vectorial puro: No puede contener imágenes incrustadas (JPG, PNG, etc.) ni scripts, fuentes externas o elementos interactivos. Ejemplo real: Hace que tu logo aparezca junto a tus correos en Gmail, Yahoo y otros proveedores compatibles.",
      },
      vmc: {
        title: "Certificado VMC",
        description: "Un VMC es un certificado digital que va un paso más allá de BIMI. Verifica que el logotipo que estás usando realmente te pertenece como marca registrada. Es emitido por Autoridades Certificadoras externas, tiene un costo y es un requisito para que Gmail muestre tu logo.\n\nRequisitos previos: Tener configurados correctamente SPF, DKIM y DMARC con política 'quarantine' o 'reject'.",
      },
    }

    const renderSpfContent = () => {
        const recordValue = `v=spf1 include:_spf.daybuu.com -all`;
        return (
            <div className="space-y-4 text-sm">
                <p>Añade el siguiente registro TXT a la configuración de tu dominio en tu proveedor (Foxmiu.com, Cloudflare.com, etc.).</p>
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
            <p>Genera una clave única para tu dominio y acéptala para que nuestro sistema la use en las verificaciones.</p>
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
                <Button onClick={() => dkimData && onAcceptKey(dkimData.publicKeyRecord)} disabled={!dkimData || dkimData.publicKeyRecord === acceptedKey} className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-white">
                  <CheckCheck className="mr-2"/>
                  {dkimData?.publicKeyRecord === acceptedKey ? 'Clave Aceptada' : 'Aceptar y Usar esta Clave'}
                </Button>
            </div>
        </div>
        <div className="space-y-4">
           <h4 className="font-semibold text-base mb-2">Paso 2: Añade el Registro a tu DNS</h4>
            <p>Una vez aceptada, copia y pega estos valores en la configuración de tu proveedor de dominio.</p>
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
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <Button 
                    onClick={() => { onRegenerateDkim(); setConfirmRegenerate(false); }}
                    className="bg-gradient-to-r from-[#00CE07] to-[#A6EE00] text-white hover:opacity-90"
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
        <p>Añade este registro MX para usar nuestro servicio de correo entrante.</p>
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
        <p>Añade este registro TXT para que los proveedores de correo muestren tu logo.</p>
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
        <p>Añade el certificado VMC a tu registro BIMI para validación de marca.</p>
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
        { name: "Enviado", status: deliveryStatus !== 'idle' },
        { name: "Procesado por Servidor", status: deliveryStatus === 'delivered' || (deliveryStatus === 'bounced' && testError !== '') },
        { name: "Entregado / Rebotado", status: deliveryStatus === 'delivered' || deliveryStatus === 'bounced' }
    ];

    const getStepStatus = (index: number) => {
        if (steps[index].status) {
            if (index === 2 && deliveryStatus === 'bounced') return 'error';
            return 'success';
        }
        return 'pending';
    };

    return (
        <div className="mt-4 p-3 rounded-lg bg-black/20 border border-white/10">
            <div className="relative flex justify-between items-center">
                {steps.map((step, index) => {
                    const status = getStepStatus(index);
                    return (
                        <div key={index} className="relative z-10 flex flex-col items-center">
                            <div className={cn("size-6 rounded-full flex items-center justify-center border-2", {
                                'bg-green-500 border-green-300': status === 'success',
                                'bg-red-500 border-red-300': status === 'error',
                                'bg-gray-500 border-gray-400': status === 'pending',
                            })}>
                                {status === 'success' ? <Check className="size-4 text-white" /> : 
                                 status === 'error' ? <X className="size-4 text-white" /> :
                                 <Loader2 className="size-4 text-white animate-spin"/>}
                            </div>
                            <p className="text-xs mt-1 text-center">{step.name}</p>
                        </div>
                    );
                })}
                 <div className="absolute top-[11px] left-0 w-full h-0.5 bg-gray-500">
                    <div
                        className={cn("h-full bg-gradient-to-r", {
                            'from-green-500 to-green-500': deliveryStatus === 'delivered',
                            'from-green-500 to-red-500': deliveryStatus === 'bounced',
                        })}
                        style={{ width: deliveryStatus === 'delivered' || deliveryStatus === 'bounced' ? '100%' : (deliveryStatus === 'sent' ? '50%' : '0%'), transition: 'width 2s ease' }}
                    />
                </div>
            </div>
        </div>
    );
}
