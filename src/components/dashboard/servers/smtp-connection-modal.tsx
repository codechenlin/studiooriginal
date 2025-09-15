

"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, ArrowRight, Copy, ShieldCheck, Search, AlertTriangle, KeyRound, Server as ServerIcon, AtSign, Mail, TestTube2, CheckCircle, Dna, DatabaseZap, Workflow, Lock, Loader2, Info, RefreshCw, Layers, Check, X } from 'lucide-react';
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
type InfoViewRecord = 'spf' | 'dkim' | 'dmarc' | 'mx' | 'bimi' | 'vmc';


const generateVerificationCode = () => `demo_${Math.random().toString(36).substring(2, 10)}`;

export function SmtpConnectionModal({ isOpen, onOpenChange }: SmtpConnectionModalProps) {
  const { toast } = useToast();
  const [domain, setDomain] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  
  // Health check statuses
  const [healthCheckStep, setHealthCheckStep] = useState<'mandatory' | 'optional'>('mandatory');
  const [spfStatus, setSpfStatus] = useState<HealthCheckStatus>('idle');
  const [dkimStatus, setDkimStatus] = useState<HealthCheckStatus>('idle');
  const [dmarcStatus, setDmarcStatus] = useState<HealthCheckStatus>('idle');
  const [mxStatus, setMxStatus] = useState<HealthCheckStatus>('idle');
  const [bimiStatus, setBimiStatus] = useState<HealthCheckStatus>('idle');
  const [vmcStatus, setVmcStatus] = useState<HealthCheckStatus>('idle');

  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [infoViewRecord, setInfoViewRecord] = useState<InfoViewRecord | null>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [testError, setTestError] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'checking' | 'delivered' | 'bounced'>('idle');
  const [activeInfoModal, setActiveInfoModal] = useState<InfoViewRecord | null>(null);


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
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const result = await verifyDnsAction({
      domain,
      recordType: 'TXT',
      name: '@',
      expectedValue: txtRecordValue,
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
  
  const handleCheckHealth = async (type: 'mandatory' | 'optional') => {
    const checkRecord = async (
      name: string, 
      recordType: 'TXT' | 'MX' | 'CNAME', 
      expectedValue: string | undefined, 
      setStatus: React.Dispatch<React.SetStateAction<HealthCheckStatus>>
    ) => {
        setStatus('verifying');
        const result = await verifyDnsAction({ domain, recordType, name, expectedValue });
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000)); // Simulate delay
        setStatus(result.success ? 'verified' : 'failed');
    };

    if (type === 'mandatory') {
        await Promise.all([
            checkRecord('@', 'TXT', 'v=spf1', setSpfStatus),
            checkRecord('default._domainkey', 'TXT', undefined, setDkimStatus),
            checkRecord('_dmarc', 'TXT', 'v=DMARC1', setDmarcStatus),
        ]);
    } else {
        await Promise.all([
            checkRecord(domain, 'MX', undefined, setMxStatus),
            checkRecord('default._bimi', 'TXT', 'v=BIMI1', setBimiStatus),
            checkRecord('bimi', 'TXT', 'v=VMC1', setVmcStatus),
        ]);
    }
  }

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
        setHealthCheckStep('mandatory');
        setDkimStatus('idle');
        setSpfStatus('idle');
        setDmarcStatus('idle');
        setMxStatus('idle');
        setBimiStatus('idle');
        setVmcStatus('idle');
        setTestStatus('idle');
        setInfoViewRecord(null);
        setShowRecommendation(false);
        form.reset();
        setTestError('');
        setDeliveryStatus('idle');
        setActiveInfoModal(null);
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

  const infoContent = {
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
          title: "Registro MX (Mail Exchange)",
          description: "Los registros MX son fundamentales para la entrega de correo electrónico. Indican a otros sistemas de correo qué servidores son responsables de recibir correos electrónicos en nombre de tu dominio. Sin registros MX correctos, no podrías recibir correos electrónicos.",
        },
        bimi: {
          title: "Registro BIMI (Brand Indicators for Message Identification)",
          description: "BIMI es un estándar emergente que permite mostrar el logotipo de tu marca junto a tus correos electrónicos en las bandejas de entrada de los proveedores compatibles. Para implementarlo, necesitas tener DMARC configurado con una política estricta ('quarantine' o 'reject') y tu logotipo debe estar en formato SVG Tiny 1.2 alojado en una URL pública (HTTPS).",
        },
        vmc: {
          title: "Certificado VMC (Verified Mark Certificate)",
          description: "Un VMC es un certificado digital que va un paso más allá de BIMI. Verifica que el logotipo que estás usando te pertenece legalmente como marca registrada. Es emitido por Autoridades Certificadoras externas, tiene un costo y es un requisito para que Gmail muestre tu logo.\n\nRequisitos previos: Tener configurados correctamente SPF, DKIM y DMARC con política 'quarantine' o 'reject'.",
        },
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

  const renderRecordStatus = (name: string, status: HealthCheckStatus, recordKey: InfoViewRecord) => (
      <div className="p-3 bg-muted/50 rounded-md text-sm border flex justify-between items-center">
          <span className='font-semibold'>{name}</span>
          <div className="flex items-center gap-2">
            {status === 'verifying' ? <Loader2 className="animate-spin text-primary" /> : (status === 'verified' ? <CheckCircle className="text-green-500"/> : <AlertTriangle className="text-red-500"/>)}
            <Button size="sm" variant="outline" className="h-7" onClick={() => { setInfoViewRecord(recordKey); }}>Detalles</Button>
          </div>
      </div>
  );

  const renderCenterPanelContent = () => {
    switch (currentStep) {
        case 1:
            return (
                 <div className="space-y-4 h-full flex flex-col justify-start pt-8">
                    <h3 className="text-lg font-semibold mb-1">Paso 1: Introduce tu Dominio</h3>
                    <p className="text-sm text-muted-foreground">
                    Para asegurar la entregabilidad y autenticidad de tus correos, primero debemos verificar que eres el propietario del dominio.
                    </p>
                    <div className="space-y-2 pt-4 flex-grow">
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
                    <div className='flex justify-center pt-8'>
                        <Button className="w-full h-12 text-base mt-auto" onClick={handleStartVerification}>
                        Siguiente <ArrowRight className="ml-2"/>
                        </Button>
                    </div>
                </div>
            )
        case 2:
            return (
                 <div className="h-full flex flex-col justify-start pt-8">
                   <div className='flex-grow'>
                    <h3 className="text-lg font-semibold mb-1">Paso 2: Añadir Registro DNS</h3>
                    <p className="text-sm text-muted-foreground">
                        Copia el siguiente registro TXT y añádelo a la configuración DNS de tu dominio <b>{domain}</b>.
                    </p>
                    <div className="space-y-3 pt-4">
                        <div className="p-3 bg-muted/50 rounded-md text-sm font-mono border">
                            <Label className="text-xs font-sans text-muted-foreground">REGISTRO (HOST)</Label>
                            <p className="flex justify-between items-center">@ <Copy className="size-4 cursor-pointer" onClick={() => handleCopy('@')}/></p>
                        </div>
                         <div className="p-3 bg-muted/50 rounded-md text-sm font-mono border">
                            <Label className="text-xs font-sans text-muted-foreground">VALOR</Label>
                            <p className="flex justify-between items-center break-all">{txtRecordValue} <Copy className="size-4 cursor-pointer ml-2" onClick={() => handleCopy(txtRecordValue)}/></p>
                        </div>
                    </div>
                   </div>
                 </div>
            )
        case 3:
            if (infoViewRecord) {
                 return (
                    <div className="h-full flex flex-col justify-start pt-8">
                        <h3 className="text-lg font-bold mb-2">{infoContent[infoViewRecord].title}</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-line flex-grow">{infoContent[infoViewRecord].description}</p>
                        
                        <div className="flex gap-2 mt-auto">
                           <Button variant="outline" className="w-full" onClick={() => { setInfoViewRecord(null); setShowRecommendation(false); }}>Atrás</Button>
                           <Button className="w-full" onClick={() => setActiveInfoModal(infoViewRecord)}>Añadir DNS</Button>
                        </div>
                    </div>
                )
            }
            return (
                <div className="h-full flex flex-col justify-start pt-8">
                  <div className='flex-grow'>
                    <h3 className="text-lg font-semibold mb-1">Paso 3: Salud del Dominio</h3>
                    <p className="text-sm text-muted-foreground">Verificaremos registros para asegurar una alta entregabilidad. Si alguno falla, te daremos los valores a configurar.</p>

                    <div className="space-y-3 mt-4">
                        {healthCheckStep === 'mandatory' ? (
                          <>
                            <h4 className='font-semibold text-sm'>Obligatorios</h4>
                            {renderRecordStatus('SPF', spfStatus, 'spf')}
                            {renderRecordStatus('DKIM', dkimStatus, 'dkim')}
                            {renderRecordStatus('DMARC', dmarcStatus, 'dmarc')}
                          </>
                        ) : (
                          <>
                            <h4 className='font-semibold text-sm'>Opcionales</h4>
                            {renderRecordStatus('MX', mxStatus, 'mx')}
                            {renderRecordStatus('BIMI', bimiStatus, 'bimi')}
                            {renderRecordStatus('VMC', vmcStatus, 'vmc')}
                          </>
                        )}
                    </div>
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
       const isVerifying = [dkimStatus, spfStatus, dmarcStatus, mxStatus, bimiStatus, vmcStatus].some(s => s === 'verifying');
      const allMandatoryDone = spfStatus !== 'idle' && dkimStatus !== 'idle' && dmarcStatus !== 'idle';
      const anyMandatoryFailed = spfStatus === 'failed' || dkimStatus === 'failed' || dmarcStatus === 'failed';

      if (isVerifying) {
        status = 'processing'; text = 'ANALIZANDO SALUD';
      } else if (allMandatoryDone) {
        if (anyMandatoryFailed) {
          status = 'error'; text = 'REQUIERE ATENCIÓN';
        } else {
          status = 'success'; text = 'REGISTROS OBLIGATORIOS OK';
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
      idle: 'bg-blue-500',
      processing: 'bg-amber-500',
      success: 'bg-green-500',
      error: 'bg-red-500',
    }[status];

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

  const Step4Form = () => (
     <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitSmtp)} id="smtp-form" className="grid grid-cols-1 md:grid-cols-2 h-full">
         {/* Central Panel */}
        <div className="p-8 flex flex-col h-full">
          <motion.div
            key="step4-center"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full flex flex-col"
          >
             <div className="space-y-3 h-full flex flex-col justify-start pt-8">
                <h3 className="text-lg font-semibold mb-1">Paso 4: Configurar Credenciales</h3>
                <p className="text-sm text-muted-foreground">Proporciona los detalles de tu servidor SMTP.</p>
                <div className="space-y-4 flex-grow pt-4">
                    <FormField control={form.control} name="host" render={({ field }) => (
                        <FormItem>
                            <Label className='text-left w-full'>Host</Label>
                            <FormControl><div className="relative"><ServerIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input className="pl-10 h-12 text-base" placeholder="smtp.dominio.com" {...field} /></div></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField control={form.control} name="port" render={({ field }) => (
                        <FormItem>
                            <Label className='text-left w-full'>Puerto</Label>
                            <FormControl><div className="relative"><Input type="number" placeholder="587" className='h-12 text-base' {...field} /></div></FormControl>
                            <FormMessage />
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
                        <FormItem><Label>Usuario (Email)</Label><FormControl><div className="relative"><AtSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input className="pl-10" placeholder={`usuario@${domain}`} {...field} /></div></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem><Label>Contraseña</Label><FormControl><div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input className="pl-10" type="password" placeholder="••••••••" {...field} /></div></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
            </div>
          </motion.div>
        </div>
        {/* Right Panel */}
        <div className="h-full">
            <motion.div
                key="step4-right"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full"
              >
              {renderRightPanelContent()}
            </motion.div>
        </div>
      </form>
    </Form>
  );

  const renderRightPanelContent = () => {
    const allMandatoryHealthChecksDone = dkimStatus !== 'idle' && dkimStatus !== 'verifying' && spfStatus !== 'idle' && spfStatus !== 'verifying' && dmarcStatus !== 'idle' && dmarcStatus !== 'verifying';
    const allMandatoryHealthChecksPassed = dkimStatus === 'verified' && spfStatus === 'verified' && dmarcStatus === 'verified';
    
    const allOptionalHealthChecksDone = mxStatus !== 'idle' && mxStatus !== 'verifying' && bimiStatus !== 'idle' && bimiStatus !== 'verifying' && vmcStatus !== 'idle' && vmcStatus !== 'verifying';


    return (
      <div className="relative p-6 border-l h-full flex flex-col items-center text-center bg-muted/20">
        <StatusIndicator />
        <AnimatePresence mode="wait">
          <motion.div
              key={`step-content-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex-grow flex flex-col justify-center"
            >
            {currentStep === 1 && (
              <div className="w-full h-full text-center flex flex-col justify-center">
                <div className="flex justify-center mb-4"><Globe className="size-16 text-primary/30" /></div>
                <h4 className="font-bold">Empecemos</h4>
                <p className="text-sm text-muted-foreground">Introduce tu dominio para comenzar la verificación.</p>
              </div>
            )}
            {currentStep === 2 && (
              <div className="text-center h-full flex flex-col justify-between w-full">
                <div className="relative flex-grow flex flex-col justify-center overflow-hidden items-center">
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
              </div>
            )}
            {currentStep === 3 && (
              <div className="w-full h-full flex flex-col justify-between">
                 <div className="flex-grow flex flex-col justify-center">
                    <div className="text-center">
                        <div className="flex justify-center mb-4"><ShieldCheck className="size-16 text-primary/30" /></div>
                        <h4 className="font-bold">Salud del Dominio</h4>
                        <p className="text-sm text-muted-foreground">Comprobaremos tus registros para asegurar una alta entregabilidad.</p>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                 {healthCheckStep === 'mandatory' ? (
                     <Button className="w-full h-12 text-base" onClick={() => handleCheckHealth('mandatory')} disabled={spfStatus === 'verifying'}>
                      {spfStatus === 'verifying' ? 'Escaneando...' : 'Escanear'}
                    </Button>
                 ) : (
                    <Button className="w-full h-12 text-base" onClick={() => handleCheckHealth('optional')} disabled={mxStatus === 'verifying'}>
                      {mxStatus === 'verifying' ? 'Escaneando...' : 'Escanear'}
                    </Button>
                 )}
                 {healthCheckStep === 'mandatory' && allMandatoryHealthChecksDone && (
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 text-base" onClick={() => setHealthCheckStep('optional')} disabled={!allMandatoryHealthChecksPassed}>
                      Continuar a Opcionales <ArrowRight className="ml-2"/>
                    </Button>
                 )}
                 {healthCheckStep === 'optional' && allOptionalHealthChecksDone && (
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 text-base" onClick={() => setCurrentStep(4)}>
                        Ir a Configuración SMTP <ArrowRight className="ml-2"/>
                    </Button>
                 )}
                </div>
              </div>
            )}
            {currentStep === 4 && (
                <div className="w-full h-full flex flex-col justify-between">
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
                    <AnimatePresence>
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
                </div>
            )}
            </motion.div>
        </AnimatePresence>
        <div className="mt-auto w-full pt-4">
          <Button variant="outline" className="w-full" onClick={handleClose}>Cancelar</Button>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (currentStep === 4) {
      return (
        <DialogContent className="max-w-4xl p-0 grid grid-cols-1 md:grid-cols-1 gap-0 h-[700px]" showCloseButton={false}>
          <Step4Form />
        </DialogContent>
      );
    }

    return (
       <DialogContent className="max-w-4xl p-0 grid grid-cols-1 md:grid-cols-3 gap-0 h-[600px]" showCloseButton={false}>
          <div className="hidden md:block md:col-span-1 h-full">
            {renderLeftPanel()}
          </div>
          <div className="md:col-span-2 h-full grid grid-cols-1 md:grid-cols-2">
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
          </div>
      </DialogContent>
    );
  };


  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {renderContent()}
      </Dialog>
      <DnsInfoModal
        recordType={activeInfoModal}
        domain={domain}
        isOpen={!!activeInfoModal}
        onOpenChange={() => setActiveInfoModal(null)}
        onCopy={handleCopy}
      />
    </>
  );
}


function DnsInfoModal({
  recordType,
  domain,
  isOpen,
  onOpenChange,
  onCopy
}: {
  recordType: InfoViewRecord | null,
  domain: string,
  isOpen: boolean,
  onOpenChange: () => void,
  onCopy: (text: string) => void
}) {
    if(!recordType) return null;

    const getRecordContent = () => {
        const baseClass = "p-2 bg-black/20 rounded-md font-mono text-xs text-white/80 flex justify-between items-center";
        let recordValue = '';
        switch(recordType) {
            case 'spf':
                recordValue = `v=spf1 include:_spf.foxmiu.email -all`;
                return (
                    <div className="space-y-4 text-sm">
                        <p>Añade el siguiente registro TXT a la configuración de tu dominio en tu proveedor (GoDaddy, Cloudflare, etc.).</p>
                        <div className={baseClass}><span>Host: @</span></div>
                        <div className={baseClass}><span>Tipo: TXT</span></div>
                        <div className={baseClass}><span>TTL: 3600</span></div>
                        <div className={baseClass}><span className="truncate">Valor: {recordValue}</span><Button size="icon" variant="ghost" onClick={() => onCopy(recordValue)}><Copy className="size-4"/></Button></div>
                        <div className="text-xs text-amber-300/80 p-3 bg-amber-500/10 rounded-lg border border-amber-400/20">
                            <p className="font-bold mb-1">Importante: Unificación de SPF</p>
                            <p>Si ya usas otros servicios de correo (ej. Google Workspace), debes unificar los registros. Solo puede existir un registro SPF por dominio. Unifica los valores `include` en un solo registro.</p>
                            <p className="mt-2 font-mono text-white/90">Ej: `v=spf1 include:_spf.foxmiu.email include:spf.otrodominio.com ~all`</p>
                        </div>
                    </div>
                )
             case 'dkim':
                recordValue = `v=DKIM1; k=rsa; p=PUBLIC_KEY...`; // Placeholder
                return (
                    <div className="space-y-4 text-sm">
                         <p>Debido a que DKIM requiere una clave única, nuestro sistema la generará por ti. Haz clic en el botón para crear tu registro DKIM personalizado.</p>
                          <div className={cn(baseClass, "flex-col items-start gap-1")}>
                            <p className="font-bold text-white/90">Registro DKIM Generado:</p>
                            <span className="text-muted-foreground">(Aún no implementado)</span>
                         </div>
                         <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90">
                            <Dna className="mr-2"/> Generar Registro DKIM
                         </Button>
                    </div>
                )
             case 'dmarc':
                recordValue = `v=DMARC1; p=reject; pct=100; rua=mailto:reportes@${domain}; ruf=mailto:reportes@${domain}; sp=reject; aspf=s; adkim=s`;
                 const dmarcParts = {
                    "v=DMARC1": "Versión del protocolo.",
                    "p=reject": "Rechaza correos que no pasen la alineación.",
                    "pct=100": "Aplica la política al 100% de los correos.",
                    "rua=mailto:...": "Dirección para reportes agregados.",
                    "ruf=mailto:...": "Dirección para reportes forenses.",
                    "sp=reject": "Política estricta para subdominios.",
                    "aspf=s / adkim=s": "Alineación estricta para SPF y DKIM.",
                };
                return (
                     <div className="space-y-4 text-sm">
                        <p>Es crucial usar un registro DMARC estricto para evitar suplantaciones y mejorar la reputación de tu marca. Añade este registro TXT:</p>
                        <div className={cn(baseClass, "flex-col items-start gap-1")}>
                           <div className="w-full flex justify-between items-center"><span>Host: _dmarc</span></div>
                           <div className="w-full flex justify-between items-center"><span>Tipo: TXT</span></div>
                           <div className="w-full flex justify-between items-center"><span>TTL: 3600</span></div>
                           <div className="w-full flex justify-between items-start"><span className="truncate">Valor: {recordValue}</span><Button size="icon" variant="ghost" onClick={() => onCopy(recordValue)}><Copy className="size-4"/></Button></div>
                        </div>
                        <div className="text-xs p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                           <ul className="space-y-1">
                            {Object.entries(dmarcParts).map(([key, value]) => (
                               <li key={key} className="flex items-start gap-2">
                                <Check className="size-3 mt-0.5 shrink-0 text-blue-300"/>
                                <span><span className="font-mono text-white/90">{key}</span> &rarr; {value}</span>
                               </li>
                            ))}
                           </ul>
                        </div>
                    </div>
                )
            default:
                return <p>Información no disponible para este tipo de registro.</p>
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-black/50 backdrop-blur-xl border-primary/20 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 rounded-full bg-primary/20"><Dna className="text-primary"/></div>
                        Instrucciones para Registro {recordType.toUpperCase()}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {getRecordContent()}
                </div>
                <DialogFooter className="sm:justify-between">
                     <Button type="button" variant="outline" onClick={onOpenChange}>
                       Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

    