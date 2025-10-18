
"use client";

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Flame, Loader2, AlertTriangle, CheckCircle as CheckCircleIcon, Microscope, FileWarning, ShieldCheck, ShieldAlert, UploadCloud, Copy, MailWarning, KeyRound, Shield, Eye, Dna, Bot, Activity, GitBranch, Binary, Heart, Diamond, Star, Gift, Tags, Check, DollarSign, Tag, Mail, ShoppingCart, Users, Users2, ShoppingBag, ShoppingBasket, XCircle, Share2, Package, PackageCheck, UserPlus, UserCog, CreditCard, Receipt, Briefcase, Store, Megaphone, Volume2, ScrollText, GitCommit, LayoutTemplate, Globe, X, ShieldQuestion, ChevronDown, ChevronRight, Server, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { checkSpamAction, validateVmcWithApiAction } from './actions';
import { type SpamCheckerOutput } from '@/ai/flows/spam-checker-flow';
import { scanFileForVirusAction } from './actions';
import { type VirusScanOutput } from '@/ai/flows/virus-scan-types';
import { type VmcApiValidationOutput } from '@/ai/flows/vmc-validator-api-flow';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const spamExamples = [
    "¡¡¡GANA DINERO RÁPIDO!!! Haz clic aquí para obtener tu premio millonario. Oferta por tiempo limitado. No te lo pierdas.",
    "Felicidades, has sido seleccionado para una oferta exclusiva. Compra ahora y obtén un 90% de descuento. ¡Actúa ya!",
    "Este no es un correo no deseado. Te contactamos para ofrecerte una increíble oportunidad de inversión con retornos garantizados."
];

const eicarTestString = "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";

const StatusBadge = ({ status, text, trueText, falseText }: { status: boolean | null | undefined; text: string, trueText?: string, falseText?: string }) => {
    let statusClass, Icon, displayText;
    if (status === true) {
        statusClass = "bg-green-500/10 border-green-500/20 text-green-300";
        Icon = CheckCircleIcon;
        displayText = trueText || "OK";
    } else if (status === false) {
        statusClass = "bg-red-500/10 border-red-500/20 text-red-300";
        Icon = XCircle;
        displayText = falseText || "ERROR";
    } else { // null or undefined
        statusClass = "bg-gray-500/10 border-gray-500/20 text-gray-400";
        Icon = ShieldQuestion;
        displayText = "N/A";
    }

    return (
        <div className="flex items-center gap-4 justify-between p-2 rounded-md text-sm border-2" style={{ borderColor: status === true ? 'rgba(0, 203, 7, 0.2)' : status === false ? 'rgba(240, 0, 0, 0.2)' : 'rgba(100,100,100,0.2)', backgroundColor: status === true ? 'rgba(0,203,7,0.05)' : status === false ? 'rgba(240,0,0,0.05)' : 'rgba(100,100,100,0.05)'}}>
            <span className="font-semibold text-white/80">{text}</span>
            <div className={cn("flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold", statusClass)}>
              <Icon className="size-4" />
              <span>{displayText}</span>
            </div>
        </div>
    );
};


