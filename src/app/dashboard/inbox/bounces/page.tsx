
"use client";

import React, { useState } from 'react';
import { Database, Search, Tag, Square, RefreshCw, ChevronLeft, ChevronRight, Star, Eye, ShieldAlert, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SecuritySettingsModal } from '@/components/dashboard/inbox/security-settings-modal';
import { SpamFilterSettingsModal } from '@/components/dashboard/inbox/spam-filter-settings-modal';
import { EmailListItem, type Email } from '@/components/dashboard/inbox/email-list-item';
import { EmailView } from '@/components/dashboard/inbox/email-view';
import { AntivirusConfigModal } from '@/components/dashboard/inbox/antivirus-config-modal';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { StorageIndicator } from '@/components/dashboard/inbox/storage-indicator';
import { StorageDetailsModal } from '@/components/dashboard/inbox/storage-details-modal';
import { TagFilterModal, type TaggableTag } from '@/components/dashboard/inbox/tag-filter-modal';

const initialBouncedEmails: Email[] = [
    {
      id: 'bounce-1',
      from: 'Servidor de Correo',
      subject: 'Fallo de Entrega: Campaña de Lanzamiento',
      body: 'No se pudo entregar el correo a <strong>usuario.inexistente@dominiofalso.com</strong>. <br>Razón: El buzón de correo no existe (Error 550). <br><br> <img src="https://picsum.photos/seed/bounce1/600/300" data-ai-hint="error code" alt="Error" />',
      snippet: 'No se pudo entregar el correo a...',
      date: new Date(Date.now() - 1000 * 60 * 15),
      read: true,
      starred: false,
    },
    {
      id: 'bounce-2',
      from: 'Mail Delivery Subsystem',
      subject: 'Delivery Status Notification (Failure)',
      body: 'Your message to <strong>correo.lleno@servidor.com</strong> could not be delivered. <br>Reason: Mailbox full. <br><br> <img src="https://picsum.photos/seed/bounce2/600/300" data-ai-hint="data storage" alt="Almacenamiento" />',
      snippet: 'Your message could not be delivered...',
      date: new Date(Date.now() - 1000 * 60 * 60 * 8),
      read: true,
      starred: true,
      tag: { name: 'Revisar', color: '#8b5cf6' },
    },
];

