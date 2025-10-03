
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X } from 'lucide-react';
import { type Email } from './email-list-item';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BimiVmcStatusModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  email: Email | null;
  senderEmail: string;
}

export function BimiVmcStatusModal({ isOpen, onOpenChange, email, senderEmail }: BimiVmcStatusModalProps) {
    if (!email) return null;

    const senderInitial = email.from.charAt(0).toUpperCase();

    const StatusIndicator = ({ status, title, description, resultText }: { status: boolean, title: string, description: string, resultText: string }) => (
        <motion.div 
            className="p-4 rounded-lg bg-black/30 border border-cyan-400/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-start gap-4">
                <div className={cn(
                    "flex-shrink-0 size-12 rounded-full flex items-center justify-center border-2",
                    status ? "border-green-500/50 bg-green-900/40" : "border-red-500/50 bg-red-900/40"
                )}>
                    {status ? <Check className="size-7 text-green-400" /> : <X className="size-7 text-red-400" />}
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-lg text-white">{title}</h4>
                    <p className="text-sm text-cyan-200/70 mt-1">{description}</p>
                </div>
            </div>
            <div className={cn(
                "mt-3 text-sm font-semibold pl-16",
                status ? "text-green-300" : "text-red-300"
            )}>
               <span className="font-bold">Resultado:</span> {resultText}
            </div>
        </motion.div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full flex p-0 gap-0 bg-zinc-900/90 backdrop-blur-xl border border-cyan-400/20 text-white overflow-hidden" showCloseButton={false}>
                 <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute h-full w-full bg-[radial-gradient(#00ADEC_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
                </div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full animate-pulse-slow filter blur-3xl -translate-x-1/2 -translate-y-1/2"/>
                
                {/* Left Panel */}
                <div className="w-1/3 flex flex-col items-center justify-center p-8 border-r border-cyan-400/20 bg-black/20">
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
                        className="text-center"
                    >
                        <Avatar className="size-40 border-4 border-cyan-400/30 shadow-[0_0_30px_#00ADEC]">
                            <AvatarImage src={email.avatarUrl} alt={email.from}/>
                            <AvatarFallback className="text-6xl font-bold bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
                            {senderInitial}
                            </AvatarFallback>
                        </Avatar>
                        <DialogTitle className="text-3xl font-bold mt-6 text-white">{email.from}</DialogTitle>
                        <DialogDescription className="font-mono text-base text-cyan-300/80 mt-1">{senderEmail}</DialogDescription>
                    </motion.div>
                </div>
                
                {/* Right Panel */}
                <div className="w-2/3 flex flex-col p-8">
                     <DialogHeader className="z-10 text-left mb-6">
                         <h2 className="text-2xl font-bold text-cyan-300">Análisis de Autenticidad de Marca</h2>
                    </DialogHeader>
                    <div className="flex-1 space-y-6">
                        <StatusIndicator 
                            status={!!email.bimi}
                            title="Verificación BIMI"
                            description="BIMI (Brand Indicators for Message Identification) permite mostrar tu logo verificado, aumentando la confianza y el reconocimiento de marca."
                            resultText={email.bimi ? "Este remitente ha verificado su identidad de marca, por lo que puedes confiar en su logotipo." : "El remitente no ha configurado BIMI. Su logotipo no está verificado."}
                        />
                        <StatusIndicator 
                            status={!!email.vmc}
                            title="Certificado VMC"
                            description="VMC (Verified Mark Certificate) es un certificado digital que prueba legalmente que el logo pertenece a la marca. Es un requisito para que el logo se muestre en proveedores como Gmail."
                            resultText={email.vmc ? "Este logo ha sido validado con un certificado VMC, ofreciendo la máxima garantía de autenticidad." : "El remitente no tiene un VMC, por lo que su logo podría no mostrarse en todas las bandejas de entrada."}
                        />
                    </div>
                     <DialogFooter className="z-10 pt-6">
                        <Button 
                            onClick={() => onOpenChange(false)}
                            className="w-full bg-cyan-800/80 text-cyan-100 hover:bg-cyan-700 border border-cyan-600/50"
                        >
                            Entendido
                        </Button>
                    </DialogFooter>
                </div>

            </DialogContent>
        </Dialog>
    );
}
