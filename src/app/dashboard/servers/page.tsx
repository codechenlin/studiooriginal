
"use client";

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Server, Zap, ChevronRight, Mail, Code, Bot, Globe, Send, Clock, CheckCircle, AlertTriangle, Info, Plus, MailPlus, GitBranch, Loader2 } from "lucide-react";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { SmtpConnectionModal } from '@/components/dashboard/servers/smtp-connection-modal';
import { DnsStatusModal } from '@/components/dashboard/servers/dns-status-modal';
import { DomainManagerModal } from '@/components/dashboard/servers/domain-manager-modal';
import { SubdomainModal } from '@/components/dashboard/servers/subdomain-modal';
import { AddEmailModal } from '@/components/dashboard/servers/add-email-modal';
import { DomainVerificationSuccessModal } from '@/components/dashboard/servers/domain-verification-success-modal';
import { CreateSubdomainModal } from '@/components/dashboard/servers/create-subdomain-modal';
import { getVerifiedDomainsCount } from './db-actions';
import { useToast } from '@/hooks/use-toast';
import { ProcessSelectorModal } from '@/components/dashboard/servers/process-selector-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { type Domain } from './types';


type ProviderStatus = 'ok' | 'error';
type DnsStatus = {
    spf?: boolean;
    dkim?: boolean;
    dmarc?: boolean;
    mx?: boolean;
    bimi?: boolean;
    vmc?: boolean;
};

