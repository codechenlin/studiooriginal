
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
import { ArrowLeft, Trash2, Languages, Star, FolderOpen, ShieldAlert, File, Check, X, ShieldQuestion, AlertTriangle, Tag, Bug, CheckCircle, Mail, Server } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Email } from './email-list-item';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { AntivirusStatusModal } from './antivirus-status-modal';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TagEmailModal, type AppliedTag } from './tag-email-modal';


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
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [appliedTag, setAppliedTag] = useState<AppliedTag | null>(null);
  const [isDeleteTagConfirmOpen, setIsDeleteTagConfirmOpen] = useState(false);

  if (!email) {
    return (
       <div className="w-full h-full flex flex-col items-center justify-center bg-background text-muted-foreground p-8 text-center">
            <FolderOpen className="size-16 mb-4"/>
            <h2 className="text-xl font-semibold">Selecciona un correo para leerlo</h2>
            <p>Tu correo seleccionado aparecerá aquí.</p>
        </div>
    );
  }
  
  const senderEmail = `${email.from.toLowerCase().replace(/\s+/g, '.')}@example.com`;

  const extractAttachments = (body: string): { name: string; type: string, size: string }[] => {
    const matches = [...body.matchAll(/<p[^>]*data-attachment='true'[^>]*data-filename="([^"]*)"[^>]*data-filetype="([^"]*)"[^>]*data-filesize="([^"]*)"[^>]*>/g)];
    return matches.map(match => ({ name: match[1], type: match[2], size: match[3] }));
  };

  const attachments = extractAttachments(email.body);
  const hasThreat = email.id.startsWith('threat-') || email.id.startsWith('attachment-2');


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
  
  const senderInitial = email.from.charAt(0).toUpperCase();

  const buttonClass = "size-10 rounded-lg bg-background/50 dark:bg-zinc-800/60 backdrop-blur-sm border border-border/20 hover:bg-primary hover:text-primary-foreground";
  
  const aiButtonClass = "relative size-10 rounded-lg flex items-center justify-center cursor-pointer p-0 bg-transparent before:absolute before:-inset-px before:rounded-lg before:-z-10 before:transition-all before:duration-300 before:opacity-0 hover:before:opacity-100";

  return (
    <>
      <main className="flex-1 flex flex-col h-screen bg-background relative">
          <header className="sticky top-0 left-0 w-full z-10 p-4 bg-background backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2">
                  <div className="p-2 rounded-xl bg-card/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-border/20">
                      <Button className={buttonClass} onClick={onBack}><ArrowLeft/></Button>
                  </div>
                  <div className="w-px h-8 bg-gradient-to-b from-transparent via-primary/50 to-transparent mx-2" />
                  <div className="p-2 rounded-xl bg-card/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-border/20 flex items-center justify-center gap-2">
                      <Button className={cn("size-10 rounded-lg bg-background/50 dark:bg-zinc-800/60 backdrop-blur-sm hover:bg-yellow-500/20")} onClick={() => onToggleStar(email.id)}><Star className={cn("transition-all", email.starred && "fill-yellow-400 text-yellow-400")}/></Button>
                      <Button className={cn("size-10 rounded-lg bg-background/50 dark:bg-zinc-800/60 backdrop-blur-sm text-white hover:bg-cyan-500 hover:text-white")} onClick={() => setIsTagModalOpen(true)}><Tag/></Button>
                      <Button className={cn("size-10 rounded-lg bg-background/50 dark:bg-zinc-800/60 backdrop-blur-sm text-white hover:bg-amber-500 hover:text-white")} onClick={() => setIsReportingSpam(true)}><ShieldAlert/></Button>
                      <Button 
                          className={cn("size-10 rounded-lg bg-background/50 dark:bg-zinc-800/60 backdrop-blur-sm text-white hover:bg-blue-500 hover:text-white")}
                          onClick={() => setIsAntivirusModalOpen(true)}
                      >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </Button>
                      <Button 
                        className={cn("size-10 rounded-lg bg-background/50 dark:bg-zinc-800/60 backdrop-blur-sm text-[#F00000] hover:bg-[#F00000] hover:text-white")}
                        onClick={() => setIsDeleting(true)}
                      >
                        <Trash2/>
                      </Button>
                  </div>
                  <div className="w-px h-8 bg-gradient-to-b from-transparent via-primary/50 to-transparent mx-2" />
                  <div className="p-2 rounded-xl bg-card/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-border/20 flex items-center justify-center gap-2">
                      <button className={cn(aiButtonClass, "before:bg-[conic-gradient(from_var(--angle),theme(colors.purple.500),theme(colors.blue.500),theme(colors.purple.500))] before:animate-rotating-border")}>
                          <div className="size-[calc(100%-2px)] rounded-[7px] bg-background/80 dark:bg-zinc-800/80 flex items-center justify-center">
                            <Languages className="size-5 text-primary" />
                          </div>
                      </button>
                      <button className={cn(aiButtonClass, "before:bg-[conic-gradient(from_var(--angle),theme(colors.orange.400),theme(colors.yellow.400),theme(colors.orange.400))] before:animate-rotating-border")} onClick={() => setIsConfirmImagesModalOpen(true)}>
                        <div className="size-[calc(100%-2px)] rounded-[7px] bg-background/80 dark:bg-zinc-800/80 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-5 text-amber-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.06 10.13a3.5 3.5 0 0 1 5.88 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2"/></svg>
                          </div>
                      </button>
                  </div>
              </div>
          </header>

          <ScrollArea className="flex-1">
              <div className="p-4 md:p-8 max-w-4xl mx-auto">
                  <h1 className="text-2xl md:text-3xl font-bold mb-4">{email.subject}</h1>

                  <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                          <Avatar className="size-20 border-4 border-primary/20">
                            <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
                              {senderInitial}
                              </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                              <p className="font-semibold text-foreground text-base">{email.from}</p>
                              <p className="text-muted-foreground text-sm">{`<${senderEmail}>`}</p>
                              <p className="text-muted-foreground mt-2">Para: <span className="text-foreground/80">ventas@mailflow.ai</span></p>
                              <p className="text-muted-foreground">{format(email.date, "d 'de' MMMM, yyyy 'a las' p", { locale: es })}</p>
                          </div>
                      </div>
                      {appliedTag && (
                          <div className="text-right group relative">
                              <button
                                  onClick={() => setIsTagModalOpen(true)}
                                  className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 cursor-pointer"
                                  style={{
                                  backgroundColor: appliedTag.color,
                                  color: '#ffffff',
                                  border: `1px solid rgba(255, 255, 255, 0.5)`
                                  }}
                              >
                                  <Tag className="size-4" />
                                  {appliedTag.name}
                              </button>
                              <Button
                                  size="icon"
                                  variant="destructive"
                                  className="absolute -top-2 -right-2 size-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      setIsDeleteTagConfirmOpen(true);
                                  }}
                              >
                                  <X className="size-4"/>
                              </Button>
                          </div>
                      )}
                  </div>

                  <div className="mb-6 relative overflow-hidden rounded-lg">
                      {hasThreat ? (
                          <div className="p-4 bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30 flex items-center gap-4 relative">
                              <div className="absolute inset-0 z-0 transform -scale-x-100">
                                  <svg width="100%" height="100%" preserveAspectRatio="none">
                                      <defs>
                                          <linearGradient id="threat-glow" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#F00000" /><stop offset="100%" stopColor="#ff0048" /></linearGradient>
                                      </defs>
                                      <path className="energy-path" stroke="url(#threat-glow)" strokeWidth="0.5" fill="none" d="M0 20 L200 20 L220 40 L400 40" />
                                      <path className="energy-path" style={{animationDelay: '1s'}} stroke="url(#threat-glow)" strokeWidth="0.5" fill="none" d="M0 60 L150 60 L180 30 L300 30" />
                                      <circle className="node-pulse" cx="200" cy="20" r="2" fill="url(#threat-glow)" />
                                      <circle className="node-pulse" style={{animationDelay: '0.5s'}} cx="180" cy="30" r="2" fill="url(#threat-glow)" />
                                  </svg>
                              </div>
                              <div className="relative z-10 flex items-center justify-center size-8 shrink-0">
                                  <div className="absolute w-full h-full border-2 border-dashed border-red-500 rounded-full animate-spin" style={{ animationDuration: '4s' }} />
                                  <Bug className="text-[#F00000] size-6" style={{filter: 'drop-shadow(0 0 5px #f00)'}}/>
                              </div>
                              <div className="relative z-10">
                                  <h3 className="font-bold" style={{color: '#F00000'}}>¡Amenaza Detectada!</h3>
                                  <p className="text-sm text-red-200/90">El Escudo de IA neutralizó contenido malicioso en este correo para protegerte.</p>
                              </div>
                          </div>
                      ) : (
                          <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center gap-4 relative">
                              <div className="absolute inset-0 z-0 transform -scale-x-100">
                                  <svg width="100%" height="100%" preserveAspectRatio="none">
                                      <defs>
                                          <linearGradient id="safe-glow" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#00CB07" /><stop offset="100%" stopColor="#00F508" /></linearGradient>
                                      </defs>
                                      <path className="energy-path" stroke="url(#safe-glow)" strokeWidth="0.5" fill="none" d="M0 40 L180 40 L200 60 L350 60" />
                                      <path className="energy-path" style={{animationDelay: '1.5s'}} stroke="url(#safe-glow)" strokeWidth="0.5" fill="none" d="M0 10 L120 10 L140 30 L250 30" />
                                      <circle className="node-pulse" cx="180" cy="40" r="2" fill="url(#safe-glow)" />
                                      <circle className="node-pulse" style={{animationDelay: '1s'}} cx="140" cy="30" r="2" fill="url(#safe-glow)" />
                                  </svg>
                              </div>
                              <div className="relative z-10 flex items-center justify-center size-8 shrink-0">
                                  <div className="absolute w-full h-full border-2 border-dashed border-green-400 rounded-full animate-spin" style={{ animationDuration: '4s' }} />
                                  <CheckCircle className="relative size-6 text-green-400" />
                              </div>
                              <div className="relative z-10">
                                  <h3 className="font-bold text-green-300">Correo Verificado y Seguro</h3>
                                  <p className="text-sm text-green-200/90">Nuestro Escudo de IA ha analizado este correo y no ha encontrado amenazas.</p>
                              </div>
                          </div>
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
      <AntivirusStatusModal isOpen={isAntivirusModalOpen} onOpenChange={setIsAntivirusModalOpen} />
      <TagEmailModal 
        isOpen={isTagModalOpen} 
        onOpenChange={setIsTagModalOpen} 
        onSave={setAppliedTag}
        initialTag={appliedTag}
        senderEmail={senderEmail}
      />

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>¿Confirmas la eliminación?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El correo se eliminará permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => { setIsDeleting(false); onBack(); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Sí, eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteTagConfirmOpen} onOpenChange={setIsDeleteTagConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>¿Eliminar Etiqueta?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que quieres quitar la etiqueta &quot;{appliedTag?.name}&quot; de este correo?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => { setAppliedTag(null); setIsDeleteTagConfirmOpen(false); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Sí, quitar etiqueta
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isReportingSpam} onOpenChange={setIsReportingSpam}>
        <DialogContent className="sm:max-w-3xl bg-zinc-900/90 backdrop-blur-xl border border-amber-400/20 text-white overflow-hidden" showCloseButton={false}>
          <div className="absolute inset-0 z-0 opacity-10 bg-grid-amber-500/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-amber-500/10 rounded-full animate-pulse-slow filter blur-3xl -translate-x-1/2 -translate-y-1/2"/>
          <DialogHeader className="p-6 pb-0 z-10">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="relative size-8 flex items-center justify-center">
                  <div className="absolute w-full h-full border-2 border-dashed border-amber-400 rounded-full animate-spin" style={{ animationDuration: '4s' }}/>
                  <ShieldAlert className="text-amber-400 size-6" />
              </div>
              Reportar Correo como Spam
            </DialogTitle>
             <DialogDescription className="text-amber-100/70 pt-2">
                ¿Deseas mover este correo a la bandeja de spam o todos los futuros correos de <strong>{email.from}</strong> a la bandeja de spam?
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 z-10">
            {/* Card 1: Report this email */}
            <div className="group relative p-0.5 rounded-xl bg-transparent overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#E18700]/50 to-transparent transition-all duration-500 ease-in-out transform -translate-x-full group-hover:translate-x-full w-1/2 h-full opacity-50 blur-xl" />
                <button className="relative w-full h-full p-6 bg-zinc-900/80 rounded-lg border border-amber-400/30 text-left transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-amber-500/10 border border-amber-400/20"><Mail className="size-5 text-amber-400"/></div>
                        <h3 className="text-base font-semibold text-amber-300">Reportar solo este correo</h3>
                    </div>
                    <p className="text-xs text-muted-foreground font-normal whitespace-normal">Mueve este mensaje a la bandeja de spam. No afectará a futuros correos del mismo remitente.</p>
                </button>
            </div>
            {/* Card 2: Block all */}
            <div className="group relative p-0.5 rounded-xl bg-transparent overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F00000]/50 to-transparent transition-all duration-500 ease-in-out transform translate-x-full group-hover:-translate-x-full w-1/2 h-full opacity-50 blur-xl" />
                <button className="relative w-full h-full p-6 bg-zinc-900/80 rounded-lg border border-red-500/30 text-left transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-red-500/10 border border-red-500/20"><Server className="size-5 text-red-500"/></div>
                        <h3 className="text-base font-semibold text-red-400">Bloquear y reportar todo</h3>
                    </div>
                    <p className="text-xs text-muted-foreground font-normal whitespace-normal">Mueve este mensaje y todos los futuros correos de <strong>{email.from}</strong> a la bandeja de spam.</p>
                </button>
            </div>
          </div>
          <DialogFooter className="p-6 pt-0 z-10">
            <Button variant="outline" className="border-white text-white bg-transparent hover:bg-[#F00000] hover:border-[#F00000] hover:text-white" onClick={() => setIsReportingSpam(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={isConfirmImagesModalOpen} onOpenChange={setIsConfirmImagesModalOpen}>
          <DialogContent className="sm:max-w-xl bg-zinc-900/80 backdrop-blur-xl border border-amber-400/20 text-white overflow-hidden" showCloseButton={false}>
              <div className="absolute inset-0 z-0 opacity-10 bg-grid-amber-500/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
              <DialogHeader className="z-10">
                  <DialogTitle className="flex items-center gap-3 text-2xl text-amber-300">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.06 10.13a3.5 3.5 0 0 1 5.88 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2"/></svg>
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
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="m13.5 10.5-.5-1.5-1-1.5-1 1.5-.5 1.5 1.5.5L12 12l.5.5-1.5.5z" fill="currentColor"/></svg>
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
