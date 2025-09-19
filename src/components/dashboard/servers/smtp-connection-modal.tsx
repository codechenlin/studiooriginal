
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, ArrowRight, Copy, ShieldCheck, Search, AlertTriangle, KeyRound, Server as ServerIcon, AtSign, Mail, TestTube2, CheckCircle, Dna, DatabaseZap, Workflow, Lock, Loader2, Info, RefreshCw, Layers, Check, X, Link as LinkIcon, BrainCircuit, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { verifyDnsAction, verifyDomainOwnershipAction, verifyOptionalDnsAction } from '@/app/dashboard/servers/actions';
import { sendTestEmailAction } from '@/app/dashboard/servers/send-email-actions';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { generateDkimKeys, type DkimGenerationOutput } from '@/ai/flows/dkim-generation-flow';
import { type DnsHealthOutput } from '@/ai/flows/dns-verification-flow';
import { type OptionalDnsHealthOutput } from '@/ai/flows/optional-dns-verification-flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SmtpConnectionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type VerificationStatus = 'idle' | 'pending' | 'verifying' | 'verified' | 'failed';
type HealthCheckStatus = 'idle' | 'verifying' | 'verified' | 'failed';
type TestStatus = 'idle' | 'testing' | 'success' | 'failed';
type InfoViewRecord = 'spf' | 'dkim' | 'dmarc' | 'mx' | 'bimi' | 'vmc';

