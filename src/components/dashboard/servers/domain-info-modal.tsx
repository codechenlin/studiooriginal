
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe, Mail, ChevronRight, X, CheckCircle, GitBranch, Dna, Copy, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type Domain } from './types';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface DomainInfoModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  domain: Domain | null;
}

const StatusHeader = ({ title, lastUpdated }: { title: string, lastUpdated?: string | null }) => (
    <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-cyan-300/80">{title}</h4>
        {lastUpdated ? (
             <div className="flex items-center gap-1.5 text-xs text-white/50">
                <Clock className="size-3"/>
                <span>Últ. comprobación: {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true, locale: es })}</span>
             </div>
        ) : (
             <div className="flex items-center gap-1.5 text-xs text-amber-400/70">
                <Clock className="size-3"/>
                <span>Aún no verificado</span>
             </div>
        )}
    </div>
);


const RecordRow = ({ label, icon: Icon }: { label: string, icon: React.ElementType }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-cyan-400/20">
        <div className="flex items-center gap-3">
            <CheckCircle className="size-5 text-green-400" />
            <span className="font-semibold">{label}</span>
        </div>
        <Button size="sm" variant="outline" className="text-xs h-7 border-cyan-400/50 text-cyan-300 bg-cyan-900/20 hover:bg-cyan-900/40 hover:text-cyan-200">
            <Icon className="mr-2 size-3" />
            Instrucciones
        </Button>
    </div>
);

export function DomainInfoModal({ isOpen, onOpenChange, domain }: DomainInfoModalProps) {
    const { toast } = useToast();

    if (!domain) return null;

    const truncateDomain = (name: string, maxLength: number = 21): string => {
        if (name.length <= maxLength) {
            return name;
        }
        return `${name.substring(0, maxLength)}...`;
    };
    
    const handleCopy = (textToCopy: string) => {
        navigator.clipboard.writeText(textToCopy);
        toast({
            title: "¡Copiado!",
            description: "El registro de verificación ha sido copiado al portapapeles.",
            className: 'bg-success-login border-none text-white'
        });
    }

    const lastCheckDate = domain.dns_checks?.updated_at;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-4xl w-full h-[99vh] flex flex-col p-0 gap-0 bg-black/80 backdrop-blur-xl border border-cyan-400/20 text-white overflow-hidden">
                 <style>{`
                    .info-grid {
                        background-image:
                            linear-gradient(to right, hsl(190 100% 50% / 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, hsl(190 100% 50% / 0.1) 1px, transparent 1px);
                        background-size: 2rem 2rem;
                    }
                    .scan-line-info {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 3px;
                        background: radial-gradient(ellipse 50% 100% at 50% 0%, hsl(190 100% 50% / 0.5), transparent 80%);
                        animation: scan-info 5s infinite linear;
                    }
                    @keyframes scan-info {
                        0% { transform: translateY(-10px); }
                        100% { transform: translateY(100vh); }
                    }
                `}</style>

                <DialogHeader className="p-6 border-b border-cyan-400/20 z-10">
                    <DialogTitle className="flex items-center gap-3 text-xl text-cyan-300">
                        <Globe className="size-6" />
                        Información del Dominio
                    </DialogTitle>
                    <DialogDescription className="text-cyan-200/70">
                        Detalles y registros de tu dominio verificado.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
                    {/* Left Column */}
                    <div className="p-8 flex flex-col items-center justify-center text-center border-r border-cyan-400/20 relative overflow-hidden info-grid">
                        <div className="scan-line-info" />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="z-10 flex flex-col items-center"
                        >
                            <div className="p-4 bg-cyan-500/10 rounded-full border-2 border-cyan-400/30 inline-block">
                                <CheckCircle className="size-16 text-cyan-300" style={{ filter: 'drop-shadow(0 0 10px #00ADEC)' }} />
                            </div>
                            <h2 className="text-2xl font-bold mt-4 font-mono">{truncateDomain(domain.domain_name)}</h2>
                            <p className="text-sm text-cyan-200/80">Verificado el: {format(new Date(domain.updated_at), "d 'de' MMMM, yyyy", { locale: es })}</p>
                            
                            <Button variant="outline" className="text-white border-cyan-400/50 hover:bg-[#00ADEC] hover:border-[#00ADEC] hover:text-white mt-8" onClick={() => onOpenChange(false)}>
                                <X className="mr-2"/> Cerrar
                            </Button>

                            {domain.verification_code && (
                               <div className="w-full text-left mt-6">
                                    <h4 className="text-sm font-bold text-cyan-300/80 mb-2">
                                        Registro de Verificación <span className="text-white/50 font-normal">| Tipo de registro: TXT</span>
                                    </h4>
                                    <div className="p-3 bg-black/30 rounded-lg border border-cyan-400/20 font-mono text-xs text-white/80">
                                        <div className="flex justify-between items-center">
                                            <span className="break-all pr-2">{domain.verification_code}</span>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="size-7 shrink-0 text-cyan-300 hover:bg-cyan-500/20 hover:text-white"
                                                onClick={() => handleCopy(domain.verification_code || '')}
                                            >
                                                <Copy className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                    {/* Right Column */}
                    <div className="p-8 flex flex-col z-10">
                        <div className="space-y-3">
                           <StatusHeader title="Obligatorios" lastUpdated={lastCheckDate} />
                            <RecordRow label="SPF" icon={Dna} />
                            <RecordRow label="DKIM" icon={Dna} />
                            <RecordRow label="DMARC" icon={Dna} />
                        </div>
                        <div className="space-y-3 mt-6">
                           <StatusHeader title="Opcionales" lastUpdated={lastCheckDate} />
                            <RecordRow label="MX" icon={Mail} />
                            <RecordRow label="BIMI" icon={GitBranch} />
                            <RecordRow label="VMC" icon={GitBranch} />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
