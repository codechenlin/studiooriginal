
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tag, Check, X, CheckCircle, Search, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface TaggableTag {
  name: string;
  color: string;
}

const allTags: TaggableTag[] = [
  { name: 'Importante', color: '#ef4444' },
  { name: 'Seguimiento', color: '#f97316' },
  { name: 'Proyecto Alpha', color: '#3b82f6' },
  { name: 'Facturas', color: '#16a34a' },
  { name: 'Networking', color: '#0A66C2' },
  { name: 'Pedidos', color: '#3b82f6' },
  { name: 'Nuevos Clientes', color: '#8b5cf6' },
  { name: 'Soporte Técnico', color: '#6366f1' },
  { name: 'Marketing Q4', color: '#ec4899' },
  { name: 'Social Media', color: '#0ea5e9' },
  { name: 'Feedback', color: '#f59e0b' },
  { name: 'Interno', color: '#6b7280' },
  { name: 'Urgente', color: '#dc2626' },
  { name: 'Ideas', color: '#22c55e' },
  { name: 'Proveedores', color: '#d946ef' },
  { name: 'Logística', color: '#0891b2' },
  { name: 'Legal', color: '#a16207' },
  { name: 'Campaña de Verano', color: '#f43f5e' },
  { name: 'Newsletter', color: '#06b6d4' },
  { name: 'Anuncios', color: '#eab308' },
  { name: 'Reunión', color: '#4f46e5' },
  { name: 'Personal', color: '#7c3aed' },
  { name: 'Investigación', color: '#db2777' },
  { name: 'Desarrollo', color: '#1d4ed8' },
  { name: 'Ventas', color: '#9f1239' },
  { name: 'Finanzas', color: '#166534' },
  { name: 'Recursos Humanos', color: '#be185d' },
  { name: 'Socios Estratégicos', color: '#047857' },
  { name: 'Competencia', color: '#b45309' },
  { name: 'Lanzamiento de Producto', color: '#6d28d9' },
  { name: 'Soporte VIP', color: '#fbbf24' },
  { name: 'Contenido del Blog', color: '#34d399' },
  { name: 'Consultas de Prensa', color: '#fb7185' },
  { name: 'Recordatorios', color: '#a78bfa' },
  { name: 'Promociones', color: '#f87171' },
  { name: 'Eventos', color: '#c084fc' },
  { name: 'Webinars', color: '#60a5fa' },
  { name: 'Informes Semanales', color: '#84cc16' },
  { name: 'Actualizaciones de Producto', color: '#2dd4bf' },
  { name: 'Contratos', color: '#4ade80' },
  { name: 'Viajes', color: '#facc15' },
  { name: 'Inversores', color: '#9333ea' },
  { name: 'Cuentas por Pagar', color: '#fde047' },
  { name: 'Cuentas por Cobrar', color: '#a3e635' },
  { name: 'Reclutamiento', color: '#f472b6' },
];

interface TagFilterModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onFilter: (selectedTags: TaggableTag[]) => void;
  initialSelectedTags: TaggableTag[];
}

export function TagFilterModal({ isOpen, onOpenChange, onFilter, initialSelectedTags }: TagFilterModalProps) {
    const [selectedTags, setSelectedTags] = useState<TaggableTag[]>(initialSelectedTags);

    useEffect(() => {
        if(isOpen) {
            setSelectedTags(initialSelectedTags);
        }
    }, [isOpen, initialSelectedTags]);
    
    const handleTagClick = (tag: TaggableTag) => {
        setSelectedTags(prev => {
            if (prev.some(t => t.name === tag.name)) {
                return prev.filter(t => t.name !== tag.name);
            } else {
                return [...prev, tag];
            }
        });
    };
    
    const handleApplyFilter = () => {
        onFilter(selectedTags);
        onOpenChange(false);
    }
    
    const handleCancel = () => {
        onOpenChange(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-zinc-900/90 backdrop-blur-xl border border-cyan-400/20 text-white overflow-hidden">
                 <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute h-full w-full bg-[radial-gradient(#00ADEC_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
                </div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full animate-pulse-slow filter blur-3xl -translate-x-1/2 -translate-y-1/2"/>

                <DialogHeader className="z-10">
                    <DialogTitle className="flex items-center gap-3 text-2xl text-cyan-300">
                         <div className="p-2.5 bg-cyan-500/10 border-2 border-cyan-400/20 rounded-full icon-pulse-animation">
                           <Layers className="text-cyan-400" />
                        </div>
                        Filtrar por Etiquetas
                    </DialogTitle>
                    <DialogDescription className="text-cyan-200/70">
                        Selecciona una o más etiquetas para mostrar solo los correos relevantes.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 z-10">
                    <ScrollArea className="max-h-[60vh] -mr-4 pr-4 custom-scrollbar">
                        <AnimatePresence>
                            <motion.div 
                                layout
                                className="flex flex-wrap gap-3"
                            >
                                {allTags.map(tag => {
                                    const isSelected = selectedTags.some(t => t.name === tag.name);
                                    return (
                                        <motion.button
                                            key={tag.name}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            onClick={() => handleTagClick(tag)}
                                            className={cn(
                                                "relative group px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 cursor-pointer border-2 transition-all duration-300",
                                                isSelected ? 'border-cyan-400 text-cyan-200 bg-cyan-900/50 shadow-lg shadow-cyan-500/20' : 'border-gray-600/50 text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 hover:border-gray-500'
                                            )}
                                        >
                                            <div className="relative flex items-center justify-center size-5">
                                                <div className="absolute inset-0 rounded-full" style={{ backgroundColor: tag.color, opacity: isSelected ? 1 : 0.5, filter: isSelected ? `drop-shadow(0 0 5px ${tag.color})` : 'none' }}/>
                                                {isSelected && (
                                                    <motion.div initial={{scale: 0}} animate={{scale: 1}} className="absolute">
                                                       <CheckCircle className="size-5 text-white/80" style={{filter: 'drop-shadow(0 0 3px black)'}}/>
                                                    </motion.div>
                                                )}
                                            </div>
                                            <span>{tag.name}</span>
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        </AnimatePresence>
                    </ScrollArea>
                </div>

                <DialogFooter className="z-10 pt-4 flex justify-end gap-2">
                    <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleCancel}>
                        <X className="mr-2"/>Cancelar
                    </Button>
                    <Button className="bg-cyan-600 hover:bg-cyan-500 text-white" onClick={handleApplyFilter}>
                        <Tag className="mr-2"/>Filtrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
