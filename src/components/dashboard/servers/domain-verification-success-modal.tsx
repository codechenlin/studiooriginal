
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, MailPlus, CheckCircle, XCircle, Bot, ShieldCheck, Globe, Dna, GitBranch, MailWarning, Languages, Shield, Eye } from 'lucide-react';
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

const FeatureCard = ({ icon: Icon, title, description, enabled }: { icon: React.ElementType, title: string, description: string, enabled: boolean }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
            "relative p-3 rounded-lg bg-black/20 border transition-all overflow-hidden",
            enabled ? "border-green-500/30" : "border-red-500/30"
        )}
    >
        <div className="flex items-center gap-3">
             <div className={cn(
                "relative p-2 rounded-md shrink-0",
                enabled ? "bg-green-900/40" : "bg-red-900/40"
             )}>
                <div className="absolute inset-0 rounded-md feature-icon-glow" style={{'--glow-color': enabled ? '#00CB07' : '#F00000'} as React.CSSProperties}/>
                <div className="absolute inset-0 rounded-md feature-icon-pulse" style={{'--glow-color': enabled ? '#00CB07' : '#F00000'} as React.CSSProperties}/>
                <Icon className={cn("relative z-10 size-5", enabled ? "text-green-300" : "text-red-300")}/>
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
          <style>{`
             @keyframes feature-glow {
                0%, 100% { box-shadow: 0 0 5px -1px var(--glow-color); }
                50% { box-shadow: 0 0 12px 2px var(--glow-color); }
            }
            .feature-icon-glow { animation: feature-glow 3s infinite ease-in-out; }
            @keyframes feature-pulse {
                0% { transform: scale(0.8); opacity: 0; }
                50% { opacity: 0.7; }
                100% { transform: scale(1.5); opacity: 0; }
            }
            .feature-icon-pulse {
                position: absolute;
                inset: 0;
                border-radius: inherit;
                border: 1px solid var(--glow-color);
                animation: feature-pulse 2.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
            }
        `}</style>
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
                         <motion.div
                          className="absolute inset-0 rounded-full border-2 border-dashed"
                          style={{ borderColor: '#1700E6' }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                        />
                         <motion.div
                          className="absolute inset-4 rounded-full border-2 border-dashed"
                          style={{ borderColor: '#009AFF' }}
                          animate={{ rotate: -360 }}
                          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                        />
                        <motion.div
                             className="absolute inset-0 z-0 rounded-full"
                            style={{
                                boxShadow: `0 0 0px #E18700`,
                                filter: `blur(15px)`,
                                background: `#E18700`
                            }}
                            animate={{
                                transform: ['scale(0.3)', 'scale(0.5)', 'scale(0.3)'],
                                opacity: [0, 0.4, 0]
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
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
                        className="w-full h-11 font-bold text-base text-white transition-all duration-300"
                        style={{
                           backgroundColor: '#B96F00',
                           border: '2px solid #E18700'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; e.currentTarget.style.borderColor = '#E5E5E5'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#B96F00'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#E18700'; }}
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
                         ¡Correcto! Con tu registro MX apuntando a nuestro servidores, tu dominio no solo enviará correos, sino que también tu buzón de entrada ahora está protegido por nuestro Escudo <strong className="text-white font-bold">Neuronal Defensiva</strong>.
                       </p>
                        <FeatureCard icon={ShieldCheck} title="Antivirus con blindaje cognitivo" description="Neutraliza amenazas antes de que lleguen a tu percepción." enabled={true} />
                        <FeatureCard icon={Bot} title="Filtro de Spam con IA Predictiva" description="Nuestro sistema aprende y se anticipa, manteniendo tu enfoque despejado." enabled={true} />
                        <FeatureCard icon={Dna} title="Análisis Neuronal de Contenido" description="La IA escanea cada byte en busca de anomalías, asegurando una comunicación pura." enabled={true} />
                        <FeatureCard icon={Languages} title="Traductor de Correos Electrónicos" description="Traduce tus correos electrónicos entrantes a tu idioma" enabled={true} />
                        <FeatureCard icon={Eye} title="Escudo de Privacidad Analítica" description="Bloquea rastreadores ocultos y protégete de la analíticas de terceros." enabled={true} />
                    </div>
                 ) : (
                    <div className="space-y-3">
                        <p className="text-xs text-amber-200/80">
                           Has encendido los motores de red, ya puedes enviar correos. Sin embargo, tu (Registro MX) no está orientado hacia nuestra base. Esto significa que solo podrás transmitir, pero no recibir comunicaciones entrantes a través de nuestra plataforma.
                        </p>
                         <FeatureCard icon={ShieldCheck} title="Antivirus con blindaje cognitivo" description="Recepción de correos desactivada." enabled={false} />
                         <FeatureCard icon={Bot} title="Filtro de Spam con IA Predictiva" description="Recepción de correos desactivada." enabled={false} />
                         <FeatureCard icon={Dna} title="Análisis Neuronal de Contenido" description="Recepción de correos desactivada." enabled={false} />
                         <FeatureCard icon={Languages} title="Traductor de Correos Electrónicos" description="Recepción de correos desactivada." enabled={false} />
                        <FeatureCard icon={Eye} title="Escudo de Privacidad Analítica" description="Recepción de correos desactivada." enabled={false} />
                         <p className="text-xs text-amber-300/80 p-3 bg-amber-500/10 rounded-lg border border-amber-400/20">
                            <strong>Recomendación:</strong> Configura tu registro MX para desbloquear todo el potencial defensivo y de comunicación de daybuu.
                        </p>
                    </div>
                 )}
                 <div className="mt-auto pt-4">
                    <Separator className="bg-green-500/20 mb-3"/>
                    <p className="text-xs text-muted-foreground font-bold text-white">
                        Recuerda mantener el registro TXT de verificación en tu DNS para que tu dominio permanezca activo.
                    </p>
                 </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
