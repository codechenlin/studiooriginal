"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, CheckCircle, BrainCircuit, Link, FileScan, UserCheck, Code, Fingerprint, Lock, ShieldQuestion } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AntivirusStatusModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const analysisItems = [
    { icon: Link, title: "Análisis de Enlaces y Redirecciones", description: "Cada URL ha sido validada en tiempo real contra bases de datos de amenazas globales para neutralizar cualquier intento de phishing." },
    { icon: FileScan, title: "Escaneo Heurístico de Adjuntos", description: "Los archivos adjuntos fueron analizados en un entorno aislado (sandbox) para detectar comportamientos maliciosos antes de que te afecten." },
    { icon: UserCheck, title: "Verificación de Suplantación de Identidad (Spoofing)", description: "Se ha confirmado la autenticidad del remitente a través de los protocolos DMARC, DKIM y SPF, garantizando que el correo es legítimo." },
    { icon: Code, title: "Detección de Scripts Maliciosos", description: "El código fuente del correo ha sido inspeccionado y saneado para neutralizar cualquier script oculto diseñado para comprometer tus datos." },
    { icon: Fingerprint, title: "Análisis de Huella Digital del Correo", description: "Comparamos la 'huella digital' única de este correo con millones de muestras de nuestra base de datos global para descartar similitudes con campañas de phishing." },
];

const protectionItems = [
    { icon: Lock, title: "Encriptación de Contenido", description: "El contenido sensible se mantiene encriptado en todo momento para proteger tu privacidad, incluso si el correo es interceptado." },
    { icon: BrainCircuit, title: "Análisis Predictivo de Comportamiento", description: "Nuestra IA no solo busca amenazas conocidas, sino que aprende y se anticipa a nuevas tácticas de ataque antes de que sean catalogadas globalmente." },
    { icon: ShieldQuestion, title: "Cuarentena Atómica", description: "Cualquier elemento mínimamente sospechoso es aislado a nivel subatómico en un entorno virtual, impidiendo cualquier posible daño a tu sistema." },
];

export function AntivirusStatusModal({ isOpen, onOpenChange }: AntivirusStatusModalProps) {
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[650px] flex p-0 gap-0 bg-zinc-900/80 backdrop-blur-2xl border-2 border-cyan-400/30 text-white overflow-hidden" showCloseButton={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 h-full w-full">
            {/* Section 1: Left Panel */}
            <div className="relative h-full w-full bg-black/30 flex flex-col items-center justify-center p-8 overflow-hidden border-r border-cyan-400/20">
                <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,white_40%,transparent_100%)]"/>
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-transparent via-transparent to-blue-900/40 opacity-50"/>

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
                <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(hsl(var(--accent))_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,white_40%,transparent_100%)]"/>
                <DialogHeader className="text-left mb-4 z-10">
                    <DialogTitle className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                        <BrainCircuit />
                        Análisis de Este Correo
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 space-y-3 -mr-3 pr-3 custom-scrollbar z-10">
                    {analysisItems.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.15 + 0.4 }}
                            className="flex items-start gap-4 p-3 rounded-lg border border-cyan-500/20 bg-cyan-950/20 hover:bg-cyan-900/40 transition-colors"
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
                </ScrollArea>
            </div>

            {/* Section 3: Right Panel */}
            <div className="flex flex-col h-full p-6 bg-black/10 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-30 bg-gradient-to-br from-purple-900/20 via-transparent to-transparent"/>
                 <div className="relative z-10 text-center flex flex-col items-center">
                    <motion.div initial={{ scale: 0.8, opacity: 0}} animate={{ scale: 1, opacity: 1}} transition={{ delay: 0.5, duration: 0.5}}>
                        <CheckCircle className="size-16 text-green-300 mb-2 animate-icon-pulse-banner" style={{ filter: 'drop-shadow(0 0 10px #39FF14)'}}/>
                    </motion.div>
                    <motion.h2 className="text-2xl font-bold tracking-tight text-reveal" style={{'--reveal-delay': '0.7s'} as React.CSSProperties}>Veredicto Final: <span className="text-green-300">Cero Amenazas</span></motion.h2>
                </div>
                 <ScrollArea className="flex-1 mt-6 space-y-6 -mr-3 pr-3 custom-scrollbar z-10">
                      {protectionItems.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 + 0.8 }}
                            className="flex items-start gap-4"
                        >
                           <div className="relative p-3 bg-purple-950/50 rounded-full border-2 border-purple-500/30 node-pulse" style={{ animationDelay: `${index * 0.5}s` }}>
                                <item.icon className="size-6 text-purple-300" />
                                <div className="absolute top-0 left-0 w-full h-full circuit-flow" style={{ animationDelay: `${index * 1}s` }} />
                            </div>
                            <div className="pt-1">
                                <h4 className="font-semibold text-white">{item.title}</h4>
                                <p className="text-sm text-white/70">{item.description}</p>
                            </div>
                        </motion.div>
                      ))}
                </ScrollArea>
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
