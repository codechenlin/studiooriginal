
"use client";

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Power, ShieldCheck, AlertTriangle, CheckCircle, Bot, Globe, Terminal, Server, Dna } from 'lucide-react';
import { checkApiHealthAction } from './actions';
import { type ApiHealthOutput } from '@/ai/flows/api-health-check-flow';
import { validateVmcWithApiAction } from './actions';
import { type VmcApiValidationOutput } from '@/ai/flows/vmc-validator-api-types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function DemoPage() {
    const [isCheckingHealth, startHealthCheck] = useTransition();
    const [healthResult, setHealthResult] = useState<ApiHealthOutput | null>(null);
    const [healthError, setHealthError] = useState<string | null>(null);
    
    const [isValidatingVmc, startVmcValidation] = useTransition();
    const [vmcResult, setVmcResult] = useState<VmcApiValidationOutput | null>(null);
    const [vmcError, setVmcError] = useState<string | null>(null);
    const [domainToValidate, setDomainToValidate] = useState('paypal.com');
    
    const handleHealthCheck = () => {
        setHealthResult(null);
        setHealthError(null);
        startHealthCheck(async () => {
            const result = await checkApiHealthAction();
            if (result.success) {
                setHealthResult(result.data || null);
            } else {
                setHealthError(result.error || 'Ocurrió un error desconocido.');
            }
        });
    };

    const handleVmcValidation = () => {
        if (!domainToValidate) return;
        setVmcResult(null);
        setVmcError(null);
        startVmcValidation(async () => {
            const result = await validateVmcWithApiAction({ domain: domainToValidate });
            if (result.success) {
                setVmcResult(result.data || null);
            } else {
                setVmcError(result.error || 'Ocurrió un error desconocido.');
            }
        });
    };

    const renderVmcResult = (result: VmcApiValidationOutput) => {
        const statusColors = {
            pass: 'text-green-400',
            pass_without_vmc: 'text-yellow-400',
            indeterminate_revocation: 'text-amber-400',
            fail: 'text-red-400',
            partial: 'text-orange-400'
        }
        const openSslStatusColor = result.vmc.openssl?.status === 'pass' ? 'text-green-400' : 'text-red-400';

        return (
            <div className="space-y-4">
                <p className="text-center font-bold text-lg">
                    Estado Global: <span className={cn(statusColors[result.status])}>{result.status.replace(/_/g, ' ')}</span>
                </p>
                
                {result.vmc.openssl && (
                    <div className="p-4 rounded-lg bg-black/40 border border-purple-500/30">
                        <h4 className="font-bold text-base flex items-center gap-2 mb-2 text-purple-300">
                           <Server/> Resultados OpenSSL
                        </h4>
                        <div className="space-y-2 text-xs">
                             <p><strong>Estado:</strong> <span className={openSslStatusColor}>{result.vmc.openssl.status}</span></p>
                            <p><strong>Formato:</strong> {result.vmc.openssl.format}</p>
                            <p><strong>Cadena OK:</strong> <span className={result.vmc.openssl.chain_ok ? 'text-green-400' : 'text-red-400'}>{result.vmc.openssl.chain_ok === null ? 'N/A' : String(result.vmc.openssl.chain_ok)}</span></p>
                            {result.vmc.openssl.stderr && <p><strong>Stderr:</strong> <code className="bg-red-900/50 p-1 rounded-sm">{result.vmc.openssl.stderr}</code></p>}
                        </div>
                    </div>
                )}
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="dns">
                    <AccordionTrigger><Dna className="mr-2"/>Registros DNS</AccordionTrigger>
                    <AccordionContent>
                      <pre className="text-xs bg-black/30 p-2 rounded-md">{JSON.stringify(result.dns, null, 2)}</pre>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="vmc-details">
                    <AccordionTrigger><ShieldCheck className="mr-2"/>Detalles VMC Completo</AccordionTrigger>
                    <AccordionContent>
                      <pre className="text-xs bg-black/30 p-2 rounded-md">{JSON.stringify(result, null, 2)}</pre>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
            </div>
        )
    }

    return (
        <main className="flex flex-1 flex-col gap-8 p-4 md:p-8 bg-background items-center">
             <div className="text-center max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                    Página de Pruebas de API
                </h1>
                <p className="text-muted-foreground mt-2">
                    Utiliza estos paneles para interactuar con la API de validación externa.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
                {/* Panel 1: Health Check */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <Power className="text-primary"/>
                            Mini Panel de Prueba 01: Prueba de Conexión
                        </CardTitle>
                        <CardDescription>
                            Verifica la conectividad básica con la API de validación.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleHealthCheck} disabled={isCheckingHealth}>
                            {isCheckingHealth ? <Loader2 className="mr-2 animate-spin"/> : <ShieldCheck className="mr-2"/>}
                            Verificar Estado del Sistema
                        </Button>
                    </CardContent>
                     {(isCheckingHealth || healthResult || healthError) && (
                        <CardFooter>
                            <div className="w-full">
                                {isCheckingHealth && (
                                    <div className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="animate-spin" />
                                        Verificando conexión...
                                    </div>
                                )}
                                {healthError && (
                                    <div className="w-full text-sm p-4 rounded-md border bg-destructive/10 text-destructive border-destructive">
                                        <p className="font-bold flex items-center gap-2"><AlertTriangle/>Error de Conexión</p>
                                        <p className="mt-1 font-mono text-xs">{healthError}</p>
                                    </div>
                                )}
                                {healthResult && (
                                    <div className="w-full text-sm p-4 rounded-md border bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/50">
                                        <p className="font-bold flex items-center gap-2"><CheckCircle/>Sistema en Línea</p>
                                        <pre className="mt-2 text-xs bg-black/30 p-2 rounded-md">
                                            {JSON.stringify(healthResult, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </CardFooter>
                    )}
                </Card>

                 {/* Panel 3: Validador VMC con OpenSSL */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <Bot className="text-primary"/>
                            Mini Panel de Prueba 03: Validador VMC con OpenSSL
                        </CardTitle>
                        <CardDescription>
                            Introduce un dominio para realizar una validación completa de BIMI, SVG, VMC y OpenSSL.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div>
                            <Label htmlFor="domain-input">Dominio a Validar</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    id="domain-input"
                                    value={domainToValidate}
                                    onChange={(e) => setDomainToValidate(e.target.value)}
                                    placeholder="ejemplo.com"
                                />
                                <Button onClick={handleVmcValidation} disabled={isValidatingVmc || !domainToValidate}>
                                    {isValidatingVmc ? <Loader2 className="mr-2 animate-spin"/> : <Globe className="mr-2"/>}
                                    Validar
                                </Button>
                            </div>
                        </div>
                        {(isValidatingVmc || vmcResult || vmcError) && (
                            <div className="pt-4">
                                {isValidatingVmc && (
                                    <div className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="animate-spin" />
                                        Validando dominio...
                                    </div>
                                )}
                                {vmcError && (
                                    <div className="w-full text-sm p-4 rounded-md border bg-destructive/10 text-destructive border-destructive">
                                        <p className="font-bold flex items-center gap-2"><AlertTriangle/>Error de Validación</p>
                                        <p className="mt-1 font-mono text-xs">{vmcError}</p>
                                    </div>
                                )}
                                {vmcResult && (
                                    <ScrollArea className="h-72">
                                        {renderVmcResult(vmcResult)}
                                    </ScrollArea>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
