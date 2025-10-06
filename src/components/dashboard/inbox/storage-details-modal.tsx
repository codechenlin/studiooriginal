
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HardDrive, Inbox, FileText, Image as ImageIcon, Film, Users, BarChart, DatabaseZap, MailCheck, ShoppingCart, MailWarning, Users as SocialIcon, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const BouncesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m17 17 5 5m-5 0 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const storageData = {
  total: 15 * 1024, // 15 GB in MB
  breakdown: [
    { id: 'main', label: 'Buzón Principal', value: 2.1 * 1024, color: 'from-[#AD00EC] to-[#1700E6]', icon: MailCheck },
    { id: 'shopping', label: 'Compras', value: 1.1 * 1024, color: 'from-[#00CB07] to-[#21F700]', icon: ShoppingCart },
    { id: 'social', label: 'Redes Sociales', value: 0.8 * 1024, color: 'from-[#00ADEC] to-[#007BA8]', icon: SocialIcon },
    { id: 'spam', label: 'Spam', value: 0.4 * 1024, color: 'from-[#E18700] to-[#FFAB00]', icon: MailWarning },
    { id: 'bounces', label: 'Rebotes', value: 0.1 * 1024, color: 'from-[#F00000] to-[#F07000]', icon: BouncesIcon },
    { id: 'images', label: 'Imágenes', value: 1.8 * 1024, color: 'from-[#1700E6] to-[#009AFF]', icon: ImageIcon },
    { id: 'gifs', label: 'GIFs', value: 0.9 * 1024, color: 'from-[#1700E6] to-[#009AFF]', icon: Film },
    { id: 'templates', label: 'Plantillas', value: 1.2 * 1024, color: 'from-[#1700E6] to-[#009AFF]', icon: FileText },
    { id: 'lists', label: 'Listas', value: 0.3 * 1024, color: 'from-[#1700E6] to-[#009AFF]', icon: Users },
    { id: 'campaigns', label: 'Campañas', value: 1.5 * 1024, color: 'from-[#1700E6] to-[#009AFF]', icon: BarChart },
  ]
};

