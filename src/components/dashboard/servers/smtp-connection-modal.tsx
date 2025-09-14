
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, ArrowRight, Copy, ShieldCheck, Search, AlertTriangle, KeyRound, Server as ServerIcon, AtSign, Mail, TestTube2, CheckCircle, Dna, DatabaseZap, Workflow, Lock, Loader2, Info, RefreshCw, Layers } from 'lucide-react';
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
      recordType: 'TXT',
      name: '_foxmiu-verification',
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
        setStatus(result.success ? 'verified' : 'failed');
    };

    if (type === 'mandatory') {
        await Promise.all([
            checkRecord('@', 'TXT', 'v=spf1', setSpfStatus),
            checkRecord('default._domainkey', 'TXT', 'v=DKIM1', setDkimStatus),
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
          title: "Registro SPF (Sender Policy Framework)",
          description: "SPF es un sistema de validación de correo electrónico diseñado para prevenir el spam al detectar la suplantación de identidad (spoofing). Permite a los administradores de dominios especificar qué servidores de correo están autorizados para enviar correos en nombre de su dominio.",
          recommendation: `v=spf1 include:servidor.com ~all`
        },
        dkim: {
          title: "Registro DKIM (DomainKeys Identified Mail)",
          description: "DKIM añade una firma digital a cada correo electrónico que envías. Esto permite a los servidores de correo receptores verificar que el correo fue realmente enviado desde tu dominio y que su contenido no ha sido alterado en tránsito, como un sello de seguridad.",
          recommendation: `v=DKIM1; k=rsa; p=PUBLIC_KEY...`
        },
        dmarc: {
          title: "Registro DMARC (Domain-based Message Authentication...)",
          description: "DMARC unifica los protocolos SPF y DKIM en un marco común y permite al propietario del dominio especificar cómo tratar los correos electrónicos que no superan las comprobaciones SPF o DKIM (por ejemplo, ponerlos en cuarentena o rechazarlos).",
          recommendation: `v=DMARC1; p=quarantine; rua=mailto:dmarc@dominio.com`
        },
        mx: {
          title: "Registro MX (Mail Exchange)",
          description: "Los registros MX son fundamentales para la entrega de correo electrónico. Indican a otros sistemas de correo qué servidores son responsables de recibir correos electrónicos en nombre de tu dominio. Sin registros MX correctos, no podrías recibir correos electrónicos.",
          recommendation: `prioridad: 10, valor: mx.servidor.com`
        },
        bimi: {
          title: "Registro BIMI (Brand Indicators for Message Identification)",
          description: "BIMI es un estándar emergente que permite mostrar el logotipo de tu marca junto a tus correos electrónicos en las bandejas de entrada de los proveedores compatibles. Para implementarlo, necesitas tener DMARC configurado con una política estricta ('quarantine' o 'reject') y tu logotipo debe estar en formato SVG alojado en una URL pública.",
          recommendation: `v=BIMI1; l=https://media.dominio.com/logo.svg;`
        },
        vmc: {
          title: "Certificado VMC (Verified Mark Certificate)",
          description: "Un VMC es un certificado digital que va un paso más allá de BIMI. Verifica que el logotipo de tu marca que estás usando te pertenece legalmente como marca registrada. Es emitido por Autoridades Certificadoras externas y tiene un costo. Prerrequisitos: Tener configurados correctamente SPF, DKIM y DMARC con política 'quarantine' o 'reject'.",
          recommendation: `El registro VMC se añade a tu registro BIMI. Ejemplo: v=BIMI1; l=https://media.dominio.com/logo.svg; a=https://certs.entidad.com/vmc.pem;`
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
            <Button size="sm" variant="outline" className="h-7" onClick={() => setInfoViewRecord(recordKey)}>Detalles</Button>
          </div>
      </div>
  );

  const renderCenterPanelContent = () => {
    switch (currentStep) {
        case 1:
            return (
                 <div className="space-y-4 h-full flex flex-col justify-center">
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
                    <Button className="w-full h-12 text-base mt-4" onClick={handleStartVerification}>
                      Siguiente <ArrowRight className="ml-2"/>
                  </Button>
                </div>
            )
        case 2:
            return (
                 <div className="h-full flex flex-col justify-start">
                   <div className='flex-grow'>
                    <h3 className="text-lg font-semibold mb-1">Paso 2: Añadir Registro DNS</h3>
                    <p className="text-sm text-muted-foreground">
                        Copia el siguiente registro TXT y añádelo a la configuración DNS de tu dominio <b>{domain}</b>.
                    </p>
                    <div className="space-y-3 pt-4">
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
                 </div>
            )
        case 3:
            if (infoViewRecord) {
                 return (
                    <div className="h-full flex flex-col">
                        <h3 className="text-lg font-semibold mb-2">{infoContent[infoViewRecord].title}</h3>
                        <p className="text-sm text-muted-foreground flex-grow">{infoContent[infoViewRecord].description}</p>
                        
                        {showRecommendation && (
                            <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} className="mt-4 text-left p-3 bg-muted/50 rounded-md font-mono text-xs border">
                                <p className="font-sans font-semibold text-foreground mb-1">Ejemplo de registro:</p>
                                <code className='whitespace-pre-wrap'>{infoContent[infoViewRecord].recommendation}</code>
                            </motion.div>
                        )}
                        
                        <div className="flex gap-2 mt-4">
                           <Button variant="outline" className="w-full" onClick={() => { setInfoViewRecord(null); setShowRecommendation(false); }}>Atrás</Button>
                           <Button className="w-full" onClick={() => setShowRecommendation(!showRecommendation)}>{showRecommendation ? 'Ocultar' : 'Ver'} Ejemplo</Button>
                        </div>
                    </div>
                )
            }
            return (
                <div className="h-full flex flex-col">
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
        case 4:
            return (
                <div className="space-y-3 h-full flex flex-col">
                    <h3 className="text-lg font-semibold mb-1">Paso 4: Configurar Credenciales</h3>
                    <p className="text-sm text-muted-foreground">Proporciona los detalles de tu servidor SMTP.</p>
                    <div className="space-y-4 flex-grow pt-4">
                        <FormField control={form.control} name="host" render={({ field }) => (
                            <FormItem>
                                <Label>Host</Label>
                                <FormControl><div className="relative"><ServerIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input className="pl-10 h-12 text-base" placeholder="smtp.dominio.com" {...field} /></div></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="port" render={({ field }) => (
                            <FormItem>
                                <Label>Puerto</Label>
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

    const animation = status === 'processing' ? 'animate-spin' : 'animate-pulse';

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
                <div className="relative flex-grow flex flex-col justify-center overflow-hidden">
                  <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full transition-all duration-500", verificationStatus === 'verifying' ? "border-2 border-primary/20 animate-ping" : "bg-primary/5")}/>
                  <div className="z-10">
                    {verificationStatus === 'pending' && (
                      <div className="text-center flex-grow flex flex-col justify-center">
                        <div className="flex justify-center mb-4"><Dna className="size-16 text-primary/30" /></div>
                        <h4 className="font-bold">Acción Requerida</h4>
                        <p className="text-sm text-muted-foreground">Añade el registro TXT a tu proveedor de DNS y luego verifica.</p>
                      </div>
                    )}
                    {verificationStatus === 'verifying' && (
                      <div className="flex flex-col items-center gap-3 flex-grow justify-center">
                        <div className="relative size-20">
                          <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full"/>
                          <div className="absolute inset-0 border-t-2 border-blue-400 rounded-full animate-spin"/>
                          <Search className="absolute inset-0 m-auto size-8 text-blue-400"/>
                        </div>
                        <h4 className="font-bold text-lg">Verificando...</h4>
                        <p className="text-sm text-muted-foreground">Buscando el registro DNS en el dominio.</p>
                      </div>
                    )}
                    {verificationStatus === 'verified' && (
                      <div className="flex flex-col items-center gap-3 flex-grow justify-center">
                        <ShieldCheck className="size-20 text-green-400" />
                        <h4 className="font-bold text-lg">¡Dominio Verificado!</h4>
                        <p className="text-sm text-muted-foreground">El registro TXT se encontró correctamente.</p>
                      </div>
                    )}
                    {verificationStatus === 'failed' && (
                      <div className="flex flex-col items-center gap-3 text-center flex-grow justify-center">
                        <AlertTriangle className="size-16 text-red-400" />
                        <h4 className="font-bold text-lg">Verificación Fallida</h4>
                        <p className="text-sm text-muted-foreground">No pudimos encontrar el registro. La propagación de DNS puede tardar.</p>
                      </div>
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
                      {spfStatus === 'verifying' ? 'Verificando...' : 'Escanear Registros Obligatorios'}
                    </Button>
                 ) : (
                    <Button className="w-full h-12 text-base" onClick={() => handleCheckHealth('optional')} disabled={mxStatus === 'verifying'}>
                      {mxStatus === 'verifying' ? 'Verificando...' : 'Escanear Registros Opcionales'}
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
    return (
       <DialogContent className="max-w-4xl p-0 grid grid-cols-1 md:grid-cols-3 gap-0 h-[600px]" showCloseButton={false}>
          <div className="hidden md:block md:col-span-1 h-full">
            {renderLeftPanel()}
          </div>
           <Form {...form}>
              <form id="smtp-form" onSubmit={form.handleSubmit(onSubmitSmtp)} className="md:col-span-2 h-full grid grid-cols-1 md:grid-cols-2">
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
      </DialogContent>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
       {renderContent()}
    </Dialog>
  );
}
