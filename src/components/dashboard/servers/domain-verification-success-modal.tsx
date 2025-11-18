
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, MailPlus, CheckCircle, XCircle, Bot, ShieldCheck, Globe, Dna, GitBranch, MailWarning } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface DomainVerificationSuccessModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  domain: string;
  dnsStatus: {
    spf?: boolean;
    dkim?: boolean;
    dmarc?: boolean;
    mx?: boolean;
    bimi?: boolean;
    vmc?: boolean;
  }
}

const FeatureCard = ({ icon: Icon, title, description, color, delay, enabled }: { icon: React.ElementType, title: string, description: string, color: string, delay: number, enabled: boolean }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay, duration: 0.5 }}
        className={cn(
            "p-3 rounded-lg bg-black/20 border transition-all",
            enabled ? "border-green-500/30" : "border-red-500/30"
        )}
    >
        <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-md", enabled ? "bg-green-900/40" : "bg-red-900/40")}>
                <Icon className={cn("size-5", enabled ? "text-green-300" : "text-red-300")}/>
            </div>
            <div>
                <h4 className={cn("font-semibold text-sm", enabled ? "text-white" : "text-white/70 line-through")}>{title}</h4>
                <p className="text-xs text-white/60">{description}</p>
            </div>
        </div>
    </motion.div>
);

const RecordStatus = ({ label, icon: Icon, verified, description }: { label: string, icon: React.ElementType, verified: boolean, description: string }) => (
    <div className="relative p-2 pl-3 border-l-2" style={{ borderColor: verified ? '#00CB07' : '#F00000' }}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Icon className={cn("size-4", verified ? "text-green-400" : "text-red-400")} />
                <span className="font-semibold text-sm">{label}</span>
            </div>
            {verified ? 
                <CheckCircle className="size-5 text-green-400" style={{ filter: 'drop-shadow(0 0 4px #00CB07)'}}/> : 
                <XCircle className="size-5 text-red-400" style={{ filter: 'drop-shadow(0 0 4px #F00000)'}}/>
            }
        </div>
        <p className="text-xs text-muted-foreground mt-1 pl-6">{description}</p>
    </div>
);

