
"use client";

import { useState, useTransition, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Image as ImageIcon, KeyRound as KeyIcon, GalleryVertical, Loader2, Palette, Sun, Moon, Trash2, Smartphone, Monitor } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { MediaPreview } from '@/components/admin/media-preview';
import { Separator } from '@/components/ui/separator';
import { FileManagerModal } from '@/components/dashboard/file-manager-modal';
import { updateAppConfig, uploadLogoAndGetUrl, getAppConfig } from './actions';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export const maxDuration = 60; // Aumentar el tiempo de espera a 60 segundos
export const dynamic = 'force-dynamic';

type AppConfig = {
    loginBackgroundImage: { light: string; dark: string; };
    signupBackgroundImage: { light: string; dark: string; };
    forgotPasswordBackgroundImage: { light: string; dark: string; };
    logoLightUrl: string | null;
    logoDarkUrl: string | null;
};

function CoverImageUploader({
    title,
    imageUrl,
    configKey,
    onConfigChange,
    isLoading
}: {
    title: string;
    imageUrl: string;
    configKey: string;
    onConfigChange: (key: string, value: string) => void;
    isLoading: boolean;
}) {
    const { toast } = useToast();
    const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
    const [isUploading, startUploading] = useTransition();

    const handleFileSelect = async (url: string) => {
        setIsFileManagerOpen(false);
        await updateConfig(url);
    };

    const updateConfig = async (url: string) => {
        const result = await updateAppConfig(configKey, url);
        if (result.success) {
            toast({
                title: "Portada Actualizada",
                description: `El fondo de ${title.toLowerCase()} ha sido guardado.`,
            });
            onConfigChange(configKey, url);
        } else {
            toast({
                title: "Error al Guardar",
                description: result.error,
                variant: "destructive",
            });
        }
    };
    
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        startUploading(async () => {
            const formData = new FormData();
            formData.append('file', file);
            
            const result = await uploadLogoAndGetUrl(formData);

            if (result.success && result.url) {
                await updateConfig(result.url);
            } else {
                toast({
                    title: "Error al Subir",
                    description: result.error || "No se pudo subir el archivo.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <>
            <FileManagerModal open={isFileManagerOpen} onOpenChange={setIsFileManagerOpen} onFileSelect={handleFileSelect} />
            <div className="space-y-4">
                <h3 className="font-semibold mb-2">{title}</h3>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                   {isLoading ? (
                       <Skeleton className="w-full h-full" />
                   ) : (
                       <MediaPreview src={imageUrl} />
                   )}
                </div>
                <div className="space-y-2">
                     <Label htmlFor={`picture-${configKey}`} className={cn(
                         "flex flex-col items-center justify-center w-full h-24 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50",
                         isUploading ? "cursor-wait" : "hover:bg-muted"
                     )}>
                        <div className="flex flex-col items-center justify-center pt-4 pb-4">
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-6 h-6 mb-1 text-primary animate-spin" />
                                    <p className="text-xs text-primary">Subiendo...</p>
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="w-6 h-6 mb-1 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Haz clic para subir un archivo</p>
                                </>
                            )}
                        </div>
                        <Input id={`picture-${configKey}`} type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                    </Label>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setIsFileManagerOpen(true)}
                    >
                        <GalleryVertical className="mr-2 h-4 w-4" />
                        Seleccionar de la Galería
                    </Button>
                </div>
            </div>
        </>
    );
}

function CoverSection({ 
    title, 
    description, 
    icon: Icon, 
    configKey,
    initialImageUrls,
    onConfigChange,
    isLoading
}: {
    title: string;
    description: string;
    icon: React.ElementType;
    configKey: 'loginBackgroundImage' | 'signupBackgroundImage' | 'forgotPasswordBackgroundImage';
    initialImageUrls: { light: string; dark: string; };
    onConfigChange: (key: string, value: string) => void;
    isLoading: boolean;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Icon /> {title}</CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CoverImageUploader 
                    title="Modo Claro"
                    imageUrl={initialImageUrls.light}
                    configKey={`${configKey}.light`}
                    onConfigChange={onConfigChange}
                    isLoading={isLoading}
                />
                <CoverImageUploader 
                    title="Modo Oscuro"
                    imageUrl={initialImageUrls.dark}
                    configKey={`${configKey}.dark`}
                    onConfigChange={onConfigChange}
                    isLoading={isLoading}
                />
            </CardContent>
        </Card>
    );
}

function LogoSection({ title, icon: Icon, configKey, initialImageUrl, onConfigChange, isLoading, themePreview }: {
    title: string;
    icon: React.ElementType;
    configKey: 'logoLightUrl' | 'logoDarkUrl';
    initialImageUrl: string | null;
    onConfigChange: (key: string, value: string | null) => void;
    isLoading: boolean;
    themePreview: 'light' | 'dark';
}) {
    const { toast } = useToast();
    const [logoUrl, setLogoUrl] = useState(initialImageUrl);
    const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
    const [isUploading, startUploading] = useTransition();

    useEffect(() => {
        setLogoUrl(initialImageUrl);
    }, [initialImageUrl]);

    const updateConfig = async (url: string | null) => {
        const result = await updateAppConfig(configKey, url);
        if (result.success) {
            toast({
                title: "Logo Actualizado",
                description: `El ${title.toLowerCase()} ha sido guardado.`,
            });
            onConfigChange(configKey, url);
        } else {
            toast({ title: "Error al Guardar", description: result.error, variant: "destructive" });
            setLogoUrl(initialImageUrl); // Revert
        }
    };
    
    const handleFileSelect = (url: string) => {
        setLogoUrl(url);
        setIsFileManagerOpen(false);
        updateConfig(url);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        startUploading(async () => {
            const formData = new FormData();
            formData.append('file', file);
            const result = await uploadLogoAndGetUrl(formData);
            if (result.success && result.url) {
                setLogoUrl(result.url);
                await updateConfig(result.url);
            } else {
                toast({ title: "Error al Subir", description: result.error, variant: "destructive" });
            }
        });
    };
    
    const handleRemoveLogo = () => {
        setLogoUrl(null);
        updateConfig(null);
    }

    return (
        <>
            <FileManagerModal open={isFileManagerOpen} onOpenChange={setIsFileManagerOpen} onFileSelect={handleFileSelect} />
            <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-foreground/90"><Icon className="text-primary"/>{title}</h3>
                <div className={cn("p-4 rounded-lg border flex flex-col items-center justify-center min-h-[120px]", themePreview === 'dark' ? 'bg-zinc-900' : 'bg-zinc-100')}>
                    {isLoading ? (
                        <Skeleton className="h-10 w-32" />
                    ) : logoUrl ? (
                         <div className="relative h-10 w-32">
                           <Image src={logoUrl} alt={title} fill className="object-contain" />
                         </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Sin logo</p>
                    )}
                </div>
                 <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsFileManagerOpen(true)}><GalleryVertical className="mr-2"/>Galería</Button>
                    <Button variant="outline" size="sm" asChild>
                        <Label htmlFor={`logo-upload-${configKey}`} className="cursor-pointer">
                            <UploadCloud className="mr-2"/>Subir
                        </Label>
                    </Button>
                    <Input id={`logo-upload-${configKey}`} type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading}/>
                </div>
                {logoUrl && (
                     <Button variant="destructive" size="sm" className="w-full" onClick={handleRemoveLogo}>
                        <Trash2 className="mr-2"/>Eliminar Logo
                    </Button>
                )}
            </div>
        </>
    )
}

