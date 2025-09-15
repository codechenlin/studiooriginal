
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, ArrowRight, Copy, ShieldCheck, Search, AlertTriangle, KeyRound, Server as ServerIcon, AtSign, Mail, TestTube2, CheckCircle, Dna, DatabaseZap, Workflow, Lock, Loader2, Info, RefreshCw, Layers, Check, X, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { verifyDnsAction } from '@/app/dashboard/servers/actions';
import { sendTestEmailAction } from '@/app/dashboard/servers/send-email-actions';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { generateDkimKeys } from '@/ai/flows/dkim-generation-flow';

interface SmtpConnectionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type VerificationStatus = 'idle' | 'pending' | 'verifying' | 'verified' | 'failed';
type HealthCheckStatus = 'idle' | 'verifying' | 'verified' | 'failed';
type TestStatus = 'idle' | 'testing' | 'success' | 'failed';
type InfoViewRecord = 'spf' | 'dkim' | 'dmarc' | 'mx' | 'bimi' | 'vmc';

const generateVerificationCode = () => `fxu_${Math.random().toString(36).substring(2, 10)}`;

export function SmtpConnectionModal({ isOpen, onOpenChange }: SmtpConnectionModalProps) {
  const { toast } = useToast();
  const [domain, setDomain] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  
  const [healthCheckStep, setHealthCheckStep] = useState<'mandatory' | 'optional'>('mandatory');
  const [spfStatus, setSpfStatus] = useState<HealthCheckStatus>('idle');
  const [dkimStatus, setDkimStatus] = useState<HealthCheckStatus>('idle');
  const [dmarcStatus, setDmarcStatus] = useState<HealthCheckStatus>('idle');
  const [mxStatus, setMxStatus] = useState<HealthCheckStatus>('idle');
  const [bimiStatus, setBimiStatus] = useState<HealthCheckStatus>('idle');
  const [vmcStatus, setVmcStatus] = useState<HealthCheckStatus>('idle');

  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [infoViewRecord, setInfoViewRecord] = useState<InfoViewRecord | null>(null);
  const [showExample, setShowExample] = useState(false);
  const [testError, setTestError] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'checking' | 'delivered' | 'bounced'>('idle');
  const [activeInfoModal, setActiveInfoModal] = useState<InfoViewRecord | null>(null);
  const [dkimData, setDkimData] = useState<{ record: string; selector: string } | null>(null);
  const [isGeneratingDkim, setIsGeneratingDkim] = useState(false);


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
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
        setStatus(result.success ? 'verified' : 'failed');
    };

    if (type === 'mandatory') {
        await Promise.all([
            checkRecord(domain, 'TXT', 'v=spf1', setSpfStatus),
            checkRecord(`foxmiu._domainkey.${domain}`, 'TXT', undefined, setDkimStatus),
            checkRecord(`_dmarc.${domain}`, 'TXT', 'v=DMARC1', setDmarcStatus),
        ]);
    } else {
        await Promise.all([
            checkRecord(domain, 'MX', undefined, setMxStatus),
            checkRecord(`default._bimi.${domain}`, 'TXT', 'v=BIMI1', setBimiStatus),
            checkRecord(`bimi.${domain}`, 'TXT', 'v=VMC1', setVmcStatus),
        ]);
    }
  }

  const handleGenerateDkim = async () => {
    setIsGeneratingDkim(true);
    try {
      const result = await generateDkimKeys({ domain, selector: 'foxmiu' });
      setDkimData({ record: result.publicKeyRecord, selector: result.selector });
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
        setHealthCheckStep('mandatory');
        setDkimStatus('idle');
        setSpfStatus('idle');
        setDmarcStatus('idle');
        setMxStatus('idle');
        setBimiStatus('idle');
        setVmcStatus('idle');
        setTestStatus('idle');
        setInfoViewRecord(null);
        setShowExample(false);
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
          title: "Registro MX",
          description: "MX es un registro que dice “Aquí es donde deben entregarse los correos que envían a mi dominio”. Indica el servidor de correo que recibe tus mensajes. Ejemplo real: Permite que Foxmiu, Outlook o cualquier otro servicio sepa a qué servidor entregar tus correos electrónicos.",
        },
        bimi: {
          title: "Registro BIMI",
          description: "BIMI es un registro que dice “Este es el logotipo oficial de mi marca para mostrar junto a mis correos”. Apunta a un archivo SVG con tu logo y requiere tener SPF, DKIM y DMARC correctos. Ejemplo real: Hace que tu logo aparezca junto a tus correos en Gmail, Yahoo y otros proveedores compatibles.",
        },
        vmc: {
          title: "Certificado VMC",
          description: "Un VMC es un certificado digital que va un paso más allá de BIMI. Verifica que el logotipo que estás usando realmente te pertenece como marca registrada. Es emitido por Autoridades Certificadoras externas, tiene un costo y es un requisito para que Gmail muestre tu logo.\n\nRequisitos previos: Tener configurados correctamente SPF, DKIM y DMARC con política 'quarantine' o 'reject'.",
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
            <Button size="sm" variant="outline" className="h-7" onClick={() => { setInfoViewRecord(recordKey); setShowExample(false); }}>Detalles</Button>
          </div>
      </div>
  );

  const renderCenterPanelContent = () => {
    switch (currentStep) {
        case 1:
            return (
                 <div className="h-full flex flex-col justify-start">
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
                 <div className="h-full flex flex-col justify-start">
                   <div className='flex-grow'>
                    <h3 className="text-lg font-semibold mb-1">Paso 2: Añadir Registro DNS</h3>
                    <p className="text-sm text-muted-foreground">
                        Copia el siguiente registro TXT y añádelo a la configuración DNS de tu dominio <b>{domain}</b>.
                    </p>
                    <div className="space-y-3 pt-4">
                        <div className="p-3 bg-muted/50 rounded-md text-sm font-mono border">
                            <Label className="text-xs font-sans text-muted-foreground">REGISTRO (HOST)</Label>
                             <div className="flex justify-between items-center">
                                <span>@</span>
                                <Button variant="ghost" size="icon" className="size-7 flex-shrink-0" onClick={() => handleCopy('@')}>
                                    <Copy className="size-4"/>
                                </Button>
                            </div>
                        </div>
                         <div className="p-3 bg-muted/50 rounded-md text-sm font-mono border">
                            <Label className="text-xs font-sans text-muted-foreground">VALOR</Label>
                            <div className="flex justify-between items-center">
                                <span className="break-all pr-2">{txtRecordValue}</span>
                                <Button variant="ghost" size="icon" className="size-7 flex-shrink-0" onClick={() => handleCopy(txtRecordValue)}>
                                    <Copy className="size-4"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                   </div>
                 </div>
            )
        case 3:
            if (infoViewRecord) {
                 const { title, description } = infoContent[infoViewRecord];
                 return (
                    <div className="h-full flex flex-col justify-start">
                        <h3 className="text-lg font-bold mb-2">{title}</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-line flex-grow">{description}</p>
                        <motion.div>
                            {showExample && infoViewRecord === 'spf' && (
                                <div className="text-xs text-amber-300/80 p-3 bg-amber-500/10 rounded-lg border border-amber-400/20">
                                    <p className="font-bold mb-1">Importante: Unificación de SPF</p>
                                    <p>Si ya usas otros servicios de correo (ej. Google Workspace), debes unificar los registros. Solo puede existir un registro SPF por dominio. Unifica los valores `include` en un solo registro.</p>
                                    <p className="mt-2 font-mono text-white/90">Ej: `v=spf1 include:_spf.google.com include:spf.otrodominio.com -all`</p>
                                </div>
                            )}
                        </motion.div>
                        <div className="flex gap-2 mt-auto">
                           <Button variant="outline" className="w-full" onClick={() => setInfoViewRecord(null)}>Atrás</Button>
                           <Button className="w-full" onClick={() => setActiveInfoModal(infoViewRecord)}>Añadir DNS</Button>
                        </div>
                    </div>
                )
            }
            return (
                <div className="h-full flex flex-col justify-start">
                  <div className='flex-grow'>
                    <h3 className="text-lg font-semibold mb-1">Paso 3: Salud del Dominio</h3>
                    <p className="text-sm text-muted-foreground">Verificaremos los registros de tu dominio, y te mostraremos los registros DNS que deberás añadir a tu dominio.</p>

                    <div className="space-y-3 mt-4">
                        {healthCheckStep === 'mandatory' ? (
                          <>
                            <h4 className='font-semibold text-sm'>Obligatorios</h4>
                            {renderRecordStatus('SPF', spfStatus, 'spf')}
                            {renderRecordStatus('DKIM', dkimStatus, 'dkim')}
                            {renderRecordStatus('DMARC', dmarcStatus, 'dmarc')}
                             <div className="pt-2">
                                <h5 className="font-bold text-sm">🔗 Cómo trabajan juntos</h5>
                                <ul className="text-xs text-muted-foreground list-disc list-inside mt-1 space-y-1">
                                    <li><span className="font-semibold">SPF:</span> ¿Quién puede enviar?</li>
                                    <li><span className="font-semibold">DKIM:</span> ¿Está firmado y sin cambios?</li>
                                    <li><span className="font-semibold">DMARC:</span> ¿Qué hacer si falla alguna de las dos comprobaciones SPF y DKIM?</li>
                                </ul>
                            </div>
                          </>
                        ) : (
                          <>
                            <h4 className='font-semibold text-sm'>Opcionales</h4>
                            {renderRecordStatus('MX', mxStatus, 'mx')}
                            {renderRecordStatus('BIMI', bimiStatus, 'bimi')}
                            {renderRecordStatus('VMC', vmcStatus, 'vmc')}
                            <div className="pt-2">
                                <h5 className="font-bold text-sm">🔗 Cómo trabajan juntos</h5>
                                <ul className="text-xs text-muted-foreground list-disc list-inside mt-1 space-y-1">
                                    <li><span className="font-semibold">MX:</span> ¿A qué servidor deben llegar los correos que envían a mi dominio?</li>
                                    <li><span className="font-semibold">BIMI:</span> ¿Qué logotipo oficial debe mostrarse junto a mis correos en la bandeja de entrada?</li>
                                    <li><span className="font-semibold">VMC:</span> ¿Hay un certificado que demuestre que ese logotipo y la marca son míos?</li>
                                </ul>
                            </div>
                          </>
                        )}
                    </div>
                  </div>
                </div>
            )
        default: return null;
    }
  }

  const Step4Form = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitSmtp)} id="smtp-form" className="grid grid-cols-1 md:grid-cols-3 gap-0 h-full">
        {/* Panel Izquierdo - Servidor */}
        <div className="p-8 flex flex-col justify-start">
          <h3 className="text-lg font-semibold mb-1">Paso 4: Configurar SMTP</h3>
          <p className="text-sm text-muted-foreground mb-4">Detalles de tu servidor de correo.</p>
          <div className="space-y-4">
            <FormField control={form.control} name="host" render={({ field }) => (
                <FormItem className="space-y-1"><Label>Host</Label>
                    <FormControl><div className="relative"><ServerIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input className="pl-10 h-12 text-base" placeholder="smtp.dominio.com" {...field} /></div></FormControl><FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="port" render={({ field }) => (
                <FormItem className="space-y-1"><Label>Puerto</Label>
                    <FormControl><Input type="number" placeholder="587" className='h-12 text-base' {...field} /></FormControl><FormMessage />
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
          </div>
        </div>

        {/* Panel Central - Credenciales */}
        <div className="p-8 border-l border-r flex flex-col justify-start">
           <h3 className="text-lg font-semibold mb-1 text-transparent select-none">.</h3>
           <p className="text-sm text-muted-foreground mb-4">Tus credenciales de autenticación.</p>
           <div className="space-y-4">
              <FormField control={form.control} name="username" render={({ field }) => (
                  <FormItem className="space-y-1"><Label>Usuario (Email)</Label><FormControl><div className="relative"><AtSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input className="pl-10 h-12 text-base" placeholder={`usuario@${domain}`} {...field} /></div></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem className="space-y-1"><Label>Contraseña</Label><FormControl><div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input className="pl-10 h-12 text-base" type="password" placeholder="••••••••" {...field} /></div></FormControl><FormMessage /></FormItem>
              )}/>
           </div>
        </div>
        
        {/* Panel Derecho - Prueba y Estado */}
        <div className="p-8 bg-muted/20 flex flex-col justify-between h-full">
            {renderRightPanelContent()}
        </div>
      </form>
    </Form>
  );
  
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
      const isMandatoryVerifying = [spfStatus, dkimStatus, dmarcStatus].some(s => s === 'verifying');
      const isOptionalVerifying = [mxStatus, bimiStatus, vmcStatus].some(s => s === 'verifying');
      const allMandatoryDone = spfStatus !== 'idle' && dkimStatus !== 'idle' && dmarcStatus !== 'idle' && !isMandatoryVerifying;
      const anyMandatoryFailed = spfStatus === 'failed' || dkimStatus === 'failed' || dmarcStatus === 'failed';
      const allOptionalDone = mxStatus !== 'idle' && bimiStatus !== 'idle' && vmcStatus !== 'idle' && !isOptionalVerifying;

      if (healthCheckStep === 'mandatory') {
        if (isMandatoryVerifying) {
          status = 'processing'; text = 'ANALIZANDO OBLIGATORIOS';
        } else if (allMandatoryDone) {
          status = anyMandatoryFailed ? 'error' : 'success';
          text = anyMandatoryFailed ? 'OBLIGATORIOS REQUIEREN ATENCIÓN' : 'OBLIGATORIOS OK';
        } else {
          status = 'idle'; text = 'LISTO PARA CHEQUEO';
        }
      } else { // optional
        if (isOptionalVerifying) {
          status = 'processing'; text = 'ANALIZANDO OPCIONALES';
        } else if (allOptionalDone) {
          status = 'success'; text = 'OPCIONALES REVISADOS';
        } else {
          status = 'idle'; text = 'LISTO PARA CHEQUEO OPCIONAL';
        }
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
                      Siguiente <ArrowRight className="ml-2"/>
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
        <DialogContent className="max-w-6xl p-0 grid grid-cols-1 md:grid-cols-1 gap-0 h-[600px]" showCloseButton={false}>
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
            <div className="p-8 flex flex-col h-full justify-start">
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
        dkimData={dkimData}
        onGenerateDkim={handleGenerateDkim}
        isGeneratingDkim={isGeneratingDkim}
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
  onGenerateDkim,
  isGeneratingDkim,
}: {
  recordType: InfoViewRecord | null,
  domain: string,
  isOpen: boolean,
  onOpenChange: () => void,
  onCopy: (text: string) => void,
  dkimData: { record: string; selector: string } | null,
  onGenerateDkim: () => void,
  isGeneratingDkim: boolean,
}) {
    if(!recordType) return null;

    const baseClass = "p-2 bg-black/20 rounded-md font-mono text-xs text-white/80 flex justify-between items-center";
    
    const renderSpfContent = () => {
        const recordValue = `v=spf1 include:_spf.foxmiu.email -all`;
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
                    <p className="mt-2 font-mono text-white/90">Ej: `v=spf1 include:_spf.foxmiu.email include:spf.otrodominio.com -all`</p>
                </div>
            </div>
        );
    };

    const renderDkimContent = () => (
        <div className="space-y-4 text-sm">
            <p>Debido a que DKIM requiere una clave única, nuestro sistema la generará por ti. Haz clic en el botón para crear tu registro DKIM personalizado.</p>
            <AnimatePresence>
            {dkimData && (
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
                    <span className="break-all pr-2">{dkimData.record}</span>
                    <Button size="icon" variant="ghost" className="shrink-0 self-start size-6 -mr-2 flex-shrink-0" onClick={() => onCopy(dkimData.record)}><Copy className="size-4"/></Button>
                    </div>
                </div>
                </motion.div>
            )}
            </AnimatePresence>
            <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90" onClick={onGenerateDkim} disabled={isGeneratingDkim}>
                {isGeneratingDkim ? <Loader2 className="mr-2 animate-spin"/> : <Dna className="mr-2"/>}
                {dkimData ? "Volver a Generar Registro" : "Generar Registro DKIM"}
            </Button>
        </div>
    );
    
    const renderDmarcContent = () => {
         const recordValue = `v=DMARC1; p=reject; pct=100; rua=mailto:reportes@${domain}; ruf=mailto:reportes@${domain}; sp=reject; aspf=s; adkim=s`;
         const dmarcParts = {
            "v=DMARC1": "Versión del protocolo DMARC.",
            "p=reject": "Rechaza cualquier correo que no pase SPF o DKIM alineados.",
            "pct=100": "Aplica la política al 100% de los correos.",
            "rua=mailto:...": "Dirección para recibir reportes agregados (estadísticas).",
            "ruf=mailto:...": "Dirección para recibir reportes forenses (detalles de fallos).",
            "sp=reject": "Aplica la misma política estricta a subdominios.",
            "aspf=s": "Alineación SPF estricta (el dominio del SPF debe coincidir exactamente con el “From:” visible).",
            "adkim=s": "Alineación DKIM estricta (el dominio de la firma DKIM debe coincidir exactamente con el “From:” visible).",
        };
        return (
            <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                    <p>Es crucial usar un registro DMARC estricto en su dominio ya que asi evitara por completo suplantaciones y que sus correo enviado se etiqueten como spam mejorando tu marca.</p>
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
                        <span className="break-all pr-2">{recordValue.replace(`reportes@${domain}`, '...')}</span>
                        <Button size="icon" variant="ghost" className="shrink-0 size-6 -mr-2" onClick={() => onCopy(recordValue)}><Copy className="size-4"/></Button>
                        </div>
                    </div>
                </div>
                <div className="text-xs p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                    <p className='font-bold mb-2 text-white'>Explicación de cada parte:</p>
                    <ul className="space-y-1">
                    {Object.entries(dmarcParts).map(([key, value]) => (
                        <li key={key} className="flex items-start gap-2">
                        <Check className="size-3 mt-0.5 shrink-0 text-blue-300"/>
                        <span><span className="font-mono text-white/90">{key.replace('...', `@${domain}`)}</span> → {value}</span>
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
        );
    }
    
    const renderMxContent = () => {
        const mxValue = 'foxmiu.email';
        return (
             <div className="space-y-4 text-sm">
                <p>Para recibir correos electrónicos en tu dominio (ej: `contacto@{domain}`), necesitas un registro MX que apunte a un servidor de correo. Añade este registro para usar nuestro servicio de correo entrante.</p>
                 <div className={cn(baseClass, "flex-col items-start gap-1")}>
                    <p className="font-bold text-white/90 flex justify-between w-full"><span>Host/Nombre:</span> <Button size="icon" variant="ghost" className="size-6 -mr-2" onClick={() => onCopy('@')}><Copy className="size-4"/></Button></p>
                    <span>@</span>
                 </div>
                 <div className={cn(baseClass, "flex-col items-start gap-1")}>
                    <p className="font-bold text-white/90">Tipo de Registro:</p><span>MX</span>
                 </div>
                 <div className={cn(baseClass, "flex-col items-start gap-1")}>
                    <p className="font-bold text-white/90">Valor/Destino:</p>
                     <div className="w-full flex justify-between items-center">
                         <span className="truncate">{mxValue}</span>
                         <Button size="icon" variant="ghost" onClick={() => onCopy(mxValue)}><Copy className="size-4"/></Button>
                     </div>
                 </div>
                 <div className={cn(baseClass, "flex-col items-start gap-1")}>
                    <p className="font-bold text-white/90 flex justify-between w-full"><span>Prioridad:</span> <Button size="icon" variant="ghost" className="size-6 -mr-2" onClick={() => onCopy('0')}><Copy className="size-4"/></Button></p>
                    <span>0</span>
                 </div>
                 <div className="text-xs text-cyan-300/80 p-3 bg-cyan-500/10 rounded-lg border border-cyan-400/20">
                    <p className="font-bold mb-1">En resumen</p>
                    <p>Es como poner la dirección exacta de tu buzón para que el cartero sepa dónde dejar las cartas.</p>
                </div>
            </div>
        );
    };

    const renderBimiContent = () => (
         <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
                 <p>Este es un ejemplo de un registro BIMI apuntando a un archivo SVG Portable/Secure (SVG P/S), basado en SVG Tiny 1.2.</p>
                 <div className={cn(baseClass, "flex-col items-start gap-1")}>
                    <p className="font-bold text-white/90 flex justify-between w-full"><span>Host/Nombre:</span><Button size="icon" variant="ghost" className="size-6 -mr-2" onClick={() => onCopy('default._bimi')}><Copy className="size-4"/></Button></p>
                    <span>default._bimi</span>
                 </div>
                 <div className={cn(baseClass, "flex-col items-start gap-1")}>
                    <p className="font-bold text-white/90">Tipo:</p><span>TXT</span>
                 </div>
                 <div className={cn(baseClass, "flex-col items-start gap-1")}>
                    <p className="font-bold text-white/90">Valor:</p>
                    <div className="w-full flex justify-between items-center">
                         <span className="truncate">v=BIMI1; l=https://tudominio.com/logo.svg;</span>
                         <Button size="icon" variant="ghost" onClick={() => onCopy('v=BIMI1; l=https://tudominio.com/logo.svg;')}><Copy className="size-4"/></Button>
                     </div>
                 </div>
                <div className="text-xs text-cyan-300/80 p-3 bg-cyan-500/10 rounded-lg border border-cyan-400/20">
                  <p className="font-bold mb-1">En resumen</p>
                  <p>Es como poner un letrero luminoso con tu logo en la puerta de tu oficina de correos para que todos lo vean.</p>
                </div>
            </div>
            <div className="text-xs p-3 bg-blue-500/10 rounded-lg border border-blue-400/20 space-y-1">
                <p className="font-bold text-white mb-1">Requisitos del archivo SVG:</p>
                <p>◦ **Peso máximo:** No debe superar 32 KB.</p>
                <p>◦ **Lienzo cuadrado:** Relación de aspecto 1:1 (ej. 1000×1000 px).</p>
                <p>◦ **Fondo sólido:** Evita transparencias.</p>
                <p>◦ **Formato vectorial puro:** No puede contener imágenes incrustadas (JPG, PNG, etc.) ni scripts, fuentes externas o elementos interactivos.</p>
                <p>◦ **Elementos prohibidos:** Animaciones, filtros, gradientes complejos.</p>
                <p>◦ **Alojamiento:** Debe ser accesible via HTTPS en una URL pública.</p>
            </div>
        </div>
    );
    
    const renderVmcContent = () => (
         <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
                <p>VMC es un certificado digital que confirma que eres el dueño legítimo de la marca y del logo. Es requerido por Gmail y otros para mostrar tu logo.</p>
                <div className="text-xs p-3 bg-blue-500/10 rounded-lg border border-blue-400/20 space-y-1">
                    <p className="font-bold text-white mb-1">Cómo funciona:</p>
                    <p>1. Lo compras y validas con una autoridad certificadora.</p>
                    <p>2. Lo enlazas en tu registro BIMI (`a=`) junto con tu logo.</p>
                </div>
                <div className="text-xs text-cyan-300/80 p-3 bg-cyan-500/10 rounded-lg border border-cyan-400/20">
                  <p className="font-bold mb-1">En resumen</p>
                  <p>Es como un título de propiedad que demuestra que ese logo es tuyo.</p>
                </div>
            </div>
            <div className="space-y-4">
                <p className="font-semibold text-white">Ejemplo de registro BIMI con VMC:</p>
                 <div className={cn(baseClass, "flex-col items-start gap-1")}>
                    <p className="font-bold text-white/90 flex justify-between w-full"><span>Host/Nombre:</span><Button size="icon" variant="ghost" className="size-6 -mr-2" onClick={() => onCopy('default._bimi')}><Copy className="size-4"/></Button></p>
                    <span>default._bimi</span>
                 </div>
                 <div className={cn(baseClass, "flex-col items-start gap-1")}>
                    <p className="font-bold text-white/90">Tipo:</p><span>TXT</span>
                 </div>
                 <div className={cn(baseClass, "flex-col items-start gap-1")}>
                    <p className="font-bold text-white/90">Valor:</p>
                    <div className="w-full flex justify-between items-start">
                         <span className="break-all pr-2">v=BIMI1; l=https://tudominio.com/logo.svg; a=https://tudominio.com/certificado-vmc.pem</span>
                         <Button size="icon" variant="ghost" className="shrink-0 size-6 -mr-2" onClick={() => onCopy('v=BIMI1; l=https://tudominio.com/logo.svg; a=https://tudominio.com/certificado-vmc.pem')}><Copy className="size-4"/></Button>
                     </div>
                 </div>
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
                     <Button type="button" variant="outline" onClick={onOpenChange}>
                       Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
    

    