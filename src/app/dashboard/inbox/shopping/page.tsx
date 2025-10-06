
"use client";

import React, { useState } from 'react';
import { Database, Search, Tag, Square, RefreshCw, ChevronLeft, ChevronRight, Star, Eye, ShieldAlert, DollarSign, Mail, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SecuritySettingsModal } from '@/components/dashboard/inbox/security-settings-modal';
import { SpamFilterSettingsModal } from '@/components/dashboard/inbox/spam-filter-settings-modal';
import { EmailListItem, type Email } from '@/components/dashboard/inbox/email-list-item';
import { EmailView } from '@/components/dashboard/inbox/email-view';
import { AntivirusStatusModal } from '@/components/dashboard/inbox/antivirus-status-modal';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { StorageIndicator } from '@/components/dashboard/inbox/storage-indicator';
import { StorageDetailsModal } from '@/components/dashboard/inbox/storage-details-modal';

const initialShoppingEmails: Email[] = [
    {
      id: 'shop-1',
      from: 'Amazon',
      subject: 'Tu pedido ha sido enviado',
      body: 'Tu pedido #123-4567890-1234567 ha sido enviado. <br><br> <img src="https://picsum.photos/seed/shop1/600/300" data-ai-hint="package delivery" alt="Pedido" />',
      snippet: 'Fecha de entrega estimada: 3 días...',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      starred: true,
      tag: { name: 'Pedidos', color: '#3b82f6' },
    },
    {
      id: 'shop-2',
      from: 'Mercado Libre',
      subject: '¡Ofertas exclusivas para ti!',
      body: 'No te pierdas estas ofertas de hasta 50% de descuento en electrónicos. <br><br> <img src="https://picsum.photos/seed/shop2/600/300" data-ai-hint="electronic devices" alt="Ofertas" />',
      snippet: 'Descuentos en laptops, celulares y más...',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
      starred: false,
    },
];

export default function ShoppingPage() {
  const [emails, setEmails] = useState(initialShoppingEmails);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isSpamFilterModalOpen, setIsSpamFilterModalOpen] = useState(false);
  const [isAntivirusModalOpen, setIsAntivirusModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showStarred, setShowStarred] = useState(false);

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

  const displayedEmails = showStarred ? emails.filter(email => email.starred) : emails;

  if (selectedEmail) {
      return <EmailView email={selectedEmail} onBack={handleBackToList} onToggleStar={handleToggleStar} />
  }

  return (
    <>
    <main className="flex-1 p-4 md:p-8 bg-background relative overflow-hidden flex flex-col">
      <div 
        className="absolute inset-0 z-0 opacity-[0.05] bg-grid-green-500/[0.2] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)]"
        style={{
            backgroundImage: 'radial-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px), radial-gradient(hsl(var(--accent) / 0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px, 30px 30px',
            backgroundPosition: '0 0, 15px 15px',
        }}
      />
       <div className="absolute inset-0 z-0 bg-gradient-to-br from-transparent via-transparent to-[#00EF10]/20 opacity-50"/>

      <div className="relative z-10 shrink-0">
         <header className="mb-8 flex justify-between items-start">
            <div className="flex items-center gap-6">
                <div className="relative flex items-center justify-center animation-wrapper-1 w-16 h-16 text-[#A6EE00]">
                    <div className="absolute inset-0 rounded-full bg-green-500/10 animate-pulse"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-green-500/30 border-dashed animate-spin-slow"></div>
                    <ShoppingCart className="size-8 icon1"/>
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00EF10] to-[#A6EE00]">
                      Buzón de Compras
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Aquí encontrarás tus confirmaciones de compra, envíos y ofertas.
                    </p>
                </div>
            </div>
            <StorageIndicator used={10.2} total={15} gradientColors={['#00EF10', '#A6EE00']} onClick={() => setIsStorageModalOpen(true)} />
        </header>

        <Card className="bg-card/80 backdrop-blur-sm border-[#00CB07]/30 shadow-lg mb-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
          <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
             <div className="flex items-center gap-4 w-full md:w-auto">
              <Select defaultValue="domain1">
                <SelectTrigger className="w-full sm:w-[200px] bg-background/70 border-[#00CB07]/30">
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
                <SelectTrigger className="w-full sm:w-[220px] bg-background/70 border-[#00CB07]/30">
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
                <Input placeholder="Buscar en compras..." className="pl-10 bg-background/70 border-[#00CB07]/30" />
            </div>
             <Button variant="outline" className="w-full md:w-auto bg-background/70 border-[#00CB07]/30 hover:bg-cyan-500 hover:text-white">
                <Tag className="mr-2 size-4" />
                Etiquetas
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border-[#00CB07]/30 shadow-lg mb-6 relative overflow-hidden shrink-0">
             <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5" />
            <CardContent className="p-2 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="hover:bg-green-500/20"><Square/></Button>
                    <Separator orientation="vertical" className="h-6 bg-green-500/30" />
                    <Button variant="ghost" size="icon" className="hover:bg-green-500/20"><RefreshCw/></Button>
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
                        <Button variant="ghost" size="icon" className="hover:bg-green-500/20"><ChevronLeft/></Button>
                        <Button variant="ghost" size="icon" className="hover:bg-green-500/20"><ChevronRight/></Button>
                    </div>
                    <Separator orientation="vertical" className="h-6 bg-green-500/30" />
                     <Button variant="ghost" size="icon" className="hover:bg-green-500/20 border-2 border-transparent hover:border-green-500/50 text-green-500" onClick={() => setIsSecurityModalOpen(true)}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-5">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9.06 10.13a3.5 3.5 0 0 1 5.88 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
                         </svg>
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:bg-amber-500/20 border-2 border-transparent hover:border-amber-500/50 text-amber-500" onClick={() => setIsSpamFilterModalOpen(true)}><ShieldAlert /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-blue-500/20 border-2 border-transparent hover:border-blue-500/50 text-blue-500" onClick={() => setIsAntivirusModalOpen(true)}>
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
        <motion.div layout className="bg-card/60 backdrop-blur-sm border border-[#00CB07]/30 rounded-lg shadow-lg">
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
                <EmailListItem 
                  key={email.id} 
                  email={email} 
                  onSelect={handleSelectEmail} 
                  onToggleStar={handleToggleStar} 
                  isFirst={index === 0} 
                  isLast={index === displayedEmails.length - 1} 
                  unreadIndicatorStyle={{background: 'linear-gradient(to bottom, #00EF10, #21F700)'}}
                  unreadBgStyle={{background: 'linear-gradient(to right, rgba(0, 239, 16, 0.1), transparent)'}}
                  unreadDateColor="#00CB07"
                />
              </motion.div>
            ))}
           </AnimatePresence>
        </motion.div>
      </div>
    </main>
    <SecuritySettingsModal isOpen={isSecurityModalOpen} onOpenChange={setIsSecurityModalOpen} />
    <SpamFilterSettingsModal isOpen={isSpamFilterModalOpen} onOpenChange={setIsSpamFilterModalOpen} />
    <AntivirusStatusModal isOpen={isAntivirusModalOpen} onOpenChange={setIsAntivirusModalOpen} />
    <StorageDetailsModal isOpen={isStorageModalOpen} onOpenChange={setIsStorageModalOpen} />
    </>
  );
}
