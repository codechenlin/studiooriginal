
"use client";

import { useState, useTransition, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Image as ImageIcon, KeyRound as KeyIcon, GalleryVertical, Loader2, Palette, Sun, Moon, Trash2 } from "lucide-react";
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
    loginBackgroundImageUrl: string;
    signupBackgroundImageUrl: string;
    forgotPasswordBackgroundImageUrl: string;
    logoLightUrl: string | null;
    logoDarkUrl: string | null;
};

function CoverSection({ 
    title, 
    description, 
    icon: Icon, 
    configKey,
    initialImageUrl,
    onConfigChange,
    isLoading
}: {
    title: string;
    description: string;
    icon: React.ElementType;
    configKey: 'loginBackgroundImageUrl' | 'signupBackgroundImageUrl' | 'forgotPasswordBackgroundImageUrl';
    initialImageUrl: string;
    onConfigChange: (key: string, value: string) => void;
    isLoading: boolean;
}) {
    const { toast } = useToast();
    const [imageUrl, setImageUrl] = useState(initialImageUrl);
    const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
    const [isUploading, startUploading] = useTransition();

    useEffect(() => {
        setImageUrl(initialImageUrl);
    }, [initialImageUrl]);

    const handleFileSelect = async (url: string) => {
        setImageUrl(url);
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
             // Revert optimistic UI update on failure
            setImageUrl(initialImageUrl);
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
                setImageUrl(result.url); // Optimistic UI update
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
        <FileManagerModal
          open={isFileManagerOpen}
          onOpenChange={setIsFileManagerOpen}
          onFileSelect={handleFileSelect}
        />
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Icon /> {title}</CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="font-semibold mb-4">Vista Previa Actual</h3>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                       {isLoading ? (
                           <Skeleton className="w-full h-full" />
                       ) : (
                           <MediaPreview src={imageUrl} />
                       )}
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Subir Nuevo Archivo</h3>
                         <Label htmlFor={`picture-${title}`} className={cn(
                             "flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50",
                             isUploading ? "cursor-wait" : "hover:bg-muted"
                         )}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-8 h-8 mb-2 text-primary animate-spin" />
                                        <p className="text-sm text-primary">Subiendo...</p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground">Haz clic para subir un archivo</p>
                                        <p className="text-xs text-muted-foreground">JPG, PNG, WEBP, GIF, WEBM, AVI</p>
                                    </>
                                )}
                            </div>
                            <Input id={`picture-${title}`} type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                        </Label>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">O</span>
                        </div>
                    </div>

                     <div>
                        <h3 className="font-semibold mb-2">Seleccionar de la Galería</h3>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setIsFileManagerOpen(true)}
                        >
                            <GalleryVertical className="mr-2 h-4 w-4" />
                            Abrir Gestor de Archivos
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
      </>
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
        loginBackgroundImageUrl: '', 
        signupBackgroundImageUrl: '', 
        forgotPasswordBackgroundImageUrl: '',
        logoLightUrl: null,
        logoDarkUrl: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchConfig = useCallback(async () => {
         setIsLoading(true);
         const result = await getAppConfig();
         if (result.success && result.data) {
             setConfig(result.data);
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
        setConfig(prevConfig => ({ ...prevConfig, [key]: value }));
        // Re-fetch to ensure sync, though optimistic update is done in child.
        // This also helps if a revalidation is needed across the app.
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
                icon={ImageIcon}
                configKey="loginBackgroundImageUrl"
                initialImageUrl={config.loginBackgroundImageUrl}
                onConfigChange={handleConfigChange}
                isLoading={isLoading}
            />

            <Separator />

            <CoverSection
                title="Portada de Olvidé Contraseña"
                description="Este fondo se mostrará en la página para restablecer la contraseña."
                icon={KeyIcon}
                configKey="forgotPasswordBackgroundImageUrl"
                initialImageUrl={config.forgotPasswordBackgroundImageUrl}
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
