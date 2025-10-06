
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HardDrive, Inbox, FileText, ImageIcon, Users, BarChart, MailCheck, ShoppingCart, MailWarning, Box, X, Film, DatabaseZap, CheckCircle, Eye, Gift, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const BouncesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m17 17 5 5m-5 0 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const storageData = {
  total: 15 * 1024,
  sections: [
    {
      id: 'inbox',
      label: 'Análisis del Buzón',
      icon: Inbox,
      items: [
        { id: 'main', label: 'Principal', value: 2150.40, color: 'from-[#AD00EC] to-[#1700E6]', icon: MailCheck },
        { id: 'shopping', label: 'Compras', value: 1126.40, color: 'from-[#00CB07] to-[#21F700]', icon: ShoppingCart },
        { id: 'social', label: 'Social', value: 819.20, color: 'from-[#00ADEC] to-[#007BA8]', icon: Users },
        { id: 'spam', label: 'Spam', value: 409.60, color: 'from-[#E18700] to-[#FFAB00]', icon: MailWarning },
        { id: 'bounces', label: 'Rebotes', value: 102.40, color: 'from-[#F00000] to-[#F07000]', icon: BouncesIcon },
      ]
    },
    {
      id: 'content',
      label: 'Datos de Contenido',
      icon: Box,
      items: [
        { id: 'images', label: 'Imágenes', value: 1843.20, color: 'from-[#1700E6] to-[#009AFF]', icon: ImageIcon },
        { id: 'gifs', label: 'GIFs', value: 921.60, color: 'from-[#1700E6] to-[#009AFF]', icon: Film },
        { id: 'templates', label: 'Plantillas', value: 1228.80, color: 'from-[#1700E6] to-[#009AFF]', icon: FileText },
        { id: 'lists', label: 'Listas', value: 307.20, color: 'from-[#1700E6] to-[#009AFF]', icon: Share2 },
        { id: 'campaigns', label: 'Campañas', value: 1536.00, color: 'from-[#1700E6] to-[#009AFF]', icon: Gift },
      ]
    }
  ]
};

const totalUsed = storageData.sections.flatMap(s => s.items).reduce((acc, item) => acc + item.value, 0);

const SectionProgressBar = ({ label, value, total, color, icon: Icon }: { label: string, value: number, total: number, color: string, icon: React.ElementType }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <motion.div
            className="space-y-2 group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-center text-xs">
                <p className="font-semibold flex items-center gap-2 text-white"><Icon className="size-4 transition-colors duration-300 text-white/70 group-hover:text-[#AD00EC]" />{label}</p>
                <p className="font-mono text-white/80">{value.toFixed(2)} MB <span className="text-white/50">({percentage.toFixed(1)}%)</span></p>
            </div>
            <div className="relative h-3 w-full bg-black/30 rounded-full overflow-hidden border border-[#AD00EC]/20">
                <motion.div
                    className={cn("absolute top-0 left-0 h-full rounded-full bg-gradient-to-r", color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                >
                    <div className="absolute top-0 left-0 h-full w-full opacity-50 animate-[scan-glare_3s_infinite_linear]"
                        style={{
                            background: `radial-gradient(circle at 50% 50%, white, transparent 30%)`,
                            backgroundSize: '400% 100%',
                        }}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
};

const QuantumProgressBar = ({ used, total }: { used: number, total: number }) => {
  const percentage = total > 0 ? (used / total) * 100 : 0;

  return (
    <div className="w-full text-center">
      <div className="relative h-8 w-full bg-black/30 rounded-lg border border-[#AD00EC]/30 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
        >
          <div className="h-full w-full bg-gradient-to-r from-[#AD00EC] to-[#1700E6] relative overflow-hidden">
             <div className="progress-bar-shine absolute top-0 left-0 w-full h-full" />
          </div>
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-bold text-lg text-white drop-shadow-lg">{(used / 1024).toFixed(2)} GB</p>
        </div>
      </div>
      <div className="flex justify-between items-center mt-2 text-xs font-mono text-white/80">
        <p>Total Usado: <span className="font-bold text-white">{percentage.toFixed(1)}%</span></p>
        <p>Disponible: <span className="font-bold text-white">{((total - used) / 1024).toFixed(2)} GB</span></p>
      </div>
    </div>
  );
};


export function StorageDetailsModal({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-4xl w-full flex flex-col p-0 gap-0 bg-black/80 backdrop-blur-xl border-2 border-[#AD00EC]/30 text-white overflow-hidden">
                <style>{`
                    @keyframes grid-pan { 0% { background-position: 0% 0%; } 100% { background-position: 100% 100%; } }
                    .animated-grid { background-image: linear-gradient(hsl(var(--primary)/0.1) 1px, transparent 1px), linear-gradient(to right, hsl(var(--primary)/0.1) 1px, transparent 1px); background-size: 3rem 3rem; animation: grid-pan 60s linear infinite; }
                    .progress-bar-shine::after {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 50%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                        animation: light-scan 2.5s infinite linear;
                    }
                    @keyframes light-scan {
                      0% { transform: translateX(-100%); }
                      100% { transform: translateX(200%); }
                    }
                     @keyframes led-glow {
                        0%, 100% { box-shadow: 0 0 5px 2px hsl(var(--primary)/0.4); }
                        50% { box-shadow: 0 0 15px 5px hsl(var(--primary)/0.7); }
                    }
                    .led-animation {
                        animation: led-glow 2s infinite ease-in-out;
                    }
                `}</style>
                
                <div className="p-4 flex items-center justify-between border-b border-[#AD00EC]/20 bg-black/50">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                             <div className="relative p-2 rounded-full bg-primary/20 led-animation">
                                <HardDrive className="size-6 text-primary"/>
                            </div>
                            <span className="font-semibold text-xl">Diagnóstico de Almacenamiento</span>
                        </DialogTitle>
                    </DialogHeader>
                    <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white/70 hover:text-white hover:bg-white/10 border border-white/50 rounded-full">
                        <X className="size-5 text-white"/>
                    </Button>
                </div>
                
                <div className="flex-1 flex flex-col gap-px bg-[#AD00EC]/20">
                    {/* Top Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#AD00EC]/20">
                        {storageData.sections.map(section => (
                            <div key={section.id} className="bg-black/30 p-6">
                                <div className="relative text-left mb-4 p-3 rounded-lg bg-gradient-to-r from-[#AD00EC]/20 to-[#1700E6]/20 border border-[#AD00EC]/30">
                                    <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                                        <section.icon className="size-5" />
                                        {section.label}
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {section.items.map(item => (
                                        <SectionProgressBar key={item.id} {...item} total={storageData.total}/>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Section */}
                    <div className="p-6 bg-black/30">
                        <QuantumProgressBar used={totalUsed} total={storageData.total} />
                         <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/30 flex items-center gap-4">
                            <Eye className="size-10 shrink-0 text-amber-300"/>
                            <p className="text-xs text-amber-200/90 flex-1">
                                Puedes libera espacio eliminando archivos, correos electrónicos o plantillas antiguas, también puedes aumenta tu capacidad de almacenamiento.
                            </p>
                            <Button className="group relative h-11 overflow-hidden bg-gradient-to-r from-[#AD00EC] to-[#1700E6] text-white font-bold text-base transition-all duration-300 hover:shadow-[0_0_20px_#AD00EC] shrink-0">
                                <div className="absolute inset-0 w-full h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] animate-[button-scan_3s_infinite_linear]"/>
                                <DatabaseZap className="mr-2"/>
                                Aumentar Almacenamiento
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
