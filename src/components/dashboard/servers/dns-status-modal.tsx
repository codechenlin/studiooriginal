
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Bot, ShieldCheck } from 'lucide-react';
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

const Particle = ({ className }: { className?: string }) => {
    const style = {
      '--x': `${Math.random() * 100}%`,
      '--y': `${Math.random() * 100}%`,
      '--s': `${Math.random() * 0.5 + 0.5}`,
      '--d': `${Math.random() * 2 + 1}s`,
      '--d2': `${Math.random() * 1 + 0.5}s`
    } as React.CSSProperties;
    return <div className={className} style={style} />;
};


export function DnsStatusModal({ isOpen, onOpenChange, status }: DnsStatusModalProps) {
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    const handleAnalyzeDomain = (domain: string) => {
        setSelectedDomain(domain);
        setIsAnalysisModalOpen(true);
    };

    if (!status) return null;

    if (status === 'ok') {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl w-full h-[600px] flex flex-col p-0 gap-0 bg-black border-2 border-green-500/30 text-white overflow-hidden" showCloseButton={false}>
                    <style>{`
                        @keyframes digital-rain {
                          from { transform: translateY(-100%); }
                          to { transform: translateY(100%); }
                        }
                        .digital-rain-col {
                            position: absolute;
                            height: 100%;
                            width: 20px;
                            opacity: 0.1;
                            animation: digital-rain linear infinite;
                        }
                        .digital-rain-char {
                            display: block;
                            font-family: monospace;
                            color: hsl(140 100% 50%);
                        }
                        @keyframes core-pulse {
                          0%, 100% { transform: scale(1); box-shadow: 0 0 40px 10px hsl(140 100% 50% / 0.2); }
                          50% { transform: scale(1.05); box-shadow: 0 0 60px 20px hsl(140 100% 50% / 0.3); }
                        }
                        @keyframes ring-rotate {
                          to { transform: rotate(360deg); }
                        }
                    `}</style>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 h-full">
                        <div className="relative flex flex-col items-center justify-center p-8 overflow-hidden">
                           <div className="absolute inset-0 bg-grid-green-500/10 [mask-image:radial-gradient(ellipse_at_center,white_50%,transparent_100%)] z-0"/>
                             {isClient && Array.from({length: 30}).map((_, i) => (
                                <div key={i} className="digital-rain-col" style={{ left: `${Math.random() * 100}%`, animationDuration: `${Math.random() * 5 + 5}s`, animationDelay: `-${Math.random() * 10}s` }}>
                                    {Array.from({length: 30}).map((_, j) => (
                                        <span key={j} className="digital-rain-char" style={{opacity: Math.random()}}>{Math.random() > 0.5 ? '1' : '0'}</span>
                                    ))}
                                </div>
                            ))}
                             <motion.div 
                                initial={{ scale: 0.5, opacity: 0 }} 
                                animate={{ scale: 1, opacity: 1 }} 
                                transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }} 
                                className="relative w-48 h-48"
                            >
                                <div className="absolute inset-0 rounded-full animate-[core-pulse_4s_infinite_ease-in-out]" />
                                <div className="absolute inset-0 rounded-full border-2 border-green-500/20 animate-[ring-rotate_20s_linear_infinite]" />
                                <div className="absolute inset-4 rounded-full border-2 border-green-500/30 animate-[ring-rotate_15s_linear_infinite_reverse]" />
                                <div className="absolute inset-8 rounded-full border-2 border-green-500/40 animate-[ring-rotate_10s_linear_infinite]" />
                                <div className="w-full h-full flex items-center justify-center">
                                    <ShieldCheck className="size-24 text-green-400" style={{filter: 'drop-shadow(0 0 15px hsl(140 100% 50%))'}} />
                                </div>
                            </motion.div>
                            <h2 className="text-3xl font-bold text-white mt-4">Sistema de Integridad Activo</h2>
                            <p className="text-green-200/70 text-lg mt-1">Todos los dominios operativos.</p>
                        </div>
                         <div className="flex flex-col p-8 bg-black/30 backdrop-blur-sm border-l border-green-500/20">
                           <div className="absolute inset-0 bg-grid-green-500/5 [mask-image:radial-gradient(ellipse_at_top,white_10%,transparent_100%)] z-0"/>
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
                    <style>{`
                        @keyframes glitch-line {
                            0% { transform: translateY(${Math.random() * 100}%); opacity: ${Math.random()}; }
                            100% { transform: translateY(${Math.random() * 100}%); opacity: ${Math.random()}; }
                        }
                        .glitch-line {
                            position: absolute;
                            left: 0;
                            right: 0;
                            height: 1px;
                            background: hsl(0 100% 50% / 0.5);
                            animation: glitch-line 0.1s infinite alternate;
                        }
                        @keyframes orb-flicker {
                            0%, 100% { box-shadow: 0 0 30px 10px hsl(0 100% 50% / 0.2); opacity: 0.8; }
                            50% { box-shadow: 0 0 40px 15px hsl(0 100% 50% / 0.4); opacity: 1; }
                        }
                        @keyframes particle-burst {
                            from { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                            to { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
                        }
                        .particle-burst { position: absolute; top: 50%; left: 50%; border-radius: 50%; animation: particle-burst var(--d) cubic-bezier(0.1, 0.7, 1.0, 0.1) infinite; animation-delay: var(--d2); background-color: hsl(0 100% 50% / 0.8); width: var(--s); height: var(--s); }
                    `}</style>
                    <div className="absolute inset-0 bg-red-950/50 bg-grid-red-500/10 z-0" />
                    <div className="absolute inset-0 [mask-image:url('data:image/svg+xml,<svg_xmlns=\"http://www.w3.org/2000/svg\"_viewBox=\"0_0_100_100\"><filter_id=\"noise\"><feTurbulence_type=\"fractalNoise\"_baseFrequency=\"0.8\"_numOctaves=\"4\"_stitchTiles=\"stitch\"/></filter><rect_width=\"100%\"_height=\"100%\"_filter=\"url(%23noise)\"/></svg>')] opacity-[0.03]" />

                     <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 h-full">
                        <div className="flex flex-col items-center justify-center p-8 relative overflow-hidden">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }} 
                                animate={{ scale: 1, opacity: 1 }} 
                                transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }} 
                                className="relative w-48 h-48"
                            >
                                <div className="absolute inset-0 rounded-full animate-[orb-flicker_2s_infinite_ease-in-out]" />
                                <div className="w-full h-full flex items-center justify-center">
                                    <AlertCircle className="size-24 text-red-400 animate-[orb-flicker_1.5s_infinite_reverse]" style={{filter: 'drop-shadow(0 0 15px hsl(0 100% 50%))'}} />
                                </div>
                                {isClient && Array.from({length: 15}).map((_, i) => <Particle key={i} className="particle-burst" />)}
                            </motion.div>
                            <h2 className="text-3xl font-bold text-white mt-4">Anomalía Detectada</h2>
                            <p className="text-red-200/70 text-lg mt-1">Se requiere acción inmediata.</p>
                        </div>

                        <div className="flex flex-col p-8 bg-black/30 backdrop-blur-sm border-l border-red-500/20">
                           <div className="absolute inset-0 bg-grid-red-500/5 [mask-image:radial-gradient(ellipse_at_top,white_10%,transparent_100%)] z-0"/>
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