const initialProviders = [
  {
    id: 'smtp',
    name: 'SMTP Genérico',
    description: 'Conéctate a cualquier servidor de correo usando credenciales SMTP.',
    icon: Mail,
    connected: false,
    colors: 'from-cyan-500/10 to-blue-500/10',
    borderColor: 'hover:border-cyan-400',
    domainsCount: 0,
    subdomainsCount: 0,
    emailsCount: 0,
    lastDnsCheck: 'Nunca',
    status: 'ok' as ProviderStatus,
    hasVerifiedDomains: false,
  },
  {
    id: 'blastengine',
    name: 'Blastengine',
    description: 'Integra el potente servicio de envío de correo de Blastengine.',
    icon: Zap,
    connected: false,
    colors: 'from-purple-500/10 to-indigo-500/10',
    borderColor: 'hover:border-purple-400',
    domainsCount: 0,
    subdomainsCount: 0,
    emailsCount: 0,
    lastDnsCheck: 'Nunca',
    status: 'error' as ProviderStatus,
    hasVerifiedDomains: false,
  },
  {
    id: 'sparkpost',
    name: 'SparkPost',
    description: 'Utiliza la plataforma de entrega de correo de SparkPost.',
    icon: Code,
    connected: false,
    colors: 'from-orange-500/10 to-amber-500/10',
    borderColor: 'hover:border-orange-400',
    domainsCount: 0,
    subdomainsCount: 0,
    emailsCount: 0,
    lastDnsCheck: 'Nunca',
     status: 'ok' as ProviderStatus,
     hasVerifiedDomains: false,
  },
  {
    id: 'elasticemail',
    name: 'Elastic Email',
    description: 'Conecta con Elastic Email para envíos masivos y marketing.',
    icon: Bot,
    connected: false,
    colors: 'from-green-500/10 to-emerald-500/10',
    borderColor: 'hover:border-green-400',
    domainsCount: 0,
    subdomainsCount: 0,
    emailsCount: 0,
    lastDnsCheck: 'Nunca',
    status: 'error' as ProviderStatus,
    hasVerifiedDomains: false,
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
  const [isDnsModalOpen, setIsDnsModalOpen] = useState(false);
  const [isDomainManagerModalOpen, setIsDomainManagerModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProviderStatus | null>(null);
  
  const [isSubdomainModalOpen, setIsSubdomainModalOpen] = useState(false);
  const [isCreateSubdomainModalOpen, setIsCreateSubdomainModalOpen] = useState(false);
  const [isAddEmailModalOpen, setIsAddEmailModalOpen] = useState(false);
  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{domain: string, dnsStatus: DnsStatus} | null>(null);
  
  const [domainsCount, setDomainsCount] = useState(0);
  const [isLoading, startLoading] = useTransition();
  const { toast } = useToast();
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);

  const handleSubdomainClick = (hasVerified: boolean) => {
    if (hasVerified) {
      setIsCreateSubdomainModalOpen(true);
    } else {
      setIsSubdomainModalOpen(true);
    }
  };
  
  const handleAddEmailClick = (hasVerified: boolean) => {
    if (hasVerified) {
       // Future: Open functional "add email" modal
       setIsAddEmailModalOpen(true); 
    } else {
       setIsAddEmailModalOpen(true);
    }
  };
  
  const fetchDomainCount = useCallback(async () => {
    startLoading(async () => {
      const result = await getVerifiedDomainsCount();
      if (result.success && typeof result.count === 'number') {
        setDomainsCount(result.count);
      } else {
        toast({
          title: 'Error al cargar dominios',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  }, [toast]);

  useEffect(() => {
    fetchDomainCount();
    setIsClient(true);
  }, [fetchDomainCount]);

  const providers = initialProviders.map(p => {
    return {
      ...p,
      domainsCount: domainsCount,
      hasVerifiedDomains: domainsCount > 0,
      subdomainsCount: 0, 
      emailsCount: 0,
      formattedEmailsCount: (0).toLocaleString()
    }
  });
  
  const handleConnectClick = (providerId: string) => {
    if (providerId === 'smtp') {
      setIsSelectorModalOpen(true);
    }
  };
  
  const handleStatusClick = (status: ProviderStatus) => {
    setSelectedStatus(status);
    setIsDnsModalOpen(true);
  };
  
  const handleVerificationComplete = (domain: string, dnsStatus: DnsStatus) => {
    setIsSmtpModalOpen(false);
    setSuccessModalData({ domain, dnsStatus });
    fetchDomainCount(); // Re-fetch the count after verification
    setTimeout(() => {
      setIsSuccessModalOpen(true);
    }, 300);
  };
  
  const handleSelectContinue = (domain: Domain) => {
    // For now, this just opens the main SMTP modal.
    // In the future, it would load the state from the paused `domain` object.
    setIsSmtpModalOpen(true);
  };

  return (
    <>
    <ProcessSelectorModal
        isOpen={isSelectorModalOpen}
        onOpenChange={setIsSelectorModalOpen}
        onSelectNew={() => setIsSmtpModalOpen(true)}
        onSelectContinue={handleSelectContinue}
    />
    <SmtpConnectionModal 
      isOpen={isSmtpModalOpen} 
      onOpenChange={setIsSmtpModalOpen} 
      onVerificationComplete={handleVerificationComplete}
    />
    <DnsStatusModal 
      isOpen={isDnsModalOpen} 
      onOpenChange={setIsDnsModalOpen}
      status={selectedStatus}
    />
    <DomainManagerModal isOpen={isDomainManagerModalOpen} onOpenChange={setIsDomainManagerModalOpen} />
    <SubdomainModal isOpen={isSubdomainModalOpen} onOpenChange={setIsSubdomainModalOpen} />
    <CreateSubdomainModal isOpen={isCreateSubdomainModalOpen} onOpenChange={setIsCreateSubdomainModalOpen} />
    <AddEmailModal isOpen={isAddEmailModalOpen} onOpenChange={setIsAddEmailModalOpen} />
    {successModalData && (
        <DomainVerificationSuccessModal 
            isOpen={isSuccessModalOpen}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setSuccessModalData(null);
              }
              setIsSuccessModalOpen(isOpen);
            }}
            domain={successModalData.domain}
            dnsStatus={successModalData.dnsStatus}
        />
    )}


    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background relative overflow-hidden">
       <style>{`
        @keyframes scanner {
          0% {
            transform: translateX(-150%) skewX(-15deg);
          }
          50% {
            transform: translateX(150%) skewX(-15deg);
          }
          100% {
            transform: translateX(-150%) skewX(-15deg);
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
              
                <div className="p-6 pb-0 z-10 flex flex-col flex-grow">
                     <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                               <provider.icon className="size-8 text-primary"/>
                           </div>
                           <div>
                               <h2 className="text-xl font-bold text-foreground">{provider.name}</h2>
                               <div className="flex items-center gap-4 mt-1">
                                {provider.connected ? (
                                   <span className="text-xs font-semibold text-green-400 px-2 py-1 bg-green-500/10 rounded-full flex items-center gap-1"><div className="size-2 rounded-full bg-green-400 animate-pulse"/>Conectado</span>
                                ) : (
                                   <span className="text-xs font-semibold text-amber-400 px-2 py-1 bg-amber-500/10 rounded-full">Desconectado</span>
                                )}
                               </div>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs h-7 px-3 border-cyan-400/50 text-cyan-300 bg-cyan-900/20 hover:bg-cyan-900/40 hover:text-cyan-200"
                              onClick={() => setIsDomainManagerModalOpen(true)}
                              disabled={!provider.hasVerifiedDomains}
                           >
                              Información
                          </Button>

                           <Button 
                              size="icon" 
                              variant="ghost" 
                              className={cn("size-7 rounded-md border-2", 
                                provider.status === 'ok' ? 'border-[#00CB07]/50' : 'border-[#F00000]/50',
                                'hover:bg-card/50'
                              )}
                              onClick={() => handleStatusClick(provider.status)}
                            >
                              {provider.status === 'ok' ? (
                                <CheckCircle className="size-5 text-[#00CB07]" style={{filter: 'drop-shadow(0 0 3px #00CB07)'}}/>
                              ) : (
                                <AlertTriangle className="size-5 text-[#F00000]" style={{filter: 'drop-shadow(0 0 3px #F00000)'}}/>
                              )}
                            </Button>
                        </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4">{provider.description}</p>
                    
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="size-4"/>
                            {isLoading ? <Loader2 className="animate-spin size-4" /> : <span className="font-semibold text-foreground">{provider.domainsCount}</span>}
                            <span>Dominios</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <GitBranch className="size-4"/>
                             {isLoading ? <Loader2 className="animate-spin size-4" /> : <span className="font-semibold text-foreground">{provider.subdomainsCount}</span>}
                            <span>Subdominios</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Send className="size-4"/>
                             {isLoading ? <Loader2 className="animate-spin size-4" /> : <span className="font-semibold text-foreground">{provider.formattedEmailsCount}</span>}
                            <span>Correos</span>
                          </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center justify-end gap-2 border-t border-border/20 pt-2 -mx-6 px-6">
                          <Clock className="size-3" />
                          <span>Último chequeo DNS: {provider.lastDnsCheck}</span>
                      </div>
                    </div>
                </div>

              <div className="p-6 pt-4 z-10 mt-auto">
                 <Button 
                    onClick={() => handleConnectClick(provider.id)}
                    className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-95 transition-opacity"
                  >
                    <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-80 animate-[scanner_3s_ease-in-out_infinite]" />
                    <span className="relative flex items-center gap-2">
                      Conectar Ahora <ChevronRight className="size-4" />
                    </span>
                 </Button>
                 <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                        variant="outline"
                        className="w-full text-xs h-9 border-white/50 bg-transparent text-white hover:bg-white hover:text-black"
                        onClick={() => handleSubdomainClick(provider.hasVerifiedDomains)}
                    >
                        <Plus className="mr-1"/>
                        <span>Sub Dominio</span>
                        <div className="relative ml-auto size-2.5 rounded-full led-indicator"
                             style={provider.hasVerifiedDomains ? {
                                '--led-glow-color': '#39FF14',
                                '--led-wave-color': '#39FF14'
                             } : {
                                '--led-glow-color': '#facc15',
                                '--led-wave-color': '#facc15'
                             }}>
                          <div className="absolute inset-0 rounded-full" style={{ background: 'var(--led-glow-color)' }}/>
                        </div>
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full text-xs h-9 border-white/50 bg-transparent text-white hover:bg-white hover:text-black"
                        onClick={() => handleAddEmailClick(provider.hasVerifiedDomains)}
                    >
                        <MailPlus className="mr-1"/>
                        <span>Correos</span>
                        <div className="relative ml-auto size-2.5 rounded-full led-indicator"
                             style={provider.hasVerifiedDomains ? {
                                '--led-glow-color': '#39FF14',
                                '--led-wave-color': '#39FF14'
                             } : {
                                '--led-glow-color': '#facc15',
                                '--led-wave-color': '#facc15'
                             }}>
                          <div className="absolute inset-0 rounded-full" style={{ background: 'var(--led-glow-color)' }}/>
                        </div>
                    </Button>
                  </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
    </>
  );
}
