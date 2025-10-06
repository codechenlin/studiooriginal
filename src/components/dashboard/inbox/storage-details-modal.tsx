
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HardDrive, Inbox, FileText, Image as ImageIcon, Users, BarChart, DatabaseZap, MailCheck, ShoppingCart, MailWarning, Box, X, Film } from 'lucide-react';
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
  total: 15 * 1024, // 15 GB in MB
  sections: [
    { 
      id: 'inbox',
      label: 'Buzón',
      icon: Inbox,
      color: 'hsl(283, 100%, 55%)',
      items: [
        { id: 'main', label: 'Principal', value: 2.1 * 1024, color: 'from-[#AD00EC] to-[#1700E6]', icon: MailCheck },
        { id: 'shopping', label: 'Compras', value: 1.1 * 1024, color: 'from-[#00CB07] to-[#21F700]', icon: ShoppingCart },
        { id: 'social', label: 'Social', value: 0.8 * 1024, color: 'from-[#00ADEC] to-[#007BA8]', icon: Users },
        { id: 'spam', label: 'Spam', value: 0.4 * 1024, color: 'from-[#E18700] to-[#FFAB00]', icon: MailWarning },
        { id: 'bounces', label: 'Rebotes', value: 0.1 * 1024, color: 'from-[#F00000] to-[#F07000]', icon: BouncesIcon },
      ]
    },
    {
      id: 'content',
      label: 'Contenido',
      icon: Box,
      color: 'hsl(182, 100%, 60%)',
      items: [
        { id: 'images', label: 'Imágenes', value: 1.8 * 1024, color: 'from-[#1700E6] to-[#009AFF]', icon: ImageIcon },
        { id: 'gifs', label: 'GIFs', value: 0.9 * 1024, color: 'from-[#1700E6] to-[#009AFF]', icon: Film },
        { id: 'templates', label: 'Plantillas', value: 1.2 * 1024, color: 'from-[#1700E6] to-[#009AFF]', icon: FileText },
        { id: 'lists', label: 'Listas', value: 0.3 * 1024, color: 'from-[#1700E6] to-[#009AFF]', icon: Users },
        { id: 'campaigns', label: 'Campañas', value: 1.5 * 1024, color: 'from-[#1700E6] to-[#009AFF]', icon: BarChart },
      ]
    }
  ]
};