export default function BouncesPage() {
  const [emails, setEmails] = useState(initialBouncedEmails);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isSpamFilterModalOpen, setIsSpamFilterModalOpen] = useState(false);
  const [isAntivirusConfigModalOpen, setIsAntivirusConfigModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showStarred, setShowStarred] = useState(false);
  const [isTagFilterModalOpen, setIsTagFilterModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<TaggableTag[]>([]);

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
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
  
  const handleFilterByTags = (tags: TaggableTag[]) => {
    setSelectedTags(tags);
  }

  const displayedEmails = emails
    .filter(email => !showStarred || email.starred)
    .filter(email => selectedTags.length === 0 || (email.tag && selectedTags.some(t => t.name === email.tag?.name)));


  if (selectedEmail) {
      return <EmailView email={selectedEmail} onBack={handleBackToList} onToggleStar={handleToggleStar} />
  }


  return (
    <>
    <main className="flex-1 p-4 md:p-8 bg-background relative overflow-hidden flex flex-col">
      {/* Background Animation */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.05] bg-grid-red-500/[0.2] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)]"
      />
      <div className="relative z-10 shrink-0">
        <header className="mb-8 flex justify-between items-start">
           <div className="flex items-center gap-6">
                <div className="relative flex items-center justify-center animation-wrapper-1 w-16 h-16 text-red-500">
                    <div className="absolute inset-0 rounded-full bg-red-500/10 animate-pulse"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-red-500/30 border-dashed animate-spin-slow"></div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-8 icon1">
                       <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                       <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                       <path d="m17 17 5 5m-5 0 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#F00000] to-[#F07000]">
                      Buzón de Rebotes
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Analiza los correos que no pudieron ser entregados y soluciona.
                    </p>
                </div>
            </div>
          <StorageIndicator 
            used={10.2} 
            total={15} 
            gradientColors={['#F00000', '#F07000']} 
            borderColor="hsla(0, 100%, 47%, 0.3)"
            hoverBorderColor="hsla(0, 100%, 47%, 0.45)"
            onClick={() => setIsStorageModalOpen(true)}
        />
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
             <div className="flex items-center gap-2">
                <Button variant="outline" className="w-full md:w-auto bg-background/70 border-red-500/30 hover:bg-cyan-500 hover:text-white" onClick={() => setIsTagFilterModalOpen(true)}>
                    <Tag className="mr-2 size-4" />
                    Etiquetas
                </Button>
                 <AnimatePresence>
                  {selectedTags.length > 0 && (
                      <motion.div
                          initial={{ opacity: 0, scale: 0.8, width: 0 }}
                          animate={{ opacity: 1, scale: 1, width: 'auto' }}
                          exit={{ opacity: 0, scale: 0.8, width: 0 }}
                          className="relative"
                      >
                          <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setSelectedTags([])}
                              className="relative group/reset-btn rounded-full size-10 border-2 border-red-500/50 text-red-400 bg-red-900/20 hover:bg-red-900/40 hover:text-red-300 hover:border-red-500"
                          >
                              <div className="absolute inset-0 rounded-full border-2 border-dashed border-red-500 animate-spin-slow group-hover/reset-btn:animate-[spin-slow_2s_linear_infinite]" />
                              <XCircle className="size-5 transition-transform group-hover/reset-btn:scale-110" style={{ filter: 'drop-shadow(0 0 5px #F00000)'}}/>
                          </Button>
                      </motion.div>
                  )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border-red-500/30 shadow-lg mb-6 relative overflow-hidden shrink-0">
             <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5" />
            <CardContent className="p-2 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="hover:bg-red-500/20"><Square/></Button>
                    <Separator orientation="vertical" className="h-6 bg-red-500/30" />
                    <Button variant="ghost" size="icon" className="hover:bg-red-500/20"><RefreshCw/></Button>
                    <Button variant="ghost" size="icon" onClick={() => setShowStarred(!showStarred)} className="hover:bg-yellow-500/20">
                      <Star className={cn("text-foreground dark:text-white transition-colors", showStarred && "text-yellow-400 fill-yellow-400")}/>
                    </Button>
                    <AnimatePresence>
                      {showStarred && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-300"
                        >
                           <motion.div initial={{scale:0.5}} animate={{scale:1}} exit={{scale:0.5}} className="flex items-center justify-center">
                              <Eye className="size-4 animate-pulse" />
                           </motion.div>
                          <span className="text-xs font-bold whitespace-nowrap">Mostrando correos importantes</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                     <Button variant="ghost" size="icon" className="hover:bg-green-500/20 text-green-500 hover:text-green-500" onClick={() => setIsSecurityModalOpen(true)}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-5">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9.06 10.13a3.5 3.5 0 0 1 5.88 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
                         </svg>
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:bg-amber-500/20 text-amber-500 hover:text-amber-500" onClick={() => setIsSpamFilterModalOpen(true)}><ShieldAlert /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-blue-500/20 text-blue-500 hover:text-blue-500" onClick={() => setIsAntivirusConfigModalOpen(true)}>
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-5">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4">
        <motion.div layout className="bg-card/60 backdrop-blur-sm border border-red-500/20 rounded-lg shadow-lg">
           <AnimatePresence>
            {displayedEmails.map((email, index) => (
               <motion.div
                    key={email.id}
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                <EmailListItem key={email.id} email={email} onSelect={handleSelectEmail} onToggleStar={handleToggleStar} isFirst={index === 0} isLast={index === displayedEmails.length - 1} />
              </motion.div>
            ))}
           </AnimatePresence>
        </motion.div>
      </div>
    </main>
    <SecuritySettingsModal isOpen={isSecurityModalOpen} onOpenChange={setIsSecurityModalOpen} />
    <SpamFilterSettingsModal isOpen={isSpamFilterModalOpen} onOpenChange={setIsSpamFilterModalOpen} />
    <AntivirusConfigModal isOpen={isAntivirusConfigModalOpen} onOpenChange={setIsAntivirusConfigModalOpen} />
    <StorageDetailsModal isOpen={isStorageModalOpen} onOpenChange={setIsStorageModalOpen} themeColors={['#F00000', '#F07000']} />
    <TagFilterModal isOpen={isTagFilterModalOpen} onOpenChange={setIsTagFilterModalOpen} onFilter={handleFilterByTags} initialSelectedTags={selectedTags} />
    </>
  );
}
