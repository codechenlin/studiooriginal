
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, AlertTriangle, Languages, Star, FolderOpen, EyeOff, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Email } from './email-list-item';
import { cn } from '@/lib/utils';

interface EmailViewProps {
  email: Email | null;
  onBack: () => void;
}

export function EmailView({ email, onBack }: EmailViewProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReportingSpam, setIsReportingSpam] = useState(false);
  const [showImages, setShowImages] = useState(false);

  if (!email) {
    return (
       <div className="w-full h-full flex flex-col items-center justify-center bg-background text-muted-foreground p-8 text-center">
            <FolderOpen className="size-16 mb-4"/>
            <h2 className="text-xl font-semibold">Selecciona un correo para leerlo</h2>
            <p>Tu correo seleccionado aparecerá aquí.</p>
        </div>
    );
  }

  const sanitizedBody = showImages
    ? email.body
    : email.body.replace(/<img[^>]*>/g, (match) => {
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

  const buttonClass = "size-10 rounded-lg bg-card/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-border/20 hover:bg-primary hover:text-primary-foreground";

  return (
    <>
    <main className="flex-1 flex flex-col h-screen bg-background relative">
        <header className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-lg z-10">
          <div className="p-2 rounded-xl bg-card/60 dark:bg-zinc-800/80 backdrop-blur-sm border border-border/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button className={buttonClass} onClick={onBack}><ArrowLeft/></Button>
                <Button className={buttonClass} onClick={() => setIsDeleting(true)}><Trash2/></Button>
                <Button className={buttonClass}><Star/></Button>
            </div>
            <div className="flex items-center gap-2">
                <Button className={buttonClass} onClick={() => setIsReportingSpam(true)}><AlertTriangle/></Button>
                <Button className={buttonClass}><Languages/></Button>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1">
            <div className="p-4 md:p-8 max-w-4xl mx-auto pt-24">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{email.subject}</h1>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                    <p>De: <span className="font-medium text-foreground">{email.from}</span></p>
                    <p>{format(email.date, "d 'de' MMMM, yyyy 'a las' p", { locale: es })}</p>
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
