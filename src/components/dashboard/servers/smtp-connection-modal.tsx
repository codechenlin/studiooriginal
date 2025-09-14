
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, ArrowRight, Copy, ShieldCheck, Search, AlertTriangle, KeyRound, Server as ServerIcon, AtSign, Mail, TestTube2, CheckCircle, Dna, DatabaseZap, Workflow, Lock, Loader2, Info, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { verifyDnsAction } from '@/app/dashboard/servers/actions';
import { sendTestEmailAction } from '@/app/dashboard/servers/send-email-actions';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface SmtpConnectionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type VerificationStatus = 'idle' | 'pending' | 'verifying' | 'verified' | 'failed';
type HealthCheckStatus = 'idle' | 'verifying' | 'verified' | 'failed';
type TestStatus = 'idle' | 'testing' | 'success' | 'failed';
type InfoView = 'spf' | 'dkim' | 'dmarc' | null;


const generateVerificationCode = () => `demo_${Math.random().toString(36).substring(2, 10)}`;

export function SmtpConnectionModal({ isOpen, onOpenChange }: SmtpConnectionModalProps) {
  const { toast } = useToast();
  const [domain, setDomain] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [dkimStatus, setDkimStatus] = useState<HealthCheckStatus>('idle');
  const [spfStatus, setSpfStatus] = useState<HealthCheckStatus>('idle');
  const [dmarcStatus, setDmarcStatus] = useState<HealthCheckStatus>('idle');
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [infoView, setInfoView] = useState<InfoView>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [testError, setTestError] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'checking' | 'delivered' | 'bounced'>('idle');


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
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const result = await verifyDnsAction({
      domain,
      expectedTxt: txtRecordValue,
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (result.success) {
      setVerificationStatus('verified');
      form.setValue('username', `ejemplo@${domain}`);
    } else {
      setVerificationStatus('failed');
      toast({
        title: "Verificación Fallida",
        description: result.error,
        variant: "destructive",
      });
    }
  };
  
  const handleCheckHealth = async () => {
    setDkimStatus('verifying');
    setSpfStatus('verifying');
    setDmarcStatus('verifying');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setDkimStatus('verified');
    setSpfStatus('failed');
    setDmarcStatus('failed');
  }

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
        setDkimStatus('idle');
        setSpfStatus('idle');
        setDmarcStatus('idle');
        setTestStatus('idle');
        setInfoView(null);
        setShowRecommendation(false);
        form.reset();
        setTestError('');
        setDeliveryStatus('idle');
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

  const renderLeftPanel = () => {
      const stepInfo = [
          { title: "Verificar Dominio", icon: Globe },
          { title: "Añadir DNS", icon: Dna },
          { title: "Salud del Dominio", icon: ShieldCheck },
          { title: "Configurar SMTP", icon: DatabaseZap },
      ];

      return (
          <div className="bg-muted/30 p-8 flex flex-col justify-between h-full">
              <div>
                 <DialogTitle className="text-xl font-bold flex items-center gap-2"><Workflow /> Conectar Servidor SMTP</DialogTitle>
                 <DialogDescription className="text-muted-foreground mt-1">Sigue los pasos para una conexión segura.</DialogDescription>
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
              </div>

              <div className="text-xs text-muted-foreground">
                  Una configuración SMTP segura y verificada es crucial para asegurar la máxima entregabilidad y reputación de tus campañas de correo.
              </div>
          </div>
      )
  }

  const renderCenterPanelContent = () => {
    switch (currentStep) {
        case 1:
            return (
                 <div className="space-y-4 h-full flex flex-col">
                     <div className="flex-grow">
                      <h3 className="text-lg font-semibold mb-1">Paso 1: Introduce tu Dominio</h3>
                      <p className="text-sm text-muted-foreground">
                      Para asegurar la entregabilidad y autenticidad de tus correos, primero debemos verificar que eres el propietario del dominio.
                      </p>
                      <div className="space-y-2 pt-4">
                        <Label htmlFor="domain">Tu Dominio</Label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input 
                                id="domain" 
                                placeholder="ejemplo.com" 
                                className="pl-10 h-12 text-base"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                            />
                        </div>
                      </div>
                    </div>
                     <Button className="w-full h-12 text-base mt-4" onClick={handleStartVerification}>
                        Siguiente <ArrowRight className="ml-2"/>
                    </Button>
                </div>
            )
        case 2:
            return (
                 <div className="h-full flex flex-col">
                    <h3 className="text-lg font-semibold mb-1">Paso 2: Añadir Registro DNS</h3>
                    <p className="text-sm text-muted-foreground">
                        Copia el siguiente registro TXT y añádelo a la configuración DNS de tu dominio <b>{domain}</b>.
                    </p>
                    <div className="space-y-3 pt-4 flex-grow">
                        <div className="p-3 bg-muted/50 rounded-md text-sm font-mono border">
                            <Label className="text-xs font-sans text-muted-foreground">REGISTRO</Label>
                            <p className="flex justify-between items-center">_foxmiu-verification <Copy className="size-4 cursor-pointer" onClick={() => handleCopy('_foxmiu-verification')}/></p>
                        </div>
                         <div className="p-3 bg-muted/50 rounded-md text-sm font-mono border">
                            <Label className="text-xs font-sans text-muted-foreground">VALOR</Label>
                            <p className="flex justify-between items-center break-all">{txtRecordValue} <Copy className="size-4 cursor-pointer ml-2" onClick={() => handleCopy(txtRecordValue)}/></p>
                        </div>
                    </div>
                 </div>
            )
        case 3:
            return (
                <div className="h-full flex flex-col">
                    <h3 className="text-lg font-semibold mb-1">Paso 3: Salud del Dominio</h3>
                    <p className="text-sm text-muted-foreground flex-grow">Verificaremos registros SPF, DKIM y DMARC para asegurar una alta entregabilidad. Si alguno falla, te daremos los valores a configurar.</p>
                </div>
            )
        case 4:
            return (
                <div className="space-y-3 h-full flex flex-col">
                    <h3 className="text-lg font-semibold mb-1">Paso 4: Configurar Credenciales</h3>
                    <p className="text-sm text-muted-foreground">Proporciona los detalles de tu servidor SMTP.</p>
                    <div className="space-y-3 flex-grow pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="host" render={({ field }) => (
                            <FormItem><Label>Host</Label><FormControl><div className="relative"><ServerIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input className="pl-10" placeholder="smtp.ejemplo.com" {...field} /></div></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="port" render={({ field }) => (
                            <FormItem><Label>Puerto</Label><FormControl><div className="relative"><Input type="number" placeholder="587" {...field} /></div></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
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
                            <FormItem><Label>Usuario (Email)</Label><FormControl><div className="relative"><AtSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input className="pl-10" placeholder={`usuario@${domain}`} {...field} /></div></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem><Label>Contraseña</Label><FormControl><div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input className="pl-10" type="password" placeholder="••••••••" {...field} /></div></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                </div>
            )
        default: return null;
    }
  }
  
  const StatusIndicator = () => {
    let status: 'idle' | 'processing' | 'success' | 'error' = 'idle';
    let text = 'ESTADO DEL SISTEMA';

    if (currentStep === 2) {
      if (verificationStatus === 'verifying') {
        status = 'processing'; text = 'VERIFICANDO DNS';
      } else if (verificationStatus === 'verified') {
        status = 'success'; text = 'DOMINIO VERIFICADO';
      } else if (verificationStatus === 'failed') {
        status = 'error'; text = 'FALLO DE VERIFICACIÓN';
      } else {
        status = 'idle'; text = 'ESPERANDO ACCIÓN';
      }
    } else if (currentStep === 3) {
      const isVerifying = dkimStatus === 'verifying' || spfStatus === 'verifying' || dmarcStatus === 'verifying';
      const isDone = dkimStatus !== 'idle' && spfStatus !== 'idle' && dmarcStatus !== 'idle' && !isVerifying;
      const hasFailed = dkimStatus === 'failed' || spfStatus === 'failed' || dmarcStatus === 'failed';

      if (isVerifying) {
        status = 'processing'; text = 'ANALIZANDO SALUD';
      } else if (isDone) {
        if (hasFailed) {
          status = 'error'; text = 'REQUIERE ATENCIÓN';
        } else {
          status = 'success'; text = 'DOMINIO SALUDABLE';
        }
      } else {
        status = 'idle'; text = 'LISTO PARA CHEQUEO';
      }
    } else if (currentStep === 4) {
      if (testStatus === 'testing' || deliveryStatus === 'checking') {
        status = 'processing'; text = 'PROBANDO CONEXIÓN';
      } else if (testStatus === 'success' && deliveryStatus === 'delivered') {
        status = 'success'; text = 'CONEXIÓN ESTABLECIDA';
      } else if (testStatus === 'success') {
        status = 'success'; text = 'CONEXIÓN EXITOSA';
      } else if (testStatus === 'failed') {
        status = 'error'; text = 'FALLO DE CONEXIÓN';
      } else {
        status = 'idle'; text = 'LISTO PARA PRUEBA';
      }
    }
    
    const ledColor = {
      idle: 'bg-blue-500/50',
      processing: 'bg-amber-500',
      success: 'bg-green-500',
      error: 'bg-red-500',
    }[status];

    const animation = {
      idle: 'animate-pulse',
      processing: 'animate-pulse animation-delay-300',
      success: 'animate-pulse',
      error: 'animate-pulse',
    }[status];

    return (
      <div className="flex items-center justify-center gap-2 mb-4 p-2 rounded-lg bg-black/10 border border-white/5">
        <div className="relative flex items-center justify-center w-4 h-4">
          <div className={cn('absolute w-full h-full rounded-full', ledColor, animation)} />
          <div className={cn('w-2 h-2 rounded-full', ledColor)} />
        </div>
        <p className="text-xs font-semibold tracking-wider text-white/80">{text}</p>
      </div>
    );
  };


  const renderRightPanelContent = () => {
    const renderRecordStatus = (name: string, status: HealthCheckStatus, onInfoClick: () => void) => (
        <div className="flex items-center justify-between p-2 rounded-md bg-muted/40">
            <span className="font-semibold">{name}</span>
            <div className="flex items-center gap-2">
                {status === 'verifying' && <Loader2 className="animate-spin text-primary" />}
                {status === 'verified' && <CheckCircle className="text-green-500"/>}
                {status === 'failed' && <AlertTriangle className="text-red-500"/>}
                <Button size="sm" variant="ghost" className="text-xs h-6 px-1" onClick={onInfoClick}><Info className="size-4 mr-1"/> Aprende más</Button>
            </div>
        </div>
    );
    
    const allHealthChecksDone = dkimStatus !== 'idle' && dkimStatus !== 'verifying' && spfStatus !== 'idle' && spfStatus !== 'verifying' && dmarcStatus !== 'idle' && dmarcStatus !== 'verifying';
    const allHealthChecksPassed = dkimStatus === 'verified' && spfStatus === 'verified' && dmarcStatus === 'verified';

    const infoContent = {
        spf: {
          title: "Qué es SPF?",
          description: "Sender Policy Framework (SPF) previene la suplantación de identidad (spoofing) al especificar qué servidores de correo están autorizados a enviar emails desde tu dominio. Es una lista blanca para tus remitentes.",
          recommendation: `v=spf1 include:servidor.com ~all`
        },
        dkim: {
          title: "Qué es DKIM?",
          description: "DomainKeys Identified Mail (DKIM) añade una firma digital a tus correos. Esto permite a los servidores receptores verificar que el correo realmente provino de tu dominio y no ha sido alterado en tránsito.",
          recommendation: `v=DKIM1; k=rsa; p=PUBLIC_KEY`
        },
        dmarc: {
          title: "Qué es DMARC?",
          description: "Domain-based Message Authentication, Reporting, and Conformance (DMARC) unifica SPF y DKIM. Le dice a los servidores qué hacer si un correo falla estas verificaciones (rechazarlo, marcarlo como spam, etc.) y envía reportes.",
          recommendation: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}`
        },
    };

    return (
      <div className="relative p-6 border-l h-full flex flex-col items-center text-center bg-muted/20">
        <StatusIndicator />
        <AnimatePresence mode="wait">
          <div key={`step-content-${currentStep}`} className="w-full flex-grow flex flex-col justify-center">
            {currentStep === 1 && (
              <motion.div key="step1-info" {...cardAnimation} className="w-full h-full text-center flex flex-col justify-center">
                <div className="flex justify-center mb-4"><Globe className="size-16 text-primary/30" /></div>
                <h4 className="font-bold">Empecemos</h4>
                <p className="text-sm text-muted-foreground">Introduce tu dominio para comenzar la verificación.</p>
              </motion.div>
            )}
            {currentStep === 2 && (
              <motion.div key="step2-container" {...cardAnimation} className="text-center h-full flex flex-col justify-between w-full">
                <div className="relative flex-grow flex flex-col justify-center overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex justify-center items-center pointer-events-none">
                    <div className={cn("absolute w-40 h-40 bg-primary/5 rounded-full transition-all duration-500", verificationStatus === 'verifying' && "animate-pulse")}/>
                    <div className={cn("absolute w-56 h-56 border-2 border-primary/10 rounded-full transition-all duration-500", verificationStatus === 'verifying' && "animate-ping")}/>
                  </div>
                  <div className="z-10">
                    {verificationStatus === 'pending' && (
                      <motion.div key="pending-check" {...cardAnimation} className="text-center flex-grow flex flex-col justify-center">
                        <div className="flex justify-center mb-4"><Dna className="size-16 text-primary/30" /></div>
                        <h4 className="font-bold">Acción Requerida</h4>
                        <p className="text-sm text-muted-foreground">Añade el registro TXT a tu proveedor de DNS y luego verifica.</p>
                      </motion.div>
                    )}
                    {verificationStatus === 'verifying' && (
                      <motion.div key="verifying" {...cardAnimation} className="flex flex-col items-center gap-3 flex-grow justify-center">
                        <div className="relative size-20">
                          <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full"/>
                          <div className="absolute inset-0 border-t-2 border-blue-400 rounded-full animate-spin"/>
                          <Search className="absolute inset-0 m-auto size-8 text-blue-400"/>
                        </div>
                        <h4 className="font-bold text-lg">Verificando...</h4>
                        <p className="text-sm text-muted-foreground">Buscando el registro DNS en el dominio.</p>
                      </motion.div>
                    )}
                    {verificationStatus === 'verified' && (
                      <motion.div key="verified" {...cardAnimation} className="flex flex-col items-center gap-3 flex-grow justify-center">
                        <ShieldCheck className="size-20 text-green-400" />
                        <h4 className="font-bold text-lg">¡Dominio Verificado!</h4>
                        <p className="text-sm text-muted-foreground">El registro TXT se encontró correctamente.</p>
                      </motion.div>
                    )}
                    {verificationStatus === 'failed' && (
                      <motion.div key="failed-info" {...cardAnimation} className="flex flex-col items-center gap-3 text-center flex-grow justify-center">
                        <AlertTriangle className="size-16 text-red-400" />
                        <h4 className="font-bold text-lg">Verificación Fallida</h4>
                        <p className="text-sm text-muted-foreground">No pudimos encontrar el registro. La propagación de DNS puede tardar.</p>
                      </motion.div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-auto">
                  {(verificationStatus === 'pending' || verificationStatus === 'failed') &&
                    <Button
                      className="w-full h-12 text-base mt-4"
                      onClick={handleCheckVerification}
                      disabled={verificationStatus === 'verifying'}
                    >
                      {verificationStatus === 'verifying' ? <><Loader2 className="mr-2 animate-spin"/>Verificando...</> : 'Verificar ahora'}
                    </Button>
                  }
                  {verificationStatus === 'verified' && (
                    <Button className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white h-12 text-base" onClick={() => setCurrentStep(3)}>
                      Continuar <ArrowRight className="ml-2"/>
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
            {currentStep === 3 && (
              <motion.div key="step3-health" {...cardAnimation} className="w-full h-full flex flex-col justify-between">
                <div className="flex-grow flex flex-col justify-center">
                  {infoView ? (
                    <motion.div key={infoView} {...cardAnimation} className="flex-grow flex flex-col">
                      <h4 className="font-bold text-lg">{infoContent[infoView].title}</h4>
                      <p className="text-sm text-muted-foreground mt-2 text-left flex-grow">{infoContent[infoView].description}</p>
                      {showRecommendation && (
                        <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} className="mt-3 text-left p-2 bg-muted/50 rounded-md font-mono text-xs border">
                          <p className="font-sans font-semibold text-foreground mb-1">Ejemplo de registro TXT:</p>
                          <code>{infoContent[infoView].recommendation}</code>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <div>
                      {(dkimStatus !== 'idle' || spfStatus !== 'idle' || dmarcStatus !== 'idle') ? (
                        <div className="space-y-2 mt-4 text-left">
                          {renderRecordStatus('SPF', spfStatus, () => setInfoView('spf'))}
                          {renderRecordStatus('DKIM', dkimStatus, () => setInfoView('dkim'))}
                          {renderRecordStatus('DMARC', dmarcStatus, () => setInfoView('dmarc'))}
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="flex justify-center mb-4"><ShieldCheck className="size-16 text-primary/30" /></div>
                          <h4 className="font-bold">Salud del Dominio</h4>
                          <p className="text-sm text-muted-foreground">Comprobaremos tus registros SPF, DKIM y DMARC.</p>
                        </div>
                      )}
                      {allHealthChecksDone && (
                        <p className={cn("text-sm mt-3", allHealthChecksPassed ? "text-green-500" : "text-red-500")}>
                          {allHealthChecksPassed ? "¡Tu dominio está en perfectas condiciones!" : "Algunos registros requieren atención para una entregabilidad óptima."}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {infoView ? (
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" className="w-full" onClick={() => { setInfoView(null); setShowRecommendation(false); }}>Atrás</Button>
                      <Button className="w-full" onClick={() => setShowRecommendation(!showRecommendation)}>
                        {showRecommendation ? 'Ocultar' : 'Ver'} Recomendación
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      {allHealthChecksDone ? (
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 text-base" onClick={() => setCurrentStep(4)}>
                          Continuar <ArrowRight className="ml-2"/>
                        </Button>
                      ) : (
                        <Button className="w-full h-12 text-base" onClick={handleCheckHealth} disabled={dkimStatus === 'verifying'}>
                          {dkimStatus === 'verifying' ? 'Verificando...' : 'Comprobar Salud del Dominio'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            {currentStep === 4 && (
              <motion.div key="step4-actions" {...cardAnimation} className="w-full h-full flex flex-col justify-between">
                  <div className="p-4 border rounded-lg bg-muted/30 flex-grow flex flex-col">
                    <p className="text-sm font-semibold mb-2">Verifica tu conexión</p>
                    <p className="text-xs text-muted-foreground mb-3 flex-grow">Enviaremos un correo para asegurar que todo esté configurado correctamente.</p>
                    <FormField control={form.control} name="testEmail" render={({ field }) => (
                        <FormItem>
                            <Label className="text-left">Enviar correo de prueba a:</Label>
                            <FormControl><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input className="pl-10" placeholder="receptor@ejemplo.com" {...field} /></div></FormControl>
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
                        <p className="text-xs text-muted-foreground">Haz clic aquí para comprobar si el correo rebotó. Esto puede tardar unos segundos.</p>
                        {deliveryStatus === 'delivered' && 
                            <p className="text-sm font-bold text-green-400">¡Confirmado! El correo fue entregado con éxito.</p>
                        }
                      </motion.div>
                  )}
                  <AnimatePresence mode="wait">
                    {testStatus === 'failed' && (
                        <motion.div key="failed-smtp" {...cardAnimation} className="p-2 mt-4 bg-red-500/10 text-red-400 rounded-lg text-center text-xs">
                            <h4 className="font-bold flex items-center justify-center gap-2"><AlertTriangle/>Fallo en la Conexión</h4>
                            <p>{testError}</p>
                        </motion.div>
                    )}
                  </AnimatePresence>
                <div className="mt-auto pt-4 flex flex-col gap-2">
                    {(testStatus === 'success' && deliveryStatus === 'delivered') ? (
                        <Button className="w-full bg-gradient-to-r from-primary to-accent/80 hover:opacity-90 transition-opacity h-12 text-base" onClick={handleClose}>
                            Finalizar y Guardar
                        </Button>
                    ) : (
                        <Button type="submit" form="smtp-form" className="w-full h-12 text-base" disabled={testStatus === 'testing'}>
                            {testStatus === 'testing' ? <><Loader2 className="mr-2 animate-spin"/> Probando...</> : <><TestTube2 className="mr-2"/> Probar Conexión</>}
                        </Button>
                    )}
                </div>
              </motion.div>
            )}
          </div>
        </AnimatePresence>
        <div className="mt-auto w-full pt-4">
          <Button variant="outline" className="w-full" onClick={handleClose}>Cancelar</Button>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    return (
       <Form {...form}>
          <form id="smtp-form" onSubmit={form.handleSubmit(onSubmitSmtp)} className="grid grid-cols-1 md:grid-cols-2 h-full">
            <div className="p-8 flex flex-col h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="h-full"
                >
                  {renderCenterPanelContent()}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="h-full">
              {renderRightPanelContent()}
            </div>
          </form>
        </Form>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-4xl p-0 grid grid-cols-1 md:grid-cols-3 gap-0 h-[600px]" showCloseButton={false}>
          <div className="hidden md:block md:col-span-1 h-full">
            {renderLeftPanel()}
          </div>
          <div className="md:col-span-2 h-full">
            {renderContent()}
          </div>
      </DialogContent>
    </Dialog>
  );
}

    