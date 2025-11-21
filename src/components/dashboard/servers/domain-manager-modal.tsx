
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe, GitBranch, Mail, X, MailOpen, FolderOpen, Code, Signal, CheckCircle, XCircle, MoreHorizontal, Layers, Plug, Hourglass } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const domains = [
    { name: 'mailflow.ai', verified: true, emails: [{address: 'ventas@mailflow.ai', connected: true}, {address: 'soporte@mailflow.ai', connected: true}, {address: 'info@mailflow.ai', connected: false}] },
    { name: 'daybuu.com', verified: true, emails: [{address: 'contacto@daybuu.com', connected: true}] },
    { name: 'my-super-long-domain-name-that-needs-truncation.com', verified: true, emails: [{address: 'test@my-super-long-domain-name-that-needs-truncation.com', connected: false}] },
    { name: 'another-domain.dev', verified: false, emails: [] },
];
const subdomains = [
    { name: 'marketing.mailflow.ai', verified: true, emails: [{address: 'newsletter@marketing.mailflow.ai', connected: true}] },
    { name: 'app.daybuu.com', verified: false, emails: [] },
    { name: 'another-very-long-subdomain-name-to-check-truncation.mailflow.ai', verified: true, emails: [{address: 'info@another-very-long-subdomain-name-to-check-truncation.mailflow.ai', connected: true}] },
];

interface DomainManagerModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const EmptyState = ({ type }: { type: 'Dominios' | 'Subdominios' }) => (
    <div className="flex flex-col items-center justify-center text-center text-cyan-200/50 h-full p-4">
        <FolderOpen className="size-16 mb-4 animate-pulse" />
        <h4 className="font-semibold text-white/80">No hay {type}</h4>
        <p className="text-xs">Aún no has verificado ningún {type.toLowerCase()}.</p>
    </div>
);

const RightPanelPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-cyan-200/70 p-8">
        <div className="relative flex items-center justify-center w-full max-w-sm h-24">
            <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            <motion.div 
                className="absolute h-2 w-2 rounded-full bg-cyan-300"
                style={{ boxShadow: '0 0 10px #00ADEC, 0 0 15px #00ADEC' }}
                animate={{ 
                    left: ['10%', '90%', '10%'],
                    right: ['90%', '10%', '90%']
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 group">
                <div className="relative p-4 rounded-full bg-black/30 border border-cyan-400/20 icon-illuminated">
                    <div className="illumination-pulse"/>
                    <Globe className="relative size-8 text-cyan-300"/>
                </div>
            </div>
             <div className="absolute right-0 top-1/2 -translate-y-1/2 group">
                <div className="relative p-4 rounded-full bg-black/30 border border-cyan-400/20 icon-illuminated">
                    <div className="illumination-pulse" style={{animationDelay: '0.5s'}}/>
                    <MailOpen className="relative size-8 text-cyan-300"/>
                </div>
            </div>
        </div>
        <p className="mt-8 text-sm">Selecciona un dominio o sub dominio para observar las direcciones de correos electrónicos conectados.</p>
    </div>
);

export function DomainManagerModal({ isOpen, onOpenChange }: DomainManagerModalProps) {
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'domains' | 'subdomains'>('domains');
    const [emailFilter, setEmailFilter] = useState<'all' | 'connected' | 'disconnected'>('all');
    
    const truncateName = (name: string, maxLength: number): string => {
        if (name.length <= maxLength) {
            return name;
        }
        return `${name.substring(0, maxLength)}...`;
    };

    const getEmailsForDomain = () => {
        const domainData = [...domains, ...subdomains].find(d => d.name === selectedDomain);
        if (!domainData) return [];

        if (emailFilter === 'connected') {
            return domainData.emails.filter(e => e.connected);
        }
        if (emailFilter === 'disconnected') {
            return domainData.emails.filter(e => !e.connected);
        }
        return domainData.emails;
    }
    
    const emails = getEmailsForDomain();
    const currentList = activeTab === 'domains' ? domains : subdomains;
    const currentDomainData = [...domains, ...subdomains].find(d => d.name === selectedDomain);
    
    const LedIndicator = ({ verified }: { verified: boolean }) => (
      <div 
        className="relative size-3 rounded-full shrink-0" 
        style={{
          backgroundColor: verified ? '#00CB07' : '#F00000',
          boxShadow: `0 0 6px ${verified ? '#00CB07' : '#F00000'}`,
        }}
      >
        <div className="absolute inset-0 rounded-full animate-pulse-wave" style={{'--wave-color': verified ? '#00CB07' : '#F00000'} as React.CSSProperties} />
      </div>
    );
    
    const ConnectionSignal = () => (
        <div className="relative flex items-center justify-center w-8 h-8">
            <div className="absolute w-full h-full border-2 border-dashed border-cyan-400/30 rounded-full animate-spin-slow" />
            <div className="flex items-end gap-0.5 h-3/5">
                <motion.div
                    className="w-1 bg-cyan-300 rounded-full"
                    animate={{ height: ['20%', '80%', '20%'] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                 <motion.div
                    className="w-1 bg-cyan-300 rounded-full"
                    animate={{ height: ['60%', '30%', '60%'] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                />
                 <motion.div
                    className="w-1 bg-cyan-300 rounded-full"
                    animate={{ height: ['40%', '100%', '40%'] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                />
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-5xl w-full h-[650px] flex flex-col p-0 gap-0 bg-black/80 backdrop-blur-xl border border-cyan-400/20 text-white overflow-hidden">
                <style>{`
                    .info-grid {
                        background-image:
                            linear-gradient(to right, hsl(190 100% 50% / 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, hsl(190 100% 50% / 0.1) 1px, transparent 1px);
                        background-size: 2rem 2rem;
                    }
                    @keyframes pulse-wave {
                      0% { transform: scale(0.8); opacity: 0; }
                      70% { transform: scale(2.5); opacity: 0.7; }
                      100% { transform: scale(3.5); opacity: 0; }
                    }
                    .animate-pulse-wave {
                      position: absolute;
                      inset: 0;
                      border-radius: 50%;
                      border: 1px solid var(--wave-color);
                      animation: pulse-wave 1s infinite cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    @keyframes illumination-pulse {
                        0%, 100% {
                            transform: scale(0.5);
                            opacity: 0;
                        }
                        50% {
                            transform: scale(1.2);
                            opacity: 1;
                        }
                    }
                    .icon-illuminated .illumination-pulse {
                        position: absolute;
                        inset: 0;
                        border-radius: 50%;
                        background: radial-gradient(circle, hsl(190 100% 50% / 0.4), transparent 70%);
                        animation: illumination-pulse 3s infinite ease-out;
                    }
                `}</style>

                 <DialogHeader className="p-4 border-b border-cyan-400/20 bg-black/30 text-left z-10">
                    <DialogTitle className="flex items-center gap-3">
                         <div className="p-2 rounded-full bg-cyan-500/10 border-2 border-cyan-400/20">
                           <Globe className="text-cyan-300"/>
                        </div>
                        Gestor de Dominios y Correos
                    </DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">
                    {/* Left Column: Domain List */}
                    <div className="flex flex-col p-6 border-r border-cyan-400/20 bg-black/20">
                         <div className="flex bg-black/30 p-1 rounded-lg border border-cyan-400/20 mb-4 shrink-0">
                            <button onClick={() => setActiveTab('domains')} className={cn("flex-1 py-2 px-4 text-sm font-semibold rounded-md transition-colors", activeTab === 'domains' && 'bg-cyan-500/20 text-cyan-200')}>Dominios</button>
                            <button onClick={() => setActiveTab('subdomains')} className={cn("flex-1 py-2 px-4 text-sm font-semibold rounded-md transition-colors", activeTab === 'subdomains' && 'bg-cyan-500/20 text-cyan-200')}>Subdominios</button>
                        </div>
                        <ScrollArea className="flex-1 -m-6 p-6 custom-scrollbar">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-2"
                                >
                                    {currentList.length > 0 ? currentList.map(d => (
                                        <div key={d.name} onClick={() => setSelectedDomain(d.name)} className={cn("w-full text-left p-3 rounded-lg flex items-center justify-between transition-all duration-200 border-2 cursor-pointer", selectedDomain === d.name ? "bg-cyan-500/20 border-cyan-400" : "bg-black/20 border-transparent hover:bg-cyan-500/10 hover:border-cyan-400/50")}>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <LedIndicator verified={d.verified}/>
                                                <Button variant="outline" size="sm" className="h-7 px-3 text-xs bg-cyan-900/50 border-cyan-400/30 text-cyan-300 hover:bg-cyan-800/60 hover:text-white" onClick={(e) => {e.stopPropagation(); /* Future action */}}>
                                                  <Code className="mr-2 size-3"/>
                                                  Detalles
                                                </Button>
                                                <span className="font-mono text-sm truncate" title={d.name}>{truncateName(d.name, 21)}</span>
                                            </div>
                                            <MoreHorizontal className="text-cyan-300/50"/>
                                        </div>
                                    )) : (
                                        <EmptyState type={activeTab === 'domains' ? 'Dominios' : 'Subdominios'} />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </ScrollArea>
                    </div>
                    {/* Right Column: Email List */}
                    <div className="flex flex-col p-6 bg-black/10 info-grid relative">
                         <div className="z-10 flex flex-col h-full">
                           <div className="flex justify-between items-center shrink-0 mb-4">
                               <h3 className="font-semibold text-cyan-300 text-sm flex items-center gap-2 min-w-0">
                                 <Mail className="size-4"/>
                                 <span className="truncate">Correos para: <span className="font-mono text-white" title={selectedDomain || ''}>{selectedDomain ? truncateName(selectedDomain, 15) : '...'}</span></span>
                               </h3>
                               <div className="flex items-center gap-1 p-1 rounded-md bg-black/30 border border-cyan-400/20">
                                    <Button variant={emailFilter === 'connected' ? 'secondary' : 'ghost'} size="icon" className="size-7 hover:bg-white" onClick={() => setEmailFilter('connected')}>
                                        <CheckCircle className="text-green-400"/>
                                    </Button>
                                    <Button variant={emailFilter === 'disconnected' ? 'secondary' : 'ghost'} size="icon" className="size-7 hover:bg-white" onClick={() => setEmailFilter('disconnected')}>
                                        <XCircle className="text-red-500"/>
                                    </Button>
                                     <Button variant={emailFilter === 'all' ? 'secondary' : 'ghost'} size="icon" className="size-7 hover:bg-white" onClick={() => setEmailFilter('all')}>
                                         <Layers/>
                                     </Button>
                                </div>
                           </div>
                           <ScrollArea className="flex-1 -m-6 p-6 mt-0 custom-scrollbar">
                                <div className="space-y-2">
                                    {selectedDomain ? (
                                        emails.length > 0 ? emails.map(email => (
                                            <div key={email.address} className="p-3 bg-black/40 border border-cyan-400/10 rounded-lg flex items-center justify-between">
                                                <div className="flex items-center gap-3 min-w-0">
                                                   <LedIndicator verified={email.connected}/>
                                                    <Button variant="outline" size="sm" className="h-7 px-3 text-xs bg-cyan-900/50 border-cyan-400/30 text-cyan-300 hover:bg-white hover:text-black" onClick={(e) => e.stopPropagation()}>
                                                      <Signal className="mr-2 size-3"/>
                                                      Informe
                                                    </Button>
                                                   <span className="font-mono text-sm text-white/80 truncate" title={email.address}>{truncateName(email.address, 19)}</span>
                                                </div>
                                                <MoreHorizontal className="text-cyan-300/50" />
                                            </div>
                                        )) : (
                                             <div className="text-center text-cyan-200/50 pt-16">
                                                <p>No hay correos para este dominio.</p>
                                            </div>
                                        )
                                    ) : (
                                        <RightPanelPlaceholder />
                                    )}
                                </div>
                           </ScrollArea>
                        </div>
                    </div>
                </div>
                 <DialogFooter className="p-3 border-t border-cyan-400/20 bg-black/30 z-10 flex justify-between items-center">
                     <Button variant="outline" className="text-white border-white/30 hover:bg-white hover:text-black" onClick={() => onOpenChange(false)}>
                       <X className="mr-2"/>
                       Cerrar
                     </Button>
                     <Button
                        style={{backgroundColor: '#E18700'}}
                        className="text-white font-bold transition-colors duration-300"
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#00CB07'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#E18700'; }}
                     >
                       <Plug className="mr-2"/>
                       Comprobar Conexión
                     </Button>
                    
                     <div className="w-1 h-8 bg-cyan-400/20 rounded-full"/>

                     {selectedDomain && currentDomainData ? (
                        <div className="flex items-center gap-3 text-xs">
                           <div className="flex items-center gap-2">
                               <p className="font-semibold text-green-300">Conexión Establecida</p>
                               <LedIndicator verified={true}/>
                               <span className="font-mono text-lg text-white">{currentDomainData.emails.filter(e => e.connected).length}</span>
                               <div className="px-2 py-1 bg-black/40 text-white/80 rounded-md text-xs font-semibold border border-white/20">Correos</div>
                           </div>
                           <div className="flex items-center gap-2">
                               <p className="font-semibold text-red-400">Error de Conexión</p>
                               <LedIndicator verified={false}/>
                               <span className="font-mono text-lg text-white">{currentDomainData.emails.filter(e => !e.connected).length}</span>
                               <div className="px-2 py-1 bg-black/40 text-white/80 rounded-md text-xs font-semibold border border-white/20">Correos</div>
                           </div>
                           <ConnectionSignal />
                        </div>
                     ) : (
                        <div className="flex items-center gap-3 text-sm text-cyan-200/60">
                            <Hourglass className="size-5 animate-spin-slow" />
                            <span>Selecciona un dominio para ver el estado de conexión.</span>
                        </div>
                     )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
