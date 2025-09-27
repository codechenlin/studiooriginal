
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Server, CheckCircle, Clock, BrainCircuit, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface AntivirusStatusModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const techItems = [
    { name: "Análisis Predictivo de Comportamiento", info: "Nuestro motor de IA no solo busca firmas conocidas; analiza el comportamiento del código para detectar amenazas de día cero antes de que actúen." },
    { name: "Inteligencia de Amenazas Global Neuronal", info: "Conectado a una red global, nuestro sistema aprende y se adapta en tiempo real a nuevas tácticas de ataque y vectores de malware de todo el mundo." },
    { name: "Desinfección Atómica de Adjuntos", info: "Cada archivo es descompuesto y reconstruido en un entorno seguro a nivel binario, eliminando cualquier código malicioso sin corromper el archivo." },
    { name: "Arquitectura de Contención Cuántica", info: "Las amenazas se ejecutan en un micro-entorno virtualizado y aislado, donde son analizadas y neutralizadas sin ninguna posibilidad de afectar tu sistema." }
];

const Particle = () => {
    const style: React.CSSProperties = {
      '--size': `${Math.random() * 2 + 1}px`,
      '--x-start': `${Math.random() * 100}%`,
      '--y-start': `${Math.random() * 100}%`,
      '--x-end': `${Math.random() * 200 - 50}%`,
      '--y-end': `${Math.random() * 200 - 50}%`,
      '--duration': `${Math.random() * 8 + 6}s`,
      '--delay': `-${Math.random() * 14}s`,
      '--color-group': Math.random() > 0.5 ? '#1700E6' : '#009AFF'
    } as any;
    return <div className="particle" style={style} />;
};


export function AntivirusStatusModal({ isOpen, onOpenChange }: AntivirusStatusModalProps) {
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full h-[600px] flex p-0 gap-0 bg-zinc-900/90 backdrop-blur-2xl border-2 border-blue-500/30 text-white overflow-hidden" showCloseButton={false}>
          <style>{`
            @keyframes particle-move {
              0% { transform: translate(var(--x-start), var(--y-start)); opacity: 1; }
              100% { transform: translate(var(--x-end), var(--y-end)); opacity: 0; }
            }
            .particle {
              position: absolute;
              width: var(--size);
              height: var(--size);
              background: var(--color-group);
              border-radius: 50%;
              animation: particle-move var(--duration) var(--delay) linear infinite;
              will-change: transform, opacity;
            }
             @keyframes hud-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            {/* Left Panel: AI Animation */}
            <div className="relative h-full w-full bg-black/30 flex flex-col items-center justify-center p-8 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                    {Array.from({ length: 50 }).map((_, i) => <Particle key={i} />)}
                </div>
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }}
                    className="relative z-10 flex flex-col items-center text-center gap-6"
                >
                     <div className="relative p-6 rounded-full border-2 border-blue-400/50 bg-blue-900/30">
                        <svg className="absolute inset-0 w-full h-full animate-[hud-spin_10s_linear_infinite]" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" stroke="rgba(100,200,255,0.2)" strokeWidth="1" fill="none" />
                            <path d="M 50,5 A 45,45 0 0,1 95,50" stroke="rgba(100,200,255,0.5)" strokeWidth="1.5" fill="none" strokeDasharray="2, 5" />
                        </svg>
                        <Shield className="size-20 text-blue-300" style={{ filter: 'drop-shadow(0 0 15px #00aaff)' }}/>
                    </div>
                     <div className="p-3 rounded-lg bg-gradient-to-r from-[#00CE07]/20 to-[#A6EE00]/20 border border-[#00CE07]/50 flex items-center gap-3">
                        <CheckCheck className="size-6 text-[#A6EE00]"/>
                        <span className="font-semibold text-white">Sistema Activo</span>
                    </div>
                    <p className="text-blue-200/70 text-lg">Protección en Tiempo Real</p>
                    
                    <Button 
                        onClick={() => onOpenChange(false)} 
                        className="w-full bg-blue-800 hover:bg-blue-700 text-white"
                      >
                        Entendido
                      </Button>
                </motion.div>
            </div>

            {/* Right Panel: Content */}
            <div className="flex flex-col h-full p-8">
                <DialogHeader className="text-left">
                    <DialogTitle className="text-2xl font-bold text-blue-300">
                        Escudo de Seguridad de IA
                    </DialogTitle>
                    <DialogDescription className="text-blue-200/70">
                        Tu sistema está protegido activamente contra virus, troyanos y malware.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 mt-6">
                    <h3 className="font-semibold text-lg text-white/90 mb-4 flex items-center gap-2"><BrainCircuit/>Tecnologías Activas</h3>
                     <ul className="space-y-4">
                      {techItems.map((item, index) => (
                        <motion.li
                            key={item.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.15 + 0.3 }}
                            className="flex items-start gap-4"
                        >
                            <CheckCircle className="size-6 text-blue-400 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-semibold text-white">{item.name}</h4>
                                <p className="text-sm text-white/70">{item.info}</p>
                            </div>
                        </motion.li>
                      ))}
                    </ul>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
