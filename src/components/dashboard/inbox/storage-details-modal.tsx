
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HardDrive, Inbox, FileText, Image, Film, Users, BarChart, DatabaseZap, MailCheck, ShoppingCart, MailWarning, Users as SocialIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const storageData = {
  total: 15 * 1024, // 15 GB in MB
  breakdown: [
    { id: 'main', label: 'Buzón Principal', value: 2.1 * 1024, color: 'from-[#AD00EC] to-[#1700E6]', icon: MailCheck },
    { id: 'shopping', label: 'Compras', value: 1.1 * 1024, color: 'from-[#00CB07] to-[#21F700]', icon: ShoppingCart },
    { id: 'social', label: 'Redes Sociales', value: 0.8 * 1024, color: 'from-[#00ADEC] to-[#007BA8]', icon: SocialIcon },
    { id: 'spam', label: 'Spam', value: 0.4 * 1024, color: 'from-[#E18700] to-[#FFAB00]', icon: MailWarning },
    { id: 'bounces', label: 'Rebotes', value: 0.1 * 1024, color: 'from-[#F00000] to-[#F07000]', icon: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="m17 17 5 5m-5 0 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id: 'images', label: 'Imágenes', value: 1.8 * 1024, color: 'from-[#1700E6] to-[#009AFF]', icon: Image },
    { id: 'gifs', label: 'GIFs', value: 0.9 * 1024, color: 'from-[#1700E6] to-[#009AFF]', icon: Film },
    { id: 'templates', label: 'Plantillas', value: 1.2 * 1024, color: 'from-[#1700E6] to-[#009AFF]', icon: FileText },
    { id: 'lists', label: 'Listas', value: 0.3 * 1024, color: 'from-[#1700E6] to-[#009AFF]', icon: Users },
    { id: 'campaigns', label: 'Campañas', value: 1.5 * 1024, color: 'from-[#1700E6] to-[#009AFF]', icon: BarChart },
  ]
};

const SectionProgressBar = ({ label, value, total, color, Icon, delay }: { label: string, value: number, total: number, color: string, Icon: React.ElementType, delay: number }) => {
  const percentage = (value / total) * 100;
  return (
    <motion.div
      className="space-y-1.5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex justify-between items-center text-xs">
        <p className="font-semibold flex items-center gap-2"><Icon className="size-4" />{label}</p>
        <p className="font-mono text-cyan-300/80">{value.toFixed(2)} MB ({percentage.toFixed(1)}%)</p>
      </div>
      <div className="relative h-2 w-full bg-cyan-900/50 rounded-full overflow-hidden">
        <motion.div
          className={cn("absolute top-0 left-0 h-full rounded-full bg-gradient-to-r", color)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.3, duration: 1, ease: 'easeOut' }}
        >
           <div className="absolute inset-0 bg-white/20 opacity-50 animate-pulse"/>
        </motion.div>
      </div>
    </motion.div>
  );
};


