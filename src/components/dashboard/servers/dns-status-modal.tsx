
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DnsAnalysisModal } from './dns-analysis-modal';

type ProviderStatus = 'ok' | 'error';

interface DnsStatusModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  status: ProviderStatus | null;
}

const mockOkDomains = [
    { name: 'mailflow.ai', status: 'ok' },
    { name: 'marketingpro.com', status: 'ok' },
    { name: 'leads.mydomain.org', status: 'ok' },
    { name: 'notifications.app.net', status: 'ok' },
    { name: 'sales-updates.co', status: 'ok' },
];

const mockErrorDomains = [
    { name: 'mailflow.ai', status: 'ok' },
    { name: 'analytics.data.info', status: 'error' },
    { name: 'customer-service.io', status: 'ok' },
    { name: 'my-other-domain.com', status: 'error' },
    { name: 'test-env.dev', status: 'ok' },
];

export function DnsStatusModal({ isOpen, onOpenChange, status }: DnsStatusModalProps) {
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

    const handleAnalyzeDomain = (domain: string) => {
        setSelectedDomain(domain);
        setIsAnalysisModalOpen(true);
    };

    if (!status) return null;

    if (status === 'ok') {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl w-full h-[600px] flex flex-col p-0 gap-0 bg-black border-2 border-green-500/30 text-white overflow-hidden" showCloseButton={false}>
                    <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                        <div className="relative flex flex-col items-center justify-center p-8 overflow-hidden">
                            <h2 className="text-3xl font-bold text-white mt-4">Sistema de Integridad Activo</h2>
                            <p className="text-green-200/70 text-lg mt-1">Todos los dominios operativos.</p>
                        </div>
                         <div className="flex flex-col p-8 bg-black/30 backdrop-blur-sm border-l border-green-500/20">
                            <DialogHeader className="text-left z-10">
                                <DialogTitle className="text-2xl font-bold text-green-300">
                                    Estado del Sistema: Óptimo
                                </DialogTitle>
                                <DialogDescription className="text-green-200/70">
                                    Nuestra IA de vigilancia neuronal monitorea tus registros DNS 24/7 para asegurar la máxima entregabilidad y reputación.
                                </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="flex-1 mt-6 -mr-4 pr-4 custom-scrollbar z-10">
                               <ul className="space-y-3">
                                  {mockOkDomains.map((domain, index) => (
                                    <motion.li
                                        key={domain.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                                    >
                                        <CheckCircle className="size-5 text-green-400" />
                                        <span className="font-mono text-white/90">{domain.name}</span>
                                    </motion.li>
                                  ))}
                                </ul>
                            </ScrollArea>
                            <DialogFooter className="pt-6 z-10">
                                <Button onClick={() => onOpenChange(false)} className="w-full bg-green-800 hover:bg-[#00CB07] text-white">Cerrar</Button>
                            </DialogFooter>
                         </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }
    
    return (
        <>
            <DnsAnalysisModal 
                isOpen={isAnalysisModalOpen}
                onOpenChange={setIsAnalysisModalOpen}
                domain={selectedDomain}
            />
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                 <DialogContent className="max-w-4xl w-full h-[600px] flex flex-col p-0 gap-0 bg-black border-2 border-red-500/30 text-white overflow-hidden" showCloseButton={false}>
                     <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 h-full">
                        <div className="flex flex-col items-center justify-center p-8 relative overflow-hidden">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }} 
                                animate={{ scale: 1, opacity: 1 }} 
                                transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }} 
                                className="relative w-48 h-48"
                            >
                                <div className="w-full h-full flex items-center justify-center">
                                    <AlertCircle className="size-24 text-red-400" />
                                </div>
                            </motion.div>
                            <h2 className="text-3xl font-bold text-white mt-4">Anomalía Detectada</h2>
                            <p className="text-red-200/70 text-lg mt-1">Se requiere acción inmediata.</p>
                        </div>

                        <div className="flex flex-col p-8 bg-black/30 backdrop-blur-sm border-l border-red-500/20">
                            <DialogHeader className="text-left z-10">
                                <DialogTitle className="text-2xl font-bold text-red-300">
                                    Diagnóstico de DNS
                                </DialogTitle>
                                <DialogDescription className="text-red-200/70">
                                    Algunos de tus dominios tienen configuraciones incorrectas que podrían afectar la entrega de correos.
                                </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="flex-1 mt-6 -mr-4 pr-4 custom-scrollbar z-10">
                               <ul className="space-y-3">
                                  {mockErrorDomains.map((domain, index) => (
                                    <motion.li
                                        key={domain.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-3 rounded-lg border bg-black/20"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="flex items-center gap-3">
                                            {domain.status === 'ok' ? <CheckCircle className="size-5 text-green-400" /> : <AlertCircle className="size-5 text-red-400" />}
                                            <span className="font-mono text-white/90">{domain.name}</span>
                                          </div>
                                        </div>
                                        {domain.status === 'error' && (
                                           <div className="pl-8 pt-3">
                                             <Button size="sm" className="h-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 w-full" onClick={() => handleAnalyzeDomain(domain.name)}>
                                                <Bot className="mr-2" /> Analizar con IA
                                            </Button>
                                           </div>
                                        )}
                                    </motion.li>
                                  ))}
                                </ul>
                            </ScrollArea>
                            <DialogFooter className="pt-6 z-10">
                                <Button onClick={() => onOpenChange(false)} className="w-full bg-red-800 hover:bg-red-700 text-white">Cerrar</Button>
                            </DialogFooter>
                        </div>
                     </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

