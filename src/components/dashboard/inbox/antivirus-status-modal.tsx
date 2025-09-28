
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, CheckCircle, BrainCircuit, Eye, Server, Layers, Package, ScanSearch, FileScan, UserCheck, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface AntivirusStatusModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const analysisItems = [
    { icon: ScanSearch, title: "Análisis Heurístico Profundo", description: "Nuestro motor de IA examina la estructura y el código del correo en busca de anomalías y patrones sospechosos para encontrar desviaciones." },
    { icon: Layers, title: "Escaneo de Firmas de Malware", description: "El correo fue examinado con nuestra base de datos global de 2 mil millones de amenazas conocidas para encontrar coincidencia." },
    { icon: UserCheck, title: "Verificación de Suplantación de Identidad", description: "Se valida la autenticidad del remitente a través de DMARC, DKIM y SPF. El Núcleo de IA confirmara si el correo es legítimo." },
    { icon: Code, title: "Saneamiento de Scripts", description: "El código HTML y JavaScript es inspeccionado y saneado, neutralizando cualquier script ofuscado o rutina potencialmente maliciosa." },
    { icon: FileScan, title: "Análisis Forense de Adjuntos", description: "Cada archivo adjunto es detonado en un sandbox virtualizado para analizar su comportamiento y verificar que todos los archivos son seguros." },
    { icon: Package, title: "Detección de Archivos Comprimidos Maliciosos", description: "Se analizan todos los archivos comprimidos (ZIP, RAR) para descartar 'bombas de descompresión' y malware oculto." },
];

const protectionItems = [
    { title: "Análisis Heurístico Profundo", icon: ScanSearch },
    { title: "Escaneo de Firmas de Malware", icon: Layers },
    { title: "Verificación de Suplantación de Identidad", icon: UserCheck },
    { title: "Saneamiento de Scripts", icon: Code },
    { title: "Análisis Forense de Adjuntos", icon: FileScan },
    { title: "Detección de Archivos Comprimidos Maliciosos", icon: Package },
];

