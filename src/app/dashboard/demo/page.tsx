
"use client";

import React, { useState, useTransition, useEffect } from 'react';
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
import { motion } from 'framer-motion';
import { ScoreDisplay } from '@/components/dashboard/score-display';

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
        
        const analysisItems = [
            {
                title: "Registro BIMI",
                isValid: result.bimi_is_valid,
                description: result.bimi_description,
                verdict: result.bimi_is_valid ? "VÁLIDO" : "FALSO/INVÁLIDO"
            },
            {
                title: "Análisis SVG",
                isValid: result.svg_is_valid,
                description: result.svg_description,
                verdict: result.svg_is_valid ? "VÁLIDO" : "FALSO/INVÁLIDO"
            },
            {
                title: "Certificado VMC",
                isValid: result.vmc_is_authentic,
                description: result.vmc_description,
                verdict: result.verdict || "INDETERMINADO"
            }
        ]

        return (
             <div className="w-full text-sm space-y-4">
                {result.validation_score !== undefined && (
                   <ScoreDisplay score={result.validation_score} />
                )}
                {result.detailed_analysis && (
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg text-center text-cyan-300">Análisis Detallado de la IA</h3>
                        <div className="p-3 bg-black/40 rounded-md font-mono text-xs text-white/80 whitespace-pre-wrap border border-cyan-400/20 max-h-48 overflow-y-auto custom-scrollbar">
                            {result.detailed_analysis}
                        </div>
                    </div>
                )}
                <h3 className="font-bold text-lg text-center">Veredicto de la IA</h3>
                <Accordion type="single" collapsible defaultValue="item-0" className="w-full space-y-2">
                    {analysisItems.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="bg-black/20 border-border/30 rounded-lg">
                            <AccordionTrigger className="p-4 text-base font-semibold hover:no-underline">
                               <div className="flex items-center gap-3">
                                {item.isValid 
                                    ? <CheckCircle className="size-6 text-green-400" />
                                    : <AlertTriangle className="size-6 text-red-400" />
                                }
                                <span>{item.title}:</span>
                                 <span className={cn("font-bold", item.isValid ? "text-green-400" : "text-red-400")}>{item.verdict}</span>
                               </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                               <div className="p-3 bg-black/40 rounded-md font-mono text-xs text-white/80 whitespace-pre-wrap border border-border/20 max-h-32 overflow-y-auto custom-scrollbar">
                                 {item.description}
                               </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
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
                 {/* Panel 2: AI Analysis */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <Bot className="text-accent"/>
                            Mini Panel de Prueba 02: Análisis con IA
                        </CardTitle>
                        <CardDescription>
                           Valida un dominio y obtén un análisis técnico de la IA sobre sus registros BIMI y VMC.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="domain-input" className="font-semibold">Dominio a Analizar</Label>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="relative flex-grow">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        id="domain-input"
                                        placeholder="ejemplo.com"
                                        value={domainToAnalyze}
                                        onChange={(e) => setDomainToAnalyze(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button onClick={handleAnalysis} disabled={isAnalyzing || !domainToAnalyze}>
                                    {isAnalyzing ? <Loader2 className="mr-2 animate-spin"/> : <Dna className="mr-2"/>}
                                    Validar y Analizar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                     {(isAnalyzing || analysisResult || analysisError) && (
                        <CardFooter>
                            <div className="w-full">
                                {isAnalyzing && (
                                    <div className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="animate-spin" />
                                        La IA está analizando los datos del dominio...
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
                        </CardFooter>
                     )}
                </Card>
            </div>
        </main>
    );
}
