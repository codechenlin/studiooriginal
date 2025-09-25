
"use client";

import React, { useState } from 'react';
import { MailWarning, Database, Search, Tag, Square, RefreshCw, ChevronLeft, ChevronRight, Shield, ShieldAlert, ShieldHalf, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SecuritySettingsModal } from '@/components/dashboard/inbox/security-settings-modal';
import { SpamFilterSettingsModal } from '@/components/dashboard/inbox/spam-filter-settings-modal';
import { EmailListItem, type Email } from '@/components/dashboard/inbox/email-list-item';
import { EmailView } from '@/components/dashboard/inbox/email-view';

const mockSpamEmails: Email[] = [
    {
      id: 'spam-1',
      from: 'Gana $$$ Rápido',
      subject: '¡Oportunidad ÚNICA que no puedes dejar pasar!',
      body: 'Felicidades, has sido seleccionado para una oportunidad de inversión exclusiva. ¡Retornos garantizados del 500%! <br><br> <img src="https://picsum.photos/seed/spam1/600/300" data-ai-hint="money prize" alt="Premio" />',
      snippet: 'Felicidades, has sido seleccionado...',
      date: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
    },
    {
      id: 'spam-2',
      from: 'Soporte Técnico URGENTE',
      subject: 'Alerta de Seguridad: Tu cuenta ha sido comprometida',
      body: 'Detectamos actividad sospechosa en tu cuenta. Por favor, haz clic aquí para verificar tu identidad de inmediato. <br><br> <img src="https://picsum.photos/seed/spam2/600/300" data-ai-hint="security alert" alt="Alerta" />',
      snippet: 'Detectamos actividad sospechosa...',
      date: new Date(Date.now() - 1000 * 60 * 60 * 5),
      read: false,
    },
];

export default function SpamPage() {
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isSpamFilterModalOpen, setIsSpamFilterModalOpen] = useState(false);
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
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px), radial-gradient(hsl(var(--accent) / 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px, 30px 30px',
          backgroundPosition: '0 0, 15px 15px',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-transparent via-transparent to-orange-900/40 opacity-50"/>


      <div className="relative z-10">
        <header className="mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500 flex items-center gap-3">
                <MailWarning className="size-8"/>
                Bandeja de Spam
              </h1>
               <div className="relative flex items-center justify-center size-8 ml-2">
                  <MailWarning className="text-amber-500/80 size-7" />
                  <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-pulse" />
              </div>
            </div>
          <p className="text-muted-foreground mt-1">
            Revisa los correos clasificados como no deseados por nuestro sistema de IA.
          </p>
        </header>

        <Card className="bg-card/80 backdrop-blur-sm border-amber-500/30 shadow-lg mb-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10" />
          <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Select defaultValue="domain1">
                <SelectTrigger className="w-full sm:w-[200px] bg-background/70 border-amber-500/30">
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
                <SelectTrigger className="w-full sm:w-[220px] bg-background/70 border-amber-500/30">
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
              <Input placeholder="Buscar en spam..." className="pl-10 bg-background/70 border-amber-500/30" />
            </div>
             <Button variant="outline" className="w-full md:w-auto bg-background/70 border-amber-500/30 hover:bg-cyan-500 hover:text-white">
                <Tag className="mr-2 size-4" />
                Etiquetas
            </Button>
          </CardContent>
        </Card>
        
         <Card className="bg-card/80 backdrop-blur-sm border-amber-500/30 shadow-lg mb-6 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />
            <CardContent className="p-2 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="hover:bg-amber-500/20"><Square/></Button>
                    <Separator orientation="vertical" className="h-6 bg-amber-500/30" />
                    <Button variant="ghost" size="icon" className="hover:bg-amber-500/20"><RefreshCw/></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-yellow-500/20 border-2 border-transparent hover:border-yellow-500/50 text-yellow-500"><Star/></Button>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-mono p-2 rounded-md bg-black/10">
                        <span className="text-muted-foreground">1-50 de</span>
                        <span className="font-bold text-foreground">12,345</span>
                    </div>
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="hover:bg-amber-500/20"><ChevronLeft/></Button>
                        <Button variant="ghost" size="icon" className="hover:bg-amber-500/20"><ChevronRight/></Button>
                    </div>
                    <Separator orientation="vertical" className="h-6 bg-amber-500/30" />
                    <Button variant="ghost" size="icon" className="hover:bg-blue-500/20 border-2 border-transparent hover:border-blue-500/50 text-blue-500" onClick={() => setIsSecurityModalOpen(true)}><Shield /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-amber-500/20 border-2 border-transparent hover:border-amber-500/50 text-amber-500" onClick={() => setIsSpamFilterModalOpen(true)}><Filter /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-red-500/20 border-2 border-transparent hover:border-red-500/50 text-red-500"><ShieldHalf /></Button>
                </div>
            </CardContent>
        </Card>

         <div className="bg-card/60 backdrop-blur-sm border border-amber-500/20 rounded-lg shadow-lg">
            {mockSpamEmails.map((email, index) => (
                <EmailListItem key={email.id} email={email} onSelect={handleSelectEmail} isFirst={index === 0} isLast={index === mockSpamEmails.length - 1} />
            ))}
        </div>
      </div>
    </main>
    <SecuritySettingsModal isOpen={isSecurityModalOpen} onOpenChange={setIsSecurityModalOpen} />
    <SpamFilterSettingsModal isOpen={isSpamFilterModalOpen} onOpenChange={setIsSpamFilterModalOpen} />
    </>
  );
}
