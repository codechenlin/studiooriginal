
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, BrainCircuit, Check, X, Disc, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'Inglés' },
    { code: 'fr', name: 'Francés' },
    { code: 'de', name: 'Alemán' },
    { code: 'pt', name: 'Portugués' },
    { code: 'it', name: 'Italiano' },
    { code: 'ru', name: 'Ruso' },
    { code: 'zh', name: 'Chino (Simplificado)' },
    { code: 'ja', name: 'Japonés' },
];

export function TranslationConfigModal({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
    const [detectedLanguage, setDetectedLanguage] = useState('Inglés (Detectado)');
    const [targetLanguage, setTargetLanguage] = useState('es');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate saving
        setTimeout(() => {
            setIsSaving(false);
            onOpenChange(false);
        }, 1500);
    }

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
                        <div className="relative p-4 rounded-lg bg-black/30 border border-purple-400/20 flex flex-col items-center justify-center h-28">
                             <motion.div
                                className="absolute inset-0 opacity-50"
                                style={{
                                    backgroundImage: `radial-gradient(circle at 50% 50%, hsl(283 100% 55% / 0.2), transparent 70%)`
                                }}
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <p className="font-bold text-lg text-white">{detectedLanguage}</p>
                            <p className="text-xs text-purple-300/80">Detectado por IA</p>
                        </div>
                    </div>
                    {/* To Language */}
                    <div className="space-y-2 text-center">
                        <Label htmlFor="target-lang" className="font-semibold text-sm text-purple-200">Traducir a</Label>
                        <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                            <SelectTrigger id="target-lang" className="h-28 text-lg bg-black/30 border-purple-400/30">
                                <SelectValue placeholder="Seleccionar idioma..." />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map((lang) => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                        <div className="flex items-center justify-between w-full">
                                            <span>{lang.name}</span>
                                            {targetLanguage === lang.code && (
                                                <div className="relative flex items-center justify-center size-4">
                                                    <div className="absolute inset-0 rounded-full bg-[#00CB07] shadow-[0_0_8px_#00CB07] animate-pulse"/>
                                                    <Disc className="size-2 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
