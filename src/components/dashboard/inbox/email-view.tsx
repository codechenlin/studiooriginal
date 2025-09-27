
"use client";

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Languages, Star, FolderOpen, Eye, ShieldAlert, File, Check, X, Wand2, ShieldQuestion, ShieldOff, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Email } from './email-list-item';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { SecuritySettingsModal } from './security-settings-modal';
import { AntivirusInfoModal } from './antivirus-info-modal';
import { cn } from '@/lib/utils';


interface EmailViewProps {
  email: Email | null;
  onBack: () => void;
  onToggleStar: (emailId: string) => void;
}

export function EmailView({ email, onBack, onToggleStar }: EmailViewProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReportingSpam, setIsReportingSpam] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const { toast } = useToast();
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isConfirmImagesModalOpen, setIsConfirmImagesModalOpen] = useState(false);
  const [isPrivacyFeatureEnabled, setIsPrivacyFeatureEnabled] = useState(true);
  const [isAntivirusModalOpen, setIsAntivirusModalOpen] = useState(false);

  if (!email) {
    return (
       <div className="w-full h-full flex flex-col items-center justify-center bg-background text-muted-foreground p-8 text-center">
            <FolderOpen className="size-16 mb-4"/>
            <h2 className="text-xl font-semibold">Selecciona un correo para leerlo</h2>
            <p>Tu correo seleccionado aparecerá aquí.</p>
        </div>
    );
  }
  
  const extractAttachments = (body: string): { name: string; type: string, size: string }[] => {
    const matches = [...body.matchAll(/<p[^>]*data-attachment='true'[^>]*data-filename="([^"]*)"[^>]*data-filetype="([^"]*)"[^>]*data-filesize="([^"]*)"[^>]*>/g)];
    return matches.map(match => ({ name: match[1], type: match[2], size: match[3] }));
  };

  const attachments = extractAttachments(email.body);

  const sanitizedBodyForDisplay = (body: string) => {
    let processedBody = body.replace(/<p[^>]*data-attachment='true'[^>]*>Attachment<\/p>/g, '');
    if (!showImages && isPrivacyFeatureEnabled) {
        processedBody = processedBody.replace(/<img[^>]*>/g, (match) => {
            const alt = match.match(/alt="([^"]*)"/)?.[1] || 'Imagen bloqueada';
            const aiHint = match.match(/data-ai-hint="([^"]*)"/)?.[1] || 'image';
            return `
              <div class="my-4 p-4 rounded-lg bg-muted/50 border border-dashed flex items-center gap-4 text-sm text-muted-foreground">
                <div class="p-3 bg-background rounded-full border">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-off"><path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m2 2 20 20"/></svg>
                </div>
                <div>
                  <p class="font-semibold text-foreground">Contenido externo bloqueado</p>
                  <p>Esta imagen (${alt}) fue bloqueada para proteger tu privacidad.</p>
                  <p class="text-xs font-mono text-muted-foreground/70" >AI Hint: ${aiHint}</p>
                </div>
              </div>
            `;
        });
    }
    return processedBody;
  }
  
  const sanitizedBody = sanitizedBodyForDisplay(email.body);

  const buttonClass = "size-10 rounded-lg bg-background/50 dark:bg-zinc-800/60 backdrop-blur-sm border border-border/20 hover:bg-primary hover:text-primary-foreground";
  
  const senderInitial = email.from.charAt(0).toUpperCase();

  return (
    <>
    <main className="flex-1 flex flex-col h-screen bg-background relative">
        <header className="sticky top-0 left-0 w-full z-10 p-4 bg-background">
             <div className="flex items-center justify-center gap-2">
                <div className="p-2 rounded-xl bg-card/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-border/20">
                     <Button className={buttonClass} onClick={onBack}><ArrowLeft/></Button>
                </div>
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-primary/50 to-transparent mx-2" />
                <div className="p-2 rounded-xl bg-card/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-border/20 flex items-center justify-center gap-2">
                    <Button className={buttonClass} onClick={() => onToggleStar(email.id)}><Star className={cn(email.starred && "fill-yellow-400 text-yellow-400")}/></Button>
                    <Button className={cn(buttonClass, "border-transparent text-white hover:bg-amber-500 hover:text-white")} onClick={() => setIsReportingSpam(true)}><ShieldAlert/></Button>
                    <Button className={cn(buttonClass, "border-transparent text-white hover:bg-blue-500 hover:text-white")} onClick={() => setIsAntivirusModalOpen(true)}><Shield /></Button>
                    <Button 
                      className={cn(buttonClass, "border-[#F00000]/80 text-[#F00000] hover:bg-[#F00000] hover:text-white")}
                      onClick={() => setIsDeleting(true)}
                    >
                      <Trash2/>
                    </Button>
                </div>
             </div>
        </header>

        <ScrollArea className="flex-1">
            <div className="p-4 md:p-8 max-w-4xl mx-auto">
                 <h1 className="text-2xl md:text-3xl font-bold mb-4">{email.subject}</h1>

                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Avatar className="size-16 border-2 border-primary/20">
                           <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
                            {senderInitial}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                            <p className="font-semibold text-foreground text-base">{email.from}</p>
                            <p className="text-muted-foreground text-sm">{`<${email.from.toLowerCase().replace(/\s+/g, '.')}@example.com>`}</p>
                            <p className="text-muted-foreground mt-2">Para: <span className="text-foreground/80">ventas@mailflow.ai</span></p>
                            <p className="text-muted-foreground">{format(email.date, "d 'de' MMMM, yyyy 'a las' p", { locale: es })}</p>
                        </div>
                    </div>
                </div>

                <div className="my-6 flex flex-col sm:flex-row items-center gap-4">
                  <Button variant="outline" className="w-full sm:w-auto text-base py-6 px-6 border-2 border-transparent hover:bg-transparent flex-1 group relative overflow-hidden hover-border-gradient-primary">
                      <Wand2 className="mr-2 text-primary transition-transform group-hover:scale-110"/>
                      Traducir Mensaje
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
                  </Button>
                  
                  {isPrivacyFeatureEnabled ? (
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto text-base py-6 px-6 border-2 border-transparent hover:bg-transparent flex-1 group relative overflow-hidden hover-border-gradient-accent"
                        onClick={() => setIsConfirmImagesModalOpen(true)}
                      >
                          <Eye className="mr-2 text-amber-500 transition-transform group-hover:scale-110"/>
                          Mostrar Imágenes
                          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
                      </Button>
                  ) : (
                       <Button
                        variant="outline"
                        className="w-full sm:w-auto text-base py-6 px-6 border-2 border-transparent hover:bg-transparent flex-1 group relative overflow-hidden hover-border-gradient-primary"
                        onClick={() => setIsPrivacyModalOpen(true)}
                      >
                          <ShieldOff className="mr-2 text-green-500 transition-transform group-hover:scale-110"/>
                          Activar Privacidad
                          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-green-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
                      </Button>
                  )}
                </div>
                
                <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizedBody }}
                />
                 {attachments.length > 0 && (
                    <>
                        <Separator className="my-6" />
                        <div className="space-y-4">
                             <h3 className="font-semibold text-lg flex items-center gap-2">
                                <File className="text-primary"/>
                                Archivos Adjuntos ({attachments.length})
                            </h3>
                            <div className="p-4 border rounded-lg bg-muted/30 space-y-2">
                                {attachments.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-black/10">
                                        <div>
                                            <p className="font-medium text-sm">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">{file.type} - {file.size}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </ScrollArea>
    </main>

    {/* Modals */}
    <AntivirusInfoModal isOpen={isAntivirusModalOpen} onOpenChange={setIsAntivirusModalOpen} />

    <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El correo se eliminará permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setIsDeleting(false); onBack(); }}>
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    
    <AlertDialog open={isReportingSpam} onOpenChange={setIsReportingSpam}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reportar como Spam</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Deseas mover este correo a la bandeja de spam o todos los futuros correos de <strong>{email.from}</strong> a la bandeja de spam?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction>Mover solo este correo</AlertDialogAction>
          <AlertDialogAction>Mover todo lo de este remitente</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>


    <Dialog open={isConfirmImagesModalOpen} onOpenChange={setIsConfirmImagesModalOpen}>
        <DialogContent className="sm:max-w-xl bg-zinc-900/80 backdrop-blur-xl border border-amber-400/20 text-white overflow-hidden" showCloseButton={false}>
            <div className="absolute inset-0 z-0 opacity-10 bg-grid-amber-500/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
            <DialogHeader className="z-10">
                <DialogTitle className="flex items-center gap-3 text-2xl text-amber-300">
                    <ShieldQuestion className="size-8"/>
                    Confirmar Visualización de Imágenes
                </DialogTitle>
                <DialogDescription className="text-amber-100/70 pt-2">
                    Mostrar imágenes de este remitente podría revelar información a servidores externos.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 z-10 text-amber-100/90 text-sm space-y-3">
                <p>Al cargar contenido externo (como imágenes), el remitente puede saber que abriste el correo y podría recopilar datos como:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Tu dirección IP (ubicación aproximada)</li>
                    <li>Tipo de dispositivo y cliente de correo que usas</li>
                    <li>Si y cuándo abriste el correo</li>
                </ul>
                <p className="font-semibold pt-2">¿Confías en <strong className="text-white">{email.from}</strong> y deseas mostrar las imágenes para este correo?</p>
            </div>
            <DialogFooter className="z-10 pt-4 flex justify-between w-full">
                <Button variant="ghost" className="hover:text-white" onClick={() => setIsConfirmImagesModalOpen(false)}><X className="mr-2"/>Cancelar</Button>
                <Button
                    className="bg-amber-600 text-white hover:bg-amber-500"
                    onClick={() => {
                        setShowImages(true);
                        setIsConfirmImagesModalOpen(false);
                        toast({ title: 'Imágenes habilitadas', description: 'Se ha cargado el contenido externo para este correo.' });
                    }}
                >
                    <Check className="mr-2"/>Sí, mostrar imágenes
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isPrivacyModalOpen} onOpenChange={setIsPrivacyModalOpen}>
        <DialogContent className="sm:max-w-xl bg-zinc-900/80 backdrop-blur-xl border border-green-400/20 text-white overflow-hidden" showCloseButton={false}>
             <div className="absolute inset-0 z-0 opacity-10 bg-grid-green-500/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
            <DialogHeader className="z-10">
                <DialogTitle className="flex items-center gap-3 text-2xl text-green-300">
                    <ShieldOff className="size-8"/>
                    Activar Protección de Privacidad
                </DialogTitle>
                <DialogDescription className="text-green-100/70 pt-2">
                    Habilita el bloqueo de imágenes y rastreadores para los correos de este remitente.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 z-10 text-green-100/90 text-sm">
                <p>¿Deseas activar la función de privacidad para todos los correos futuros de <strong className="text-white">{email.from}</strong>? Esto bloqueará automáticamente la carga de imágenes y otros contenidos externos para proteger tu información.</p>
            </div>
             <DialogFooter className="z-10 pt-4 flex justify-between w-full">
                <div className="flex-1">
                    <Button variant="link" className="text-cyan-300" onClick={() => {
                        setIsPrivacyModalOpen(false);
                        // Future: open advanced settings modal
                    }}>Configuración Avanzada</Button>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" className="hover:text-white" onClick={() => setIsPrivacyModalOpen(false)}><X className="mr-2"/>Cancelar</Button>
                    <Button
                        className="bg-green-600 text-white hover:bg-green-500"
                        onClick={() => {
                            setIsPrivacyFeatureEnabled(true);
                            setIsPrivacyModalOpen(false);
                            toast({ title: 'Privacidad Activada', description: `Se bloquearán las imágenes para ${email.from}.` });
                        }}
                    >
                        <Check className="mr-2"/>Sí, activar
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    </>
  );
}
