
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
        { id: 'lists', label: 'Listas', value: 307.20, color: 'from-[#1700E6] to-[#009AFF]', icon: Users },
        { id: 'campaigns', label: 'Campañas', value: 1536.00, color: 'from-[#1700E6] to-[#009AFF]', icon: BarChart },
      ]
    }
  ]
};

const totalUsed = storageData.sections.flatMap(s => s.items).reduce((acc, item) => acc + item.value, 0);

const SectionProgressBar = ({ label, value, total, color, icon: Icon }: { label: string, value: number, total: number, color: string, icon: React.ElementType }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-center text-xs">
                <p className="font-semibold flex items-center gap-2 text-white"><Icon className="size-4" />{label}</p>
                <p className="font-mono text-white/80">{value.toFixed(2)} MB ({percentage.toFixed(1)}%)</p>
            </div>
            <div className="relative h-2 w-full bg-black/30 rounded-full overflow-hidden border border-[#AD00EC]/20">
                <motion.div
                    className={cn("absolute top-0 left-0 h-full rounded-full bg-gradient-to-r", color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                />
                 <div className="absolute top-0 left-0 h-full w-full opacity-50 animate-[scan-glare_3s_infinite_linear]"
                    style={{
                        background: `radial-gradient(circle at 50% 50%, white, transparent 30%)`,
                        backgroundSize: '400% 100%',
                    }}
                />
            </div>
        </motion.div>
    );
};

const CircularChart = ({ percentage, total, used, label, isMain = false }: { percentage: number; total: number; used: number; label: string; isMain?: boolean; }) => {
    const circumference = 2 * Math.PI * (isMain ? 55 : 45);
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={cn("relative", isMain ? "w-48 h-48" : "w-36 h-36")}>
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    {isMain && (
                        <>
                         <circle className="text-[#AD00EC]/10" stroke="currentColor" strokeWidth="10" fill="transparent" r="55" cx="60" cy="60" />
                         <motion.circle
                            className="text-white"
                            stroke="url(#progressGradient)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            fill="transparent"
                            r="55"
                            cx="60"
                            cy="60"
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: offset }}
                            transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                            strokeDasharray={circumference}
                         />
                         <motion.circle
                            cx="60" cy="60" r="55" fill="none" stroke="url(#shineGradient)" strokeWidth="2" strokeLinecap="round"
                            strokeDasharray="5 50"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                         />
                        </>
                    )}
                    {!isMain && (
                         <>
                             <circle className="text-[#AD00EC]/10" stroke="currentColor" strokeWidth="8" fill="transparent" r="45" cx="60" cy="60" />
                             <motion.circle
                                className="text-white"
                                stroke="url(#progressGradient)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                fill="transparent"
                                r="45"
                                cx="60"
                                cy="60"
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: offset }}
                                transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                                strokeDasharray={circumference}
                             />
                        </>
                    )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className={cn("font-bold font-mono text-white leading-none", isMain ? "text-3xl" : "text-2xl")}>
                        {(used / 1024).toFixed(2)}
                        <span className={cn("font-sans text-white/70 ml-1", isMain ? "text-lg" : "text-base")}>GB</span>
                    </span>
                    {isMain && (
                        <span className="text-sm text-white/50">de {(total / 1024).toFixed(0)} GB</span>
                    )}
                </div>
            </div>
            <p className="text-sm font-semibold text-white/90">{label}</p>
        </div>
    );
};


export function StorageDetailsModal({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full h-auto flex flex-col p-0 gap-0 bg-black/80 backdrop-blur-xl border-2 border-[#AD00EC]/30 text-white overflow-hidden">
                <DialogHeader className="p-4 border-b border-[#AD00EC]/20 bg-black/50 sr-only">
                    <DialogTitle>Diagnóstico de Almacenamiento</DialogTitle>
                </DialogHeader>

                <style>{`
                    @keyframes grid-pan { 0% { background-position: 0% 0%; } 100% { background-position: 100% 100%; } }
                    .animated-grid { background-image: linear-gradient(hsl(var(--primary)/0.1) 1px, transparent 1px), linear-gradient(to right, hsl(var(--primary)/0.1) 1px, transparent 1px); background-size: 3rem 3rem; animation: grid-pan 60s linear infinite; }
                    @keyframes scan-glare { 0% { transform: translateX(-100%) skewX(-30deg); } 100% { transform: translateX(300%) skewX(-30deg); } }
                `}</style>
                <svg width="0" height="0" className="absolute">
                     <defs>
                         <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#AD00EC" />
                            <stop offset="100%" stopColor="#1700E6" />
                        </linearGradient>
                        <linearGradient id="shineGradient">
                            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
                            <stop offset="50%" stopColor="white" stopOpacity="1" />
                            <stop offset="100%" stopColor="white" stopOpacity="0.5" />
                        </linearGradient>
                    </defs>
                </svg>

                 <div className="flex items-center justify-between p-4 border-b border-[#AD00EC]/20 bg-black/50">
                    <div className="flex items-center gap-3">
                        <HardDrive className="size-6 text-[#AD00EC]"/>
                        <h2 className="font-semibold text-xl">Diagnóstico de Almacenamiento</h2>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 border border-white text-white hover:bg-white/10" onClick={() => onOpenChange(false)}>
                        <X className="size-4" />
                    </Button>
                </div>

                <div className="flex flex-col">
                    {/* Top Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#AD00EC]/20">
                        {storageData.sections.map(section => (
                            <div key={section.id} className="bg-black/30 p-6">
                                <div className="relative text-center mb-4 p-3 rounded-lg bg-gradient-to-r from-[#AD00EC]/20 to-[#1700E6]/20 border border-[#AD00EC]/30">
                                    <h3 className="font-bold text-lg flex items-center justify-center gap-2 text-white">
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
                    <div className="p-6 border-t border-[#AD00EC]/20 bg-black/50 grid grid-cols-1 md:grid-cols-3 items-center gap-6">
                        <div className="md:col-span-2 flex justify-around items-center">
                            <CircularChart 
                                percentage={(totalUsed / storageData.total) * 100} 
                                total={storageData.total} 
                                used={totalUsed}
                                label="Total Usado"
                                isMain
                            />
                            <CircularChart 
                                percentage={(4500 / totalUsed) * 100} 
                                total={totalUsed} 
                                used={4500}
                                label="Uso Reciente (30 días)"
                            />
                        </div>
                        <div className="flex flex-col gap-4">
                             <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-400/30 text-center">
                                <p className="text-sm text-amber-200/90">
                                   Puedes libera espacio eliminando archivos, información o plantillas antiguas, también puedes aumenta tu capacidad de almacenamiento.
                                </p>
                            </div>
                            <Button className="group relative w-full h-12 overflow-hidden bg-gradient-to-r from-[#AD00EC] to-[#1700E6] text-white font-bold text-base transition-all duration-300 hover:shadow-[0_0_20px_#AD00EC]">
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
