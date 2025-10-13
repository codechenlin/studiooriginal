
"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Languages, BrainCircuit, Check, X, Loader2, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const availableLanguages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'Inglés' },
    { code: 'fr', name: 'Francés' },
    { code: 'de', name: 'Alemán' },
    { code: 'pt', name: 'Portugués' },
    { code: 'it', name: 'Italiano' },
    { code: 'ru', name: 'Ruso' },
    { code: 'zh', name: 'Chino (Simplificado)' },
    { code: 'ja', name: 'Japonés' },
    { code: 'ar', name: 'Árabe' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ko', name: 'Coreano' },
];

export function TranslationConfigModal({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
    const [detectedLanguage] = useState('Inglés (Detectado)');
    const [targetLanguage, setTargetLanguage] = useState('es');
    const [isSaving, setIsSaving] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredLanguages = useMemo(() => 
        availableLanguages.filter(lang => 
            lang.name.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      [searchTerm]
    );

    const activeIndex = useMemo(() => {
        return filteredLanguages.findIndex(l => l.code === targetLanguage);
    }, [filteredLanguages, targetLanguage]);

    const handleLanguageClick = (direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? activeIndex - 1 : activeIndex + 1;
        if (newIndex >= 0 && newIndex < filteredLanguages.length) {
            setTargetLanguage(filteredLanguages[newIndex].code);
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            onOpenChange(false);
        }, 1500);
    }
    
    const itemHeight = 48; // Corresponds to h-12 in Tailwind

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl bg-zinc-900/90 backdrop-blur-xl border border-purple-500/20 text-white overflow-hidden" showCloseButton={false}>
                <div className="absolute inset-0 z-0 opacity-10 bg-grid-purple-500/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full animate-pulse-slow filter blur-3xl -translate-x-1/2 -translate-y-1/2"/>
                
                <DialogHeader className="z-10">
                    <DialogTitle className="flex items-center gap-3 text-2xl text-purple-300">
                        <BrainCircuit className="size-8"/>
                        Configuración de Traducción con IA
                    </DialogTitle>
                    <DialogDescription className="text-purple-200/70 pt-2">
                        Elige tu idioma preferido para las traducciones. La IA detectará el idioma original automáticamente.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 z-10 grid grid-cols-2 gap-6 items-center">
                    {/* From Language */}
                    <div className="space-y-2 text-center">
                        <Label className="font-semibold text-sm text-purple-200">Idioma Original</Label>
                        <div className="relative p-4 rounded-lg bg-black/30 border border-purple-400/20 flex flex-col items-center justify-center h-48">
                             <motion.div
                                className="absolute inset-0 opacity-50"
                                style={{ backgroundImage: `radial-gradient(circle at 50% 50%, hsl(283 100% 55% / 0.2), transparent 70%)` }}
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <p className="font-bold text-lg text-white">{detectedLanguage}</p>
                            <p className="text-xs text-purple-300/80">Detectado por IA</p>
                        </div>
                    </div>
                    {/* To Language */}
                    <div className="space-y-2 text-center flex flex-col">
                        <Label htmlFor="target-lang" className="font-semibold text-sm text-purple-200">Traducir a</Label>
                        <div className="relative rounded-lg bg-black/30 border border-purple-400/20 flex flex-col items-center justify-between overflow-hidden h-48">
                             <div className="absolute top-4 right-4 z-20 flex items-center justify-end">
                                <AnimatePresence>
                                {isSearchOpen && (
                                    <motion.div
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 150, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="relative mr-2"
                                    >
                                        <Input
                                            type="text"
                                            placeholder="Buscar idioma..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="h-8 bg-black/50 border-purple-400/50 text-white placeholder:text-purple-200/50"
                                            autoFocus
                                        />
                                        <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-8 w-8 text-purple-200 hover:text-white" onClick={() => { setSearchTerm(''); setIsSearchOpen(false); }}>
                                            <X className="size-4" />
                                        </Button>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-200 hover:text-white" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                                    <Search className="size-4" />
                                </Button>
                             </div>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-300 hover:text-white absolute top-2 left-1/2 -translate-x-1/2 z-10" onClick={() => handleLanguageClick('up')}><ChevronUp/></Button>
                             
                             <div className="w-full h-full relative overflow-hidden">
                                <div className="absolute top-1/2 left-0 w-full h-12 -translate-y-1/2 bg-purple-500/20 border-y-2 border-purple-400 rounded-lg" style={{ filter: 'blur(5px)' }}/>
                                <div
                                    className="w-full transition-transform duration-300 ease-in-out"
                                    style={{ transform: `translateY(calc(50% - ${activeIndex * itemHeight}px - ${itemHeight/2}px))` }}
                                >
                                    {filteredLanguages.map((lang, index) => (
                                        <div
                                            key={lang.code}
                                            className={cn(
                                                "w-full text-center text-lg p-2 transition-all duration-300 rounded-md h-12 flex items-center justify-center cursor-pointer",
                                                activeIndex === index ? "font-bold text-white scale-100" : "text-purple-200/50 scale-90"
                                            )}
                                            onClick={() => setTargetLanguage(lang.code)}
                                        >
                                           <div className="flex items-center justify-center gap-3">
                                               {activeIndex === index && (
                                                 <div className="w-2.5 h-2.5 rounded-full bg-[#00CB07] shadow-[0_0_8px_#00CB07]" />
                                               )}
                                              <span>{lang.name}</span>
                                           </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-300 hover:text-white absolute bottom-2 left-1/2 -translate-x-1/2 z-10" onClick={() => handleLanguageClick('down')}><ChevronDown/></Button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="z-10 pt-4 flex justify-between w-full">
                    <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => onOpenChange(false)}>
                        <X className="mr-2"/>
                        Cerrar
                    </Button>
                    <Button className="bg-purple-600 text-white hover:bg-purple-500" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <Check className="mr-2"/>}
                        Guardar Preferencia
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
