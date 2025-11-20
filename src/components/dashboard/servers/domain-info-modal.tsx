
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe, CheckCircle, Copy, X, Shield, AlertTriangle, GitBranch, MailWarning, Dna, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { type Domain } from './types';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DomainInfoModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  domain: Domain | null;
}

const RecordStatus = ({ label, icon: Icon, verified }: { label: string, icon: React.ElementType, verified: boolean }) => (
    <motion.div 
        className={cn(
            "relative p-3 border rounded-lg bg-black/30 overflow-hidden",
            verified ? "border-green-500/30" : "border-red-500/30"
        )}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
        <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
                <Icon className={cn("size-5", verified ? "text-green-400" : "text-red-400")} />
                <span className="font-semibold text-sm text-white/90">{label}</span>
                 <Button
                    variant="outline"
                    size="sm"
                    className="group/button relative h-6 px-2 text-xs bg-black/20 border-cyan-400/30 text-cyan-300 overflow-hidden"
                >
                    <div className="absolute inset-0 w-0 bg-cyan-400/20 transition-all duration-300 ease-out group-hover/button:w-full"></div>
                    <div className="relative flex items-center gap-1">
                        <Bot className="size-3" />
                        Detalles
                    </div>
                </Button>
            </div>
            <div className="relative flex items-center justify-center size-6">
                <div 
                    className={cn(
                        "absolute inset-0 rounded-full",
                        verified ? "bg-green-500/50" : "bg-red-500/50"
                    )} 
                    style={{ animation: `icon-pulse-glow 2s infinite ease-in-out` }}
                />
                 <div 
                    className={cn(
                        "absolute inset-0 rounded-full border-2",
                        verified ? "border-green-500/70" : "border-red-500/70"
                    )} 
                    style={{ animation: `icon-pulse-wave 2s infinite ease-out` }}
                />
                {verified ? <CheckCircle className={cn("relative size-6", "text-green-300")} /> : <AlertTriangle className={cn("relative size-6", "text-red-300")} />}
            </div>
        </div>
    </motion.div>
);


export function DomainInfoModal({ isOpen, onOpenChange, domain }: DomainInfoModalProps) {
    const { toast } = useToast();
    const [lastCheckedDate, setLastCheckedDate] = useState('Nunca');
    
    const dnsChecks = Array.isArray(domain?.dns_checks) ? domain?.dns_checks[0] : domain?.dns_checks;

    useEffect(() => {
        if (isOpen) {
            const calculateDate = () => {
                if (dnsChecks?.updated_at) {
                    setLastCheckedDate(formatDistanceToNow(new Date(dnsChecks.updated_at), { addSuffix: true, locale: es }));
                } else {
                    setLastCheckedDate('Nunca');
                }
            };
            calculateDate();
        }
    }, [isOpen, dnsChecks?.updated_at]);


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

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-4xl w-full h-[650px] flex flex-col p-0 gap-0 bg-black/80 backdrop-blur-xl border border-cyan-400/20 text-white overflow-hidden">
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
                    @keyframes icon-pulse-glow {
                        0%, 100% { filter: blur(4px); opacity: 0.7; }
                        50% { filter: blur(8px); opacity: 1; }
                    }
                    @keyframes icon-pulse-wave {
                        0% { transform: scale(0.8); opacity: 1; }
                        100% { transform: scale(2.5); opacity: 0; }
                    }
                `}</style>

                 <DialogHeader className="p-4 border-b border-cyan-400/20 bg-black/30 text-left z-10">
                    <DialogTitle className="flex items-center gap-3">
                         <div className="p-2 rounded-full bg-cyan-500/10 border-2 border-cyan-400/20">
                           <Globe className="text-cyan-300"/>
                        </div>
                        Información del Dominio
                    </DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
                    {/* Left Column */}
                    <div className="p-8 flex flex-col items-center justify-between text-center border-r border-cyan-400/20 relative overflow-hidden info-grid">
                        <div className="scan-line-info" />
                        <div/>
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
                            
                            {domain.verification_code && (
                               <div className="w-full text-left mt-6">
                                    <h4 className="text-sm font-bold text-cyan-300/80 mb-2">
                                        Registro de Verificación <span className="text-white/50 font-normal">| Tipo: TXT</span>
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
                         <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="w-full mt-8 bg-[#00ADEC] text-white z-10 border-white hover:bg-white hover:text-black"
                        >
                            <X className="mr-2"/>
                            Cerrar
                        </Button>
                    </div>
                    {/* Right Column */}
                    <div className="p-8 flex flex-col z-10 items-center justify-center bg-black/20">
                       <div className="w-full space-y-4">
                           <div>
                                <div className="flex justify-between items-baseline mb-2">
                                  <h4 className="font-semibold text-white text-sm flex items-center gap-2"><Dna style={{color: '#00ADEC'}}/>Registros Obligatorios</h4>
                                  <p className="text-xs text-muted-foreground">Revisado: {lastCheckedDate}</p>
                                </div>
                                <div className="space-y-2">
                                   <RecordStatus label="Registro SPF" icon={Shield} verified={dnsChecks?.spf_verified ?? false} />
                                   <RecordStatus label="Registro DKIM" icon={Shield} verified={dnsChecks?.dkim_verified ?? false} />
                                   <RecordStatus label="Registro DMARC" icon={Shield} verified={dnsChecks?.dmarc_verified ?? false} />
                                </div>
                            </div>
                            <div>
                               <div className="flex justify-between items-baseline mb-2">
                                  <h4 className="font-semibold text-white text-sm flex items-center gap-2"><Dna style={{color: '#00ADEC'}}/>Registros Opcionales</h4>
                                  <p className="text-xs text-muted-foreground">Revisado: {lastCheckedDate}</p>
                                </div>
                                 <div className="space-y-2">
                                   <RecordStatus label="Registro MX" icon={MailWarning} verified={dnsChecks?.mx_verified ?? false}/>
                                   <RecordStatus label="Registro BIMI" icon={GitBranch} verified={dnsChecks?.bimi_verified ?? false}/>
                                   <RecordStatus label="Certificado VMC" icon={GitBranch} verified={dnsChecks?.vmc_verified ?? false}/>
                                </div>
                            </div>
                       </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
