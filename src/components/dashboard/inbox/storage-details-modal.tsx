
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HardDrive, Inbox, FileText, Image, Film, FileType, Users, BarChart, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';

const storageData = {
  total: 15 * 1024, // 15 GB in MB
  breakdown: [
    { id: 'inbox', label: 'Buzón', value: 2.1 * 1024, color: 'from-blue-500 to-cyan-400' },
    { id: 'images', label: 'Imágenes', value: 1.8 * 1024, color: 'from-purple-500 to-pink-500' },
    { id: 'gifs', label: 'GIFs', value: 0.9 * 1024, color: 'from-indigo-500 to-purple-400' },
    { id: 'templates', label: 'Plantillas', value: 1.2 * 1024, color: 'from-teal-500 to-emerald-400' },
    { id: 'lists', label: 'Listas', value: 0.3 * 1024, color: 'from-amber-500 to-yellow-400' },
    { id: 'campaigns', label: 'Campañas', value: 4.0 * 1024, color: 'from-rose-500 to-red-500' },
  ]
};

const sectionIcons: { [key: string]: React.ElementType } = {
  inbox: Inbox,
  images: Image,
  gifs: Film,
  templates: FileText,
  lists: Users,
  campaigns: BarChart,
  available: FileType
};

export function StorageDetailsModal({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const totalUsed = storageData.breakdown.reduce((acc, item) => acc + item.value, 0);
  const available = storageData.total - totalUsed;
  
  const fullBreakdown = [...storageData.breakdown, { id: 'available', label: 'Disponible', value: available, color: 'from-gray-600 to-gray-500' }];

  const activeSection = hoveredSection 
    ? fullBreakdown.find(item => item.id === hoveredSection) 
    : { id: 'total', label: 'Total Usado', value: totalUsed, color: 'from-cyan-500 to-blue-500' };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[650px] flex p-0 gap-0 bg-zinc-900/90 backdrop-blur-xl border-2 border-cyan-400/30 text-white overflow-hidden">
        <style>{`
          .donut-segment { transition: all 0.2s ease-out; }
          .donut-segment:hover { transform: scale(1.05); filter: drop-shadow(0 0 10px currentColor); }
        `}</style>
        <div className="w-2/3 flex flex-col p-8 border-r border-cyan-400/20">
          <DialogHeader className="text-left mb-6">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="relative p-2 rounded-full bg-cyan-900/50 border-2 border-cyan-500/50">
                <div className="absolute inset-0 rounded-full animate-ping border-2 border-cyan-400/50" />
                <HardDrive className="relative text-cyan-300" />
              </div>
              Gestión de Almacenamiento
            </DialogTitle>
            <DialogDescription className="text-cyan-200/70">
              Visualiza el desglose de tu almacenamiento y optimiza tu espacio.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-5 pr-4 -mr-4 overflow-y-auto custom-scrollbar">
            {storageData.breakdown.map(item => {
              const percentage = (item.value / storageData.total) * 100;
              const Icon = sectionIcons[item.id];
              return (
                <motion.div
                  key={item.id}
                  className="space-y-2"
                  onHoverStart={() => setHoveredSection(item.id)}
                  onHoverEnd={() => setHoveredSection(null)}
                >
                  <div className="flex justify-between items-center text-sm">
                    <p className="font-semibold flex items-center gap-2"><Icon className="size-4" />{item.label}</p>
                    <p className="font-mono text-cyan-300/80">{item.value.toFixed(2)} MB</p>
                  </div>
                  <Progress value={percentage} className="h-3" indicatorClassName={`bg-gradient-to-r ${item.color}`} />
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="w-1/3 bg-black/30 flex flex-col items-center justify-center p-8 relative overflow-hidden">
           <div className="absolute inset-0 bg-grid-cyan-500/10 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_100%)]"/>
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
                  const fromColor = `var(--tw-gradient-from, ${from.replace('from-', '')})`;
                  const toColor = `var(--tw-gradient-to, ${to.replace('to-', '')})`;
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
                    const ActiveIcon = activeSection ? sectionIcons[activeSection.id] : HardDrive;
                    const percentage = activeSection ? (activeSection.value / storageData.total) * 100 : (totalUsed / storageData.total) * 100;
                    const valueInGB = activeSection ? activeSection.value / 1024 : totalUsed / 1024;
                    if (!ActiveIcon) return null;
                    return (
                      <>
                        <ActiveIcon className="size-8 mb-2" />
                        <p className="text-lg font-bold">{activeSection?.label}</p>
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
           <Button className="mt-8 bg-cyan-600 hover:bg-cyan-500 text-white w-full" onClick={() => onOpenChange(false)}>
            <X className="mr-2"/>Cerrar
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
