
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Server, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface AntivirusStatusModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const techItems = [
    { name: "Potente Motor de Análisis", info: "Utilizamos un avanzado motor de heurística para detectar troyanos, virus, malware y otras amenazas maliciosas en tiempo real." },
    { name: "Inteligencia de Amenazas Global", info: "Nuestra base de datos se nutre de una red global, actualizándose diariamente contra las últimas ciberamenazas y sofisticadas técnicas de suplantación." },
    { name: "Escaneo Profundo de Adjuntos", info: "Cada archivo adjunto puede ser inspeccionado a nivel binario, asegurando su integridad antes de que llegue a tu equipo." },
    { name: "Arquitectura Aislada y Segura", info: "El servicio opera en un entorno de microservicios aislado, garantizando que cualquier amenaza potencial sea neutralizada sin afectar la integridad de tu sistema." }
];

export function AntivirusStatusModal({ isOpen, onOpenChange }: AntivirusStatusModalProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full h-[600px] flex flex-col p-0 gap-0 bg-zinc-900/90 backdrop-blur-2xl border-2 border-blue-500/30 text-white overflow-hidden" showCloseButton={false}>
          <style>{`
            .scanner-grid {
              background-image:
                linear-gradient(to right, hsl(210 50% 30% / 0.15) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(210 50% 30% / 0.15) 1px, transparent 1px);
              background-size: 1rem 1rem;
            }
            .scanner-light {
              position: absolute;
              left: 50%;
              transform: translateX(-50%);
              width: 200%;
              height: 150px;
              background: radial-gradient(ellipse 50% 100% at 50% 0%, hsl(190 100% 50% / 0.4), transparent 70%);
              animation: scan-anim 4s infinite linear;
              will-change: transform;
            }
            @keyframes scan-anim {
              0% { top: -150px; }
              100% { top: 100%; }
            }
            @keyframes status-glow {
              0%, 100% { 
                background-color: hsl(80 100% 30% / 0.5);
                box-shadow: 0 0 15px hsl(80 100% 50% / 0.3);
              }
              50% { 
                background-color: hsl(80 100% 40% / 0.7);
                box-shadow: 0 0 25px hsl(80 100% 50% / 0.5);
              }
            }
          `}</style>
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            {/* Left Panel: AI Animation */}
            <div className="relative h-full w-full bg-black/30 flex flex-col items-center justify-center p-8 overflow-hidden">
                <div className="absolute inset-0 scanner-grid" />
                <div className="scanner-light" />
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }}
                    className="relative z-10 flex flex-col items-center text-center"
                >
                    <div className="relative p-4 rounded-full bg-blue-900/50 border-2 border-blue-500/50 mb-4">
                       <Shield className="text-blue-300 size-12" />
                       <div className="absolute inset-0 rounded-full animate-ping border-2 border-blue-400/50" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Sistema Activo</h2>
                    <p className="text-blue-200/70 text-lg">Protección en tiempo real</p>
                    <div className="mt-6 flex items-center gap-3 p-3 rounded-md bg-green-500/10 border border-green-400/20">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute w-full h-full bg-green-500/30 rounded-full animate-ping"/>
                            <CheckCircle className="size-5 text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-white/90">Operativo</span>
                    </div>
                     <Button 
                        onClick={() => onOpenChange(false)} 
                        className="mt-8 w-full text-white bg-blue-800 hover:bg-blue-700"
                      >
                        Entendido
                      </Button>
                </motion.div>
                <div 
                    className="absolute bottom-4 left-4 right-4 z-10 p-2 rounded-lg text-xs text-center text-lime-100/90 border border-lime-500/20"
                    style={{
                        animation: 'status-glow 3s infinite ease-in-out',
                        background: 'linear-gradient(45deg, hsl(80 100% 30% / 0.5), hsl(100 100% 40% / 0.5))'
                    }}
                >
                  <p>Escaneo de amenazas activado...</p>
                </div>
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
                    <h3 className="font-semibold text-lg text-white/90 mb-4">Funciones Principales</h3>
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