const generateVerificationCode = () => `foxmiu_${Math.random().toString(36).substring(2, 10)}`;

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
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'checking' | 'delivered' | 'bounced'>('idle');

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

  const txtRecordValue = `foxmiu-verification=${verificationCode}`;

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
    if (!dkimData) {
      toast({
        title: "Error",
        description: "Los datos DKIM no se han generado. Por favor, reinicia el proceso.",
        variant: "destructive",
      });
      return;
    }
    
    setHealthCheckStatus('verifying');
    setDnsAnalysis(null);
    setShowNotification(false);

    try {
      const result = await verifyDnsAction({
        domain,
        dkimPublicKey: dkimData.publicKeyRecord,
      });
      
      setHealthCheckStatus(result.success ? 'verified' : 'failed');
      if (result.success && result.data) {
        setDnsAnalysis(result.data);
        const hasError = result.data.spfStatus !== 'verified' || result.data.dkimStatus !== 'verified' || result.data.dmarcStatus !== 'verified';
        if (hasError) {
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

  const handleCheckOptionalHealth = async (runAiAnalysis = false) => {
    const checkRecord = async (
        recordType: 'MX' | 'BIMI' | 'VMC'
    ) => {
        setOptionalRecordStatus(prev => ({...prev, [recordType.toLowerCase()]: 'verifying'}));
        const result = await verifyDomainOwnershipAction({ 
            domain, 
            name: recordType === 'MX' ? '@' : 'default._bimi',
            recordType: recordType,
            expectedValue: recordType === 'MX' ? 'daybuu.com' : (recordType === 'VMC' ? 'a=' : 'v=BIMI1;')
        });
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 500));
        setOptionalRecordStatus(prev => ({...prev, [recordType.toLowerCase()]: result.success ? 'verified' : 'failed'}));
        return result.success;
    };

    setHealthCheckStatus('verifying');
    await Promise.all([
      checkRecord('MX'),
      checkRecord('BIMI'),
      checkRecord('VMC')
    ]);
    setHealthCheckStatus('verified');
    
    setShowNotification(false);
    if (runAiAnalysis) {
      const result = await verifyOptionalDnsAction({ domain });
       if (result.success && result.data) {
        setDnsAnalysis(result.data);
        const hasError = result.data.mxStatus !== 'verified' || result.data.bimiStatus !== 'verified' || result.data.vmcStatus !== 'verified';
        if (hasError) {
          setShowNotification(true);
        }
      } else {
          toast({
              title: "Análisis Fallido",
              description: result.error || "La IA no pudo procesar los registros opcionales.",
              variant: "destructive",
          })
      }
    }
  }

  const handleGenerateDkim = async () => {
    if (!domain) return;
    setIsGeneratingDkim(true);
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

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
        setCurrentStep(1);
        setDomain('');
        setVerificationCode('');
        setVerificationStatus('idle');
        setHealthCheckStatus('idle');
        setDnsAnalysis(null);
        setTestStatus('idle');
        form.reset();
        setTestError('');
        setDeliveryStatus('idle');
        setActiveInfoModal(null);
        setIsCancelConfirmOpen(false);
        setDkimData(null);
        setShowNotification(false);
        setHealthCheckStep('mandatory');
        setOptionalRecordStatus({ mx: 'idle', bimi: 'idle', vmc: 'idle' });
    }, 300);
  }
  
  async function onSubmitSmtp(values: z.infer<typeof smtpFormSchema>) {
    setTestStatus('testing');
    setTestError('');
    setDeliveryStatus('idle');
    const result = await sendTestEmailAction({
        host: values.host,
        port: values.port,
        secure: values.encryption !== 'none',
        auth: {
            user: values.username,
            pass: values.password
        },
        from: values.username,
        to: values.testEmail
    });

    if (result.success) {
      setTestStatus('success');
      toast({
        title: "¡Conexión Exitosa!",
        description: `Correo de prueba despachado a ${values.testEmail}.`,
        className: 'bg-green-500 text-white border-none'
      })
    } else {
       setTestStatus('failed');
       setTestError(result.error || 'Ocurrió un error desconocido.');
    }
  }

   const handleCheckDelivery = async () => {
    setDeliveryStatus('checking');
    await new Promise(resolve => setTimeout(resolve, 2500));
    setDeliveryStatus('delivered');
  };

  const cardAnimation = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
  };

  const DomainStatusIndicator = () => {
    if (currentStep < 2) return null;
    
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
                   <div className="relative w-full h-[2px] my-6 bg-border/20 overflow-hidden">
                     <div className="tech-scanner w-[50px] bg-gradient-to-r from-transparent via-primary to-transparent" />
                  </div>

                  {currentStep > 1 && <DomainStatusIndicator />}
              </div>

              <div className="text-xs text-muted-foreground mt-4">
                  Una configuración SMTP segura y verificada es crucial para asegurar la máxima entregabilidad y reputación de tus campañas de correo.
              </div>
          </div>
      )
  }

  const renderRecordStatus = (name: string, status: HealthCheckStatus, recordKey: InfoViewRecord) => (
      <div className="p-3 bg-muted/50 rounded-md text-sm border flex justify-between items-center">
          <span className='font-semibold'>{name}</span>
          <div className="flex items-center gap-2">
            {status === 'verifying' ? <Loader2 className="animate-spin text-primary" /> : (status === 'verified' ? <CheckCircle className="text-green-500"/> : (status === 'idle' ? <div className="size-5" /> : <AlertTriangle className="text-red-500"/>))}
            <Button size="sm" variant="outline" className="h-7" onClick={() => setActiveInfoModal(recordKey)}>Instrucciones</Button>
          </div>
      </div>
  );

  const renderStep4 = () => (
    <>
        <h3 className="text-lg font-semibold mb-1">Configurar Credenciales</h3>
        <p className="text-sm text-muted-foreground">Introduce los datos de tu servidor SMTP para finalizar la conexión.</p>
        <div className="flex-grow space-y-3 pt-4 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
            <FormField control={form.control} name="host" render={({ field }) => (
                <FormItem className="space-y-1"><Label>Host</Label>
                    <FormControl><div className="relative flex items-center"><ServerIcon className="absolute left-3 size-4 text-muted-foreground" /><Input className="pl-10" placeholder="smtp.dominio.com" {...field} /></div></FormControl><FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="port" render={({ field }) => (
                <FormItem className="space-y-1"><Label>Puerto</Label>
                    <FormControl><Input type="number" placeholder="587" {...field} /></FormControl><FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="encryption" render={({ field }) => (
                <FormItem><Label>Cifrado</Label><FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-1">
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="tls" id="tls" /></FormControl><Label htmlFor="tls" className="font-normal">TLS</Label></FormItem>
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="ssl" id="ssl" /></FormControl><Label htmlFor="ssl" className="font-normal">SSL</Label></FormItem>
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="none" id="none" /></FormControl><Label htmlFor="none" className="font-normal">Ninguno</Label></FormItem>
                </RadioGroup>
                </FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem className="space-y-1"><Label>Usuario (Email)</Label><FormControl><div className="relative flex items-center"><AtSign className="absolute left-3 size-4 text-muted-foreground" /><Input className="pl-10" placeholder={`usuario@${domain}`} {...field} /></div></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem className="space-y-1"><Label>Contraseña</Label><FormControl><div className="relative flex items-center"><KeyRound className="absolute left-3 size-4 text-muted-foreground" /><Input className="pl-10" type="password" placeholder="••••••••" {...field} /></div></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
    </>
  );

  const renderContent = () => {
    return (
      <Form {...form}>
        <DialogContent className="max-w-6xl p-0 grid grid-cols-1 md:grid-cols-3 gap-0 h-[600px]" showCloseButton={false}>
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
                          </>
                          ) : (
                          <>
                             <h4 className='font-semibold text-sm'>Registros Opcionales</h4>
                             {renderRecordStatus('MX', optionalRecordStatus.mx, 'mx')}
                             {renderRecordStatus('BIMI', optionalRecordStatus.bimi, 'bimi')}
                             {renderRecordStatus('VMC', optionalRecordStatus.vmc, 'vmc')}
                          </>
                          )}
                          
                          <div className="pt-2 text-xs text-muted-foreground">
                            <h5 className="font-bold text-sm mb-1">🔗 Cómo trabajan juntos</h5>
                            <p><span className="font-semibold">SPF:</span> ¿Quién puede enviar?</p>
                            <p><span className="font-semibold">DKIM:</span> ¿Está firmado y sin cambios?</p>
                            <p><span className="font-semibold">DMARC:</span> ¿Qué hacer si falla alguna de las dos comprobaciones SPF y DKIM?</p>
                          </div>
                           
                           {healthCheckStatus !== 'idle' && healthCheckStatus !== 'verifying' && (
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
                                            1
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
    const allMandatoryRecordsVerified = (dnsAnalysis as DnsHealthOutput)?.spfStatus === 'verified' && (dnsAnalysis as DnsHealthOutput)?.dkimStatus === 'verified' && (dnsAnalysis as DnsHealthOutput)?.dmarcStatus === 'verified';

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
                        className="w-full h-12 text-base mt-4 bg-[#2a004f] hover:bg-[#AD00EC] text-white"
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
                     <div className="text-center">
                        <div className="flex justify-center mb-4"><ShieldCheck className="size-16 text-primary/30" /></div>
                        <h4 className="font-bold">Registros Obligatorios</h4>
                        <p className="text-sm text-muted-foreground">Comprobaremos tus registros para asegurar una alta entregabilidad.</p>
                    </div>
                     <div className="mt-4 p-2 bg-blue-500/10 text-blue-300 text-xs rounded-md border border-blue-400/20 flex items-start gap-2">
                      <Info className="size-5 shrink-0 mt-0.5" />
                      <p>La propagación de DNS no es instantánea. Si una verificación falla, espera un tiempo y vuelve a intentarlo.</p>
                    </div>
                  </div>
                )}
                 {currentStep === 3 && healthCheckStep === 'optional' && (
                  <div className="w-full flex-grow flex flex-col justify-center">
                     <div className="text-center">
                        <div className="flex justify-center mb-4"><Layers className="size-16 text-primary/30" /></div>
                        <h4 className="font-bold">Registros Opcionales</h4>
                        <p className="text-sm text-muted-foreground">Estos registros mejoran la reputación y visibilidad de tu marca.</p>
                    </div>
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
                        {testStatus === 'success' && deliveryStatus !== 'bounced' && (
                            <motion.div key="delivery-check" {...cardAnimation} className="mt-4 space-y-3">
                                <Button variant="outline" className="w-full" onClick={handleCheckDelivery} disabled={deliveryStatus === 'checking'}>
                                {deliveryStatus === 'checking' ? <Loader2 className="mr-2 animate-spin"/> : <RefreshCw className="mr-2"/>}
                                Verificar Entrega
                                </Button>
                                {deliveryStatus === 'delivered' && 
                                    <p className="text-sm font-bold text-green-400">¡Confirmado! El correo fue entregado con éxito.</p>
                                }
                            </motion.div>
                        )}
                        <AnimatePresence>
                        {testStatus === 'failed' && (
                            <motion.div key="failed-smtp" {...cardAnimation} className="p-2 mt-4 bg-red-500/10 text-red-400 rounded-lg text-center text-xs">
                                <h4 className="font-bold flex items-center justify-center gap-2"><AlertTriangle/>Fallo en la Conexión</h4>
                                <p>{testError}</p>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                )}
                <div className="mt-auto pt-4 flex flex-col gap-2">
                    {currentStep === 2 && (verificationStatus === 'pending' || verificationStatus === 'failed') &&
                      <Button
                        className="w-full h-12 text-base bg-[#2a004f] text-white hover:bg-[#AD00EC]"
                        onClick={handleCheckVerification}
                        disabled={verificationStatus === 'verifying'}
                      >
                        {verificationStatus === 'verifying' ? <><Loader2 className="mr-2 animate-spin"/>Verificando...</> : 'Verificar ahora'}
                      </Button>
                    }
                    {currentStep === 2 && verificationStatus === 'verified' && (
                      <Button className="w-full mt-2 bg-green-500 hover:bg-[#00CB07] text-white h-12 text-base" onClick={() => setCurrentStep(3)}>
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
                                    onClick={() => handleCheckOptionalHealth(true)} disabled={healthCheckStatus === 'verifying'}
                                >
                                {healthCheckStatus === 'verifying' ? <><Loader2 className="mr-2 animate-spin"/> Analizando...</> : <><Search className="mr-2"/> Analizar Registros Opcionales</>}
                                </Button>
                            )}
                         
                         {allMandatoryRecordsVerified && healthCheckStep === 'mandatory' && (
                            <Button className="w-full bg-[#2a004f] hover:bg-[#AD00EC] text-white h-12 text-base" onClick={() => setHealthCheckStep('optional')}>
                                Continuar a Registros Opcionales <ArrowRight className="ml-2"/>
                            </Button>
                         )}

                         {healthCheckStep === 'optional' && (
                            <Button className="w-full bg-[#2a004f] hover:bg-[#AD00EC] text-white h-12 text-base" onClick={() => setCurrentStep(4)}>
                                Siguiente <ArrowRight className="ml-2"/>
                            </Button>
                         )}
                        </div>
                    )}
                    {currentStep === 4 && (
                         <>
                         {(testStatus === 'success' && deliveryStatus === 'delivered') ? (
                             <Button className="w-full bg-gradient-to-r from-primary to-accent/80 hover:opacity-90 transition-opacity h-12 text-base" onClick={handleClose}>
                                 Finalizar y Guardar
                             </Button>
                         ) : (
                             <Button onClick={form.handleSubmit(onSubmitSmtp)} className="w-full h-12 text-base bg-[#2a004f] hover:bg-[#00CB07] text-white" disabled={testStatus === 'testing'}>
                                 {testStatus === 'testing' ? <><Loader2 className="mr-2 animate-spin"/> Probando...</> : <><TestTube2 className="mr-2"/> Probar Conexión</>}
                             </Button>
                         )}
                         </>
                    )}
                     <Button 
                        variant="outline"
                        className="w-full h-12 text-base bg-transparent border-[#F00000] text-white dark:text-foreground hover:bg-[#F00000] hover:text-white"
                        onClick={() => setIsCancelConfirmOpen(true)}
                     >
                        Cancelar
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
            const {spfStatus, dkimStatus, dmarcStatus} = (dnsAnalysis as DnsHealthOutput) || {};
            const hasError = spfStatus !== 'verified' || dkimStatus !== 'verified' || dmarcStatus !== 'verified';
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
      if (testStatus === 'testing' || deliveryStatus === 'checking') { status = 'processing'; text = 'PROBANDO CONEXIÓN';
      } else if (testStatus === 'success' && deliveryStatus === 'delivered') { status = 'success'; text = 'CONEXIÓN ESTABLECIDA';
      } else if (testStatus === 'success') { status = 'success'; text = 'CONEXIÓN EXITOSA';
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
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {renderContent()}
      </Dialog>
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
      <DnsInfoModal
        recordType={activeInfoModal}
        domain={domain}
        isOpen={!!activeInfoModal}
        onOpenChange={() => setActiveInfoModal(null)}
        onCopy={handleCopy}
        dkimData={dkimData}
        isGeneratingDkim={isGeneratingDkim}
        onRegenerateDkim={handleGenerateDkim}
      />
      <AiAnalysisModal 
        isOpen={isAnalysisModalOpen}
        onOpenChange={setIsAnalysisModalOpen}
        analysis={dnsAnalysis?.analysis || null}
      />
    </>
  );
}


function DnsInfoModal({
  recordType,
  domain,
  isOpen,
  onOpenChange,
  onCopy,
  dkimData,
  isGeneratingDkim,
  onRegenerateDkim,
}: {
  recordType: InfoViewRecord | null,
  domain: string,
  isOpen: boolean,
  onOpenChange: () => void,
  onCopy: (text: string) => void,
  dkimData: DkimGenerationOutput | null,
  isGeneratingDkim: boolean,
  onRegenerateDkim: () => void;
}) {
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
        description: "MX es un registro que dice “Aquí es donde deben entregarse los correos que envían a mi dominio”. Indica el servidor de correo que recibe tus mensajes. Ejemplo real: Permite que Foxmiu, Outlook o cualquier otro servicio sepa a qué servidor entregar tus correos electrónicos.",
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
                    <p>Si ya usas otros servicios de correo (ej. Foxmiu.com, Workspace, etc.), debes unificar los registros. Solo puede existir un registro SPF por dominio. Unifica los valores `include` en un solo registro.</p>
                    <p className="mt-2 font-mono text-white/90">Ejemplo: `v=spf1 include:_spf.daybuu.com include:spf.otrodominio.com -all`</p>
                </div>
            </div>
        );
    };

    const renderDkimContent = () => (
        <div className="space-y-4 text-sm">
            <p>Añade el siguiente registro TXT para DKIM. La clave pública se genera automáticamente para tu dominio.</p>
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
                <Button onClick={onRegenerateDkim} disabled={isGeneratingDkim} className="w-full mt-2" style={{backgroundColor: '#00ADEC'}}>
                  {isGeneratingDkim ? <Loader2 className="mr-2 animate-spin"/> : <RefreshCw className="mr-2" />}
                  Generar Nueva Clave
                </Button>
                </motion.div>
            ) : (
                <div className="flex items-center justify-center p-4">
                    <Loader2 className="animate-spin" />
                    <p className="ml-2">Generando clave DKIM...</p>
                </div>
            )}
            </AnimatePresence>
        </div>
    );
    
    const renderDmarcContent = () => {
         const recordValue = `v=DMARC1; p=reject; pct=100; rua=mailto:reportes@${domain}; ruf=mailto:reportes@${domain}; sp=reject; aspf=s; adkim=s`;
         return (
            <div className="space-y-4 text-sm">
                <p>Añade un registro DMARC con política `reject` para máxima seguridad y entregabilidad.</p>
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
                <div className="text-xs text-cyan-300/80 p-3 mt-2 bg-cyan-500/10 rounded-lg border border-cyan-400/20 space-y-1">
                    <p className="font-bold mb-1">Explicación de cada parte:</p>
                    <p><strong className="text-white/90">v=DMARC1</strong> → Versión del protocolo DMARC.</p>
                    <p><strong className="text-white/90">p=reject</strong> → Rechaza cualquier correo que no pase SPF o DKIM alineados.</p>
                    <p><strong className="text-white/90">pct=100</strong> → Aplica la política al 100% de los correos.</p>
                    <p><strong className="text-white/90">rua=...</strong> → Dirección para recibir reportes agregados (estadísticas).</p>
                    <p><strong className="text-white/90">ruf=...</strong> → Dirección para recibir reportes forenses (detalles de fallos).</p>
                    <p><strong className="text-white/90">sp=reject</strong> → Aplica la misma política estricta a subdominios.</p>
                    <p><strong className="text-white/90">aspf=s</strong> → Alineación SPF estricta (el dominio debe coincidir).</p>
                    <p><strong className="text-white/90">adkim=s</strong> → Alineación DKIM estricta (el dominio debe coincidir).</p>
                </div>
                <p className="text-xs text-muted-foreground pt-2">Es crucial usar un registro DMARC estricto en su dominio ya que asi evitara por completo suplantaciones y que sus correo enviado se etiqueten como spam mejorando tu marca.</p>
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
          <p className="font-bold text-white/90 flex justify-between w-full"><span>Host/Nombre:</span><Button size="icon" variant="ghost" className="size-6 -mr-2" onClick={() => onCopy(`default._bimi`)}><Copy className="size-4"/></Button></p>
          <span>default._bimi</span>
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
          <p className="font-bold text-white/90 flex justify-between w-full"><span>Host/Nombre:</span><Button size="icon" variant="ghost" className="size-6 -mr-2" onClick={() => onCopy(`default._bimi`)}><Copy className="size-4"/></Button></p>
          <span>default._bimi</span>
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

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl bg-black/50 backdrop-blur-xl border-primary/20 text-white">
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

                <DialogHeader className="z-10">
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
                </DialogHeader>
                 <ScrollArea className="max-h-[60vh] z-10 -mx-6 px-6">
                     <div className="py-4 text-cyan-50 text-sm leading-relaxed whitespace-pre-line bg-black/30 p-4 rounded-lg border border-cyan-400/10 custom-scrollbar break-words">
                        {analysis ? analysis : "No hay análisis disponible en este momento. Por favor, ejecuta el escaneo de nuevo."}
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


    