
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, MailPlus, CheckCircle, XCircle, Bot, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface DomainVerificationSuccessModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  domain: string;
  mxVerified: boolean;
}

const FeatureCard = ({ icon: Icon, title, description, color, delay }: { icon: React.ElementType, title: string, description: string, color: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay, duration: 0.5 }}
        className="p-3 rounded-lg bg-black/20 border"
        style={{ borderColor: `${color}4D` }}
    >
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-md" style={{ backgroundColor: `${color}26`}}>
                <Icon className="size-5" style={{ color }}/>
            </div>
            <div>
                <h4 className="font-semibold text-sm text-white">{title}</h4>
                <p className="text-xs text-white/60">{description}</p>
            </div>
        </div>
    </motion.div>
);

export function DomainVerificationSuccessModal({ isOpen, onOpenChange, domain, mxVerified }: DomainVerificationSuccessModalProps) {

  const truncateDomain = (name: string, maxLength: number = 30): string => {
    if (name.length <= maxLength) {
        return name;
    }
    return `${name.substring(0, maxLength)}...`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-3xl bg-black/80 backdrop-blur-xl border-2 border-green-500/20 text-white overflow-hidden p-0">
         <div className="absolute inset-0 z-0 opacity-10 bg-grid-green-500/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
         <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full animate-pulse-slow filter blur-3xl -translate-x-1/2 -translate-y-1/2"/>

        <div className="p-8 flex flex-col items-center text-center z-10">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 15 }}
                className="relative w-28 h-28 mb-6"
            >
                <svg className="absolute inset-0 w-full h-full animate-[hud-spin_25s_linear_infinite]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="48" stroke="rgba(0,255,100,0.1)" strokeWidth="0.5" fill="none" />
                    <path d="M 50,2 A 48,48 0 0,1 98,50" stroke="rgba(0,255,100,0.3)" strokeWidth="1" fill="none" strokeDasharray="3, 6" />
                </svg>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="size-20 text-green-400" style={{ filter: 'drop-shadow(0 0 15px #00ff6a)' }}/>
                </div>
            </motion.div>
            
            <DialogHeader>
                <DialogTitle className="text-3xl font-bold">¡Dominio Verificado!</DialogTitle>
                <DialogDescription className="text-lg text-green-200/80 mt-2">
                    El dominio <span className="font-bold text-white">{truncateDomain(domain)}</span> está listo para despegar.
                </DialogDescription>
            </DialogHeader>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }} className="w-full max-w-md my-8">
                 <div className={cn(
                    "p-3 rounded-lg border flex items-center justify-between gap-3 text-sm font-semibold transition-all duration-500",
                    mxVerified
                        ? "bg-green-500/10 border-green-500/30 text-green-300" 
                        : "bg-red-500/10 border-red-500/30 text-red-300"
                )}>
                    <p>Estado del Registro MX:</p>
                    <div className="flex items-center gap-2">
                        {mxVerified ? <CheckCircle className="size-5"/> : <XCircle className="size-5"/>}
                        <span className="font-bold">{mxVerified ? 'VERIFICADO' : 'INVÁLIDO'}</span>
                    </div>
                 </div>
            </motion.div>
            
            <div className="text-left max-w-2xl mx-auto space-y-6">
                {mxVerified ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                        <p className="text-center text-white/90">
                           ¡Felicidades! Tu dominio está completamente configurado para <strong className="text-white">enviar y recibir</strong> correos. Ahora, cada correo que añadas, como <strong className="font-mono text-cyan-300">ventas@{truncateDomain(domain, 15)}</strong>, desbloqueará todo el poder de nuestro ecosistema.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            <FeatureCard icon={Bot} title="Análisis Neuronal de Contenido" description="La IA evalúa cada correo para detectar amenazas." color="#00ADEC" delay={0.8} />
                            <FeatureCard icon={ShieldCheck} title="Filtro Anti-Spam Adaptativo" description="Aprende de tus preferencias para un buzón más limpio." color="#AD00EC" delay={0.9} />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                        <p className="text-center text-white/90">
                            Has verificado la propiedad del dominio, ¡genial! Ya puedes <strong className="text-white">enviar</strong> correos desde direcciones como <strong className="font-mono text-cyan-300">ventas@{truncateDomain(domain, 15)}</strong>.
                        </p>
                        <div className="mt-4 p-4 rounded-lg bg-amber-900/50 border border-amber-500/30 text-center">
                            <h4 className="font-bold text-amber-300">Funcionalidad de Recepción Desactivada</h4>
                            <p className="text-sm text-amber-200/80 mt-1">Para poder recibir correos y activar nuestro <strong className="text-white">Escudo Neuronal</strong> (Antivirus, Anti-Spam y Análisis de IA), necesitas configurar tu registro MX correctamente.</p>
                        </div>
                    </motion.div>
                )}
            </div>
            
        </div>
         <DialogFooter className="p-6 bg-black/30 border-t border-green-500/20 z-10">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg h-12 hover:opacity-90"
            >
              <Check className="mr-2"/>
              Aceptar y Continuar
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


    