const SectionProgressBar = ({ label, value, total, color, icon: Icon, isHovered }: { label: string, value: number, total: number, color: string, icon: React.ElementType, isHovered: boolean }) => {
    const percentage = (value / total) * 100;
  
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
                <p className="font-semibold flex items-center gap-2"><Icon className="size-4 opacity-80" />{label}</p>
                <p className="font-mono text-cyan-300/80">{value.toFixed(2)} MB</p>
            </div>
            <div className={cn("relative h-2 w-full bg-cyan-900/50 rounded-full overflow-hidden transition-all duration-300", isHovered && "shadow-[0_0_10px_var(--glow-color)]")} style={{ '--glow-color': color.split(' ')[1] } as React.CSSProperties}>
                <motion.div
                    className={cn("absolute top-0 left-0 h-full rounded-full bg-gradient-to-r", color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                >
                    <div className="absolute inset-0 w-full h-full overflow-hidden rounded-full">
                        <div 
                            className="absolute h-full w-1/2"
                            style={{
                                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 80%)',
                                animation: 'scan-glare 2s infinite ease-in-out',
                            }}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export function StorageDetailsModal({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  const [activeSection, setActiveSection] = useState<any | null>(null);
  const [expandedNode, setExpandedNode] = useState<string | null>('inbox');
  
  const totalUsed = storageData.sections.flatMap(s => s.items).reduce((acc, item) => acc + item.value, 0);
  
  const displayData = activeSection || { 
    label: 'Total Usado', 
    value: totalUsed,
    icon: HardDrive,
    color: 'from-primary to-accent'
  };
  const displayPercentage = (displayData.value / storageData.total) * 100;
  const DisplayIcon = displayData.icon;

  const valueInGB = displayData.value / 1024;
  const totalInGB = storageData.total / 1024;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-auto max-h-[90vh] flex flex-col p-0 gap-0 bg-zinc-950/80 backdrop-blur-xl border-2 border-[#AD00EC]/30 text-white overflow-hidden">
        <style jsx>{`
            @keyframes scan-glare { 0% { transform: translateX(-100%) skewX(-30deg); opacity: 0; } 20% { opacity: 0.5; } 80% { opacity: 0.5; } 100% { transform: translateX(200%) skewX(-30deg); opacity: 0; } }
            @keyframes hud-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes particle-flow { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-100px); opacity: 0; } }
            @keyframes light-ray-anim { 0% { transform: rotate(0deg) scaleY(0); opacity: 0.2; } 50% { transform: rotate(180deg) scaleY(1); opacity: 0.5; } 100% { transform: rotate(360deg) scaleY(0); opacity: 0.2; } }
        `}</style>

        <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 border border-white text-white hover:border-white hover:bg-white/10 z-20"
            onClick={() => onOpenChange(false)}
        >
            <X className="size-4" />
        </Button>
        
        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 p-6 md:p-8 flex-1 overflow-hidden">
            <div className="absolute inset-0 bg-grid-purple opacity-10"/>
            {/* Left Panel - Nodes */}
            <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-4">
                {storageData.sections.map(section => (
                    <div key={section.id}>
                         <div
                            className={cn(
                                "group relative p-4 rounded-lg cursor-pointer transition-all duration-300 border-2",
                                expandedNode === section.id ? `border-[${section.color}] shadow-[0_0_20px_var(--color-glow)]` : 'border-primary/20 bg-black/30 hover:bg-primary/10'
                            )}
                            onClick={() => setExpandedNode(expandedNode === section.id ? null : section.id)}
                            style={{ '--color-glow': section.color } as React.CSSProperties}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <section.icon className="size-6 opacity-80" />
                                    <h3 className="font-bold text-lg">{section.label}</h3>
                                </div>
                                <span className="text-xs font-mono text-cyan-300/80">{ (section.items.reduce((acc, i) => acc + i.value, 0)/1024).toFixed(2) } GB</span>
                            </div>
                        </div>
                        <AnimatePresence>
                        {expandedNode === section.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: '8px' }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="overflow-hidden pl-4 border-l-2 border-primary/30"
                            >
                                <div className="space-y-4 pt-2">
                                    {section.items.map(item => (
                                        <div key={item.id} onMouseEnter={() => setActiveSection(item)} onMouseLeave={() => setActiveSection(null)}>
                                            <SectionProgressBar {...item} total={storageData.total} isHovered={activeSection?.id === item.id}/>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Middle Panel - Core */}
            <div className="md:col-span-4 lg:col-span-6 flex flex-col items-center justify-center relative">
                <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-full filter blur-3xl opacity-50"/>
                 <div className="relative w-72 h-72">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="48" stroke="hsl(var(--primary) / 0.1)" strokeWidth="0.5" fill="none" />
                        <motion.circle 
                            cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary) / 0.2)" strokeWidth="8"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: 'circOut' }}
                        />
                         <motion.circle
                            cx="50" cy="50" r="42" fill="transparent" stroke="url(#storage-chart-gradient)" strokeWidth={8}
                            strokeLinecap="round" strokeDasharray={2 * Math.PI * 42}
                            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - (displayPercentage / 100)) }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            transform="rotate(-90 50 50)"
                        />
                         <motion.circle
                            cx="50" cy="50" r="42" fill="none" stroke="url(#storage-light-gradient)" strokeWidth={8}
                            strokeLinecap="round" strokeDasharray={`1, ${2 * Math.PI * 42}`}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={displayData.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col items-center justify-center"
                            >
                                <DisplayIcon className="size-7 mb-2 opacity-80" />
                                <p className="text-sm font-bold">{displayData.label}</p>
                                 <p className="font-bold font-mono text-cyan-300">
                                    <span className="text-4xl">{valueInGB.toFixed(2)}</span>
                                    <span className="text-lg ml-1">GB</span>
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Right Panel - Info */}
            <div className="md:col-span-4 lg:col-span-3 flex flex-col justify-center text-center">
                 <div className="relative p-4 bg-amber-900/20 rounded-lg border border-amber-400/30 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-amber-500/10 [mask-image:radial-gradient(ellipse_at_center,white_10%,transparent_100%)] opacity-50"/>
                    <p className="relative text-xs text-amber-200/90">Puedes libera espacio eliminando archivos, información o plantillas antiguas, también puedes aumenta tu capacidad de almacenamiento.</p>
                </div>
                <div className="flex justify-center pt-4 mt-4">
                    <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-gradient-to-r from-[#AD00EC] to-[#1700E6] px-6 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_theme(colors.purple.500/50%)]">
                        <div className="absolute -inset-0.5 -z-10 animate-spin-slow rounded-full bg-gradient-to-r from-[#AD00EC] via-[#009AFF] to-[#AD00EC] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <DatabaseZap className="mr-2 text-white"/>
                        <span className="text-white">Aumentar Almacenamiento</span>
                    </button>
                </div>
            </div>
        </div>

        <svg width="0" height="0" className="absolute">
            <defs>
                <linearGradient id="storage-chart-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#AD00EC" />
                    <stop offset="100%" stopColor="#1700E6" />
                </linearGradient>
                <radialGradient id="storage-light-gradient">
                    <stop offset="0%" stopColor="white" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
                 <style>
                  {`.bg-grid-purple { background-image: linear-gradient(to right, hsl(283 100% 55% / 0.1) 1px, transparent 1px), linear-gradient(to bottom, hsl(283 100% 55% / 0.1) 1px, transparent 1px); background-size: 2rem 2rem; }`}
                  {`.bg-grid-amber-500\\/10 { background-image: linear-gradient(to right, hsl(33 94% 53% / 0.1) 1px, transparent 1px), linear-gradient(to bottom, hsl(33 94% 53% / 0.1) 1px, transparent 1px); background-size: 1rem 1rem; }`}
                </style>
            </defs>
        </svg>
      </DialogContent>
    </Dialog>
  );
}
