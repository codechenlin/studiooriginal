
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HardDrive, Inbox, FileText, ImageIcon, Users, BarChart, MailCheck, ShoppingCart, MailWarning, Box, X, Film, DatabaseZap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      label: 'Análisis del Buzón',
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
      label: 'Datos de Contenido',
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

const totalUsed = storageData.sections.flatMap(s => s.items).reduce((acc, item) => acc + item.value, 0);

const AnimatedText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
    return (
        <span className="inline-block overflow-hidden">
            <motion.span
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ delay, duration: 0.5, ease: 'easeOut' }}
                className="inline-block"
            >
                {text}
            </motion.span>
        </span>
    );
};

const EnergyProgressBar = ({ value, total, color }: { value: number, total: number, color: string }) => {
    const percentage = (value / total) * 100;
    return (
        <div className="relative h-2.5 w-full bg-cyan-900/30 rounded-full overflow-hidden border border-cyan-400/20">
            <motion.div
                className={cn("absolute top-0 left-0 h-full rounded-full bg-gradient-to-r", color)}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.8 }}
            >
                 <div 
                    className="absolute top-0 left-0 h-full w-full opacity-70"
                    style={{
                        background: `radial-gradient(circle, white, transparent 40%)`,
                        backgroundSize: '400% 100%',
                        animation: 'scan-glare 3s infinite linear',
                        mixBlendMode: 'overlay',
                    }}
                />
            </motion.div>
        </div>
    );
}

export function StorageDetailsModal({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  const [hoveredItem, setHoveredItem] = useState<{label: string, value: number, color: string} | null>(null);

  const totalPercentage = (totalUsed / storageData.total) * 100;
  const centralDisplayData = hoveredItem || { label: 'Total Usado', value: totalUsed, color: 'from-[#AD00EC] to-[#1700E6]' };
  const centralPercentage = (centralDisplayData.value / storageData.total) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[700px] flex flex-col p-0 gap-0 bg-[#0A0F1A]/90 backdrop-blur-xl border-2 border-[#AD00EC]/30 text-white overflow-hidden">
        <style>{`
            @keyframes scan-line-vertical { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
            @keyframes grid-pulse { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.2; } }
            @keyframes scan-glare { 0% { background-position: 200% 50%; } 100% { background-position: -100% 50%; } }
        `}</style>
        
        {/* Main Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#AD00EC]/20 shrink-0">
             <div className="flex items-center gap-3">
                 <HardDrive className="size-6 text-[#AD00EC]"/>
                <h2 className="font-mono text-xl tracking-wider uppercase"><AnimatedText text="Diagnóstico de Almacenamiento" /></h2>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 border border-white/50 text-white/70 hover:border-white hover:bg-white/10" onClick={() => onOpenChange(false)}>
                <X className="size-4" />
            </Button>
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden">
            {/* Left Panel: Core Usage */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 border-r border-[#AD00EC]/20 relative">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(283,100%,55%,0.1)_0%,_transparent_60%)]"/>
                 <h3 className="font-mono uppercase tracking-widest text-sm text-[#AD00EC] mb-4">Carga del Núcleo</h3>
                 <div className="w-full flex-1 flex items-center justify-center">
                    <div className="w-full max-w-xs h-64 flex justify-around items-end gap-2 p-4 rounded-lg bg-black/30 border border-[#AD00EC]/20">
                        {storageData.sections.flatMap(s => s.items).map((item, i) => {
                            const itemPercentage = (item.value / storageData.total) * 100;
                            return (
                                <div key={item.id} className="w-full h-full flex flex-col justify-end items-center group" onMouseEnter={() => setHoveredItem(item)} onMouseLeave={() => setHoveredItem(null)}>
                                    <motion.div 
                                        className={cn("w-full rounded-t-sm bg-gradient-to-t", item.color)}
                                        initial={{ height: '0%' }}
                                        animate={{ height: `${(itemPercentage / totalPercentage) * 100}%` }}
                                        transition={{ duration: 1, delay: i * 0.05 + 0.5, ease: 'easeOut' }}
                                    >
                                        <div className="w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-size-8" />
                                    </motion.div>
                                    <div className="h-1 rounded-full bg-white/50 mt-1 w-1/2 group-hover:bg-white transition-colors" />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Center Panel: Main Display */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 border-r border-[#AD00EC]/20 relative bg-black/20">
                 <div className="absolute inset-0 bg-grid-purple" style={{ animation: `grid-pulse 4s infinite` }}/>
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={centralDisplayData.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                    >
                        <p className={cn("text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r", centralDisplayData.color)}>{centralDisplayData.label}</p>
                        <p className="text-5xl font-bold font-mono text-cyan-300 my-2">{(centralDisplayData.value / 1024).toFixed(2)}<span className="text-3xl">GB</span></p>
                        <p className="text-lg font-mono text-white/80">{centralPercentage.toFixed(2)}%</p>
                    </motion.div>
                 </AnimatePresence>
            </div>

            {/* Right Panel: Breakdowns */}
            <div className="md:col-span-4 flex flex-col p-6 space-y-6">
                {storageData.sections.map(section => (
                    <motion.div key={section.id} initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.4}}>
                        <h3 className="font-mono uppercase tracking-widest text-sm text-[#AD00EC] mb-3 flex items-center gap-2"><section.icon className="size-4"/>{section.label}</h3>
                        <div className="space-y-3">
                            {section.items.map((item, index) => (
                                <motion.div 
                                    key={item.id} 
                                    className="space-y-1"
                                    initial={{opacity: 0, x: 20}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{delay: index * 0.1 + 0.6}}
                                    onMouseEnter={() => setHoveredItem(item)} 
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <div className="flex justify-between items-center text-xs font-mono">
                                        <p className="flex items-center gap-2 text-white/80"><item.icon className="size-3.5"/>{item.label}</p>
                                        <p className="text-white">{(item.value / 1024).toFixed(2)} GB</p>
                                    </div>
                                    <EnergyProgressBar value={item.value} total={storageData.total} color={item.color}/>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}
                 <Separator className="my-4 bg-[#AD00EC]/20"/>
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
