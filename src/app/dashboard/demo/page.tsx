
"use client";

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Power, ShieldCheck, AlertTriangle, CheckCircle, Bot, Globe, Server, Dna } from 'lucide-react';
import { checkApiHealthAction } from './actions';
import { type ApiHealthOutput } from '@/ai/flows/api-health-check-flow';
import { validateDomainWithAI } from './actions';
import { type VmcAnalysisOutput } from './types';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function DemoPage() {
    const [isCheckingHealth, startHealthCheck] = useTransition();
    const [healthResult, setHealthResult] = useState<ApiHealthOutput | null>(null);
    const [healthError, setHealthError] = useState<string | null>(null);
    
    const [isAnalyzing, startAnalysis] = useTransition();
    const [analysisResult, setAnalysisResult] = useState<VmcAnalysisOutput | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [domainToAnalyze, setDomainToAnalyze] = useState('paypal.com');
    
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

    const handleAnalysis = () => {
        if (!domainToAnalyze) return;
        setAnalysisResult(null);
        setAnalysisError(null);
        startAnalysis(async () => {
            const result = await validateDomainWithAI({ domain: domainToAnalyze });
            if (result.success && result.data) {
                setAnalysisResult(result.data);
            } else {
                setAnalysisError(result.error || 'Ocurrió un error desconocido.');
            }
        });
    };

    const renderAnalysisResult = (result: VmcAnalysisOutput) => {
        const getStatusClasses = (isValid: boolean) => 
            isValid 
            ? "bg-green-900/40 border-green-500/50 text-green-300" 
            : "bg-red-900/40 border-red-500/50 text-red-300";

        const getStatusIcon = (isValid: boolean) => 
            isValid 
            ? <CheckCircle className="size-8 shrink-0 text-green-400" />
            : <AlertTriangle className="size-8 shrink-0 text-red-400" />;
        
        return (
             <div className="space-y-4">
                <div className={cn("p-4 rounded-lg border", getStatusClasses(result.bimi_is_valid))}>
                    <div className="flex items-start gap-4">
                        {getStatusIcon(result.bimi_is_valid)}
                        <div>
                            <h4 className="font-bold">Registro BIMI: {result.bimi_is_valid ? "VÁLIDO" : "FALSO/INVÁLIDO"}</h4>
                            <p className="text-sm">{result.bimi_description}</p>
                        </div>
                    </div>
                </div>
                 <div className={cn("p-4 rounded-lg border", getStatusClasses(result.svg_is_valid))}>
                    <div className="flex items-start gap-4">
                        {getStatusIcon(result.svg_is_valid)}
                        <div>
                            <h4 className="font-bold">Imagen SVG: {result.svg_is_valid ? "CORRECTA" : "FALSA"}</h4>
                            <p className="text-sm">{result.svg_description}</p>
                        </div>
                    </div>
                </div>
                 <div className={cn("p-4 rounded-lg border", getStatusClasses(result.vmc_is_authentic))}>
                    <div className="flex items-start gap-4">
                        {getStatusIcon(result.vmc_is_authentic)}
                        <div>
                            <h4 className="font-bold">Certificado VMC: {result.vmc_is_authentic ? "AUTÉNTICO" : "FALSO"}</h4>
                            <p className="text-sm">{result.vmc_description}</p>
                        </div>
                    </div>
                </div>
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

                 {/* Panel 2: Validador VMC con Análisis IA */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <Bot className="text-primary"/>
                            Mini Panel de Prueba 02: Análisis con IA
                        </CardTitle>
                        <CardDescription>
                           Valida un dominio y obtén un análisis de la IA sobre su autenticidad.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div>
                            <Label htmlFor="domain-input">Dominio a Validar</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    id="domain-input"
                                    value={domainToAnalyze}
                                    onChange={(e) => setDomainToAnalyze(e.target.value)}
                                    placeholder="ejemplo.com"
                                />
                                <Button onClick={handleAnalysis} disabled={isAnalyzing || !domainToAnalyze}>
                                    {isAnalyzing ? <Loader2 className="mr-2 animate-spin"/> : <Globe className="mr-2"/>}
                                    Analizar
                                </Button>
                            </div>
                        </div>
                         {(isAnalyzing || analysisResult || analysisError) && (
                            <div className="pt-4">
                                {isAnalyzing && (
                                    <div className="w-full flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="animate-spin mb-2" />
                                        <p>Contactando API externa...</p>
                                        <p>Enviando respuesta a DeepSeek para análisis...</p>
                                    </div>
                                )}
                                {analysisError && (
                                    <div className="w-full text-sm p-4 rounded-md border bg-destructive/10 text-destructive border-destructive">
                                        <p className="font-bold flex items-center gap-2"><AlertTriangle/>Error de Análisis</p>
                                        <p className="mt-1 font-mono text-xs">{analysisError}</p>
                                    </div>
                                )}
                                {analysisResult && renderAnalysisResult(analysisResult)}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

    