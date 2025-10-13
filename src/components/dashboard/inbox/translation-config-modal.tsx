
"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Languages, BrainCircuit, Check, X, Loader2, Search, ChevronUp, ChevronDown, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
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
    const [targetLanguage, setTargetLanguage] = useState('es');
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const listRef = useRef<HTMLDivElement>(null);

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
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-zinc-900/90 backdrop-blur-xl border border-purple-500/20 text-white overflow-hidden" showCloseButton={false}>
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

                <div className="py-6 z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* From Language */}
                    <div className="space-y-4 text-center">
                        <Label className="font-semibold text-sm text-purple-200">Idioma Original</Label>
                         <div className="relative p-3 rounded-lg bg-green-900/40 border border-green-500/50 flex items-center justify-center gap-3 text-sm font-semibold">
                            <CheckCircle className="size-5 text-green-400"/>
                            <span className="text-green-300">Detección Automática</span>
                        </div>
                        <div className="relative p-4 rounded-lg bg-black/30 border border-purple-400/20 flex flex-col items-center justify-center h-[280px]">
                             <motion.div
                                className="absolute inset-0 opacity-50"
                                style={{ backgroundImage: `radial-gradient(circle at 50% 50%, hsl(283 100% 55% / 0.2), transparent 70%)` }}
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <p className="font-bold text-lg text-white">Detectar Idioma</p>
                        </div>
                    </div>
                    {/* To Language */}
                    <div className="space-y-4 text-center flex flex-col">
                        <Label className="font-semibold text-sm text-purple-200">Traducir a</Label>
                         <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-purple-300/70" />
                                <Input
                                    type="text"
                                    placeholder="Buscar idioma..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-10 bg-black/50 border-purple-400/50 text-white placeholder:text-purple-200/50 pl-10"
                                />
                            </div>
                             <Button variant="outline" size="icon" className="h-10 w-10 text-purple-300 hover:text-white bg-black/50 border-purple-400/50 hover:bg-purple-500/20" onClick={() => handleLanguageClick('up')} disabled={activeIndex === 0}><ChevronUp/></Button>
                            <Button variant="outline" size="icon" className="h-10 w-10 text-purple-300 hover:text-white bg-black/50 border-purple-400/50 hover:bg-purple-500/20" onClick={() => handleLanguageClick('down')} disabled={activeIndex === filteredLanguages.length - 1}><ChevronDown/></Button>
                        </div>
                        <div className="relative h-[280px] rounded-lg bg-black/30 border border-purple-400/20 flex flex-col items-center justify-center overflow-hidden">
                           <div className="absolute top-1/2 left-0 w-full h-12 -translate-y-1/2 bg-purple-500/20 border-y-2 border-purple-400 rounded-lg" style={{ filter: 'blur(5px)' }}/>
                            <div 
                                className="w-full transition-transform duration-300 ease-in-out" 
                                style={{ transform: `translateY(calc(50% - ${activeIndex * 3}rem + 1.5rem))`}}
                            >
                                {filteredLanguages.map((lang, index) => (
                                    <div
                                        key={lang.code}
                                        className={cn(
                                            "w-full text-center text-lg p-2 transition-all duration-300 h-12 flex items-center justify-center cursor-pointer"
                                        )}
                                        onClick={() => setTargetLanguage(lang.code)}
                                    >
                                        <span className={cn(
                                            "transition-all duration-300",
                                            activeIndex === index ? "font-bold scale-100 text-white" : "text-purple-200/50 scale-90"
                                        )}>
                                            {lang.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
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