export function StorageDetailsModal({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const totalUsed = storageData.breakdown.reduce((acc, item) => acc + item.value, 0);
  const available = storageData.total - totalUsed;
  const fullBreakdown = [...storageData.breakdown, { id: 'available', label: 'Disponible', value: available, color: 'from-gray-700 to-gray-600', icon: HardDrive }];
  
  const activeSection = hoveredSection ? fullBreakdown.find(item => item.id === hoveredSection) : { id: 'total', label: 'Total Usado', value: totalUsed, color: 'from-cyan-500 to-blue-500', icon: HardDrive };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[650px] p-0 gap-0 bg-zinc-900/90 backdrop-blur-xl border-2 border-cyan-400/30 text-white overflow-hidden">
        <style>{`
          .donut-segment { transition: all 0.2s ease-out; }
          .donut-segment:hover { transform: scale(1.05); filter: drop-shadow(0 0 10px currentColor); }
        `}</style>
        
        <div className="grid grid-cols-3 h-full">
          {/* Section 1: Inbox Breakdown */}
          <div className="col-span-1 flex flex-col p-6 border-r border-cyan-400/20 bg-black/20">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 shrink-0 text-cyan-300">
                <Inbox />Desglose del Buzón
            </h3>
            <div className="flex-1 space-y-4 pr-3 -mr-3 overflow-y-auto custom-scrollbar">
                {storageData.breakdown.slice(0, 5).map((item, index) => (
                    <SectionProgressBar key={item.id} {...item} total={storageData.total} delay={index * 0.1} />
                ))}
            </div>
          </div>
          
          {/* Section 2: Content Breakdown */}
          <div className="col-span-1 flex flex-col p-6 border-r border-cyan-400/20 bg-black/20">
             <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 shrink-0 text-cyan-300">
                <FileText />Desglose de Contenido
            </h3>
             <div className="flex-1 space-y-4 pr-3 -mr-3 overflow-y-auto custom-scrollbar">
                {storageData.breakdown.slice(5).map((item, index) => (
                    <SectionProgressBar key={item.id} {...item} total={storageData.total} delay={index * 0.1} />
                ))}
            </div>
          </div>

          {/* Section 3: Main Chart */}
          <div className="col-span-1 flex flex-col p-6 bg-black/30 relative">
            <div className="absolute inset-0 bg-grid-cyan-500/10 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_100%)]"/>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-64 h-64">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <g transform="rotate(-90 50 50)">
                    {(() => {
                      let accumulatedPercentage = 0;
                      return fullBreakdown.map(item => {
                        const percentage = (item.value / storageData.total) * 100;
                        const strokeDasharray = `${percentage} ${100 - percentage}`;
                        const strokeDashoffset = -accumulatedPercentage;
                        accumulatedPercentage += percentage;
                        
                        const isHovered = hoveredSection === item.id;
                        
                        return (
                          <circle
                            key={item.id}
                            className="donut-segment"
                            cx="50"
                            cy="50"
                            r="45"
                            fill="transparent"
                            strokeWidth={isHovered ? "12" : "10"}
                            stroke={`url(#grad-${item.id})`}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            onMouseEnter={() => setHoveredSection(item.id)}
                            onMouseLeave={() => setHoveredSection(null)}
                            style={{ color: `var(--color-${item.id}-end)` }}
                          />
                        );
                      });
                    })()}
                  </g>
                  <defs>
                    {fullBreakdown.map(item => {
                      const [from, to] = item.color.split(' ');
                      const fromColor = `var(--tw-gradient-from, ${from.replace('from-', '#')})`;
                      const toColor = `var(--tw-gradient-to, ${to.replace('to-', '#')})`;
                      return (
                        <linearGradient key={`grad-${item.id}`} id={`grad-${item.id}`}>
                          <stop offset="0%" stopColor={fromColor.replace(/\[|\]/g, '')}/>
                          <stop offset="100%" stopColor={toColor.replace(/\[|\]/g, '')}/>
                        </linearGradient>
                      )
                    })}
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSection?.id || 'total'}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center justify-center"
                    >
                      {(() => {
                        if (!activeSection) return null;
                        const ActiveIcon = activeSection.icon;
                        const percentage = (activeSection.value / storageData.total) * 100;
                        const valueInGB = activeSection.value / 1024;
                        return (
                          <>
                            <ActiveIcon className="size-8 mb-2 text-cyan-300" />
                            <p className="text-lg font-bold">{activeSection.label}</p>
                            <p className="text-3xl font-bold font-mono text-cyan-300">
                              {valueInGB.toFixed(2)} <span className="text-xl">GB</span>
                            </p>
                            <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
                          </>
                        )
                      })()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <div className="shrink-0 space-y-4 mt-6 text-center z-10">
                 <p className="text-xs text-muted-foreground">
                    Libera espacio eliminando campañas, listas o plantillas antiguas, o aumenta tu capacidad para seguir creciendo.
                </p>
                <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-gradient-to-r from-primary to-accent px-6 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_theme(colors.purple.500/50%)]">
                     <div className="absolute -inset-0.5 -z-10 animate-spin-slow rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <DatabaseZap className="mr-2"/>
                    Aumentar Almacenamiento
                </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