export function DomainVerificationSuccessModal({ isOpen, onOpenChange, domain, dnsStatus }: DomainVerificationSuccessModalProps) {

  const truncateDomain = (name: string, maxLength: number = 20): string => {
    if (name.length <= maxLength) {
        return name;
    }
    return `${name.substring(0, maxLength)}...`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-7xl w-full h-[99vh] bg-black/80 backdrop-blur-xl border-2 border-green-500/20 text-white overflow-hidden p-0">
         <div className="absolute inset-0 z-0 opacity-10 bg-grid-green-500/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
         <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-green-500/10 rounded-full animate-pulse-slow filter blur-3xl -translate-x-1/2 -translate-y-1/2"/>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-green-500/20 h-full">
            {/* Column 1: DNS Status */}
            <div className="p-6 flex flex-col z-10">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{color: '#009AFF'}}><Dna style={{color: '#009AFF'}}/>Resumen de Verificación DNS</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-white mb-2 text-sm">Registros Obligatorios</h4>
                        <div className="space-y-2 p-3 bg-black/20 border border-cyan-400/10 rounded-lg">
                           <RecordStatus label="Registro TXT" icon={CheckCircle} verified={true} description="Verificación de propiedad del dominio."/>
                           <RecordStatus label="Registro SPF" icon={CheckCircle} verified={dnsStatus.spf ?? false} description="Autorización de servidores de envío."/>
                           <RecordStatus label="Registro DKIM" icon={CheckCircle} verified={dnsStatus.dkim ?? false} description="Firma digital para autenticidad."/>
                           <RecordStatus label="Registro DMARC" icon={CheckCircle} verified={dnsStatus.dmarc ?? false} description="Política de protección y reporte."/>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-2 text-sm">Registros Opcionales</h4>
                         <div className="space-y-2 p-3 bg-black/20 border border-cyan-400/10 rounded-lg">
                           <RecordStatus label="Registro MX" icon={dnsStatus.mx ? CheckCircle : MailWarning} verified={!!dnsStatus.mx} description="Requerido para recibir correos."/>
                           <RecordStatus label="Registro BIMI" icon={dnsStatus.bimi ? CheckCircle : GitBranch} verified={!!dnsStatus.bimi} description="Muestra tu logo en los buzones."/>
                           <RecordStatus label="Certificado VMC" icon={dnsStatus.vmc ? CheckCircle : GitBranch} verified={!!dnsStatus.vmc} description="Verifica tu logo como marca registrada."/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Column 2: Success Message */}
             <div className="p-6 flex flex-col items-center text-center z-10 justify-between">
                <div></div>
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 15 }}
                    className="relative flex flex-col items-center"
                >
                    <div className="relative w-64 h-64 mb-4 group">
                        <motion.svg 
                            className="absolute inset-0 w-full h-full" 
                            viewBox="0 0 100 100"
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                        >
                            <circle cx="50" cy="50" r="48" stroke="#1700E6" strokeWidth="0.5" fill="none" strokeDasharray="2 8"/>
                        </motion.svg>
                        <motion.svg 
                            className="absolute inset-0 w-full h-full"
                            viewBox="0 0 100 100"
                            initial={{ rotate: 360 }}
                            animate={{ rotate: 0 }}
                            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                        >
                            <circle cx="50" cy="50" r="40" stroke="#009AFF" strokeWidth="0.5" fill="none" strokeDasharray="6 3"/>
                        </motion.svg>
                        
                         <motion.div
                             className="absolute inset-0 z-0"
                            style={{
                                backgroundImage: `radial-gradient(circle, transparent 60%, #E1870066)`,
                            }}
                            animate={{
                                transform: ['scale(0.8)', 'scale(1.2)', 'scale(0.8)'],
                                opacity: [0.5, 0.8, 0.5]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        />

                         <div className="absolute inset-0 flex items-center justify-center">
                            <ShieldCheck className="size-32 text-green-400" style={{ filter: 'drop-shadow(0 0 25px #00ff6a)' }}/>
                         </div>
                    </div>
                    
                    <DialogHeader className="text-center">
                        <DialogTitle className="text-2xl font-bold text-center">¡Dominio Verificado!</DialogTitle>
                        <DialogDescription className="text-sm text-green-200/80 mt-2 text-center">
                            El dominio <span className="font-bold text-white">{truncateDomain(domain)}</span> está listo para despegar.
                        </DialogDescription>
                    </DialogHeader>

                    <p className="text-xs text-white/70 mt-2">
                        Ahora puedes configurar direcciones de correo SMTP y comenzar a enviar campañas con la máxima confianza y entregabilidad.
                    </p>
                </motion.div>
                
                 <div className="w-full mt-6">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="w-full h-11 font-bold text-base transition-all duration-300"
                        style={{
                           backgroundColor: '#B96F00',
                           color: 'white',
                           border: '2px solid #E18700'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#B96F00'; e.currentTarget.style.color = 'white';}}
                      >
                        <Check className="mr-2"/>
                        Aceptar y Continuar
                      </Button>
                </div>
            </div>

            {/* Column 3: Unlocked Features */}
            <div className="p-6 flex flex-col z-10 bg-black/20">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{color: '#009AFF'}}><Bot style={{color: '#009AFF'}}/>Capacidades Desbloqueadas</h3>
                 {dnsStatus.mx ? (
                    <div className="space-y-3">
                       <p className="text-xs text-green-200/80">
                         ¡Correcto! Con tu registro MX apuntando a nuestro servidores, tu dominio no solo enviará correos, sino que también tu buzón de entrada ahora está protegido por nuestro Escudo Neuronal Predictivo.
                       </p>
                        <FeatureCard icon={ShieldCheck} title="Antivirus con blindaje cognitivo" description="Neutraliza amenazas antes de que lleguen a tu percepción." color="#00CB07" delay={0.8} enabled={true} />
                        <FeatureCard icon={Bot} title="Filtro de Spam con IA Predictiva" description="Nuestro sistema aprende y se anticipa, manteniendo tu enfoque despejado." color="#00CB07" delay={0.9} enabled={true} />
                        <FeatureCard icon={Dna} title="Análisis Neuronal de Contenido" description="La IA escanea cada byte en busca de anomalías, asegurando una comunicación pura." color="#00CB07" delay={1.0} enabled={true} />
                    </div>
                 ) : (
                    <div className="space-y-3">
                        <p className="text-xs text-amber-200/80">
                           Has encendido los motores de red, ya puedes enviar correos. Sin embargo, tu (Registro MX) no está orientado hacia nuestra base. Esto significa que solo podrás transmitir, pero no recibir comunicaciones entrantes a través de nuestra plataforma.
                        </p>
                         <FeatureCard icon={ShieldCheck} title="Antivirus con blindaje cognitivo" description="Recepción de correos desactivada." color="#F00000" delay={0.8} enabled={false} />
                         <FeatureCard icon={Bot} title="Filtro de Spam con IA Predictiva" description="Recepción de correos desactivada." color="#F00000" delay={0.9} enabled={false} />
                         <FeatureCard icon={Dna} title="Análisis Neuronal de Contenido" description="Recepción de correos desactivada." color="#F00000" delay={1.0} enabled={false} />
                         <p className="text-xs text-amber-300/80 p-3 bg-amber-500/10 rounded-lg border border-amber-400/20">
                            <strong>Recomendación:</strong> Configura tu registro MX para desbloquear todo el potencial defensivo y de comunicación de daybuu.
                        </p>
                    </div>
                 )}
                 <div className="mt-auto pt-4">
                    <Separator className="bg-green-500/20 mb-3"/>
                    <p className="text-xs text-muted-foreground">
                        Recuerda mantener el registro TXT de verificación en tu DNS para que tu dominio permanezca activo.
                    </p>
                 </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
