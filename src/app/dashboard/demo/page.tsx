
"use client";

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Flame, Loader2, AlertTriangle, CheckCircle as CheckCircleIcon, Microscope, FileWarning, ShieldCheck, ShieldAlert, UploadCloud, Copy, Power, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { checkSpamAction, scanFileForVirusAction, checkApiHealthAction } from './actions';
import { type SpamCheckerOutput } from '@/ai/flows/spam-checker-flow';
import { type VirusScanOutput } from '@/ai/flows/virus-scan-types';
import { type ApiHealthOutput } from '@/ai/flows/api-health-check-flow';
import { cn } from '@/lib/utils';

export default function DemoPage() {
    const { toast } = useToast();
    
    // Spam Checker State
    const [spamText, setSpamText] = useState('Win a free car by clicking here!');
    const [spamThreshold, setSpamThreshold] = useState(5.0);
    const [isSpamChecking, startSpamCheck] = useTransition();
    const [spamResult, setSpamResult] = useState<SpamCheckerOutput | null>(null);

    // Virus Scanner State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isScanning, startScan] = useTransition();
    const [scanResult, setScanResult] = useState<VirusScanOutput | null>(null);

    // API Health Check State
    const [isCheckingHealth, startHealthCheck] = useTransition();
    const [healthResult, setHealthResult] = useState<ApiHealthOutput | null>(null);
    const [healthError, setHealthError] = useState<string | null>(null);
    
    const handleSpamCheck = () => {
        setSpamResult(null);
        startSpamCheck(async () => {
            const result = await checkSpamAction({ text: spamText, threshold: spamThreshold });
            if (result.success) {
                setSpamResult(result.data || null);
            } else {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
            }
        });
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setScanResult(null);
        }
    };
    
    const handleVirusScan = () => {
        if (!selectedFile) {
            toast({ title: 'No hay archivo', description: 'Por favor, selecciona un archivo para escanear.', variant: 'destructive' });
            return;
        }
        setScanResult(null);
        startScan(async () => {
            const formData = new FormData();
            formData.append('file', selectedFile);
            const result = await scanFileForVirusAction(formData);
            if (result.success) {
                setScanResult(result.data || null);
            } else {
                toast({ title: 'Error de Escaneo', description: result.error, variant: 'destructive' });
            }
        });
    };

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
    }

    return (
        <main className="flex flex-1 flex-col gap-8 p-4 md:p-8 bg-background items-center">
            <div className="text-center max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-destructive flex items-center justify-center gap-2">
                    <FileWarning className="size-8"/>
                    Página de Pruebas
                </h1>
                <p className="text-muted-foreground mt-2">
                    Utiliza estos paneles para probar las integraciones con APIs externas.
                </p>
            </div>
            
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                        <Power className="text-primary"/>
                        Mini Panel de Prueba 01: Conexión API
                    </CardTitle>
                    <CardDescription>
                        Este panel verifica la conectividad básica con la API externa de validación VMC/BIMI.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleHealthCheck} disabled={isCheckingHealth}>
                        {isCheckingHealth ? <Loader2 className="mr-2 animate-spin"/> : <ShieldCheck className="mr-2"/>}
                        Verificar Estado del Sistema
                    </Button>
                </CardContent>
                <CardFooter>
                    {isCheckingHealth && (
                        <div className="w-full flex items-center gap-2 text-sm text-muted-foreground">
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
                            <p className="font-bold flex items-center gap-2"><CheckCircle2/>Sistema en Línea</p>
                            <pre className="mt-2 text-xs bg-black/30 p-2 rounded-md">
                                {JSON.stringify(healthResult, null, 2)}
                            </pre>
                        </div>
                    )}
                </CardFooter>
            </Card>

            {/* Spam Checker Panel */}
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                        <Flame className="text-primary"/>
                        Probador de Spam (APILayer)
                    </CardTitle>
                    <CardDescription>Introduce un texto y ajusta la sensibilidad para ver si es detectado como spam.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="spam-text">Texto a Analizar</Label>
                        <Input id="spam-text" value={spamText} onChange={e => setSpamText(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="spam-threshold">Sensibilidad del Filtro (1-10)</Label>
                        <div className="flex items-center gap-4">
                            <Slider
                                id="spam-threshold"
                                min={1} max={10} step={0.1}
                                value={[spamThreshold]}
                                onValueChange={(value) => setSpamThreshold(value[0])}
                            />
                            <span className="font-mono text-lg font-bold w-16 text-center">{spamThreshold.toFixed(1)}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-4">
                     <Button onClick={handleSpamCheck} disabled={isSpamChecking}>
                        {isSpamChecking ? <Loader2 className="mr-2 animate-spin"/> : <Microscope className="mr-2"/>}
                        Analizar Texto
                    </Button>
                    {spamResult && (
                        <div className="w-full text-sm p-4 rounded-md border" style={{
                            borderColor: spamResult.is_spam ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
                            backgroundColor: spamResult.is_spam ? 'hsl(var(--destructive) / 0.1)' : 'hsl(var(--primary) / 0.1)',
                        }}>
                            <p><strong>Resultado:</strong> <span style={{ color: spamResult.is_spam ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}}>{spamResult.result}</span></p>
                            <p><strong>Puntuación:</strong> {spamResult.score.toFixed(2)}</p>
                        </div>
                    )}
                </CardFooter>
            </Card>

            {/* Virus Scanner Panel */}
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                        <ShieldCheck className="text-primary"/>
                        Escáner de Virus (ClamAV)
                    </CardTitle>
                    <CardDescription>Sube un archivo para escanearlo en busca de virus y malware.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Label htmlFor="virus-scan-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                             {isScanning ? (
                                <Loader2 className="w-8 h-8 mb-2 text-primary animate-spin" />
                             ) : (
                                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                             )}
                            <p className="mb-2 text-sm text-muted-foreground">
                                {selectedFile ? `Archivo seleccionado: ${selectedFile.name}` : 'Haz clic para subir un archivo'}
                            </p>
                        </div>
                        <Input id="virus-scan-file" type="file" className="hidden" onChange={handleFileChange} />
                    </Label>
                </CardContent>
                 <CardFooter className="flex-col items-start gap-4">
                     <Button onClick={handleVirusScan} disabled={isScanning || !selectedFile}>
                        {isScanning ? <Loader2 className="mr-2 animate-spin"/> : <ShieldAlert className="mr-2"/>}
                        Escanear Archivo
                    </Button>
                    {scanResult && (
                         <div className="w-full text-sm p-4 rounded-md border" style={{
                            borderColor: scanResult.isInfected ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
                            backgroundColor: scanResult.isInfected ? 'hsl(var(--destructive) / 0.1)' : 'hsl(var(--primary) / 0.1)',
                         }}>
                            <p className="font-bold flex items-center gap-2" style={{color: scanResult.isInfected ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}}>
                                {scanResult.isInfected ? <AlertTriangle/> : <CheckCircleIcon/>}
                                {scanResult.message}
                            </p>
                         </div>
                    )}
                 </CardFooter>
            </Card>
        </main>
    );
}
