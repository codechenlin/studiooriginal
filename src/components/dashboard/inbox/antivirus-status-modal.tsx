
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, CheckCircle, BrainCircuit, Link, FileScan, UserCheck, Code, Fingerprint, Lock, ShieldQuestion } from 'lucide-react';
import { motion } from 'framer-motion';

interface AntivirusStatusModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const Particle = () => {
    const colors = ['#00ADEC', '#E18700', '#AD00EC'];
    const style: React.CSSProperties = {
      '--size': `${Math.random() * 2.5 + 1}px`,
      '--x-start': `${Math.random() * 100}%`,
      '--y-start': `${Math.random() * 100}%`,
      '--x-end': `${Math.random() * 200 - 50}%`,
      '--y-end': `${Math.random() * 200 - 50}%`,
      '--duration': `${Math.random() * 8 + 7}s`,
      '--delay': `-${Math.random() * 15}s`,
      '--color': colors[Math.floor(Math.random() * colors.length)]
    } as any;
    return <div className="particle" style={style} />;
};

const analysisItems = [
    { icon: Link, title: "Análisis de Enlaces y Redirecciones", description: "Cada URL ha sido validada en tiempo real contra bases de datos de amenazas globales." },
    { icon: FileScan, title: "Escaneo Heurístico de Adjuntos", description: "Los archivos adjuntos fueron analizados en un entorno aislado para detectar comportamientos maliciosos." },
    { icon: UserCheck, title: "Verificación de Suplantación de Identidad (Spoofing)", description: "Se ha confirmado la autenticidad del remitente a través de los protocolos DMARC, DKIM y SPF." },
    { icon: Code, title: "Detección de Scripts Maliciosos", description: "El código fuente del correo ha sido inspeccionado para neutralizar cualquier script oculto." },
    { icon: Fingerprint, title: "Análisis de Huella Digital", description: "Se comparó la 'huella digital' del correo con millones de muestras para descartar similitudes con campañas de phishing conocidas." },
];

const protectionItems = [
    { icon: Lock, title: "Encriptación de Contenido", description: "El contenido sensible se mantiene encriptado en todo momento." },
    { icon: BrainCircuit, title: "Análisis Predictivo de Comportamiento", description: "La IA aprende y se anticipa a nuevas amenazas antes de que sean catalogadas." },
    { icon: ShieldQuestion, title: "Cuarentena Atómica", description: "Cualquier elemento sospechoso es aislado a nivel subatómico, impidiendo cualquier posible daño." },
];

export function AntivirusStatusModal({ isOpen, onOpenChange }: AntivirusStatusModalProps) {
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[650px] flex p-0 gap-0 bg-black/80 backdrop-blur-2xl border-2 border-cyan-400/30 text-white overflow-hidden" showCloseButton={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 h-full w-full">
            {/* Section 1: Left Panel */}
            <div className="relative h-full w-full bg-black/30 flex flex-col items-center justify-center p-8 overflow-hidden border-r border-cyan-400/20">
                <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
                    {Array.from({ length: 150 }).map((_, i) => <Particle key={i} />)}
                </div>
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }}
                    className="relative z-10 flex flex-col items-center text-center gap-6"
                >
                     <div className="relative p-6">
                        <svg className="absolute inset-0 w-full h-full animate-[hud-spin_15s_linear_infinite]" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="48" stroke="rgba(0,173,236,0.2)" strokeWidth="0.5" fill="none" />
                            <path d="M 50,2 A 48,48 0 0,1 98,50" stroke="rgba(0,173,236,0.7)" strokeWidth="1" fill="none" strokeDasharray="3, 6" />
                             <circle cx="50" cy="50" r="35" stroke="rgba(0,173,236,0.1)" strokeWidth="4" fill="none" />
                        </svg>
                        <ShieldCheck className="size-24 text-cyan-300 animate-[icon-pulse_4s_infinite_ease-in-out]" style={{ filter: 'drop-shadow(0 0 20px #00adec)' }}/>
                    </div>
                     <div className="p-3 rounded-lg bg-gradient-to-r from-[#00CE07]/20 to-[#A6EE00]/20 border border-[#00CE07]/50 flex items-center gap-3">
                        <CheckCircle className="size-6 text-[#A6EE00]"/>
                        <span className="font-semibold text-white text-lg">SISTEMA ACTIVO</span>
                    </div>
                    <p className="text-cyan-200/70 text-base">Nuestro núcleo de IA está analizando y protegiendo tu bandeja de entrada en tiempo real.</p>
                </motion.div>
            </div>

            {/* Section 2: Middle Panel */}
            <div className="flex flex-col h-full p-6 border-r border-cyan-400/20 bg-black/20 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10 bg-grid-blue-500/30 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
                <DialogHeader className="text-left mb-4 z-10">
                    <DialogTitle className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                        <BrainCircuit />
                        Análisis de Este Correo
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar -mr-3 pr-3 z-10">
                    {analysisItems.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.15 + 0.4 }}
                            className="flex items-start gap-4 p-3 rounded-lg border border-cyan-400/20 bg-cyan-900/20"
                        >
                            <div className="relative p-2 bg-cyan-950/50 rounded-full border border-cyan-500/30">
                                <item.icon className="size-6 text-cyan-400" />
                                <div className="absolute -top-1 -right-1 flex items-center justify-center size-4 bg-green-500 rounded-full border-2 border-black">
                                    <CheckCircle className="text-black size-4 animate-icon-check-pulse" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">{item.title}</h4>
                                <p className="text-sm text-white/70">{item.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Section 3: Right Panel */}
            <div className="flex flex-col h-full p-6 bg-black/10 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-30 bg-gradient-to-br from-purple-900/20 via-transparent to-transparent"/>
                 <DialogHeader className="text-left mb-4 z-10">
                    <DialogTitle className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                        <CheckCircle />
                        Veredicto Final: Cero Amenazas
                    </DialogTitle>
                </DialogHeader>
                 <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar -mr-3 pr-3 z-10">
                      {protectionItems.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.15 + 0.6 }}
                            className="flex items-start gap-4 p-3 rounded-lg border border-purple-500/20 bg-purple-900/20"
                        >
                           <div className="relative p-2 bg-purple-950/50 rounded-full border border-purple-500/30">
                                <item.icon className="size-6 text-purple-400" />
                                <div className="absolute -top-1 -right-1 flex items-center justify-center size-4 bg-green-500 rounded-full border-2 border-black">
                                    <CheckCircle className="text-black size-4 animate-icon-check-pulse" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">{item.title}</h4>
                                <p className="text-sm text-white/70">{item.description}</p>
                            </div>
                        </motion.div>
                      ))}
                </div>
                 <DialogFooter className="pt-6 z-10">
                  <Button 
                    onClick={() => onOpenChange(false)} 
                    className="w-full h-12 text-base font-bold text-cyan-200 bg-cyan-900/50 border-2 border-cyan-500/50 rounded-lg hover:bg-cyan-800/70 hover:border-cyan-400 hover:text-white transition-all duration-300 ai-button-scan"
                  >
                    Entendido
                  </Button>
                </DialogFooter>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}
