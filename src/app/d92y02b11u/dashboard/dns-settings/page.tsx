
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dna, Save, Loader2, Link as LinkIcon, AtSign, Settings } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { getDnsConfig, saveDnsConfig, type DnsConfig } from './actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function DnsSettingsPage() {
    const { toast } = useToast();
    const [config, setConfig] = useState<DnsConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, startSaving] = useTransition();

    useEffect(() => {
        const fetchConfig = async () => {
            setIsLoading(true);
            const result = await getDnsConfig();
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
            const result = await saveDnsConfig(config);
            if (result.success) {
                toast({ title: '¡Guardado!', description: 'La configuración de DNS se ha actualizado.', className: 'bg-green-500 text-white' });
            } else {
                toast({ title: 'Error al Guardar', description: result.error, variant: 'destructive' });
            }
        });
    };

    const updateConfig = (field: keyof DnsConfig, value: string) => {
        setConfig(prev => (prev ? { ...prev, [field]: value } : null));
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-1/3" />
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/4" /><Skeleton className="h-4 w-1/2" /></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3"><Dna/>Configuración de Verificación DNS</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings />Parámetros de Configuración Global</CardTitle>
                    <CardDescription>
                       Estos valores se usarán en toda la plataforma para verificar los registros DNS de los dominios de los usuarios.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="spf-domain" className="flex items-center gap-1"><LinkIcon className="size-4"/>Dominio para SPF `include`</Label>
                        <Input id="spf-domain" placeholder="_spf.daybuu.com" value={config?.spfIncludeDomain} onChange={e => updateConfig('spfIncludeDomain', e.target.value)} />
                         <p className="text-xs text-muted-foreground">Ej: `v=spf1 include:{config?.spfIncludeDomain || '_spf.daybuu.com'} -all`</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mx-domain" className="flex items-center gap-1"><AtSign className="size-4"/>Dominio de Destino para MX</Label>
                        <Input id="mx-domain" placeholder="daybuu.com" value={config?.mxTargetDomain} onChange={e => updateConfig('mxTargetDomain', e.target.value)} />
                        <p className="text-xs text-muted-foreground">Ej: `IN MX 0 {config?.mxTargetDomain || 'daybuu.com'}`</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="dkim-selector">Selector DKIM</Label>
                        <Input id="dkim-selector" placeholder="daybuu" value={config?.dkimSelector} onChange={e => updateConfig('dkimSelector', e.target.value)} />
                        <p className="text-xs text-muted-foreground">Ej: `{config?.dkimSelector || 'daybuu'}._domainkey`</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bimi-selector">Selector BIMI</Label>
                        <Input id="bimi-selector" placeholder="daybuu" value={config?.bimiSelector} onChange={e => updateConfig('bimiSelector', e.target.value)} />
                         <p className="text-xs text-muted-foreground">Ej: `{config?.bimiSelector || 'daybuu'}._bimi`</p>
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
