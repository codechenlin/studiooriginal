
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bot, Loader2, Dna, Terminal, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DnsAnalysisModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  domain: string | null;
}

const mockAnalysis = `
✅ **SPF:** ¡Excelente! Tu registro SPF está correctamente configurado para autorizar nuestros servidores.

❌ **DKIM:** ¡Atención! No pudimos encontrar una firma DKIM válida. Esto puede causar que tus correos sean marcados como spam.
   - **Solución:** Asegúrate de haber copiado y pegado la clave DKIM generada en un registro TXT para \`daybuu._domainkey.${"my-other-domain.com"}\`.

❌ **DMARC:** ¡Peligro! No se encontró un registro DMARC. Sin él, no tienes control sobre los correos fraudulentos que usan tu dominio.
   - **Solución:** Crea un registro TXT para \`_dmarc.${"my-other-domain.com"}\` con la política \`p=reject\` para máxima protección.
`;

export function DnsAnalysisModal({ isOpen, onOpenChange, domain }: DnsAnalysisModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [analysisResult, setAnalysisResult] = useState("");

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                setAnalysisResult(mockAnalysis.replace(/my-other-domain.com/g, domain || 'tu-dominio.com'));
                setIsLoading(false);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, domain]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-zinc-900/90 backdrop-blur-xl border border-purple-500/30 text-white overflow-hidden" showCloseButton={false}>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 animate-pulse" />
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <Bot className="text-purple-400" />
                        Análisis de IA para: <span className="font-mono text-purple-300">{domain}</span>
                    </DialogTitle>
                    <DialogDescription className="text-purple-200/70">
                        Nuestra inteligencia artificial ha examinado tus registros DNS y ha generado el siguiente diagnóstico.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 min-h-[300px] flex items-center justify-center">
                    {isLoading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-4 text-center"
                        >
                            <div className="relative">
                                <Dna className="text-purple-400/50 size-20" />
                                <Loader2 className="absolute inset-0 m-auto text-white size-8 animate-spin" />
                            </div>
                            <p className="font-semibold text-lg">Analizando Estructura DNS...</p>
                            <p className="text-sm text-muted-foreground">La IA está procesando los datos de tu dominio.</p>
                        </motion.div>
                    ) : (
                         <ScrollArea className="max-h-[50vh] w-full">
                            <div className="p-4 rounded-lg bg-black/30 border border-purple-500/20 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                <div className="flex items-center gap-2 text-purple-300/80 mb-3">
                                    <Terminal size={16}/>
                                    <span>Resultados del Análisis:</span>
                                </div>
                                {analysisResult.split('\n').map((line, index) => {
                                    const isTitle = line.startsWith('✅') || line.startsWith('❌');
                                    return (
                                        <p key={index} className={isTitle ? 'font-bold text-white' : 'pl-4'}>
                                            {line}
                                        </p>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2 text-sm text-green-300">
                        <div className="relative size-3 rounded-full bg-[#39FF14] led-pulse" style={{boxShadow: '0 0 8px #39FF14'}} />
                        <span>EN LÍNEA</span>
                    </div>
                    <Button onClick={() => onOpenChange(false)} className="bg-purple-800 hover:bg-purple-700 text-white">
                        Entendido
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

    