export default function DemoPage() {
    const { toast } = useToast();
    
    // Spam Checker State
    const [spamText, setSpamText] = useState('');
    const [threshold, setThreshold] = useState(5.0);
    const [isSpamChecking, startSpamCheck] = useTransition();
    const [spamResult, setSpamResult] = useState<SpamCheckerOutput | null>(null);
    const [spamError, setSpamError] = useState<string | null>(null);

    // Virus Scanner State
    const [file, setFile] = useState<File | null>(null);
    const [isVirusScanning, startVirusScan] = useTransition();
    const [virusResult, setVirusResult] = useState<VirusScanOutput | null>(null);
    const [virusError, setVirusError] = useState<string | null>(null);

    // VMC Verifier State
    const [vmcDomain, setVmcDomain] = useState('google.com');
    const [isVmcVerifying, startVmcVerification] = useTransition();
    const [vmcResult, setVmcResult] = useState<VmcApiValidationOutput | null>(null);
    const [vmcError, setVmcError] = useState<string | null>(null);

    const handleSpamCheck = () => {
        if (!spamText) {
            toast({ title: 'Campo vacío', description: 'Por favor, introduce texto para analizar.', variant: 'destructive' });
            return;
        }
        setSpamResult(null);
        setSpamError(null);
        startSpamCheck(async () => {
            const result = await checkSpamAction({ text: spamText, threshold });
            if (result.success && result.data) {
                setSpamResult(result.data);
            } else {
                setSpamError(result.error || 'Ocurrió un error desconocido.');
            }
        });
    };

     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
            setVirusResult(null);
            setVirusError(null);
        }
    };

    const handleVirusScan = () => {
        if (!file) {
            toast({ title: 'Ningún archivo seleccionado', description: 'Por favor, selecciona un archivo para escanear.', variant: 'destructive' });
            return;
        }
        setVirusResult(null);
        setVirusError(null);
        startVirusScan(async () => {
            const formData = new FormData();
            formData.append('file', file);
            const result = await scanFileForVirusAction(formData);
            if (result.success && result.data) {
                setVirusResult(result.data);
            } else {
                setVirusError(result.error || 'Ocurrió un error desconocido al escanear.');
            }
        });
    };
    
    const handleVmcVerification = () => {
        if (!vmcDomain) {
            toast({ title: 'Campo vacío', description: 'Por favor, introduce un dominio para verificar.', variant: 'destructive' });
            return;
        }
        setVmcResult(null);
        setVmcError(null);
        startVmcVerification(async () => {
            const result = await validateVmcWithApiAction({ domain: vmcDomain });
            if (result.success && result.data) {
                setVmcResult(result.data);
            } else {
                setVmcError(result.error || 'Ocurrió un error desconocido.');
            }
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "¡Texto Copiado!",
            description: "El archivo de prueba EICAR está listo para ser pegado.",
            className: 'bg-success-login border-none text-white'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pass': return '#00CB07';
            case 'pass_without_vmc': return '#f59e0b';
            case 'indeterminate_revocation': return '#3b82f6';
            case 'fail': return '#F00000';
            default: return '#9ca3af';
        }
    };

    return (
        <>
        <main className="flex flex-1 flex-col gap-8 p-4 md:p-8 bg-background items-center">
            <div className="text-center max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-destructive flex items-center justify-center gap-2">
                    <FileWarning className="size-8"/>
                    Página de Pruebas
                </h1>
                <p className="text-muted-foreground mt-2">
                    Esta página es para probar integraciones con APIs externas, nuevas funcionalidades y animaciones.
                </p>
            </div>
            
            {/* VMC Verifier Panel */}
            <div className="w-full max-w-6xl p-6 bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/80 rounded-2xl shadow-2xl relative overflow-hidden">
                 <div className="absolute inset-0 z-0 opacity-10 bg-grid-zinc-400/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
                 <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-[radial-gradient(ellipse_at_center,_#00ADEC55,_transparent_60%)] animate-pulse" style={{animationDuration: '5s'}} />

                <div className="relative z-10">
                    <CardHeader className="p-0 mb-6">
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <div className="p-2 rounded-full bg-cyan-900 border border-cyan-500/50"><ShieldCheck className="text-cyan-400"/></div>
                            Validador VMC con API Externa
                        </CardTitle>
                        <CardDescription className="text-zinc-400 pt-1">Introduce un dominio para validar su autenticidad y configuración BIMI/VMC.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400"/>
                                <Input id="vmc-domain" placeholder="google.com" value={vmcDomain} onChange={e => setVmcDomain(e.target.value)} className="h-14 pl-12 text-lg bg-black/30 border-zinc-700 focus:border-cyan-500 focus:ring-cyan-500"/>
                            </div>
                            <Button onClick={handleVmcVerification} disabled={isVmcVerifying} className="h-14 px-8 text-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:opacity-90">
                                {isVmcVerifying ? <Loader2 className="mr-2 animate-spin"/> : <Server className="mr-2"/>}
                                Validar Dominio
                            </Button>
                        </div>
                    </CardContent>
                </div>

                {(isVmcVerifying || vmcResult || vmcError) && (
                    <CardFooter className="p-0 mt-8">
                         <Separator className="bg-zinc-700/50 mb-6"/>
                         {isVmcVerifying && (
                            <div className="w-full flex flex-col items-center justify-center gap-3 text-zinc-400 py-12">
                                <div className="relative w-16 h-16">
                                    <div className="absolute inset-0 border-2 border-dashed border-cyan-500/50 rounded-full animate-spin-slow"/>
                                    <div className="absolute inset-2 border-2 border-dashed border-blue-500/50 rounded-full animate-spin-slow" style={{animationDirection: 'reverse'}} />
                                    <Loader2 className="absolute inset-0 m-auto text-cyan-400 size-8 animate-spin" />
                                </div>
                                <p className="font-semibold text-lg">Contactando el servidor de validación...</p>
                                <p className="text-sm">Puede tardar unos segundos.</p>
                            </div>
                         )}
                         {vmcError && <div className="w-full text-destructive text-sm p-4 bg-destructive/10 rounded-md border border-destructive/50 flex items-center gap-3"><AlertTriangle/>{vmcError}</div>}
                         {vmcResult && (
                             <div className="w-full space-y-6">
                                <div className="p-4 rounded-lg flex items-center justify-center gap-3" style={{ background: `radial-gradient(ellipse at center, ${getStatusColor(vmcResult.status)}33, transparent 70%)`, border: `2px solid ${getStatusColor(vmcResult.status)}80`}}>
                                    <h3 className="text-xl font-bold tracking-wider" style={{color: getStatusColor(vmcResult.status)}}>
                                        ESTADO GLOBAL: {vmcResult.status.toUpperCase().replace(/_/g, ' ')}
                                    </h3>
                                </div>
                                
                                <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="dns">
                                    <AccordionItem value="dns" className="bg-black/30 border-zinc-700/80 rounded-lg">
                                        <AccordionTrigger className="p-4 font-bold text-lg"><div className="flex items-center gap-2"><Dna className="text-cyan-400"/>Registros DNS</div></AccordionTrigger>
                                        <AccordionContent className="p-4 pt-0">
                                            <div className="space-y-3 font-mono text-xs">
                                                <div className="p-3 rounded bg-zinc-800/50">
                                                    <p className="font-bold text-cyan-300">BIMI ({vmcResult.dns.bimi.name}):</p>
                                                    <p className="text-white/80 break-all">{vmcResult.dns.bimi.values?.join(' ') || 'No encontrado'}</p>
                                                </div>
                                                <div className="p-3 rounded bg-zinc-800/50">
                                                    <p className="font-bold text-cyan-300">DMARC ({vmcResult.dns.dmarc.name}):</p>
                                                    <p className="text-white/80 break-all">{vmcResult.dns.dmarc.values?.join(' ') || 'No encontrado'}</p>
                                                </div>
                                                <div className="p-3 rounded bg-zinc-800/50">
                                                    <p className="font-bold text-cyan-300">MX:</p>
                                                    <p className="text-white/80 break-all">{vmcResult.dns.mx.exchanges?.join(', ') || 'No encontrado'}</p>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                     <AccordionItem value="bimi" className="bg-black/30 border-zinc-700/80 rounded-lg">
                                        <AccordionTrigger className="p-4 font-bold text-lg"><div className="flex items-center gap-2"><FileText className="text-cyan-400"/>Análisis BIMI</div></AccordionTrigger>
                                        <AccordionContent className="p-4 pt-0 space-y-2">
                                            <StatusBadge status={vmcResult.bimi.exists} text="Registro Existe" />
                                            <StatusBadge status={vmcResult.bimi.syntax_ok} text="Sintaxis OK" />
                                            <StatusBadge status={vmcResult.bimi.dmarc_enforced} text="DMARC Forzado" />
                                        </AccordionContent>
                                    </AccordionItem>
                                     <AccordionItem value="svg" className="bg-black/30 border-zinc-700/80 rounded-lg">
                                        <AccordionTrigger className="p-4 font-bold text-lg"><div className="flex items-center gap-2"><ImageIcon className="text-cyan-400"/>Análisis SVG</div></AccordionTrigger>
                                        <AccordionContent className="p-4 pt-0 space-y-2">
                                            <StatusBadge status={vmcResult.svg.exists} text="Logo Existe" />
                                            <StatusBadge status={vmcResult.svg.compliant} text="Cumple Especificación" />
                                            <p className="text-xs text-zinc-400 pt-2 break-all">Mensaje: {vmcResult.svg.message}</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                     <AccordionItem value="vmc" className="bg-black/30 border-zinc-700/80 rounded-lg">
                                        <AccordionTrigger className="p-4 font-bold text-lg"><div className="flex items-center gap-2"><Shield className="text-cyan-400"/>Análisis VMC</div></AccordionTrigger>
                                        <AccordionContent className="p-4 pt-0 space-y-2">
                                            <StatusBadge status={vmcResult.vmc.exists} text="Certificado Existe" />
                                            <StatusBadge status={vmcResult.vmc.authentic} text="Auténtico" />
                                            <StatusBadge status={vmcResult.vmc.chain_ok} text="Cadena OK" />
                                            <StatusBadge status={vmcResult.vmc.valid_now} text="Vigente" />
                                            <StatusBadge status={vmcResult.vmc.revocation_ok} text="No Revocado" trueText="OK" falseText="REVOCADO" />
                                            <StatusBadge status={vmcResult.vmc.logo_hash_match} text="Hash del Logo Coincide" />
                                            <p className="text-xs text-zinc-400 pt-2 break-all">Mensaje: {vmcResult.vmc.message}</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                             </div>
                         )}
                    </CardFooter>
                )}
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Spam Checker Panel */}
                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/30 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Flame className="text-amber-400"/>Prueba de Spam Checker (APILayer)</CardTitle>
                        <CardDescription>Introduce texto para analizar su puntuación de spam.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="spam-text">Texto a Analizar</Label>
                            <Textarea
                                id="spam-text"
                                value={spamText}
                                onChange={(e) => setSpamText(e.target.value)}
                                placeholder="Pega aquí el contenido del correo..."
                                className="min-h-[150px]"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label>Ejemplos de Spam:</Label>
                            <div className="flex flex-wrap gap-2">
                                {spamExamples.map((ex, i) => (
                                    <Button key={i} size="sm" variant="outline" onClick={() => setSpamText(ex)}>
                                        Ejemplo {i + 1}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="threshold">Umbral de Detección (más bajo = más estricto): {threshold.toFixed(1)}</Label>
                            <Slider
                                id="threshold"
                                min={1}
                                max={10}
                                step={0.1}
                                value={[threshold]}
                                onValueChange={(value) => setThreshold(value[0])}
                            />
                        </div>
                        <Button onClick={handleSpamCheck} disabled={isSpamChecking} className="w-full">
                            {isSpamChecking ? <Loader2 className="mr-2 animate-spin"/> : <Microscope className="mr-2"/>}
                            Analizar Spam
                        </Button>
                    </CardContent>
                    <CardFooter>
                         {spamResult && (
                            <div className="w-full space-y-3 text-sm">
                                <h4 className="font-bold">Resultado del Análisis:</h4>
                                {spamResult.is_spam ? (
                                    <div className="p-3 rounded-md bg-destructive/10 text-destructive-foreground border border-destructive/20 flex items-start gap-2">
                                        <AlertTriangle />
                                        <div>
                                            <p><strong>Resultado:</strong> <span className="font-bold">{spamResult.result}</span></p>
                                            <p><strong>Puntuación:</strong> {spamResult.score.toFixed(2)} (Umbral: {threshold.toFixed(1)})</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-md bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20 flex items-start gap-2">
                                        <CheckCircleIcon />
                                        <div>
                                            <p><strong>Resultado:</strong> <span className="font-bold">{spamResult.result}</span></p>
                                            <p><strong>Puntuación:</strong> {spamResult.score.toFixed(2)} (Umbral: {threshold.toFixed(1)})</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {spamError && <p className="text-destructive text-sm">{spamError}</p>}
                    </CardFooter>
                </Card>

                 {/* Virus Scanner Panel */}
                <Card className="bg-card/50 backdrop-blur-sm border-blue-500/30 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-400">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>Prueba de Antivirus (ClamAV)</CardTitle>
                        <CardDescription>Sube un archivo para escanearlo en busca de virus.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Cómo Probar</Label>
                             <div className="p-3 text-xs text-blue-200 bg-blue-900/20 rounded-md border border-blue-500/30 space-y-2">
                                <p>1. Copia la siguiente cadena de texto EICAR (es un archivo de prueba inofensivo).</p>
                                <div className="flex gap-2">
                                    <Input value={eicarTestString} readOnly className="font-mono text-xs h-8 bg-black/30"/>
                                    <Button size="icon" className="h-8 w-8" variant="ghost" onClick={() => copyToClipboard(eicarTestString)}><Copy className="size-4"/></Button>
                                </div>
                                <p>2. Pega el texto en un nuevo archivo de texto y guárdalo (ej: `eicar.txt`).</p>
                                <p>3. Sube ese archivo aquí para verificar la detección.</p>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="file-upload">Seleccionar Archivo</Label>
                            <div className="relative mt-1">
                                <Input id="file-upload" type="file" onChange={handleFileChange} className="pr-20"/>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground truncate max-w-[100px]">
                                    {file ? file.name : "Ningún archivo"}
                                </span>
                            </div>
                        </div>
                        <Button onClick={handleVirusScan} disabled={isVirusScanning || !file} className="w-full">
                            {isVirusScanning ? <Loader2 className="mr-2 animate-spin"/> : <UploadCloud className="mr-2"/>}
                            Escanear Archivo
                        </Button>
                    </CardContent>
                    <CardFooter>
                         {virusResult && !virusError && (
                            <div className="w-full space-y-3 text-sm">
                                <h4 className="font-bold">Resultado del Escaneo:</h4>
                                {virusResult.isInfected ? (
                                    <div className="p-3 rounded-md bg-destructive/10 text-destructive-foreground border border-destructive/20 flex items-start gap-2">
                                        <ShieldAlert />
                                        <div>
                                            <p><strong>¡Amenaza Detectada!</strong></p>
                                            <p>{virusResult.message}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-md bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20 flex items-start gap-2">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-5 shrink-0">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <div>
                                            <p><strong>El archivo es seguro.</strong></p>
                                            <p>{virusResult.message}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {virusError && (
                             <div className="p-3 rounded-md bg-destructive/10 text-destructive-foreground border border-destructive/20 flex items-start gap-2">
                                <AlertTriangle />
                                <div>
                                    <p><strong>Error al contactar el servicio de antivirus:</strong></p>
                                    <p className="text-xs">{virusError}</p>
                                </div>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </main>
        </>
    );
}

    