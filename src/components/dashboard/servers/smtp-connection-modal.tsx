
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, ArrowRight, Copy, Check, ShieldCheck, Search, AlertTriangle, KeyRound, Server as ServerIcon, AtSign, Mail, TestTube2, CheckCircle, Dna, DatabaseZap, Workflow, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { verifyDnsAction } from '@/app/dashboard/servers/actions';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface SmtpConnectionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type VerificationStatus = 'idle' | 'pending' | 'verifying' | 'verified' | 'failed';
type DkimStatus = 'idle' | 'verifying' | 'verified' | 'failed';
type SpfStatus = 'idle' | 'verifying' | 'verified' | 'failed';
type TestStatus = 'idle' | 'testing' | 'success' | 'failed';

const generateVerificationCode = () => `demo_${Math.random().toString(36).substring(2, 10)}`;

export function SmtpConnectionModal({ isOpen, onOpenChange }: SmtpConnectionModalProps) {
  const { toast } = useToast();
  const [domain, setDomain] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [dkimStatus, setDkimStatus] = useState<DkimStatus>('idle');
  const [spfStatus, setSpfStatus] = useState<SpfStatus>('idle');
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');

  const smtpFormSchema = z.object({
    host: z.string().min(1, "El host es requerido."),
    port: z.coerce.number().min(1, "El puerto es requerido."),
    encryption: z.enum(['tls', 'ssl', 'none']),
    username: z.string().email("Debe ser un correo válido."),
    password: z.string().min(1, "La contraseña es requerida."),
    testEmail: z.string().email("El correo de prueba debe ser válido.")
  }).refine(data => data.username.endsWith(`@${domain}`), {
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

  const txtRecordName = `_foxmiu-verification`;
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
    await new Promise(resolve => setTimeout(resolve, 2000));
    setDkimStatus('verified');
    setSpfStatus('failed');
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
        setTestStatus('idle');
        form.reset();
    }, 300);
  }
  
  async function onSubmitSmtp(values: z.infer<typeof smtpFormSchema>) {
    setTestStatus('testing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (values.password.toLowerCase() !== 'fail') {
      setTestStatus('success');
      toast({
        title: "¡Conexión Exitosa!",
        description: `Se ha enviado un correo de prueba a ${values.testEmail}.`,
        className: 'bg-green-500 text-white border-none'
      })
    } else {
       setTestStatus('failed');
       toast({
        title: "Fallo en la Conexión",
        description: "No se pudo autenticar con el servidor SMTP. Revisa tus credenciales.",
        variant: 'destructive'
      });
    }
  }

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
                    <h3 className="text-lg font-semibold">Paso 1: Introduce tu Dominio</h3>
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
                    <div className="flex-grow" />
                    <Button className="w-full h-12 text-base mt-auto" onClick={handleStartVerification}>
                      Verificar Dominio <ArrowRight className="ml-2"/>
                    </Button>
                </div>
            )
        case 2:
            return (
                 <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Paso 2: Añadir Registro DNS</h3>
                    <p className="text-sm text-muted-foreground">
                        Copia el siguiente registro TXT y añádelo a la configuración DNS de tu dominio <b>{domain}</b>.
                    </p>

                    <div className="space-y-3">
                        <div className="p-3 bg-muted/50 rounded-md text-sm font-mono border">
                            <Label className="text-xs font-sans text-muted-foreground">REGISTRO</Label>
                            <p className="flex justify-between items-center">{txtRecordName} <Copy className="size-4 cursor-pointer" onClick={() => handleCopy(txtRecordName)}/></p>
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
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Paso 3: Salud del Dominio</h3>
                    <p className="text-sm text-muted-foreground">Verificaremos registros SPF y DKIM para asegurar una alta entregabilidad. Si fallan, te daremos los valores a configurar.</p>
                </div>
            )
        case 4:
            return (
                <div className="space-y-4">
                     <h3 className="text-lg font-semibold">Paso 4: Configurar Credenciales</h3>
                     <p className="text-sm text-muted-foreground">Proporciona los detalles de tu servidor SMTP.</p>
                    <Form {...form}>
                        <form id="smtp-form" onSubmit={form.handleSubmit(onSubmitSmtp)} className="space-y-3">
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
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="tls" id="tls" /></FormControl><Label htmlFor="tls">TLS</Label></FormItem>
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="ssl" id="ssl" /></FormControl><Label htmlFor="ssl">SSL</Label></FormItem>
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="none" id="none" /></FormControl><Label htmlFor="none">Ninguno</Label></FormItem>
                                </RadioGroup>
                                </FormControl><FormMessage /></FormItem>
                            )}/>
                           <FormField control={form.control} name="username" render={({ field }) => (
                                <FormItem><Label>Usuario (Email)</Label><FormControl><div className="relative"><AtSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input className="pl-10" placeholder={`usuario@${domain}`} {...field} /></div></FormControl><FormMessage /></FormItem>
                           )}/>
                           <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem><Label>Contraseña</Label><FormControl><div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input className="pl-10" type="password" placeholder="••••••••" {...field} /></div></FormControl><FormMessage /></FormItem>
                           )}/>
                        </form>
                    </Form>
                </div>
            )
        default: return null;
    }
  }

  const renderRightPanelContent = () => {
    return (
        <div className="relative p-6 border-l h-full flex flex-col justify-between items-center text-center bg-muted/20">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50"/>
             <div className="w-full">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-4"><div className="size-2 rounded-full bg-green-400 animate-pulse"/>Estado del Proceso</div>
                
                <AnimatePresence mode="wait">
                {currentStep === 1 && (
                    <motion.div key="step1-info" {...cardAnimation} className="text-center">
                         <div className="flex justify-center mb-4"><Globe className="size-16 text-primary/30" /></div>
                        <h4 className="font-bold">Empecemos</h4>
                        <p className="text-sm text-muted-foreground">Introduce tu dominio para comenzar la verificación.</p>
                    </motion.div>
                )}
                {currentStep === 2 && verificationStatus === 'pending' && (
                    <motion.div key="pending-check" {...cardAnimation} className="text-center">
                        <div className="flex justify-center mb-4"><Dna className="size-16 text-primary/30" /></div>
                        <h4 className="font-bold">Acción Requerida</h4>
                        <p className="text-sm text-muted-foreground">Añade el registro TXT a tu proveedor de DNS y luego verifica.</p>
                         <Button className="w-full h-12 text-base mt-4" onClick={handleCheckVerification}>
                            Verificar ahora
                        </Button>
                    </motion.div>
                )}
                {currentStep === 2 && verificationStatus === 'verifying' && (
                    <motion.div key="verifying" {...cardAnimation} className="flex flex-col items-center gap-3">
                        <div className="relative size-20">
                            <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full"/>
                            <div className="absolute inset-0 border-t-2 border-blue-400 rounded-full animate-spin"/>
                            <Search className="absolute inset-0 m-auto size-8 text-blue-400"/>
                        </div>
                        <h4 className="font-bold text-lg">Verificando...</h4>
                        <p className="text-sm text-muted-foreground">Buscando el registro DNS en el dominio.</p>
                    </motion.div>
                )}
                {currentStep === 2 && verificationStatus === 'verified' && (
                    <motion.div key="verified" {...cardAnimation} className="flex flex-col items-center gap-3">
                        <ShieldCheck className="size-20 text-green-400" />
                        <h4 className="font-bold text-lg">¡Dominio Verificado!</h4>
                        <p className="text-sm text-muted-foreground">El registro TXT se encontró correctamente.</p>
                         <Button className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white h-12 text-base" onClick={() => setCurrentStep(3)}>
                            Continuar <ArrowRight className="ml-2"/>
                        </Button>
                    </motion.div>
                )}
                {currentStep === 2 && verificationStatus === 'failed' && (
                    <motion.div key="failed" {...cardAnimation} className="flex flex-col items-center gap-3">
                        <AlertTriangle className="size-20 text-red-400" />
                        <h4 className="font-bold text-lg">Verificación Fallida</h4>
                        <p className="text-sm text-muted-foreground">No pudimos encontrar el registro. La propagación de DNS puede tardar.</p>
                         <Button variant="outline" className="w-full mt-2 h-12 text-base" onClick={handleCheckVerification}>
                            Reintentar Verificación
                        </Button>
                    </motion.div>
                )}
                {currentStep === 3 && (
                     <motion.div key="step3-health" {...cardAnimation} className="text-center w-full">
                         <Button className="w-full h-12 text-base mt-4" onClick={handleCheckHealth} disabled={dkimStatus === 'verifying'}>
                             {dkimStatus === 'verifying' ? 'Verificando...' : 'Comprobar Salud del Dominio'}
                         </Button>
                         {(dkimStatus !== 'idle' || spfStatus !== 'idle') && (
                             <div className="space-y-2 mt-4 text-left">
                                <div className="flex items-center justify-between p-2 rounded-md bg-muted/40">
                                    <span className="font-semibold">DKIM</span>
                                    {dkimStatus === 'verifying' && <Loader2 className="animate-spin text-primary" />}
                                    {dkimStatus === 'verified' && <CheckCircle className="text-green-500"/>}
                                    {dkimStatus === 'failed' && <AlertTriangle className="text-red-500"/>}
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-md bg-muted/40">
                                    <span className="font-semibold">SPF</span>
                                     {spfStatus === 'verifying' && <Loader2 className="animate-spin text-primary" />}
                                    {spfStatus === 'verified' && <CheckCircle className="text-green-500"/>}
                                    {spfStatus === 'failed' && <AlertTriangle className="text-red-500"/>}
                                </div>
                             </div>
                         )}
                         {(dkimStatus === 'verified' && spfStatus === 'failed') && (
                             <div className="mt-4">
                                <p className="text-sm text-red-500 mb-2">Se requiere acción para el registro SPF.</p>
                                <Button className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white h-12 text-base" onClick={() => setCurrentStep(4)}>
                                    Continuar de todos modos <ArrowRight className="ml-2"/>
                                </Button>
                             </div>
                         )}
                         {(dkimStatus === 'verified' && spfStatus === 'verified') && (
                              <Button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white h-12 text-base" onClick={() => setCurrentStep(4)}>
                                Continuar <ArrowRight className="ml-2"/>
                              </Button>
                         )}
                     </motion.div>
                )}

                {currentStep === 4 && (
                     <motion.div key="step4-actions" {...cardAnimation} className="w-full space-y-4">
                        <div className="p-4 border rounded-lg bg-muted/30">
                            <p className="text-sm font-semibold mb-2">Verifica tu conexión</p>
                            <p className="text-xs text-muted-foreground mb-3">Enviaremos un correo de prueba para asegurar que todo esté configurado correctamente.</p>
                            <FormField control={form.control} name="testEmail" render={({ field }) => (
                                <FormItem>
                                    <Label className="text-left">Enviar correo de prueba a:</Label>
                                    <FormControl><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input className="pl-10" placeholder="receptor@ejemplo.com" {...field} /></div></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        
                        {testStatus !== 'success' && (
                            <Button type="submit" form="smtp-form" className="w-full h-12 text-base" disabled={testStatus === 'testing'}>
                                {testStatus === 'testing' ? <><TestTube2 className="mr-2 animate-pulse"/> Probando Conexión...</> : <><TestTube2 className="mr-2"/> Probar Conexión</>}
                            </Button>
                        )}
                        
                        <AnimatePresence mode="wait">
                            {testStatus === 'success' && (
                                <motion.div key="success-smtp" {...cardAnimation} className="flex flex-col gap-3">
                                    <div className="p-4 bg-green-500/10 text-green-400 rounded-lg flex items-center justify-center gap-3 text-center">
                                        <CheckCircle className="size-8"/>
                                        <div>
                                            <h4 className="font-bold">Conexión Exitosa</h4>
                                            <p className="text-xs">El correo de prueba fue enviado. Revisa la bandeja de entrada.</p>
                                        </div>
                                    </div>
                                    <Button className="w-full bg-gradient-to-r from-primary to-accent/80 hover:opacity-90 transition-opacity h-12 text-base" onClick={handleClose}>
                                        Finalizar y Guardar
                                    </Button>
                                </motion.div>
                            )}
                            {testStatus === 'failed' && (
                                <motion.div key="failed-smtp" {...cardAnimation} className="p-4 bg-red-500/10 text-red-400 rounded-lg flex items-center gap-3 text-center">
                                    <AlertTriangle className="size-8"/>
                                    <div>
                                        <h4 className="font-bold">Fallo en la Prueba</h4>
                                        <p className="text-xs">No se pudo enviar el correo de prueba. Verifica tus credenciales e inténtalo de nuevo.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                     </motion.div>
                )}
                </AnimatePresence>
             </div>
             <div className="w-full">
                <Button variant="outline" className="w-full" onClick={handleClose}>Cancelar</Button>
            </div>
        </div>
    )
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl p-0 grid grid-cols-1 md:grid-cols-3 gap-0 h-[600px]" showCloseButton={false}>
        <div className="hidden md:block md:col-span-1 h-full">
            {renderLeftPanel()}
        </div>
        <div className="md:col-span-1 p-8 flex flex-col justify-center h-full">
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
        <div className="md:col-span-1 h-full">
             {renderRightPanelContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
