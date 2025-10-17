
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe, Mail, Server, Database, ChevronRight, X, FolderOpen, CheckCircle, GitBranch } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DomainInfoModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const mockData = {
    'mailflow.ai': ['ventas@mailflow.ai', 'soporte@mailflow.ai', 'facturacion@mailflow.ai', 'ceo@mailflow.ai'],
    'marketingpro.com': ['newsletter@marketingpro.com', 'contacto@marketingpro.com'],
    'leads.mydomain.org': ['leads-q1@leads.mydomain.org', 'leads-q2@leads.mydomain.org'],
    'notifications.app.net': ['no-reply@notifications.app.net', 'status@notifications.app.net', 'alerts@notifications.app.net'],
    'sales-updates.co': ['daily-report@sales-updates.co'],
};

const mockVerifiedSubdomains = ['blog.mailflow.ai', 'shop.marketingpro.com'];

const domains = Object.keys(mockData);

export function DomainInfoModal({ isOpen, onOpenChange }: DomainInfoModalProps) {
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

    const handleSelectDomain = (domain: string) => {
        setSelectedDomain(domain);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full h-[600px] flex p-0 gap-0 bg-black/80 backdrop-blur-xl border border-cyan-400/20 text-white overflow-hidden">
                <style>{`
                    .info-grid {
                        background-image:
                            linear-gradient(to right, hsl(210 50% 30% / 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, hsl(210 50% 30% / 0.1) 1px, transparent 1px);
                        background-size: 2rem 2rem;
                    }
                    .scan-line-info {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 3px;
                        background: radial-gradient(ellipse 50% 100% at 50% 0%, hsl(190 100% 50% / 0.5), transparent 80%);
                        animation: scan-info 5s infinite linear;
                    }
                    @keyframes scan-info {
                        0% { transform: translateY(-10px); }
                        100% { transform: translateY(100vh); }
                    }
                    @keyframes scanner-line {
                        from {
                            left: -33.3%;
                        }
                        to {
                            left: 100%;
                        }
                    }
                `}</style>
                <div className="w-2/5 flex flex-col border-r border-cyan-400/20 bg-black/30">
                    <DialogHeader className="p-6 border-b border-cyan-400/20">
                        <DialogTitle className="flex items-center gap-3 text-cyan-300">
                            <Database className="size-6" />
                            Dominios Verificados
                        </DialogTitle>
                    </DialogHeader>
                    <div className='p-4'>
                        <Tabs defaultValue="domains" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-black/20 border border-cyan-400/20">
                                <TabsTrigger value="domains" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-200 flex items-center justify-center gap-2"><Globe className="size-4"/>Principales</TabsTrigger>
                                <TabsTrigger value="subdomains" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-200 flex items-center justify-center gap-2"><GitBranch className="size-4"/>Subdominios</TabsTrigger>
                            </TabsList>
                            <TabsContent value="domains" className="mt-2">
                                <ScrollArea className="h-80 -mr-4 pr-4">
                                    <div className="space-y-2">
                                        {domains.map(domain => (
                                            <button
                                                key={domain}
                                                onClick={() => handleSelectDomain(domain)}
                                                className={cn(
                                                    "w-full text-left p-3 rounded-lg flex items-center justify-between transition-all duration-200 border-2",
                                                    selectedDomain === domain
                                                        ? "bg-cyan-500/20 border-cyan-400 text-white"
                                                        : "bg-black/20 border-transparent hover:bg-cyan-500/10 hover:border-cyan-400/50"
                                                )}
                                            >
                                                <span className="font-mono text-sm">{domain}</span>
                                                <ChevronRight className="size-4" />
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                             <TabsContent value="subdomains" className="mt-2">
                                <ScrollArea className="h-80 -mr-4 pr-4">
                                    {mockVerifiedSubdomains.length > 0 ? (
                                        <div className="space-y-2">
                                            {mockVerifiedSubdomains.map(subdomain => (
                                                <button
                                                    key={subdomain}
                                                    onClick={() => handleSelectDomain(subdomain)}
                                                    className={cn(
                                                        "w-full text-left p-3 rounded-lg flex items-center justify-between transition-all duration-200 border-2",
                                                        selectedDomain === subdomain
                                                            ? "bg-cyan-500/20 border-cyan-400 text-white"
                                                            : "bg-black/20 border-transparent hover:bg-cyan-500/10 hover:border-cyan-400/50"
                                                    )}
                                                >
                                                    <span className="font-mono text-sm">{subdomain}</span>
                                                    <ChevronRight className="size-4" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground pt-10 flex flex-col items-center">
                                            <GitBranch className="size-10 mb-2"/>
                                            <p className="font-semibold">No hay subdominios</p>
                                            <p className="text-sm">Aún no has verificado ningún subdominio.</p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                <div className="w-3/5 flex flex-col relative overflow-hidden info-grid">
                    <div className="scan-line-info" />
                    <DialogHeader className="p-6 border-b border-cyan-400/20 bg-black/50 backdrop-blur-sm z-10">
                         <DialogTitle className="flex items-center gap-3 text-cyan-300">
                            <Mail className="size-6" />
                            Direcciones de Correo
                        </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="flex-1 p-6 z-10">
                        <AnimatePresence mode="wait">
                            {selectedDomain ? (
                                <motion.div
                                    key={selectedDomain}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h3 className="text-lg font-semibold text-white mb-4">
                                        Mostrando correos para: <span className="font-mono text-cyan-300">{selectedDomain}</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {(mockData[selectedDomain as keyof typeof mockData] || []).map(email => (
                                            <div key={email} className="flex items-center gap-3 p-3 rounded-md bg-black/20 border border-cyan-400/10 text-sm font-mono">
                                                <CheckCircle className="size-4 text-green-400" />
                                                <span>{email}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center text-cyan-200/50"
                                >
                                    <div className="flex items-center justify-center gap-8">
                                        <Globe className="size-16" />
                                        <div className="relative w-24 h-px bg-cyan-400/30 overflow-hidden">
                                            <div
                                                className="absolute top-0 h-full w-1/3"
                                                style={{
                                                    background: 'linear-gradient(to right, transparent, hsl(190 100% 50% / 0.8), transparent)',
                                                    animation: 'scanner-line 1.5s infinite linear alternate'
                                                }}
                                            />
                                        </div>
                                        <Mail className="size-16" />
                                    </div>
                                    <h3 className="font-semibold text-lg text-white/80 mt-4">Selecciona un dominio</h3>
                                    <p className="text-sm">Haz clic en un dominio de la lista para ver las direcciones de correo asociadas.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </ScrollArea>
                    <DialogFooter className="p-4 border-t border-cyan-400/20 bg-black/50 z-10">
                        <Button 
                            variant="outline" 
                            className="text-white border-cyan-400/50 hover:bg-[#00ADEC] hover:border-[#00ADEC] hover:text-white" 
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="mr-2"/> Cerrar
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
    