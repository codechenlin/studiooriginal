
"use client";

import React, { useState } from 'react';
import { MailCheck, Database, Search, Tag, Square, RefreshCw, ChevronLeft, ChevronRight, Star, Shield, ShieldAlert, ShieldHalf, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { SecuritySettingsModal } from '@/components/dashboard/inbox/security-settings-modal';
import { SpamFilterSettingsModal } from '@/components/dashboard/inbox/spam-filter-settings-modal';
import { EmailListItem, type Email } from '@/components/dashboard/inbox/email-list-item';
import { EmailView } from '@/components/dashboard/inbox/email-view';
import { AntivirusStatusModal } from '@/components/dashboard/inbox/antivirus-status-modal';

const initialEmails: Email[] = [
    {
      id: '1',
      from: 'Elena Rodriguez',
      subject: '¡Bienvenido a Mailflow AI!',
      body: 'Hola, estamos encantados de tenerte a bordo. Prepárate para llevar tu marketing por correo electrónico al siguiente nivel. <br><br> <img src="https://picsum.photos/seed/welcome/600/300" data-ai-hint="welcome party" alt="Bienvenida" />',
      snippet: 'Prepárate para llevar tu marketing...',
      date: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
      starred: true,
    },
    {
      id: 'threat-1',
      from: 'Marketing Agresivo',
      subject: '¡Oferta que no puedes rechazar! 90% de descuento',
      body: `
        <div class='p-4 mb-4 rounded-lg bg-destructive/10 border border-destructive/20'>
          <h3 class='font-bold text-destructive flex items-center gap-2'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>¡Peligro! Se detectaron múltiples amenazas</h3>
          <p class='text-sm text-destructive/90 mt-2'>Nuestro sistema de antivirus ha identificado y neutralizado varias amenazas de seguridad en este correo electrónico.</p>
        </div>
        <ul class='list-disc pl-5 space-y-3 text-sm'>
          <li><strong class='text-destructive'>Enlace de Phishing:</strong> Se detectó un intento de redirigirte a un sitio web fraudulento.</li>
          <li><strong class='text-destructive'>Script Malicioso:</strong> Un script oculto intentó ejecutarse para comprometer tus datos.</li>
          <li><strong class='text-destructive'>Rastreador de Píxel:</strong> Se bloqueó un píxel de seguimiento invisible que monitoreaba tu actividad.</li>
          <li><strong class='text-destructive'>Contenido Engañoso:</strong> El cuerpo del correo contiene tácticas de ingeniería social.</li>
          <li><strong class='text-destructive'>Falsificación de Remitente:</strong> El remitente podría no ser quien dice ser.</li>
        </ul>
        <br><br>El contenido original ha sido bloqueado para tu seguridad.
      `,
      snippet: '¡Peligro! Se detectaron múltiples amenazas...',
      date: new Date(Date.now() - 1000 * 60 * 20),
      read: false,
      starred: false,
    },
    {
      id: 'attachment-2',
      from: 'Contabilidad Urgente',
      subject: 'Factura Pendiente: Acción Requerida',
      body: `
        <div class='p-4 mb-4 rounded-lg bg-destructive/10 border border-destructive/20'>
          <h3 class='font-bold text-destructive flex items-center gap-2'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-virus"><path d="M15 12c-2.33 2.33-2.33 6.14 0 8.47l-1.06-1.06C13.06 18.53 12 17.47 12 16s1.06-2.53 1.94-3.41L15 12z"/><path d="M9 12c2.33 2.33 2.33 6.14 0 8.47l1.06-1.06C10.94 18.53 12 17.47 12 16s-1.06-2.53-1.94-3.41L9 12z"/><path d="M12 15c-2.33-2.33-6.14-2.33-8.47 0l1.06 1.06C5.47 17.06 6.53 18 8 18s2.53-1.06 3.41-1.94L12 15z"/><path d="M12 9c-2.33-2.33-6.14-2.33-8.47 0l1.06 1.06C5.47 10.94 6.53 12 8 12s2.53-1.06 3.41-1.94L12 9z"/><path d="M12 15c2.33 2.33 6.14 2.33 8.47 0l-1.06-1.06C18.53 13.06 17.47 12 16 12s-2.53 1.06-3.41 1.94L12 15z"/><path d="M12 9c2.33 2.33 6.14 2.33 8.47 0l-1.06-1.06C18.53 7.06 17.47 6 16 6s-2.53 1.06-3.41 1.94L12 9z"/><path d="M15 12c2.33-2.33 2.33-6.14 0-8.47l-1.06 1.06C13.06 5.47 12 6.53 12 8s1.06 2.53 1.94 3.41L15 12z"/><path d="M9 12c-2.33-2.33-2.33-6.14 0-8.47l1.06 1.06C10.94 5.47 12 6.53 12 8s-1.06 2.53-1.94 3.41L9 12z"/></svg>¡Amenaza Contenida!</h3>
          <p class='text-sm text-destructive/90 mt-2'>Se detectó y eliminó un archivo adjunto malicioso (<strong class='font-bold'>factura_final.zip</strong>) que contenía un troyano. El archivo ha sido eliminado permanentemente para proteger tu sistema.</p>
        </div>
        <p>Por favor, revisa los archivos adjuntos seguros.</p>
        <br>
        <!-- Clean files -->
        <p data-attachment='true' data-filename='Detalles_Servicio.pdf' data-filetype='PDF' data-filesize='1.2 MB' data-scan-result='clean'>Attachment</p>
        <p data-attachment='true' data-filename='logo_cliente.png' data-filetype='PNG' data-filesize='85 KB' data-scan-result='clean'>Attachment</p>
        <p data-attachment='true' data-filename='contrato.docx' data-filetype='DOCX' data-filesize='256 KB' data-scan-result='clean'>Attachment</p>
      `,
      snippet: 'Se detectó y eliminó un archivo adjunto malicioso...',
      date: new Date(Date.now() - 1000 * 60 * 45),
      read: true,
      starred: false,
    },
     {
      id: 'attachment-1',
      from: 'Equipo de Diseño',
      subject: 'Revisión de Propuesta de Diseño v3',
      body: `
        <p>Hola equipo,</p>
        <p>Adjunto la última versión de la propuesta de diseño para el proyecto "Zenith". Por favor, revisen los mockups y el esquema de la marca.</p>
        <br>
        <p data-attachment='true' data-filename='Propuesta_Zenith_v3.pdf' data-filetype='PDF' data-filesize='2.4 MB' data-scan-result='clean'>Attachment</p>
        <p data-attachment='true' data-filename='Esquema_Marca.png' data-filetype='PNG' data-filesize='620 KB' data-scan-result='clean'>Attachment</p>
      `,
      snippet: 'Adjunto la última versión de la propuesta de diseño...',
      date: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
      read: true,
      starred: false,
    },
    {
      id: '2',
      from: 'Notificaciones de la Plataforma',
      subject: 'Actualización de Seguridad Importante',
      body: 'Hemos actualizado nuestros protocolos de seguridad. No se requiere ninguna acción por tu parte, pero te recomendamos revisar la nueva configuración de privacidad.',
      snippet: 'Hemos actualizado nuestros protocolos...',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      starred: false,
    },
    {
      id: '3',
      from: 'Equipo de Soporte',
      subject: 'Re: Tu consulta sobre la API',
      body: 'Hola, hemos recibido tu consulta sobre la integración de la API. Nuestro equipo la está revisando y te responderá en las próximas 24 horas. ¡Gracias por tu paciencia!',
      snippet: 'Hemos recibido tu consulta...',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
      starred: true,
    },
    {
      id: '4',
      from: 'Análisis Semanal',
      subject: '📈 Tu informe de rendimiento de la campaña está listo',
      body: '¡Buenas noticias! Tu última campaña "Lanzamiento de Verano" superó las expectativas con una tasa de apertura del 35%. <br><br> <img src="https://picsum.photos/seed/analytics/600/300" data-ai-hint="data analytics" alt="Gráficos" />',
      snippet: '¡Buenas noticias! Tu última campaña...',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      read: true,
      starred: false,
    },
];

export default function MainInboxPage() {
  const [emails, setEmails] = useState(initialEmails);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isSpamFilterModalOpen, setIsSpamFilterModalOpen] = useState(false);
  const [isAntivirusModalOpen, setIsAntivirusModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showStarred, setShowStarred] = useState(false);

  const handleSelectEmail = (email: Email) => {
    // Mark email as read when selected
    const updatedEmail = { ...email, read: true };
    const emailIndex = emails.findIndex(e => e.id === email.id);
    if(emailIndex !== -1) {
        const newEmails = [...emails];
        newEmails[emailIndex] = updatedEmail;
        setEmails(newEmails);
    }
    setSelectedEmail(updatedEmail);
  };
  
  const handleBackToList = () => {
      setSelectedEmail(null);
  }

  const handleToggleStar = (emailId: string) => {
    setEmails(currentEmails => 
        currentEmails.map(email => 
            email.id === emailId ? { ...email, starred: !email.starred } : email
        )
    );
  };

  const displayedEmails = showStarred ? emails.filter(email => email.starred) : emails;


  if (selectedEmail) {
      return <EmailView email={selectedEmail} onBack={handleBackToList} onToggleStar={handleToggleStar} />
  }

  return (
    <>
      <main className="flex-1 p-4 md:p-8 bg-background relative overflow-hidden">
        {/* Background Animation */}
        <div 
          className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,white_40%,transparent_100%)]"
        />

        <div className="relative z-10">
          <header className="mb-8">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent flex items-center gap-3">
                  <MailCheck className="size-8"/>
                  Buzón Principal
                </h1>
                <div className="relative flex items-center justify-center size-8 ml-2">
                    <Database className="text-primary/70 size-7" />
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                </div>
              </div>
            <p className="text-muted-foreground mt-1">
              Aquí recibirás todos tus correos importantes y comunicaciones generales.
            </p>
          </header>

           <Card className={cn(
            "bg-card/80 backdrop-blur-sm shadow-lg mb-2 relative overflow-hidden",
            "dark:border-border/50 border-transparent",
            "dark:from-primary/10 dark:to-accent/10",
            "bg-gradient-to-r from-purple-100 to-cyan-100"
          )}>
            <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Select defaultValue="domain1">
                  <SelectTrigger className="w-full sm:w-[200px] bg-background/70 dark:border-border/50 border-primary/30">
                    <div className="flex items-center gap-2">
                      <Database className="size-4" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domain1">ejemplo.com</SelectItem>
                    <SelectItem value="domain2">mi-negocio.co</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[220px] bg-background/70 dark:border-border/50 border-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las direcciones</SelectItem>
                    <SelectItem value="address1">ventas@ejemplo.com</SelectItem>
                    <SelectItem value="address2">soporte@ejemplo.com</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Buscar en el buzón principal..." className="pl-10 bg-background/70 dark:border-border/50 border-primary/30" />
              </div>
              <Button variant="outline" className="w-full md:w-auto bg-background/70 dark:border-border/50 border-primary/30 hover:bg-cyan-500 hover:text-white">
                  <Tag className="mr-2 size-4" />
                  Etiquetas
              </Button>
            </CardContent>
          </Card>
          
          <Card className={cn(
            "bg-card/80 backdrop-blur-sm shadow-lg mb-6 relative overflow-hidden",
            "bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10"
          )}>
              <CardContent className="p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="hover:bg-primary/20"><Square/></Button>
                      <Separator orientation="vertical" className="h-6" />
                      <Button variant="ghost" size="icon" className="hover:bg-primary/20"><RefreshCw/></Button>
                      <Button variant="ghost" size="icon" onClick={() => setShowStarred(!showStarred)} className="hover:bg-yellow-500/20 border-2 dark:border-white border-black hover:border-yellow-500/50 text-yellow-500"><Star/></Button>
                       <div className="flex items-center gap-2">
                          <div className={cn(
                              "w-3 h-3 rounded-full transition-all duration-300",
                              showStarred ? "bg-lime-400 shadow-[0_0_8px_#a3e635]" : "bg-yellow-500/50"
                          )}>
                              <div className={cn("w-full h-full rounded-full", showStarred && "animate-pulse bg-lime-400")}></div>
                          </div>
                          {showStarred && <span className="text-xs font-medium text-lime-300 animate-pulse">Mostrando correos importantes</span>}
                       </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm font-mono p-2 rounded-md bg-black/10">
                          <span className="text-muted-foreground">1-50 de</span>
                          <span className="font-bold text-foreground">12,345</span>
                      </div>
                      <div className="flex items-center">
                          <Button variant="ghost" size="icon" className="hover:bg-primary/20"><ChevronLeft/></Button>
                          <Button variant="ghost" size="icon" className="hover:bg-primary/20"><ChevronRight/></Button>
                      </div>
                      <Separator orientation="vertical" className="h-6" />
                      <Button variant="ghost" size="icon" className="hover:bg-green-500/20 border-2 border-transparent hover:border-green-500/50 text-green-500" onClick={() => setIsSecurityModalOpen(true)}><ShieldHalf /></Button>
                      <Button variant="ghost" size="icon" className="hover:bg-amber-500/20 border-2 border-transparent hover:border-amber-500/50 text-amber-500" onClick={() => setIsSpamFilterModalOpen(true)}><Filter /></Button>
                      <Button variant="ghost" size="icon" className="hover:bg-blue-500/20 border-2 border-transparent hover:border-blue-500/50 text-blue-500" onClick={() => setIsAntivirusModalOpen(true)}><Shield /></Button>
                  </div>
              </CardContent>
          </Card>
          
          <div className="bg-card/60 backdrop-blur-sm border dark:border-border/50 border-border/20 rounded-lg shadow-lg">
            {displayedEmails.map((email, index) => (
                <EmailListItem key={email.id} email={email} onSelect={handleSelectEmail} isFirst={index === 0} isLast={index === displayedEmails.length - 1} onToggleStar={handleToggleStar} />
            ))}
          </div>
        </div>
      </main>
      <SecuritySettingsModal isOpen={isSecurityModalOpen} onOpenChange={setIsSecurityModalOpen} />
      <SpamFilterSettingsModal isOpen={isSpamFilterModalOpen} onOpenChange={setIsSpamFilterModalOpen} />
      <AntivirusStatusModal isOpen={isAntivirusModalOpen} onOpenChange={setIsAntivirusModalOpen} />
    </>
  );
}

    