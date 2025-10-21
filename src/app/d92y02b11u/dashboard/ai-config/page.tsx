
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BrainCircuit, Key, Bot, Shield, Loader2, Wand2, Power, Dna, Save, ShieldCheck, Edit } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { getAiConfig, saveAiConfig, testAiConnection, type AiConfig, getPrompts, savePrompts, type PromptsConfig } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

function PromptEditModal({ isOpen, onOpenChange, initialPrompt, onSave }: { isOpen: boolean; onOpenChange: (open: boolean) => void; initialPrompt: string, onSave: (newPrompt: string) => Promise<any>}) {
    const [prompt, setPrompt] = useState(initialPrompt);
    const [isSaving, startSaving] = useTransition();

    useEffect(() => {
        setPrompt(initialPrompt);
    }, [initialPrompt]);

    const handleSave = () => {
        startSaving(async () => {
            await onSave(prompt);
            onOpenChange(false);
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Editar Prompt de Análisis VMC</DialogTitle>
                    <DialogDescription>
                        Modifica las instrucciones que seguirá la IA para analizar los resultados de la validación VMC.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea 
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        className="h-80 font-mono text-xs"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                         {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2"/>}
                        Guardar Prompt
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function AiConfigPage() {
    const { toast } = useToast();
    const [config, setConfig] = useState<AiConfig | null>(null);
    const [prompts, setPrompts] = useState<PromptsConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, startSaving] = useTransition();
    const [isTesting, startTesting] = useTransition();
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

    useEffect(() => {
        const fetchAllConfigs = async () => {
            setIsLoading(true);
            const [aiResult, promptsResult] = await Promise.all([
                getAiConfig(),
                getPrompts()
            ]);

            if (aiResult.success && aiResult.data) {
                const functions = aiResult.data.functions || {};
                setConfig({
                    ...aiResult.data,
                    functions: {
                        dnsAnalysis: functions.dnsAnalysis || false,
                        vmcVerification: functions.vmcVerification || false,
                    }
                });
            } else {
                 toast({ title: 'Error al Cargar Configuración de IA', description: aiResult.error, variant: 'destructive' });
            }
            
            if (promptsResult.success && promptsResult.data) {
                setPrompts(promptsResult.data);
            } else {
                toast({ title: 'Error al Cargar Prompts', description: promptsResult.error, variant: 'destructive' });
            }

            setIsLoading(false);
        };
        fetchAllConfigs();
    }, [toast]);
    
    const handleSaveAiConfig = () => {
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
    
    const handleSavePrompts = async (newVmcPrompt: string) => {
        if (!prompts) return;
        const newPrompts = { ...prompts, vmcAnalysis: newVmcPrompt };
        const result = await savePrompts(newPrompts);
        if (result.success) {
            setPrompts(newPrompts);
            toast({ title: '¡Guardado!', description: 'El prompt de VMC se ha actualizado.', className: 'bg-green-500 text-white' });
        } else {
            toast({ title: 'Error al Guardar', description: result.error, variant: 'destructive' });
        }
        return result;
    };


    const handleTestConnection = () => {
        if (!config) return;
        startTesting(async () => {
            const result = await testAiConnection({
                provider: config.provider,
                apiKey: config.apiKey,
                modelName: config.modelName,
            });
            if(result.success) {
                 toast({ title: '¡Conexión Exitosa!', description: 'La IA respondió correctamente.', className: 'bg-green-500 text-white' });
            } else {
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
                <Card><CardHeader><Skeleton className="h-6 w-1/4" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-16 w-full" /></CardContent></Card>
            </div>
        )
    }

    return (
        <>
            <PromptEditModal 
                isOpen={isPromptModalOpen}
                onOpenChange={setIsPromptModalOpen}
                initialPrompt={prompts?.vmcAnalysis || ''}
                onSave={handleSavePrompts}
            />
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
                                <Label htmlFor="dnsAnalysis" className="font-semibold flex items-center gap-2"><Dna/>Análisis de Salud DNS</Label>
                                <p className="text-sm text-muted-foreground">Usa la IA para analizar y dar recomendaciones sobre los registros DNS.</p>
                            </div>
                             <Switch id="dnsAnalysis" checked={config?.functions.dnsAnalysis} onCheckedChange={(checked) => updateFunctionToggle('dnsAnalysis', checked)} />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                            <div className="space-y-1">
                                <Label htmlFor="vmc-verification" className="font-semibold flex items-center gap-2"><ShieldCheck/>Análisis de Registros VMC</Label>
                                <p className="text-sm text-muted-foreground">Permite a la IA analizar la autenticidad de los certificados VMC.</p>
                            </div>
                            <Switch id="vmc-verification" checked={config?.functions.vmcVerification} onCheckedChange={(checked) => updateFunctionToggle('vmcVerification', checked)} />
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bot />Gestión de Prompts de IA</CardTitle>
                        <CardDescription>
                            Personaliza las instrucciones que sigue la IA para realizar ciertas tareas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                            <div className="space-y-1">
                                <Label className="font-semibold flex items-center gap-2"><ShieldCheck/>Prompt de Análisis VMC</Label>
                                <p className="text-sm text-muted-foreground">Define cómo la IA debe analizar y reportar sobre los certificados VMC.</p>
                            </div>
                            <Button onClick={() => setIsPromptModalOpen(true)} variant="outline">
                                <Edit className="mr-2"/>
                                Editar Prompt
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSaveAiConfig} disabled={isSaving}>
                         {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2"/>}
                        Guardar Configuración
                    </Button>
                </div>
            </div>
        </>
    );
}
