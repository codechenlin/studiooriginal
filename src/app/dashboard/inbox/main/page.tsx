
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

const mockEmails: Email[] = [
    {
      id: '1',
      from: 'Elena Rodriguez',
      subject: '¡Bienvenido a Mailflow AI!',
      body: 'Hola, estamos encantados de tenerte a bordo. Prepárate para llevar tu marketing por correo electrónico al siguiente nivel. <br><br> <img src="https://picsum.photos/seed/welcome/600/300" data-ai-hint="welcome party" alt="Bienvenida" />',
      snippet: 'Prepárate para llevar tu marketing...',
      date: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
    },
    {
      id: '2',
      from: 'Notificaciones de la Plataforma',
      subject: 'Actualización de Seguridad Importante',
      body: 'Hemos actualizado nuestros protocolos de seguridad. No se requiere ninguna acción por tu parte, pero te recomendamos revisar la nueva configuración de privacidad.',
      snippet: 'Hemos actualizado nuestros protocolos...',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
    },
    {
      id: '3',
      from: 'Equipo de Soporte',
      subject: 'Re: Tu consulta sobre la API',
      body: 'Hola, hemos recibido tu consulta sobre la integración de la API. Nuestro equipo la está revisando y te responderá en las próximas 24 horas. ¡Gracias por tu paciencia!',
      snippet: 'Hemos recibido tu consulta...',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
    },
    {
      id: '4',
      from: 'Análisis Semanal',
      subject: '📈 Tu informe de rendimiento de la campaña está listo',
      body: '¡Buenas noticias! Tu última campaña "Lanzamiento de Verano" superó las expectativas con una tasa de apertura del 35%. <br><br> <img src="https://picsum.photos/seed/analytics/600/300" data-ai-hint="data analytics" alt="Gráficos" />',
      snippet: '¡Buenas noticias! Tu última campaña...',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      read: true,
    },
];

export default function MainInboxPage() {
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isSpamFilterModalOpen, setIsSpamFilterModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const handleSelectEmail = (email: Email) => {
    // Mark email as read when selected
    const updatedEmail = { ...email, read: true };
    const emailIndex = mockEmails.findIndex(e => e.id === email.id);
    if(emailIndex !== -1) {
        mockEmails[emailIndex] = updatedEmail;
    }
    setSelectedEmail(updatedEmail);
  };
  
  const handleBackToList = () => {
      setSelectedEmail(null);
  }

  if (selectedEmail) {
      return <EmailView email={selectedEmail} onBack={handleBackToList} />
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
                      <Button variant="ghost" size="icon" className="hover:bg-yellow-500/20 border-2 border-transparent hover:border-yellow-500/50 text-yellow-500"><Star/></Button>
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
                      <Button variant="ghost" size="icon" className="hover:bg-green-500/20 border-2 border-transparent hover:border-green-500/50 text-green-500"><ShieldHalf /></Button>
                      <Button variant="ghost" size="icon" className="hover:bg-amber-500/20 border-2 border-transparent hover:border-amber-500/50 text-amber-500" onClick={() => setIsSpamFilterModalOpen(true)}><ShieldAlert /></Button>
                      <Button variant="ghost" size="icon" className="hover:bg-blue-500/20 border-2 border-transparent hover:border-blue-500/50 text-blue-500" onClick={() => setIsSecurityModalOpen(true)}><Shield /></Button>
                  </div>
              </CardContent>
          </Card>
          
          <div className="bg-card/60 backdrop-blur-sm border dark:border-border/50 border-border/20 rounded-lg shadow-lg">
            {mockEmails.map((email, index) => (
                <EmailListItem key={email.id} email={email} onSelect={handleSelectEmail} isFirst={index === 0} isLast={index === mockEmails.length - 1} />
            ))}
          </div>
        </div>
      </main>
      <SecuritySettingsModal isOpen={isSecurityModalOpen} onOpenChange={setIsSecurityModalOpen} />
      <SpamFilterSettingsModal isOpen={isSpamFilterModalOpen} onOpenChange={setIsSpamFilterModalOpen} />
    </>
  );
}
