
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BrainCircuit, Key, Bot, Shield, Loader2, Wand2, Power, Dna, Save } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { getAiConfig, saveAiConfig, testAiConnection, type AiConfig } from './actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function AiConfigPage() {
    const { toast } = useToast();
    const [config, setConfig] = useState<AiConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, startSaving] = useTransition();
    const [isTesting, startTesting] = useTransition();
    const [testResult, setTestResult] = useState<'success' | 'failure' | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            const result = await getAiConfig();
            if (result.success && result.data) {
                setConfig(result.data);
            } else {
                 toast({ title: 'Error al Cargar', description: result.error, variant: 'destructive' });
            }
            setIsLoading(false);
        };
        fetchConfig();
    }, [toast]);
    
    const handleSave = () => {
        if (!config) return;
        startSaving(async () => {
            const result = await saveAiConfig(config);
            if (result.success) {
                toast({ title: '¡Guardado!', description: 'La configuración de IA se ha actualizado.', className: 'bg-green-500 text-white' });
            } else {
                toast({ title: 'Error al Guardar', description: result.error, variant: 'destructive' });
            }
        });
    };

    const handleTestConnection = () => {
        if (!config) return;
        setTestResult(null);
        startTesting(async () => {
            const result = await testAiConnection({
                provider: config.provider,
                apiKey: config.apiKey,
                modelName: config.modelName,
            });
            if(result.success) {
                setTestResult('success');
                 toast({ title: '¡Conexión Exitosa!', description: 'La IA respondió correctamente.', className: 'bg-green-500 text-white' });
            } else {
                setTestResult('failure');
                 toast({ title: 'Error de Conexión', description: result.error, variant: 'destructive' });
            }
        });
    }

    const updateConfig = (field: keyof AiConfig, value: any) => {
        setConfig(prev => (prev ? { ...prev, [field]: value } : null));
    };

     const updateFunctionToggle = (func: keyof AiConfig['functions'], value: boolean) => {
        setConfig(prev => {
            if (!prev) return null;
            return {
                ...prev,
                functions: {
                    ...prev.functions,
                    [func]: value
                }
            };
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-1/3" />
                <Card><CardHeader><Skeleton className="h-6 w-1/4" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-1/4" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3"><BrainCircuit/>Configuración de Inteligencia Artificial</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Key />Proveedor del Modelo (DeepSeek)</CardTitle>
                    <CardDescription>
                       Configura las credenciales y el modelo para conectarte con la API de DeepSeek.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                        <div className="space-y-1">
                            <Label htmlFor="ai-enabled" className="font-semibold text-base">Habilitar IA de DeepSeek Globalmente</Label>
                            <p className="text-sm text-muted-foreground">Apaga esto para deshabilitar todas las funciones de IA que usan DeepSeek.</p>
                        </div>
                         <Switch id="ai-enabled" checked={config?.enabled} onCheckedChange={(checked) => updateConfig('enabled', checked)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="api-key">API Key de DeepSeek</Label>
                            <Input id="api-key" type="password" placeholder="••••••••••••••••••••••" value={config?.apiKey} onChange={e => updateConfig('apiKey', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="model-name">Nombre del Modelo</Label>
                            <Input id="model-name" placeholder="deepseek-chat" value={config?.modelName} onChange={e => updateConfig('modelName', e.target.value)} />
                        </div>
                    </div>
                     <div className="flex justify-end">
                        <Button onClick={handleTestConnection} disabled={isTesting} variant="outline">
                            {isTesting ? <Loader2 className="mr-2 animate-spin"/> : <Wand2 className="mr-2"/>}
                            Probar Conexión
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Power />Funciones de IA</CardTitle>
                    <CardDescription>
                       Activa o desactiva las capacidades específicas de la IA en la plataforma.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                        <div className="space-y-1">
                            <Label htmlFor="dns-analysis" className="font-semibold flex items-center gap-2"><Dna/>Análisis de Salud DNS</Label>
                            <p className="text-sm text-muted-foreground">Usa la IA para analizar y dar recomendaciones sobre los registros DNS en la página de Servidores.</p>
                        </div>
                         <Switch id="dns-analysis" checked={config?.functions.dnsAnalysis} onCheckedChange={(checked) => updateFunctionToggle('dnsAnalysis', checked)} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                     {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2"/>}
                    Guardar Configuración
                </Button>
            </div>
        </div>
    );
}