const SectionProgressBar = ({ label, value, total, color, icon: Icon, delay }: { label: string, value: number, total: number, color: string, icon: React.ElementType, delay: number }) => {
  const percentage = (value / total) * 100;
  
  if (!Icon) {
    Icon = FileText;
  }

  return (
    <motion.div
      className="space-y-1.5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex justify-between items-center text-xs">
        <p className="font-semibold flex items-center gap-2 text-white/80"><Icon className="size-4" />{label}</p>
        <p className="font-mono text-white">{value.toFixed(2)} MB ({percentage.toFixed(1)}%)</p>
      </div>
      <div className="relative h-2 w-full bg-cyan-900/50 rounded-full overflow-hidden">
        <motion.div
          className={cn("absolute top-0 left-0 h-full rounded-full bg-gradient-to-r", color)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.3, duration: 1, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 w-full h-full overflow-hidden rounded-full">
            <div 
              className="absolute h-full w-1/2"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 80%)',
                animation: 'scan-glare 2s infinite ease-in-out',
                animationDelay: `${delay}s`,
              }}
            />
          </div>
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
  
  const activeSection = hoveredSection ? fullBreakdown.find(item => item.id === hoveredSection) : null;
  const defaultDisplayData = { id: 'total', label: 'Total Usado', value: totalUsed, color: 'from-cyan-500 to-blue-500', icon: HardDrive };
  const displayData = activeSection || defaultDisplayData;

  const ActiveIcon = displayData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-auto max-h-[90vh] flex flex-col p-0 gap-0 bg-zinc-900/90 backdrop-blur-xl border-2 border-cyan-400/30 text-white overflow-hidden" showCloseButton={false}>
          <DialogTitle className="sr-only">Detalles de Almacenamiento</DialogTitle>
          <DialogDescription className="sr-only">Un desglose detallado del uso de almacenamiento de tu cuenta.</DialogDescription>
        <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-cyan-400/20">
          {/* Section 1 */}
          <div className="flex flex-col p-6 bg-black/20">
             <div className="relative mb-4 text-center p-3 rounded-lg bg-gradient-to-r from-[#AD00EC] to-[#1700E6]">
               <div className="absolute inset-0 bg-grid-cyan-500/10 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_100%)] opacity-50"/>
               <h3 className="relative text-lg font-semibold flex items-center justify-center gap-2 shrink-0 text-white">
                  <Inbox />Desglose del Buzón
               </h3>
             </div>
            <div className="space-y-4">
                {storageData.breakdown.slice(0, 5).map((item, index) => (
                    <SectionProgressBar key={item.id} {...item} total={storageData.total} delay={index * 0.1} />
                ))}
            </div>
          </div>
          
          {/* Section 2 */}
          <div className="flex flex-col p-6 bg-black/20">
             <div className="relative mb-4 text-center p-3 rounded-lg bg-gradient-to-r from-[#AD00EC] to-[#1700E6]">
               <div className="absolute inset-0 bg-grid-cyan-500/10 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_100%)] opacity-50"/>
               <h3 className="relative text-lg font-semibold flex items-center justify-center gap-2 shrink-0 text-white">
                  <FileText />Desglose de Contenido
               </h3>
             </div>
             <div className="space-y-4">
                {storageData.breakdown.slice(5).map((item, index) => (
                    <SectionProgressBar key={item.id} {...item} total={storageData.total} delay={index * 0.1 + 0.5} />
                ))}
            </div>
          </div>

          {/* Section 3 */}
          <div className="flex flex-col p-6 bg-black/30 relative items-center justify-center gap-6">
             <div className="absolute inset-0 bg-grid-cyan-500/10 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_100%)]"/>
            <div className="relative w-48 h-48">
              <motion.svg className="w-full h-full" viewBox="0 0 100 100">
                 <defs>
                  <linearGradient id="storage-chart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#AD00EC" />
                    <stop offset="100%" stopColor="#1700E6" />
                  </linearGradient>
                   <radialGradient id="storage-orb-gradient">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                        <stop offset="25%" stopColor="rgba(200,200,200,0)" />
                    </radialGradient>
                </defs>
                {/* Outer animated rings */}
                <circle cx="50" cy="50" r="48" stroke="hsl(var(--primary) / 0.1)" strokeWidth="0.5" fill="none" />
                <motion.circle
                  cx="50" cy="50" r="48" fill="none" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1"
                  strokeDasharray="1, 15"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />
                 <motion.circle
                  cx="50" cy="50" r="38" fill="none" stroke="hsl(var(--accent) / 0.2)" strokeWidth="1"
                  strokeDasharray="1, 10"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                />

                {/* Main progress track */}
                <circle cx="50" cy="50" r="42" fill="transparent" stroke="hsl(var(--primary) / 0.1)" strokeWidth="16" />
                
                {/* Main progress bar */}
                <motion.circle
                  cx="50" cy="50" r="42"
                  fill="transparent"
                  stroke="url(#storage-chart-gradient)"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - (totalUsed / storageData.total)) }}
                  transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                  transform="rotate(-90 50 50)"
                />
                
                {/* Orbiter animation */}
                 <motion.circle
                    cx="50" cy="50" r="42"
                    fill="transparent"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray={`1, ${2 * Math.PI * 42}`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    style={{ stroke: 'url(#storage-orb-gradient)' }}
                />
              </motion.svg>
              
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={displayData.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center justify-center"
                    >
                        {ActiveIcon && <ActiveIcon className="size-6 mb-1 text-cyan-300" />}
                        <p className="text-md font-bold">{displayData.label}</p>
                        <p className="text-2xl font-bold font-mono text-cyan-300">
                          {(displayData.value / 1024).toFixed(2)} <span className="text-lg">GB</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{((displayData.value / storageData.total) * 100).toFixed(1)}%</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
            </div>
            
             <div className="space-y-4 text-center z-10 w-full">
                 <div className="relative p-3 text-xs text-amber-200/90 bg-amber-900/20 rounded-lg border border-amber-400/30 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-amber-500/10 [mask-image:radial-gradient(ellipse_at_center,white_10%,transparent_100%)] opacity-50"/>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="size-8 text-amber-400 shrink-0"/>
                      <p className="relative text-left">Puedes libera espacio eliminando archivos, información o plantillas antiguas, también puedes aumenta tu capacidad de almacenamiento.</p>
                    </div>
                 </div>
                <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-gradient-to-r from-[#AD00EC] to-[#1700E6] px-6 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_theme(colors.purple.500/50%)]">
                     <div className="absolute -inset-0.5 -z-10 animate-spin-slow rounded-full bg-gradient-to-r from-[#AD00EC] via-[#009AFF] to-[#AD00EC] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <DatabaseZap className="mr-2 text-white"/>
                    <span className="text-white">Aumentar Almacenamiento</span>
                </button>
            </div>
          </div>
        </div>
        <DialogFooter className="p-2 border-t border-cyan-400/20 bg-black/50">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 h-8 w-8 border border-white text-white hover:border-white hover:bg-white/10"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
        </DialogFooter>
        <style jsx>{`
            @keyframes scan-glare {
              0% { transform: translateX(-100%) skewX(-30deg); opacity: 0; }
              20% { opacity: 0.5; }
              80% { opacity: 0.5; }
              100% { transform: translateX(200%) skewX(-30deg); opacity: 0; }
            }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
