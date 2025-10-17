
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Bot, Shield, AlertTriangle } from 'lucide-react';
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
            <>
                <DnsAnalysisModal 
                    isOpen={isAnalysisModalOpen}
                    onOpenChange={setIsAnalysisModalOpen}
                    domain={selectedDomain}
                />
                <Dialog open={isOpen} onOpenChange={onOpenChange}>
                    <DialogContent className="max-w-4xl w-full h-[600px] flex p-0 gap-0 bg-black border-2 border-green-500/30 text-white overflow-hidden" showCloseButton={false}>
                         <style>{`
                            @keyframes pulse-node {
                                0%, 100% { transform: scale(1); opacity: 0.8; }
                                50% { transform: scale(1.1); opacity: 1; }
                            }
                            @keyframes shimmer-line {
                                0% { stroke-dashoffset: 200; }
                                100% { stroke-dashoffset: -200; }
                            }
                            .node-pulse { animation: pulse-node 3s infinite ease-in-out; }
                            .line-shimmer { stroke-dasharray: 10 10; animation: shimmer-line 10s linear infinite; }
                        `}</style>
                        {/* Left Panel: Neural Core Animation */}
                        <div className="w-1/3 bg-gray-900/50 relative flex items-center justify-center overflow-hidden border-r border-green-500/20">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,203,7,0.1)_0%,_transparent_70%)]" />
                            <svg width="100%" height="100%" className="absolute inset-0 opacity-20">
                                <defs>
                                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,255,100,0.2)" strokeWidth="0.5"/>
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                                {/* Plexus lines */}
                                <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="rgba(0,255,100,0.3)" className="line-shimmer" />
                                <line x1="80%" y1="20%" x2="50%" y2="50%" stroke="rgba(0,255,100,0.3)" className="line-shimmer" />
                                <line x1="20%" y1="80%" x2="50%" y2="50%" stroke="rgba(0,255,100,0.3)" className="line-shimmer" />
                                <line x1="80%" y1="80%" x2="50%" y2="50%" stroke="rgba(0,255,100,0.3)" className="line-shimmer" />
                                <line x1="50%" y1="10%" x2="50%" y2="50%" stroke="rgba(0,255,100,0.3)" className="line-shimmer" />
                                <line x1="50%" y1="90%" x2="50%" y2="50%" stroke="rgba(0,255,100,0.3)" className="line-shimmer" />
                            </svg>

                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }} 
                                animate={{ scale: 1, opacity: 1 }} 
                                transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }}
                                className="relative z-10 flex flex-col items-center"
                            >
                                <div className="relative p-6 rounded-full border-2 border-green-400/50 bg-green-900/30 node-pulse">
                                    <Shield className="size-20 text-green-300" style={{ filter: 'drop-shadow(0 0 15px #00ff6a)' }}/>
                                    <CheckCircle className="absolute bottom-4 right-2 size-8 text-white bg-green-500 rounded-full border-4 border-gray-900" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mt-6">Todo en Orden</h2>
                                <p className="text-green-200/70 text-lg mt-1">Sistema Íntegro</p>
                            </motion.div>
                        </div>

                        {/* Right Panel: Content */}
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
                                <Button onClick={() => onOpenChange(false)} className="w-full bg-green-800 hover:bg-[#00CB07] text-white">Cerrar</Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        );
    }
    
    // Status === 'error'
    return (
        <>
            <DnsAnalysisModal 
                isOpen={isAnalysisModalOpen}
                onOpenChange={setIsAnalysisModalOpen}
                domain={selectedDomain}
            />
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                 <DialogContent className="max-w-4xl w-full h-[600px] flex p-0 gap-0 bg-black border-2 border-red-500/30 text-white overflow-hidden" showCloseButton={false}>
                     <style>{`
                        @keyframes glitch-line { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(${Math.random() * 600}px); } }
                        .glitch-line { position: absolute; left: 0; right: 0; height: 1px; background: rgba(255,0,0,0.3); animation: glitch-line ${Math.random() * 2 + 1}s infinite; }
                        @keyframes hud-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                        @keyframes ai-wave { 0%, 100% { transform: scale(0.8); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 1; } }
                        .ai-button-scan {
                          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
                          background-size: 200% 100%;
                          animation: button-scan 2s linear infinite;
                        }
                        @keyframes button-scan { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                     `}</style>

                     <div className="w-1/3 bg-gray-900/50 relative flex items-center justify-center overflow-hidden border-r border-red-500/20">
                         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,0,0,0.15)_0%,_transparent_70%)]" />
                         <div className="absolute inset-0 opacity-20"><div className="glitch-line" style={{top: '10%'}}/> <div className="glitch-line" style={{top: '50%'}}/> <div className="glitch-line" style={{top: '90%'}}/></div>

                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }}
                            className="relative z-10 flex flex-col items-center"
                        >
                            <div className="relative p-6 rounded-full border-2 border-red-400/50 bg-red-900/30">
                                {/* HUD elements */}
                                <svg className="absolute inset-0 w-full h-full animate-[hud-spin_10s_linear_infinite]" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" stroke="rgba(255,100,100,0.2)" strokeWidth="1" fill="none" />
                                    <path d="M 50,5 A 45,45 0 0,1 95,50" stroke="rgba(255,100,100,0.5)" strokeWidth="1.5" fill="none" strokeDasharray="2, 5" />
                                </svg>
                                <AlertTriangle className="size-20 text-red-300" style={{ filter: 'drop-shadow(0 0 15px #ff0000)' }}/>
                            </div>
                            <h2 className="text-3xl font-bold text-white mt-6">Acción Requerida</h2>
                            <p className="text-red-200/70 text-lg mt-1">Anomalía detectada</p>
                        </motion.div>
                     </div>

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
                                      <div className="flex items-center gap-3">
                                        {domain.status === 'ok' ? <CheckCircle className="size-5 text-green-400" /> : <AlertCircle className="size-5 text-red-400" />}
                                        <span className="font-mono text-white/90">{domain.name}</span>
                                      </div>
                                      {domain.status === 'error' && (
                                        <button
                                            onClick={() => handleAnalyzeDomain(domain.name)}
                                            className="relative group/error-btn inline-flex items-center justify-center overflow-hidden rounded-lg p-3 text-white h-9"
                                            style={{
                                                background: 'linear-gradient(to right, #AD00EC, #1700E6)',
                                            }}
                                        >
                                            <div className="ai-button-scan absolute inset-0"/>
                                            <div className="relative z-10 flex items-center justify-center gap-2">
                                                <div className="relative w-4 h-4 flex items-center justify-center">
                                                  <div className="absolute w-full h-full bg-white/20 rounded-full" style={{ animation: 'ai-wave 2s infinite ease-in-out' }}/>
                                                  <div className="absolute w-full h-full bg-white/20 rounded-full" style={{ animation: 'ai-wave 2s infinite ease-in-out 1s' }}/>
                                                  <Bot className="size-4 text-white"/>
                                                </div>
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
                            <Button onClick={() => onOpenChange(false)} className="w-full bg-red-800 hover:bg-red-700 text-white">Cerrar</Button>
                        </DialogFooter>
                    </div>
                 </DialogContent>
            </Dialog>
        </>
    );
}
