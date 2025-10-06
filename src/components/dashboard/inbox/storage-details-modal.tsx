
"use client";

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HardDrive, Inbox, FileText, ImageIcon, Users, BarChart, MailCheck, ShoppingCart, MailWarning, Box, X, Film, DatabaseZap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

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
      label: 'Desglose del Buzón',
      icon: Inbox,
      color: 'from-[#AD00EC] to-[#1700E6]',
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
      label: 'Desglose de Contenido',
      icon: Box,
      color: 'from-[#1700E6] to-[#009AFF]',
      items: [
        { id: 'images', label: 'Imágenes', value: 1843.20, color: 'from-[#1700E6] to-[#009AFF]', icon: ImageIcon },
        { id: 'gifs', label: 'GIFs', value: 921.60, color: 'from-[#1700E6] to-[#009AFF]', icon: Film },
        { id: 'templates', label: 'Plantillas', value: 1228.80, color: 'from-[#1700E6] to-[#009AFF]', icon: FileText },
        { id: 'lists', label: 'Listas', value: 307.20, color: 'from-[#1700E6] to-[#009AFF]', icon: Users },
        { id: 'campaigns', label: 'Campañas', value: 1536.00, color: 'from-[#1700E6] to-[#009AFF]', icon: BarChart },
      ]
    }
  ]
};

