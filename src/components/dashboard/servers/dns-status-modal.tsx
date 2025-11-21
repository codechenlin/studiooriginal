
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Bot, Shield, AlertTriangle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DnsAnalysisModal } from './dns-analysis-modal';
import { cn } from '@/lib/utils';

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
    { name: 'mi-dominio-super-largo-para-probar-el-truncado.com', status: 'error' },
    { name: 'test-env.dev', status: 'ok' },
];

const StatusDisplay = ({ status, onAnalyze }: { status: ProviderStatus | null, onAnalyze: (domain: string) => void }) => {
    if (status === 'ok') {
        return (
            <div className="w-2/3 flex flex-col p-8 bg-black/30 backdrop-blur-sm relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,100,255,0.1)_0%,_transparent_60%)] opacity-70" />
                <DialogHeader className="text-left z-10">
                    <DialogTitle className="text-2xl font-bold" style={{color: '#00CB07'}}>
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
                    <Button onClick={() => onAnalyze('')} className="w-full bg-green-800 hover:bg-[#00CB07] text-white">Cerrar</Button>
                </DialogFooter>
            </div>
        );
    }
    
    return (
        <div className="w-2/3 flex flex-col p-8 bg-black/30 backdrop-blur-sm relative">
            <div className="absolute inset-0 bg-grid-red-500/10 [mask-image:radial-gradient(ellipse_at_top_right,white_10%,transparent_60%)]" />
            <DialogHeader className="text-left z-10">
                <DialogTitle className="text-2xl font-bold" style={{ color: '#F00000' }}>
                    Estado del Sistema: Incidencia
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
                        className={cn("p-4 rounded-lg border", domain.status === 'ok' ? 'border-green-500/20 bg-green-500/10' : 'border-red-500/20 bg-red-500/10')}
                    >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {domain.status === 'ok' ? <CheckCircle className="size-5 text-green-400 flex-shrink-0" /> : <AlertCircle className="size-5 text-red-400 flex-shrink-0" />}
                            <span className="font-mono text-white/90 truncate" title={domain.name}>{domain.name}</span>
                          </div>
                          {domain.status === 'error' && (
                            <button
                                onClick={() => onAnalyze(domain.name)}
                                className="relative group/error-btn inline-flex items-center justify-center overflow-hidden rounded-lg p-3 text-white h-9"
                                style={{ background: 'linear-gradient(to right, #AD00EC, #1700E6)' }}
                            >
                                <div className="ai-button-scan absolute inset-0"/>
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                  <Bot className="size-4"/>
                                  <span className="text-sm font-semibold">Analizar con IA</span>
                                </div>
                            </button>
                           )}
                        </div>
                    </motion.li>
                  ))}
                </ul>
            </ScrollArea>
            <DialogFooter className="pt-6 z-10">
                <Button onClick={() => onAnalyze('')} className="w-full bg-red-800 hover:bg-red-700 text-white">Cerrar</Button>
            </DialogFooter>
        </div>
    );
}

export function DnsStatusModal({ isOpen, onOpenChange, status }: DnsStatusModalProps) {
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

    const handleAnalyzeDomain = (domain: string) => {
        setSelectedDomain(domain);
        if(domain) {
            setIsAnalysisModalOpen(true);
        } else {
            onOpenChange(false);
        }
    };

    const AnimationPanel = () => (
        <div className="w-1/3 relative flex items-center justify-center overflow-hidden border-r"
            style={{ 
                borderColor: status === 'ok' ? 'rgba(0, 255, 100, 0.2)' : 'rgba(255, 0, 0, 0.2)',
                background: `radial-gradient(ellipse at center, ${status === 'ok' ? 'rgba(0,203,7,0.1)' : 'rgba(255,0,0,0.15)'} 0%, transparent 70%)`
            }}
        >
             {status === 'ok' ? (
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }}>
                    <div className="relative p-6 rounded-full border-2 border-green-400/50 bg-green-900/30 node-pulse">
                        <Shield className="size-20 text-green-300" style={{ filter: 'drop-shadow(0 0 15px #00ff6a)' }}/>
                        <CheckCircle className="absolute bottom-4 right-2 size-8 text-white bg-green-500 rounded-full border-4 border-gray-900" />
                    </div>
                </motion.div>
             ) : (
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }}>
                    <div className="relative p-6 rounded-full border-2 border-red-400/50 bg-red-900/30">
                        <AlertTriangle className="size-20 text-red-300" style={{ filter: 'drop-shadow(0 0 15px #ff0000)' }}/>
                    </div>
                </motion.div>
             )}
        </div>
    );
    
    return (
        <>
            <DnsAnalysisModal 
                isOpen={isAnalysisModalOpen}
                onOpenChange={setIsAnalysisModalOpen}
                domain={selectedDomain}
            />
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl w-full h-[600px] flex p-0 gap-0 bg-black text-white overflow-hidden" showCloseButton={false}>
                    <AnimationPanel />
                    <StatusDisplay status={status} onAnalyze={handleAnalyzeDomain} />
                </DialogContent>
            </Dialog>
        </>
    );
}
