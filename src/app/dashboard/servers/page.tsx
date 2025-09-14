
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Server, Zap, ChevronRight, Mail, Code, Bot } from "lucide-react";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { SmtpConnectionModal } from '@/components/dashboard/servers/smtp-connection-modal';

const providers = [
  {
    id: 'smtp',
    name: 'SMTP Genérico',
    description: 'Conéctate a cualquier servidor de correo usando credenciales SMTP.',
    icon: Mail,
    connected: false,
    colors: 'from-cyan-500/10 to-blue-500/10',
    borderColor: 'hover:border-cyan-400'
  },
  {
    id: 'blastengine',
    name: 'Blastengine',
    description: 'Integra el potente servicio de envío de correo de Blastengine.',
    icon: Zap,
    connected: false,
    colors: 'from-purple-500/10 to-indigo-500/10',
    borderColor: 'hover:border-purple-400'
  },
  {
    id: 'sparkpost',
    name: 'SparkPost',
    description: 'Utiliza la plataforma de entrega de correo de SparkPost.',
    icon: Code,
    connected: false,
    colors: 'from-orange-500/10 to-amber-500/10',
    borderColor: 'hover:border-orange-400'
  },
  {
    id: 'elasticemail',
    name: 'Elastic Email',
    description: 'Conecta con Elastic Email para envíos masivos y marketing.',
    icon: Bot,
    connected: false,
    colors: 'from-green-500/10 to-emerald-500/10',
    borderColor: 'hover:border-green-400'
  },
];

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

const Particle = () => {
    const style = {
      '--size': `${Math.random() * 1.5 + 0.5}px`,
      '--x-start': `${Math.random() * 100}%`,
      '--x-end': `${Math.random() * 200 - 50}%`,
      '--y-start': `${Math.random() * 100}%`,
      '--y-end': `${Math.random() * 200 - 50}%`,
      '--duration': `${Math.random() * 4 + 3}s`,
      '--delay': `-${Math.random() * 7}s`,
    } as React.CSSProperties;
    return <div className="particle" style={style} />;
};


export default function ServersPage() {
  const [isClient, setIsClient] = useState(false);
  const [isSmtpModalOpen, setIsSmtpModalOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleConnectClick = (providerId: string) => {
    if (providerId === 'smtp') {
      setIsSmtpModalOpen(true);
    }
    // Handle other providers later
  };

  return (
    <>
    <SmtpConnectionModal isOpen={isSmtpModalOpen} onOpenChange={setIsSmtpModalOpen} />
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background relative overflow-hidden">
       <style>{`
        @keyframes particle-move {
          0% { transform: translate(var(--x-start), var(--y-start)); opacity: 1; }
          100% { transform: translate(var(--x-end), var(--y-end)); opacity: 0; }
        }
        .particle {
          position: absolute;
          width: var(--size);
          height: var(--size);
          background: hsl(var(--primary) / 0.5);
          border-radius: 50%;
          animation: particle-move var(--duration) var(--delay) linear infinite;
          will-change: transform, opacity;
        }
         @keyframes scanner {
          0%, 100% {
            transform: translateX(-100%) skewX(-15deg);
          }
          50% {
            transform: translateX(100%) skewX(-15deg);
          }
        }
      `}</style>
      
      <div className="absolute inset-0 z-0 opacity-20 dark:opacity-30 pointer-events-none">
          {isClient && Array.from({ length: 50 }).map((_, i) => <Particle key={i} />)}
      </div>
      
      <div className="relative z-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground flex items-center gap-2">
          <Server className="size-8"/>
          Servidores y Proveedores
        </h1>
        <p className="text-muted-foreground mt-1">Conecta tus servicios de envío de correo para empezar a crear campañas.</p>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 md:gap-8">
        {providers.map((provider, i) => (
          <motion.div
            key={provider.id}
            custom={i}
            variants={cardVariants}
            initial="initial"
            animate="animate"
          >
            <div className={cn(
              "group relative flex flex-col h-full rounded-xl border border-border/20 bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300",
              provider.borderColor,
              "hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
            )}>
              <div className={cn("absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br", provider.colors)} />
              
              <div className="flex-1 p-6 z-10">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                       <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                           <provider.icon className="size-8 text-primary"/>
                       </div>
                        <div>
                           <h2 className="text-xl font-bold text-foreground">{provider.name}</h2>
                           <div className="mt-1">
                             {provider.connected ? (
                               <span className="text-xs font-semibold text-green-400 px-2 py-1 bg-green-500/10 rounded-full">Conectado</span>
                             ) : (
                               <span className="text-xs font-semibold text-amber-400 px-2 py-1 bg-amber-500/10 rounded-full">Desconectado</span>
                             )}
                           </div>
                        </div>
                    </div>
                </div>
                <p className="text-muted-foreground mt-4 text-sm">{provider.description}</p>
              </div>

              <div className="p-6 pt-0 z-10 mt-auto">
                 <Button 
                    onClick={() => handleConnectClick(provider.id)}
                    className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-95 transition-opacity"
                  >
                    <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover/btn:opacity-100 group-hover/btn:animate-[scanner_5s_ease-in-out_infinite]" />
                    <span className="relative flex items-center gap-2">
                      Conectar Ahora <ChevronRight className="size-4" />
                    </span>
                 </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
    </>
  );
}

