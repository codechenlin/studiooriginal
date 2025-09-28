
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { CheckCircle, BrainCircuit, ShieldAlert, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SpamFilterSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const techItems = [
    { name: "Análisis Heurístico y Estadístico", info: "Examina la estructura, el formato y el contenido del correo en busca de patrones comunes de spam, como el uso excesivo de mayúsculas o frases sospechosas." },
    { name: "Filtrado Bayesiano", info: "Es un sistema inteligente que aprende de los correos que marcas como spam y de los que no. Con el tiempo, se vuelve más preciso al identificar lo que consideras correo no deseado." },
    { name: "Listas de Bloqueo de DNS (DNSBL)", info: "Verifica si el servidor de correo del remitente se encuentra en listas negras públicas de spammers conocidos. Si está en una lista, es muy probable que sea spam." },
    { name: "Bases de Datos Colaborativas", info: "Utiliza una red global de inteligencia sobre amenazas para identificar en tiempo real nuevas campañas de spam, phishing y malware." }
];


const sensitivityLevels = [
    { value: 10, label: 'Relajado', description: 'Casi nada se marca como spam. Bueno si esperas correos de fuentes no verificadas.', example: 'Solo correos obviamente fraudulentos son bloqueados.' },
    { value: 7.5, label: 'Moderado', description: 'Un buen equilibrio. Bloquea la mayoría del spam obvio sin ser demasiado agresivo.', example: 'Un boletín poco conocido podría pasar.' },
    { value: 5.0, label: 'Recomendado (Default)', description: 'El punto óptimo para la mayoría. Bloquea spam conocido y correos altamente sospechosos.', example: 'Ej: Correos "¡Publicidad engañosa!" de remitentes desconocidos serán bloqueados.' },
    { value: 2.5, label: 'Estricto', description: 'Muy agresivo. Podría marcar correos legítimos como spam si no cumplen todas las reglas.', example: 'Un correo de un nuevo cliente sin firma DKIM podría ser bloqueado.' },
    { value: 1, label: 'Paranoico', description: 'Extremadamente estricto. Solo correos de remitentes conocidos y perfectamente configurados pasarán.', example: 'Casi todo lo que no esté en tu lista blanca será bloqueado.' },
];

export function SpamFilterSettingsModal({ isOpen, onOpenChange }: SpamFilterSettingsModalProps) {
  const [threshold, setThreshold] = useState(5.0);

  const currentLevel = sensitivityLevels.reduce((prev, curr) => {
    return (Math.abs(curr.value - threshold) < Math.abs(prev.value - threshold) ? curr : prev);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-zinc-900/80 backdrop-blur-xl border border-amber-400/20 text-white overflow-hidden" showCloseButton={false}>
        <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute h-full w-full bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-amber-500/20 rounded-full animate-pulse-slow filter blur-3xl -translate-x-1/2 -translate-y-1/2"/>
        
        <DialogHeader className="z-10">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="relative p-2.5 bg-amber-500/10 border-2 border-amber-400/20 rounded-full">
              <div className="absolute inset-0 rounded-full animate-ping bg-amber-400/50" />
              <ShieldAlert className="relative text-amber-400" />
            </div>
            Ajustes del Filtro de Spam con IA
          </DialogTitle>
          <DialogDescription className="text-amber-100/70">
            Calibra la sensibilidad de nuestro motor de IA para que se ajuste a tus necesidades. Un umbral más bajo es más estricto.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-8 py-6 z-10">
          {/* Left Panel: Slider */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-amber-300">Nivel de Sensibilidad: <span className="text-white font-bold">{threshold.toFixed(1)}</span></h3>
            <div className="py-4">
              <Slider
                value={[threshold]}
                onValueChange={(value) => setThreshold(value[0])}
                min={1}
                max={10}
                step={0.1}
                className="w-full"
              />
            </div>
            <motion.div 
                key={currentLevel.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 rounded-lg bg-black/30 border border-amber-400/10 text-center"
            >
                <h4 className="font-bold text-xl text-white">{currentLevel.label}</h4>
                <p className="text-sm text-amber-100/80 mt-1">{currentLevel.description}</p>
                <p className="text-xs text-amber-300/60 italic mt-3">{currentLevel.example}</p>
            </motion.div>
          </div>

          {/* Right Panel: Active Tech */}
          <div className="space-y-4">
             <h3 className="font-semibold text-lg text-amber-300 flex items-center gap-2">
                <BrainCircuit />
                Tecnologías Activas
            </h3>
            <div className="space-y-3">
              {techItems.map((item, index) => (
                <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-md bg-black/20 border border-amber-400/10"
                >
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-full h-full bg-green-500/30 rounded-full animate-ping"/>
                        <CheckCircle className="size-5 text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-white/90 flex-1">{item.name}</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-300/70 hover:bg-amber-500/20 hover:text-amber-200">
                                <HelpCircle className="size-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 text-sm bg-black/80 backdrop-blur-md border-amber-400/30 text-white p-3">
                           {item.info}
                        </PopoverContent>
                    </Popover>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="z-10 pt-4">
          <Button variant="outline" className="hover:bg-[#F00000] hover:text-white hover:border-[#F00000]" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            onClick={() => {
                onOpenChange(false);
            }}
            className="text-white bg-green-800 hover:bg-[#00CB07]"
          >
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
