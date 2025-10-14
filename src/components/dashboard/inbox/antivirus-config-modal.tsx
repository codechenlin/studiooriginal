
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Trash2, Mail, Bell, X, Bot, ShieldQuestion, CheckCircle, Eye, HardDrive } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface AntivirusConfigModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AntivirusConfigModal({ isOpen, onOpenChange }: AntivirusConfigModalProps) {
  const [actionOnThreat, setActionOnThreat] = useState<'quarantine' | 'delete'>('quarantine');
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState<'default' | 'custom'>('default');
  const [customEmail, setCustomEmail] = useState('');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[650px] flex flex-col p-0 gap-0 bg-zinc-900/90 backdrop-blur-2xl border-2 border-blue-500/20 text-white overflow-hidden" showCloseButton={false}>
          <style>{`
              @keyframes hud-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              .hexagonal-grid {
                  background-image:
                      linear-gradient(rgba(0,173,236,0.05) 1px, transparent 1px),
                      linear-gradient(60deg, rgba(0,173,236,0.05) 1px, transparent 1px),
                      linear-gradient(-60deg, rgba(0,173,236,0.05) 1px, transparent 1px);
                  background-size: 34px 60px;
              }
          `}</style>
         <div className="absolute inset-0 z-0 opacity-20 hexagonal-grid"/>
         <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full animate-pulse-slow filter blur-3xl -translate-x-1/2 -translate-y-1/2"/>
        
        <DialogHeader className="z-10 p-4 flex flex-row justify-between items-center border-b border-blue-500/20 bg-black/30">
            <div className="flex items-center gap-3">
               <div className="relative p-3 rounded-full bg-blue-900/50 border-2 border-blue-500/50">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 text-blue-300">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                   <div className="absolute inset-0 rounded-full animate-ping border-2 border-blue-400/50" />
                </div>
                <div>
                  <DialogTitle className="text-2xl">
                    Configuración del Escudo Neuronal Antivirus
                  </DialogTitle>
                  <DialogDescription className="text-blue-200/70">
                    Calibra los protocolos de defensa y los canales de alerta de la IA.
                  </DialogDescription>
                </div>
            </div>
             <div className="flex items-center gap-2 text-sm font-semibold text-green-300">
                <div className="size-3 rounded-full bg-[#39FF14] animate-pulse" style={{boxShadow: '0 0 8px #39FF14'}} />
                EN LÍNEA
            </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
          {/* Left Panel */}
          <div className="md:col-span-1 flex flex-col items-center justify-between p-8 border-r border-blue-500/20 bg-black/20 z-10">
              <div className="text-center">
                  <h3 className="text-xl font-bold text-blue-300">Núcleo de IA</h3>
                  <p className="text-xs text-blue-200/60">Análisis y Protección Activa</p>
              </div>
              <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }}
                    className="relative w-48 h-48"
                >
                    <svg className="absolute inset-0 w-full h-full animate-[hud-spin_20s_linear_infinite]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="48" stroke="rgba(0,173,236,0.1)" strokeWidth="0.5" fill="none" />
                        <path d="M 50,2 A 48,48 0 0,1 98,50" stroke="rgba(0,173,236,0.3)" strokeWidth="1" fill="none" strokeDasharray="3, 6" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative p-6 rounded-full border-2 border-blue-400/50 bg-blue-900/30">
                            <HardDrive className="size-16 text-blue-300" style={{ filter: 'drop-shadow(0 0 15px #00adec)' }}/>
                        </div>
                    </div>
              </motion.div>
              <div className="relative p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 flex items-center gap-3">
                  <div className="relative size-8 shrink-0 flex items-center justify-center">
                     <div className="absolute w-full h-full border-2 border-dashed border-[#00CB07] rounded-full animate-spin" style={{ animationDuration: '4s' }} />
                     <Eye className="size-6 text-[#00CB07]"/>
                  </div>
                  <div className="text-left">
                      <p className="font-bold text-[#00CB07]">MONITOREO ACTIVO 24/7</p>
                      <p className="text-xs text-green-200/80">El núcleo de IA siempre está activo, analizando en segundo plano para garantizar una protección total.</p>
                  </div>
              </div>
          </div>
          
          {/* Middle Panel */}
          <div className="md:col-span-1 flex flex-col p-8 border-r border-blue-500/20 bg-black/10 z-10">
            <h3 className="font-semibold text-lg text-blue-300 flex items-center gap-2 mb-6">
                <ShieldQuestion />
                Protocolo de Respuesta a Amenazas
            </h3>
            <RadioGroup value={actionOnThreat} onValueChange={(value) => setActionOnThreat(value as any)} className="space-y-4">
                <motion.div variants={{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0, transition: { delay: 0.2 } } }} initial="initial" animate="animate">
                    <Label htmlFor="quarantine" className={cn("flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all", actionOnThreat === 'quarantine' ? 'border-blue-400 bg-blue-900/40' : 'border-blue-500/20 bg-black/20 hover:bg-blue-900/20')}>
                        <div className="flex items-center gap-3 mb-2">
                             <RadioGroupItem value="quarantine" id="quarantine" />
                             <span className="font-bold text-base">Poner en Cuarentena (Recomendado)</span>
                        </div>
                        <p className="text-sm text-blue-200/80 pl-8">Mueve correos o archivos infectados a una zona segura para revisión manual. No podrán ser abiertos o descargados.</p>
                    </Label>
                </motion.div>
                <motion.div variants={{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0, transition: { delay: 0.3 } } }} initial="initial" animate="animate">
                    <Label htmlFor="delete" className={cn("flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all", actionOnThreat === 'delete' ? 'border-red-400 bg-red-900/40' : 'border-red-500/20 bg-black/20 hover:bg-red-900/20')}>
                        <div className="flex items-center gap-3 mb-2">
                            <RadioGroupItem value="delete" id="delete" />
                             <span className="font-bold text-base text-red-300 flex items-center gap-2"><Trash2 /> Eliminar Automáticamente</span>
                        </div>
                        <p className="text-sm text-red-200/80 pl-8">
                            Elimina permanentemente cualquier correo o archivo con amenazas.
                            <strong className="block mt-1">Atención: Acción irreversible.</strong>
                        </p>
                    </Label>
                </motion.div>
            </RadioGroup>
          </div>
          
          {/* Right Panel */}
          <div className="md:col-span-1 flex flex-col p-8 bg-black/10 z-10">
            <h3 className="font-semibold text-lg text-blue-300 flex items-center gap-2 mb-6">
                <Bell />
                Canal de Notificaciones
            </h3>
            <div className="space-y-6">
                <motion.div variants={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0, transition: { delay: 0.4 } } }} initial="initial" animate="animate">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-blue-500/20">
                        <div>
                            <Label htmlFor="notify-email" className="font-bold text-base">Alertas por Correo</Label>
                            <p className="text-sm text-blue-200/80">Recibe un informe cuando se neutralice una amenaza.</p>
                        </div>
                        <Switch
                            id="notify-email"
                            checked={notifyByEmail}
                            onCheckedChange={setNotifyByEmail}
                            className="data-[state=checked]:bg-[#00CB07] data-[state=unchecked]:bg-[#00CB07]/30"
                        />
                    </div>
                </motion.div>
                
                <motion.div variants={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0, transition: { delay: 0.5 } } }} initial="initial" animate="animate" className={cn("space-y-3", !notifyByEmail && "opacity-50 pointer-events-none")}>
                     <Label className="font-bold">Enviar notificaciones a:</Label>
                     <div
                        onClick={() => setNotificationEmail('default')}
                        className={cn(
                            "p-3 rounded-lg border-2 flex items-center gap-3 cursor-pointer",
                            notificationEmail === 'default' ? 'bg-blue-900/40 border-blue-400' : 'bg-black/20 border-blue-500/20'
                        )}
                     >
                        <div className={cn("size-5 rounded-full border-2 flex items-center justify-center", notificationEmail === 'default' ? 'border-blue-300' : 'border-gray-500')}>
                           {notificationEmail === 'default' && <div className="size-2 rounded-full bg-blue-300" />}
                        </div>
                        <p className="font-mono text-sm">usuario@mailflow.ai (predeterminado)</p>
                     </div>
                     <div className="space-y-2">
                         <div
                            onClick={() => setNotificationEmail('custom')}
                            className={cn(
                                "p-3 rounded-t-lg border-2 flex items-center gap-3 cursor-pointer",
                                notificationEmail === 'custom' ? 'bg-blue-900/40 border-blue-400 border-b-0' : 'bg-black/20 border-blue-500/20'
                            )}
                         >
                           <div className={cn("size-5 rounded-full border-2 flex items-center justify-center", notificationEmail === 'custom' ? 'border-blue-300' : 'border-gray-500')}>
                               {notificationEmail === 'custom' && <div className="size-2 rounded-full bg-blue-300" />}
                            </div>
                            <p className="text-sm">Usar un correo personalizado</p>
                        </div>
                         <Input 
                            type="email"
                            placeholder="tucorreo@ejemplo.com"
                            value={customEmail}
                            onChange={(e) => setCustomEmail(e.target.value)}
                            onFocus={() => setNotificationEmail('custom')}
                            className={cn(
                                "bg-black/20 border-blue-500/20 rounded-t-none focus-visible:ring-blue-400",
                                notificationEmail === 'custom' && "border-t-transparent"
                            )}
                        />
                     </div>
                </motion.div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="p-4 bg-black/30 border-t border-blue-500/20 z-10 flex justify-end">
          <div className="flex gap-2">
            <Button variant="outline" className="hover:bg-[#F00000] hover:text-white hover:border-[#F00000]" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button 
              onClick={() => {
                  onOpenChange(false);
              }}
              className="text-white bg-blue-800 hover:bg-blue-700"
            >
              Guardar Configuración
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
