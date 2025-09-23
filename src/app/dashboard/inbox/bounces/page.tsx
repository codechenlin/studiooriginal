
"use client";

import React, { useState } from 'react';
import { ShieldAlert, Database, Search, Tag, Square, RefreshCw, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SecuritySettingsModal } from '@/components/dashboard/inbox/security-settings-modal';
import { EmailListItem, type Email } from '@/components/dashboard/inbox/email-list-item';
import { EmailView } from '@/components/dashboard/inbox/email-view';

const mockBouncedEmails: Email[] = [
    {
      id: 'bounce-1',
      from: 'Servidor de Correo',
      subject: 'Fallo de Entrega: Campaña de Lanzamiento',
      body: 'No se pudo entregar el correo a <strong>usuario.inexistente@dominiofalso.com</strong>. <br>Razón: El buzón de correo no existe (Error 550). <br><br> <img src="https://picsum.photos/seed/bounce1/600/300" data-ai-hint="error code" alt="Error" />',
      snippet: 'No se pudo entregar el correo a...',
      date: new Date(Date.now() - 1000 * 60 * 15),
      read: true,
    },
    {
      id: 'bounce-2',
      from: 'Mail Delivery Subsystem',
      subject: 'Delivery Status Notification (Failure)',
      body: 'Your message to <strong>correo.lleno@servidor.com</strong> could not be delivered. <br>Reason: Mailbox full. <br><br> <img src="https://picsum.photos/seed/bounce2/600/300" data-ai-hint="data storage" alt="Almacenamiento" />',
      snippet: 'Your message could not be delivered...',
      date: new Date(Date.now() - 1000 * 60 * 60 * 8),
      read: true,
    },
];

export default function BouncesPage() {
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
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
        className="absolute inset-0 z-0 opacity-[0.05] bg-grid-red-500/[0.2] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)]"
      />
      <div className="relative z-10">
        <header className="mb-8">
          <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-400 flex items-center gap-3">
                <ShieldAlert className="size-8"/>
                Buzón de Rebotes
              </h1>
              <div className="relative flex items-center justify-center size-8 ml-2">
                  <ShieldAlert className="text-red-500/80 size-7" />
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse" />
              </div>
          </div>
          <p className="text-muted-foreground mt-1">
            Analiza los correos que no pudieron ser entregados para mejorar la salud de tus listas.
          </p>
        </header>

        <Card className="bg-card/80 backdrop-blur-sm border-red-500/30 shadow-lg mb-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-500/10" />
          <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
             <div className="flex items-center gap-4 w-full md:w-auto">
              <Select defaultValue="domain1">
                <SelectTrigger className="w-full sm:w-[200px] bg-background/70 border-red-500/30">
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
                <SelectTrigger className="w-full sm:w-[220px] bg-background/70 border-red-500/30">
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
                <Input placeholder="Buscar en rebotes..." className="pl-10 bg-background/70 border-red-500/30" />
            </div>
             <Button variant="outline" className="w-full md:w-auto bg-background/70 border-red-500/30 hover:bg-cyan-500 hover:text-white">
                <Tag className="mr-2 size-4" />
                Etiquetas
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border-red-500/30 shadow-lg mb-6 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5" />
            <CardContent className="p-2 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="hover:bg-red-500/20"><Square/></Button>
                    <Separator orientation="vertical" className="h-6 bg-red-500/30" />
                    <Button variant="ghost" size="icon" className="hover:bg-red-500/20"><RefreshCw/></Button>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-mono p-2 rounded-md bg-black/10">
                        <span className="text-muted-foreground">1-50 de</span>
                        <span className="font-bold text-foreground">12,345</span>
                    </div>
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="hover:bg-red-500/20"><ChevronLeft/></Button>
                        <Button variant="ghost" size="icon" className="hover:bg-red-500/20"><ChevronRight/></Button>
                    </div>
                    <Separator orientation="vertical" className="h-6 bg-red-500/30" />
                    <Button variant="ghost" size="icon" className="hover:bg-red-500/20" onClick={() => setIsSecurityModalOpen(true)}><Shield /></Button>
                </div>
            </CardContent>
        </Card>

        <div className="bg-card/60 backdrop-blur-sm border border-red-500/20 rounded-lg shadow-lg">
            {mockBouncedEmails.map((email, index) => (
                <EmailListItem key={email.id} email={email} onSelect={handleSelectEmail} isFirst={index === 0} isLast={index === mockBouncedEmails.length - 1} />
            ))}
        </div>
      </div>
    </main>
    <SecuritySettingsModal isOpen={isSecurityModalOpen} onOpenChange={setIsSecurityModalOpen} />
    </>
  );
}