export default function LogosPage() {
    const { toast } = useToast();
    const [config, setConfig] = useState<AppConfig>({ 
        loginBackgroundImage: { light: '', dark: '' }, 
        signupBackgroundImage: { light: '', dark: '' }, 
        forgotPasswordBackgroundImage: { light: '', dark: '' },
        logoLightUrl: null,
        logoDarkUrl: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchConfig = useCallback(async () => {
         setIsLoading(true);
         const result = await getAppConfig();
         if (result.success && result.data) {
             const defaultConfig = {
                loginBackgroundImage: { light: '', dark: '' }, 
                signupBackgroundImage: { light: '', dark: '' }, 
                forgotPasswordBackgroundImage: { light: '', dark: '' },
                logoLightUrl: null,
                logoDarkUrl: null,
             };
             setConfig({...defaultConfig, ...result.data});
         } else {
             toast({
                 title: "Error al Cargar",
                 description: result.error || "No se pudo cargar la configuración de la aplicación.",
                 variant: "destructive",
             });
         }
         setIsLoading(false);
    }, [toast]);
    
    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);
    
    const handleConfigChange = (key: string, value: string | null) => {
        setConfig(prevConfig => {
            const keys = key.split('.');
            if (keys.length === 2) {
                return {
                    ...prevConfig,
                    [keys[0]]: {
                        ...(prevConfig as any)[keys[0]],
                        [keys[1]]: value,
                    }
                };
            }
            return { ...prevConfig, [key]: value };
        });
        fetchConfig();
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold mb-8">Personalización de Marca</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette /> Logo del Proyecto</CardTitle>
                    <CardDescription>Sube los logos para los modos claro y oscuro. Se mostrarán en toda la aplicación.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <LogoSection
                        title="Logo para Modo Claro"
                        icon={Sun}
                        configKey="logoLightUrl"
                        initialImageUrl={config.logoLightUrl}
                        onConfigChange={handleConfigChange}
                        isLoading={isLoading}
                        themePreview="light"
                    />
                    <LogoSection
                        title="Logo para Modo Oscuro"
                        icon={Moon}
                        configKey="logoDarkUrl"
                        initialImageUrl={config.logoDarkUrl}
                        onConfigChange={handleConfigChange}
                        isLoading={isLoading}
                        themePreview="dark"
                    />
                </CardContent>
            </Card>

            <Separator />
            
            <CoverSection
                title="Portada de Inicio de Sesión"
                description="Este fondo se mostrará en la página de login del usuario."
                icon={Monitor}
                configKey="loginBackgroundImage"
                initialImageUrls={config.loginBackgroundImage}
                onConfigChange={handleConfigChange}
                isLoading={isLoading}
            />
            
             <CoverSection
                title="Portada de Registro de Cuenta"
                description="Este fondo se mostrará en la página de signup del usuario."
                icon={ImageIcon}
                configKey="signupBackgroundImage"
                initialImageUrls={config.signupBackgroundImage}
                onConfigChange={handleConfigChange}
                isLoading={isLoading}
            />

            <CoverSection
                title="Portada de Olvidé Contraseña"
                description="Este fondo se mostrará en la página para restablecer la contraseña."
                icon={KeyIcon}
                configKey="forgotPasswordBackgroundImage"
                initialImageUrls={config.forgotPasswordBackgroundImage}
                onConfigChange={handleConfigChange}
                isLoading={isLoading}
            />

             <CardFooter>
                <p className="text-xs text-muted-foreground">
                    Los cambios se guardarán y reflejarán automáticamente en las páginas de autenticación.
                </p>
            </CardFooter>
        </div>
    );
}