export function AntivirusStatusModal({ isOpen, onOpenChange }: AntivirusStatusModalProps) {
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[650px] flex p-0 gap-0 bg-zinc-900/90 backdrop-blur-2xl border-2 border-cyan-400/30 text-white overflow-hidden" showCloseButton={false}>
           <DialogHeader className="sr-only">
            <DialogTitle>Estado del Antivirus</DialogTitle>
            <DialogDescription>
              Un resumen detallado del análisis de seguridad realizado en el correo electrónico.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 h-full w-full">
            {/* Section 1: Left Panel */}
            <div className="relative h-full w-full bg-black/30 flex flex-col items-center justify-between p-8 overflow-hidden border-r border-cyan-400/20">
                <div className="absolute inset-0 w-full h-full hexagonal-grid opacity-20" />
                <div className="absolute inset-0 w-full h-full radar-scanner" />
                
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
                             <circle className="pulse-dot" cx="20" cy="20" r="2" fill="#00ADEC"/>
                             <circle className="pulse-dot" cx="80" cy="80" r="2" fill="#E18700" style={{animationDelay: '1s'}}/>
                             <circle className="pulse-dot" cx="80" cy="20" r="2" fill="#AD00EC" style={{animationDelay: '0.5s'}}/>
                        </svg>
                        <ShieldCheck className="size-24 text-cyan-300" style={{ filter: 'drop-shadow(0 0 20px #00adec)' }}/>
                    </div>
                     <div className="p-3 rounded-lg bg-gradient-to-r from-[#00CE07]/20 to-[#A6EE00]/20 border border-[#00CE07]/50 flex items-center gap-3">
                        <CheckCircle className="size-6 text-[#A6EE00]"/>
                        <span className="font-semibold text-white text-lg">SISTEMA ACTIVO</span>
                    </div>
                    <p className="text-cyan-200/70 text-base">Nuestro núcleo de IA está analizando y protegiendo tu bandeja de entrada en tiempo real.</p>
                </motion.div>
                <div className="z-10 w-full pt-6">
                  <Button 
                    onClick={() => onOpenChange(false)} 
                    className="w-full h-12 text-base font-bold text-cyan-200 bg-cyan-900/50 border-2 border-cyan-500/50 rounded-lg hover:bg-cyan-800/70 hover:border-cyan-400 hover:text-white transition-all duration-300 ai-button-scan"
                  >
                    Entendido
                  </Button>
                </div>
            </div>

            {/* Section 2: Middle Panel */}
            <div className="flex flex-col h-full p-6 border-r border-cyan-400/20 bg-black/20 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10 bg-grid-blue-500/30"/>
                <div className="text-left mb-4 z-10 shrink-0">
                    <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                        <BrainCircuit />
                        Análisis del Correo
                    </h2>
                </div>
                <ScrollArea className="flex-1 -mr-3 pr-3 custom-scrollbar z-10">
                  <div className="space-y-4">
                    {analysisItems.map((item, index) => (
                        <React.Fragment key={item.title}>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.15 + 0.4 }}
                            className="group/card relative p-4 rounded-lg bg-blue-950/40 border border-blue-500/20 overflow-hidden"
                        >
                             <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-[#1700E6] to-[#009AFF]"/>
                            <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-950/70 border border-green-500/30">
                                <div className="size-2 rounded-full bg-[#39FF14] led-pulse"/>
                                <span className="text-xs font-bold text-green-300">ACTIVADO</span>
                            </div>
                            <div className="flex items-start gap-4 pt-8">
                                <div className="relative p-2 bg-blue-950/50 rounded-full border border-blue-500/30">
                                    <div className="absolute inset-0 rounded-full icon-check-pulse bg-green-500/30"/>
                                    <item.icon className="relative z-10 size-6 text-blue-300" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-white">{item.title}</h4>
                                    <p className="text-sm text-white/70">{item.description}</p>
                                </div>
                            </div>
                        </motion.div>
                        {index < analysisItems.length - 1 && <Separator className="bg-blue-500/20" />}
                        </React.Fragment>
                    ))}
                  </div>
                </ScrollArea>
            </div>

            {/* Section 3: Right Panel */}
             <div className="flex flex-col h-full p-6 bg-black/10 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-30 bg-gradient-to-br from-green-900/20 via-transparent to-transparent"/>
                 <div className="relative z-10 text-center flex flex-col items-center">
                     <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="relative"
                    >
                         <CheckCircle className="size-16 text-green-300 mb-2 icon-check-pulse" style={{ filter: 'drop-shadow(0 0 10px #39FF14)'}}/>
                    </motion.div>
                    <motion.h2
                      className="text-2xl font-bold tracking-tight relative"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <span className="text-white">Veredicto: </span>
                      <span className="scanline-text" data-text="Cero Amenazas" style={{color: '#00CB07', textShadow: '0 0 8px #00CB07'}}>Cero Amenazas</span>
                    </motion.h2>
                </div>
                 <ScrollArea className="flex-1 mt-6 -mr-3 pr-3 custom-scrollbar z-10">
                    <div className="space-y-3">
                        {protectionItems.map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.15 + 1.0 }}
                                className="p-3 rounded-lg bg-black/30 flex items-center justify-between"
                            >
                                <div className="text-sm font-semibold text-white/90">{item.title}</div>
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-300">
                                        <Eye size={14}/>
                                        <span>VERIFICADO</span>
                                    </div>
                                    <div className="relative p-2 rounded-full bg-green-950/50">
                                      <svg className="absolute inset-0 w-full h-full animate-[hud-spin_8s_linear_infinite]" viewBox="0 0 100 100" style={{ animationDelay: `${index * 0.3}s`}}>
                                          <defs>
                                            <linearGradient id="protection-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                              <stop offset="0%" stopColor="#A6EE00" />
                                              <stop offset="100%" stopColor="#00CB07" />
                                            </linearGradient>
                                          </defs>
                                          <path d="M 50,5 A 45,45 0 0,1 95,50" stroke="url(#protection-ring-gradient)" strokeWidth="1.5" fill="none" strokeDasharray="5, 10" />
                                      </svg>
                                      <CheckCircle className="size-5 text-green-300" style={{ fill: 'rgba(0, 203, 7, 0.1)' }} />
                                  </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}
