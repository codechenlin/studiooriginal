
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe, GitBranch, Mail, X, MailOpen, FolderOpen, Code } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const domains = [
    { name: 'mailflow.ai', verified: true, emails: ['ventas@mailflow.ai', 'soporte@mailflow.ai'] },
    { name: 'daybuu.com', verified: true, emails: ['contacto@daybuu.com'] },
    { name: 'my-super-long-domain-name-that-needs-truncation.com', verified: true, emails: ['test@my-super-long-domain-name-that-needs-truncation.com'] },
];
const subdomains = [
    { name: 'marketing.mailflow.ai', verified: true, emails: ['newsletter@marketing.mailflow.ai'] },
    { name: 'app.daybuu.com', verified: false, emails: [] },
    { name: 'another-very-long-subdomain-name-to-check-truncation.mailflow.ai', verified: true, emails: ['info@another-very-long-subdomain-name-to-check-truncation.mailflow.ai'] },
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
                initial={{ left: '10%' }}
                animate={{ left: '90%' }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut'
                }}
            />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 group">
                <div className="relative p-4 rounded-full bg-black/30 border border-cyan-400/20">
                    <motion.div className="absolute inset-0 rounded-full bg-cyan-500/10" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}/>
                    <Globe className="relative size-8 text-cyan-300"/>
                </div>
            </div>
             <div className="absolute right-0 top-1/2 -translate-y-1/2 group">
                <div className="relative p-4 rounded-full bg-black/30 border border-cyan-400/20">
                    <motion.div className="absolute inset-0 rounded-full bg-cyan-500/10" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}/>
                    <MailOpen className="relative size-8 text-cyan-300"/>
                </div>
            </div>
        </div>
        <p className="mt-8 text-sm">Selecciona un dominio o subdominio de la izquierda para ver los correos electrónicos asociados.</p>
    </div>
);

export function DomainManagerModal({ isOpen, onOpenChange }: DomainManagerModalProps) {
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'domains' | 'subdomains'>('domains');
    
    const truncateName = (name: string, maxLength: number = 21): string => {
        if (name.length <= maxLength) {
            return name;
        }
        return `${name.substring(0, maxLength)}...`;
    };

    const getEmailsForDomain = () => {
        const domainData = [...domains, ...subdomains].find(d => d.name === selectedDomain);
        return domainData ? domainData.emails : [];
    }
    
    const emails = getEmailsForDomain();
    const currentList = activeTab === 'domains' ? domains : subdomains;
    
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

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-4xl w-full h-[650px] flex flex-col p-0 gap-0 bg-black/80 backdrop-blur-xl border border-cyan-400/20 text-white overflow-hidden">
                <style>{`
                    .info-grid {
                        background-image:
                            linear-gradient(to right, hsl(190 100% 50% / 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, hsl(190 100% 50% / 0.1) 1px, transparent 1px);
                        background-size: 2rem 2rem;
                    }
                    @keyframes pulse-wave {
                      0% { transform: scale(1); opacity: 0.5; }
                      50% { transform: scale(2.5); opacity: 0; }
                      100% { transform: scale(1); opacity: 0; }
                    }
                    .animate-pulse-wave {
                      position: absolute;
                      inset: 0;
                      border-radius: 50%;
                      border: 1px solid var(--wave-color);
                      animation: pulse-wave 2s infinite;
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
                                                <span className="font-mono text-sm truncate" title={d.name}>{truncateName(d.name)}</span>
                                            </div>
                                            <Button variant="outline" size="sm" className="h-7 px-3 text-xs bg-cyan-900/50 border-cyan-400/30 text-cyan-300 hover:bg-cyan-800/60 hover:text-white" onClick={(e) => e.stopPropagation()}>
                                                <Code className="mr-2 size-3"/>
                                                Detalles
                                            </Button>
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
                           <h3 className="font-semibold text-cyan-300 text-sm mb-2 flex items-center gap-2 shrink-0">
                             <Mail className="size-4"/>
                             Correos para: <span className="font-mono text-white truncate">{selectedDomain ? truncateName(selectedDomain, 25) : '...'}</span>
                           </h3>
                           <ScrollArea className="flex-1 -m-6 p-6 mt-4 custom-scrollbar">
                                <div className="space-y-2">
                                    {selectedDomain ? (
                                        emails.length > 0 ? emails.map(email => (
                                            <div key={email} className="p-3 bg-black/40 border border-cyan-400/10 rounded-lg flex items-center justify-between">
                                                <div className="flex items-center gap-3 min-w-0">
                                                   <LedIndicator verified={true}/>
                                                   <span className="font-mono text-sm text-white/80 truncate">{email}</span>
                                                </div>
                                                <Button variant="outline" size="sm" className="h-7 px-3 text-xs bg-cyan-900/50 border-cyan-400/30 text-cyan-300 hover:bg-cyan-800/60 hover:text-white" onClick={(e) => e.stopPropagation()}>
                                                  <GitBranch className="mr-2 size-3"/>
                                                  Informe
                                                </Button>
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
                 <DialogFooter className="p-4 border-t border-cyan-400/20 bg-black/30 z-10">
                     <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-full bg-[#00ADEC] text-white border-white hover:bg-white hover:text-black"
                    >
                        <X className="mr-2"/>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
