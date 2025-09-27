
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Languages, Star, FolderOpen, EyeOff, Eye, ShieldAlert, File } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Email } from './email-list-item';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';

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
    if (!showImages) {
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

  const buttonClass = "size-10 rounded-lg bg-background/50 dark:bg-zinc-800/60 backdrop-blur-sm border border-primary/20 hover:bg-primary hover:text-primary-foreground";
  
  // Placeholder for BIMI logo logic
  const bimiLogoUrl = null;
  const senderInitial = email.from.charAt(0).toUpperCase();

  return (
    <>
    <main className="flex-1 flex flex-col h-screen bg-background relative">
        <header className="sticky top-0 left-0 w-full z-10 p-4">
          <div className="p-2 rounded-xl bg-card/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-border/20 flex items-center justify-between gap-4 w-full max-w-lg mx-auto">
            <div className="flex items-center gap-2">
                <Button className={buttonClass} onClick={onBack}><ArrowLeft/></Button>
                <Button className={buttonClass} onClick={() => onToggleStar(email.id)}><Star/></Button>
            </div>
            <div className="flex items-center gap-2">
                <Button className={buttonClass} onClick={() => setIsDeleting(true)}><Trash2/></Button>
                <Button className={buttonClass} onClick={() => setIsReportingSpam(true)}><ShieldAlert/></Button>
                <Button className={buttonClass}><Languages/></Button>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1">
            <div className="p-4 md:p-8 max-w-4xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold mb-4">{email.subject}</h1>
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <Avatar className="size-12 border-2 border-primary/20">
                       {bimiLogoUrl ? (
                         <Image src={bimiLogoUrl} alt={`Logo de ${email.from}`} fill className="object-contain" />
                       ) : (
                         <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
                           {senderInitial}
                         </AvatarFallback>
                       )}
                     </Avatar>
                     <div className="text-sm">
                       <p className="font-semibold text-foreground text-base">{email.from}</p>
                       <p className="text-muted-foreground">Para: <span className="text-foreground/80">ventas@mailflow.ai</span></p>
                       <p className="text-muted-foreground">{format(email.date, "d 'de' MMMM, yyyy 'a las' p", { locale: es })}</p>
                     </div>
                  </div>
                </div>
                
                 {!showImages && email.body.includes('<img') && (
                    <div className="mb-6 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-between gap-2">
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            <EyeOff className="inline-block mr-2 size-4"/>
                            Se ha bloqueado la carga de imágenes para proteger tu privacidad.
                        </p>
                        <Button size="sm" variant="outline" className="shrink-0" onClick={() => setShowImages(true)}>
                            <Eye className="mr-2 size-4"/>
                            Cargar Imágenes
                        </Button>
                    </div>
                )}
                
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

    {/* Delete Confirmation Modal */}
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
            <AlertDialogAction onClick={() => { /* Lógica de eliminación aquí */ setIsDeleting(false); onBack(); }}>
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    
    {/* Report Spam Modal */}
    <AlertDialog open={isReportingSpam} onOpenChange={setIsReportingSpam}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reportar como Spam</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Deseas mover también todos los futuros correos de <strong>{email.from}</strong> a la bandeja de spam?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, solo este correo</AlertDialogCancel>
            <AlertDialogAction>Sí, y futuros correos</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