const SectionProgressBar = ({ label, value, total, color, icon: Icon }: { label: string, value: number, total: number, color: string, icon: React.ElementType }) => {
    const percentage = (value / total) * 100;
    return (
        <div className="space-y-1.5 group">
            <div className="flex justify-between items-center text-xs">
                <p className="font-semibold flex items-center gap-2 text-white"><Icon className="size-4" />{label}</p>
                <p className="font-mono text-white">{value.toFixed(2)} MB ({percentage.toFixed(1)}%)</p>
            </div>
            <div className="relative h-3 w-full bg-primary/10 rounded-full overflow-hidden border border-[#AD00EC]/30">
                <motion.div
                    className={cn("absolute top-0 left-0 h-full rounded-full bg-gradient-to-r", color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                >
                     <div 
                        className="absolute top-0 left-0 h-full w-full opacity-50"
                        style={{
                            background: `radial-gradient(circle, white, transparent 30%)`,
                            backgroundSize: '300% 100%',
                            animation: 'scan-glare 2s infinite linear',
                            mixBlendMode: 'overlay',
                        }}
                    />
                </motion.div>
            </div>
        </div>
    );
};

const totalUsed = storageData.sections.flatMap(s => s.items).reduce((acc, item) => acc + item.value, 0);
const totalPercentage = (totalUsed / storageData.total) * 100;

export function StorageDetailsModal({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-full h-auto max-h-[90vh] flex flex-col p-0 gap-0 bg-zinc-950/80 backdrop-blur-xl border-2 border-[#AD00EC]/30 text-white overflow-hidden">
        <style>{`
            @keyframes scan-glare { 0% { background-position: 200% 50%; } 100% { background-position: -100% 50%; } }
            @keyframes hud-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .bg-hex-grid { background-image: linear-gradient(rgba(173, 0, 236, 0.05) 1px, transparent 1px), linear-gradient(120deg, transparent 11.5px, rgba(173, 0, 236, 0.05) 12px, transparent 12.5px), linear-gradient(60deg, transparent 11.5px, rgba(173, 0, 236, 0.05) 12px, transparent 12.5px); background-size: 24px 42px; }
        `}</style>

        <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 border border-white text-white hover:border-white hover:bg-white/10 z-20"
            onClick={() => onOpenChange(false)}
        >
            <X className="size-4" />
        </Button>
        
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-0 p-8 flex-1 overflow-hidden">
            <div className="absolute inset-0 bg-hex-grid opacity-50"/>
            <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-transparent opacity-30"/>
            
            {/* Left Panel */}
            <div className="lg:col-span-3 flex flex-col gap-4">
               <div className="text-center p-3 rounded-lg bg-gradient-to-r from-[#AD00EC]/30 to-[#1700E6]/30 border border-[#AD00EC]/50">
                    <h2 className="text-lg font-bold flex items-center justify-center gap-2"><Inbox className="text-white"/> <span className="text-white">Desglose del Buzón</span></h2>
                </div>
                {storageData.sections[0].items.map(item => (
                    <SectionProgressBar key={item.id} {...item} total={storageData.total} />
                ))}
            </div>
            
            {/* Middle Panel - Core */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center relative px-8">
                <div className="relative w-80 h-80">
                    {/* Animated Rings */}
                    <svg className="absolute inset-0 w-full h-full animate-[hud-spin_30s_linear_infinite]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="48" stroke="hsl(var(--primary) / 0.1)" strokeWidth="0.25" fill="none" />
                        <circle cx="50" cy="50" r="38" stroke="hsl(var(--primary) / 0.1)" strokeWidth="0.25" fill="none" />
                    </svg>
                    <svg className="absolute inset-0 w-full h-full animate-[hud-spin_20s_linear_infinite]" style={{animationDirection: 'reverse'}} viewBox="0 0 100 100">
                        <path d="M 50,5 A 45,45 0 0,1 95,50" stroke="hsl(var(--accent) / 0.2)" strokeWidth="0.5" fill="none" strokeDasharray="2, 8" />
                        <path d="M 5,50 A 45,45 0 0,1 50,95" stroke="hsl(var(--accent) / 0.2)" strokeWidth="0.5" fill="none" strokeDasharray="2, 8" />
                    </svg>

                     {/* Progress Ring */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="storage-chart-gradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#AD00EC" /><stop offset="100%" stopColor="#1700E6" /></linearGradient>
                            <linearGradient id="storage-light-gradient"><stop offset="0%" stopColor="rgba(255,255,255,0.7)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" /></linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--primary) / 0.15)" strokeWidth="10" />
                        <motion.circle
                            cx="50" cy="50" r="45" fill="transparent" stroke="url(#storage-chart-gradient)" strokeWidth="10"
                            strokeLinecap="round" strokeDasharray={2 * Math.PI * 45}
                            initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - (totalPercentage / 100)) }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            transform="rotate(-90 50 50)"
                        />
                         {/* Animated light glare */}
                        <circle
                            cx="50" cy="50" r="45" fill="transparent" stroke="url(#storage-light-gradient)" strokeWidth="10"
                            strokeLinecap="round" strokeDasharray={`2, ${2 * Math.PI * 45}`}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <p className="font-bold font-mono text-cyan-300">
                            <span className="text-5xl">{ (totalUsed/1024).toFixed(2) }</span>
                            <span className="text-2xl ml-1">GB</span>
                        </p>
                         <p className="text-sm">Usado de {storageData.total / 1024} GB</p>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
             <div className="lg:col-span-3 flex flex-col gap-4">
                <div className="text-center p-3 rounded-lg bg-gradient-to-r from-[#AD00EC]/30 to-[#1700E6]/30 border border-[#AD00EC]/50">
                    <h2 className="text-lg font-bold flex items-center justify-center gap-2"><Box className="text-white"/> <span className="text-white">Desglose de Contenido</span></h2>
                </div>
                 {storageData.sections[1].items.map(item => (
                    <SectionProgressBar key={item.id} {...item} total={storageData.total} />
                ))}
                 <Separator className="my-4 bg-[#AD00EC]/30" />
                 <div className="relative p-4 bg-amber-900/20 rounded-lg border border-amber-400/30 overflow-hidden text-center mt-auto">
                    <p className="relative text-xs text-amber-200/90">Puedes libera espacio eliminando archivos, información o plantillas antiguas, también puedes aumenta tu capacidad de almacenamiento.</p>
                </div>
                <div className="flex justify-center pt-2">
                    <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-gradient-to-r from-[#AD00EC] to-[#1700E6] px-6 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_theme(colors.purple.500/50%)]">
                        <div className="absolute -inset-0.5 -z-10 animate-spin-slow rounded-full bg-gradient-to-r from-[#AD00EC] via-[#009AFF] to-[#AD00EC] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <DatabaseZap className="mr-2 text-white"/>
                        <span className="text-white">Aumentar Almacenamiento</span>
                    </button>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    