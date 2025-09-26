
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, ShieldCheck, Dna, Bot, Shield, Loader2 } from 'lucide-react';
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

    if(status === 'ok') {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl w-full h-[600px] flex flex-col p-0 gap-0 bg-zinc-900/90 backdrop-blur-2xl border-2 border-green-500/30 text-white overflow-hidden" showCloseButton={false}>
                    <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                        {/* Left Panel */}
                        <div className="relative h-full w-full bg-black/30 flex flex-col items-center justify-center p-8 overflow-hidden">
                             <div className="absolute inset-0 bg-grid-green-500/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
                             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-500/10 via-transparent to-green-500/10 animate-[scan_5s_linear_infinite]" />
                              <style>{`
                                @keyframes scan {
                                  0% { transform: translateY(-100%); }
                                  100% { transform: translateY(100%); }
                                }
                              `}</style>
                            <motion.div 
                                initial={{ scale: 0.5, opacity: 0 }} 
                                animate={{ scale: 1, opacity: 1 }} 
                                transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }} 
                                className="relative z-10 flex flex-col items-center text-center"
                            >
                                <motion.div
                                  animate={{ scale: [1, 1.05, 1], filter: ['drop-shadow(0 0 10px #00CB07)', 'drop-shadow(0 0 25px #00CB07)', 'drop-shadow(0 0 10px #00CB07)'] }}
                                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                >
                                  <ShieldCheck className="size-20 text-green-400" />
                                </motion.div>
                                <h2 className="text-3xl font-bold text-white mt-4">Todo en Orden</h2>
                                <p className="text-green-200/70 text-lg mt-1">Todos tus dominios están verificados y saludables.</p>
                            </motion.div>
                        </div>
                        {/* Right Panel */}
                        <div className="flex flex-col h-full p-8 relative">
                           <div className="absolute inset-0 bg-grid-zinc-400/[0.05] [mask-image:radial-gradient(ellipse_at_center,transparent_60%,black)]" />
                            <DialogHeader className="text-left z-10">
                                <DialogTitle className="text-2xl font-bold text-green-300">
                                    Estado del Sistema: Óptimo
                                </DialogTitle>
                                <DialogDescription className="text-green-200/70">
                                    Nuestro sistema de vigilancia neuronal monitorea tus registros DNS 24/7 para asegurar la máxima entregabilidad.
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
            <DialogContent className="max-w-4xl w-full h-[600px] flex flex-col p-0 gap-0 bg-zinc-900/90 backdrop-blur-2xl border-2 border-red-500/30 text-white overflow-hidden" showCloseButton={false}>
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                    {/* Left Panel */}
                    <div className="relative h-full w-full bg-black/30 flex flex-col items-center justify-center p-8 overflow-hidden">
                        <div className="absolute inset-0 bg-grid-red-500/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
                        <div className="absolute inset-0 animate-[glitch_2s_infinite_steps(8)]" style={{backgroundImage: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 10\'><line x1=\'0\' y1=\'5\' x2=\'100\' y2=\'5\' stroke=\'%23F0000033\' stroke-width=\'1\'/><line x1=\'0\' y1=\'8\' x2=\'100\' y2=\'8\' stroke=\'%23F0000022\' stroke-width=\'0.5\'/></svg>")'}}/>
                        <style>{`@keyframes glitch { 0% { transform: translate(0); } 20% { transform: translate(-2px, 2px); } 40% { transform: translate(-2px, -2px); } 60% { transform: translate(2px, 2px); } 80% { transform: translate(2px, -2px); } 100% { transform: translate(0); }}`}</style>
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }} className="relative z-10 flex flex-col items-center text-center">
                            <motion.div 
                                animate={{ scale: [1, 1.1, 1] }} 
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} 
                                className="relative p-4 rounded-full mb-4"
                            >
                                <AlertCircle className="text-red-400 size-20" style={{ filter: 'drop-shadow(0 0 15px #F00000)' }}/>
                                <div className="absolute inset-0 rounded-full border-4 border-red-500/50 animate-ping"/>
                            </motion.div>
                            <h2 className="text-3xl font-bold text-white">Acción Requerida</h2>
                            <p className="text-red-200/70 text-lg mt-1">Se han detectado errores en algunos dominios.</p>
                        </motion.div>
                    </div>
                    {/* Right Panel */}
                    <div className="flex flex-col h-full p-8 relative">
                       <div className="absolute inset-0 bg-grid-zinc-400/[0.05] [mask-image:radial-gradient(ellipse_at_center,transparent_60%,black)]" />
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
