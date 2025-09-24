
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, User, Users, Globe, ArrowRight, Mail, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type Step = 'initial' | 'specific' | 'multiple' | 'all';

export function SecuritySettingsModal({ isOpen, onOpenChange }: SecuritySettingsModalProps) {
  const [step, setStep] = useState<Step>('initial');

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setStep('initial'), 300);
  };
  
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
    exit: { opacity: 0, y: -20 },
  };

  const itemVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  };

  const renderInitialStep = () => (
    <motion.div
      key="initial"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {[
        { step: 'specific', title: 'Dirección Única', desc: 'Aplicar a un remitente específico.', icon: User },
        { step: 'multiple', title: 'Múltiples Direcciones', desc: 'Seleccionar varios remitentes.', icon: Users },
        { step: 'all', title: 'Todos los Correos', desc: 'Aplicar a todos los correos entrantes.', icon: Globe },
      ].map(item => (
         <motion.div variants={itemVariants} key={item.step}>
            <button
              onClick={() => setStep(item.step as Step)}
              className="group relative p-6 rounded-2xl border border-blue-500/20 bg-black/20 w-full h-full text-center transition-all duration-300 overflow-hidden hover:bg-blue-900/40 hover:shadow-2xl hover:shadow-blue-500/20"
            >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                    <item.icon className="mx-auto size-12 text-blue-400 mb-4 transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_theme(colors.blue.400)]" />
                    <h3 className="font-bold text-lg text-white">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                </div>
            </button>
         </motion.div>
      ))}
    </motion.div>
  );

  const renderSecondaryStep = (title: string, description: string) => (
    <motion.div
        key={step}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="text-center"
    >
        <h3 className="text-xl font-semibold text-white mt-4">{title}</h3>
        <p className="text-muted-foreground mt-2">{description}</p>
        
        <div className="mt-6 text-left max-w-lg mx-auto">
            {step === 'specific' && (
                 <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input placeholder="Introduce la dirección de correo..." className="pl-10 bg-black/20 border-primary/30 focus:border-primary focus:ring-primary" />
                </div>
            )}
            {step === 'multiple' && (
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input placeholder="Busca o añade direcciones..." className="pl-10 bg-black/20 border-accent/30 focus:border-accent focus:ring-accent" />
                </div>
            )}
             {step === 'all' && (
                 <p className="text-center bg-primary/10 p-4 rounded-lg border border-primary/20 text-primary-foreground/80">La configuración se aplicará a todos los correos entrantes.</p>
            )}
        </div>
    </motion.div>
  );

  const stepContent = {
    initial: renderInitialStep(),
    specific: renderSecondaryStep("Dirección Única", "Introduce la dirección de correo específica a la que aplicarás la configuración."),
    multiple: renderSecondaryStep("Múltiples Direcciones", "Añade o busca direcciones de tu historial para aplicar la configuración."),
    all: renderSecondaryStep("Todos los Correos", "La configuración de seguridad se aplicará globalmente a todos los correos entrantes.")
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-zinc-900/90 backdrop-blur-2xl border-2 border-blue-500/20 text-white overflow-hidden" showCloseButton={false}>
        <div className="absolute inset-0 z-0 opacity-20">
           <div className="absolute inset-0 bg-grid-blue-500/30 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
        </div>
         <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full animate-pulse-slow filter blur-3xl -translate-x-1/2 -translate-y-1/2"/>

        <DialogHeader className="z-10">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="relative p-3 rounded-full bg-blue-900/50 border-2 border-blue-500/50">
               <Shield className="text-blue-300 size-6" />
               <div className="absolute inset-0 rounded-full animate-ping border-2 border-blue-400/50" />
            </div>
            Configuración de Privacidad Avanzada
          </DialogTitle>
          <DialogDescription className="text-blue-200/70">
            Protege tu privacidad bloqueando imágenes y rastreadores en tus correos. Elige cómo deseas aplicar esta configuración.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 min-h-[250px] flex items-center justify-center z-10">
            <AnimatePresence mode="wait">
                {stepContent[step]}
            </AnimatePresence>
        </div>

        <DialogFooter className="z-10 pt-4 flex justify-between w-full">
            {step !== 'initial' ? (
                <Button variant="ghost" onClick={() => setStep('initial')}>Atrás</Button>
            ) : <div></div>}
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={handleClose}
                    className="border-input bg-transparent hover:bg-[#F00000] hover:border-[#F00000] hover:text-white"
                >
                    Cancelar
                </Button>
                {step !== 'initial' && (
                     <Button className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90">Guardar Configuración <ArrowRight className="ml-2"/></Button>
                )}
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
