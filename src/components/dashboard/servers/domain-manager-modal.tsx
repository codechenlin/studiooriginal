
"use client";

import React, { useState, useEffect, useCallback, useTransition, useActionState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  MoreHorizontal,
  FileIcon,
  ImageIcon,
  Film,
  FileText,
  Music,
  Archive,
  Edit,
  Trash2,
  Download,
  Eye,
  UploadCloud,
  Loader2,
  Search,
  XCircle,
  AlertTriangle,
  FolderOpen,
  Check,
  Globe,
  GitBranch,
  Mail,
  X,
  MailOpen,
  Code,
  Signal,
  CheckCircle,
  Layers,
  Plug,
  Hourglass,
  KeyRound,
  Shield,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { type Domain } from './types';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaPreview } from '@/components/admin/media-preview';
import { Separator } from '@/components/ui/separator';
import { createOrGetDomainAction } from './db-actions';

// Mock Data
const domains: Domain[] = [
    // @ts-ignore
    { id: '1', name: 'mailflow.ai', is_verified: true, emails: [{address: 'ventas@mailflow.ai', connected: true}, {address: 'soporte@mailflow.ai', connected: true}, {address: 'info@mailflow.ai', connected: false}], user_id: '', verification_code: '', created_at: '', updated_at: '' },
    // @ts-ignore
    { id: '2', name: 'daybuu.com', is_verified: true, emails: [{address: 'contacto@daybuu.com', connected: true}], user_id: '', verification_code: '', created_at: '', updated_at: '' },
    // @ts-ignore
    { id: '3', name: 'my-super-long-domain-name-that-needs-truncation.com', is_verified: true, emails: [{address: 'test@my-super-long-domain-name-that-needs-truncation.com', connected: false}], user_id: '', verification_code: '', created_at: '', updated_at: '' },
    // @ts-ignore
    { id: '4', name: 'another-domain.dev', is_verified: false, emails: [], user_id: '', verification_code: '', created_at: '', updated_at: '' },
];
const subdomains = [
    // @ts-ignore
    { id: 'sub1', name: 'marketing.mailflow.ai', is_verified: true, emails: [{address: 'newsletter@marketing.mailflow.ai', connected: true}] },
    // @ts-ignore
    { id: 'sub2', name: 'app.daybuu.com', is_verified: false, emails: [] },
    // @ts-ignore
    { id: 'sub3', name: 'another-very-long-subdomain-name-to-check-truncation.mailflow.ai', is_verified: true, emails: [{address: 'info@another-very-long-subdomain-name-to-check-truncation.mailflow.ai', connected: true}] },
];

interface DomainManagerModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const EmptyState = ({ type }: { type: 'Dominios' | 'Subdominios' }) => (
    <div className="flex flex-col items-center justify-center text-center text-cyan-200/50 h-full p-4">
        <FolderOpen className="size-16 mb-4 animate-pulse" />
        <h4 className="font-semibold text-white/80">No hay {type}</h4>
        <p className="text-xs">Aún no has verificado ningún {type.toLowerCase()}.</p>
    </div>
);

const RightPanelPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-cyan-200/70 p-8">
        <div className="relative flex items-center justify-center w-full max-w-sm h-24">
            <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            <motion.div 
                className="absolute h-2 w-2 rounded-full bg-cyan-300"
                style={{ boxShadow: '0 0 10px #00ADEC, 0 0 15px #00ADEC' }}
                animate={{ 
                    left: ['10%', '90%', '10%'],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 group">
                 <div className="relative p-4 rounded-full bg-black/30 border border-cyan-400/20 icon-illuminated">
                    <div className="illumination-pulse" style={{'--glow-color': '#00ADEC'} as React.CSSProperties}/>
                    <Globe className="relative size-8 text-cyan-300"/>
                </div>
            </div>
             <div className="absolute right-0 top-1/2 -translate-y-1/2 group">
                 <div className="relative p-4 rounded-full bg-black/30 border border-cyan-400/20 icon-illuminated">
                    <div className="illumination-pulse" style={{'--glow-color': '#00ADEC'} as React.CSSProperties}/>
                    <MailOpen className="relative size-8 text-cyan-300"/>
                </div>
            </div>
        </div>
        <p className="mt-8 text-sm">Selecciona un dominio o sub dominio para observar las direcciones de correos electrónicos conectados.</p>
    </div>
);

const LedIndicator = ({ verified }: { verified: boolean }) => (
    <div 
      className="relative size-3 rounded-sm shrink-0" 
      style={{
        backgroundColor: verified ? '#00CB07' : '#F00000',
        boxShadow: `0 0 6px ${verified ? '#00CB07' : '#F00000'}`,
      }}
    >
      <div className="absolute inset-0 rounded-sm animate-pulse-wave" style={{'--wave-color': verified ? '#00CB07' : '#F00000', animationDuration: '1s'} as React.CSSProperties} />
    </div>
  );
  
const SystemStatusIndicator = () => {
    return (
        <div className="p-2 rounded-lg bg-black/30 border border-cyan-400/20 flex items-center gap-3">
            <div className="relative flex items-center justify-center w-6 h-6">
                 <motion.div
                    className="absolute inset-0 border-2 border-dashed rounded-full"
                    style={{ borderColor: '#1700E6' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                />
                 <motion.div
                    className="absolute inset-2 border-2 border-dashed rounded-full"
                    style={{ borderColor: '#009AFF' }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                />
                 <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#1700E6', boxShadow: '0 0 6px #1700E6'}}/>
            </div>
            <p className="text-xs font-bold tracking-wider text-white">ESTADO DEL SISTEMA</p>
        </div>
    );
};

export function DomainManagerModal({ isOpen, onOpenChange }: DomainManagerModalProps) {
    const { toast } = useToast();
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'domains' | 'subdomains'>('domains');
    const [emailFilter, setEmailFilter] = useState<'all' | 'connected' | 'disconnected'>('all');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [domainToDelete, setDomainToDelete] = useState<string | null>(null);

    const truncateName = (name: string, maxLength: number): string => {
        if (!name || name.length <= maxLength) {
            return name || '';
        }
        return `${name.substring(0, maxLength)}...`;
    };

    const getEmailsForDomain = () => {
        const domainData = [...domains, ...subdomains].find(d => d.name === selectedDomain);
        if (!domainData) return [];

        if (emailFilter === 'connected') {
            return domainData.emails.filter(e => e.connected);
        }
        if (emailFilter === 'disconnected') {
            return domainData.emails.filter(e => !e.connected);
        }
        return domainData.emails;
    }
    
    const emails = getEmailsForDomain();
    const currentList = activeTab === 'domains' ? domains : subdomains;
    const currentDomainData = [...domains, ...subdomains].find(d => d.name === selectedDomain);
    
    const ConnectionSignal = () => {
        const connectedCount = currentDomainData?.emails.filter(e => e.connected).length ?? 0;
        const errorCount = currentDomainData?.emails.filter(e => !e.connected).length ?? 0;
    
        return (
            <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <CheckCircle className="size-5 text-green-400" />
                    <span className="font-semibold text-white">Conexión Estable: <span className="font-mono text-lg">{connectedCount}</span></span>
                    <span className="text-xs font-semibold text-white px-2 py-1 rounded-md" style={{backgroundColor: 'rgba(0, 203, 7, 0.3)'}}>Correos</span>
                </div>
                <div className="flex items-center gap-2">
                    <XCircle className="size-5 text-red-500" />
                    <span className="font-semibold text-white">Error de Conexión: <span className="font-mono text-lg">{errorCount}</span></span>
                    <span className="text-xs font-semibold text-white px-2 py-1 rounded-md" style={{backgroundColor: 'rgba(240, 0, 0, 0.3)'}}>Correos</span>
                </div>
            </div>
        );
    };

    const handleDeleteClick = (e: React.MouseEvent, domainName: string) => {
        e.stopPropagation();
        setDomainToDelete(domainName);
        setIsDeleteModalOpen(true);
    };
    
    const handleDelete = () => {
        toast({
            title: "Dominio eliminado (simulado)",
            description: `El dominio "${domainToDelete}" ha sido eliminado.`,
        });
        setIsDeleteModalOpen(false);
        setDomainToDelete(null);
    };

    const DeleteConfirmationModal = () => (
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent showCloseButton={false} className="sm:max-w-md bg-zinc-900/90 backdrop-blur-xl border border-red-500/20 text-white overflow-hidden p-0">
              <div className="absolute inset-0 z-0 opacity-10 bg-grid-red-500/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
              <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-red-500/10 rounded-full animate-pulse-slow filter blur-3xl -translate-x-1/2 -translate-y-1/2"/>

              <div className="p-8 text-center flex flex-col items-center z-10">
                   <div className="flex justify-center mb-4">
                      <div className="relative w-24 h-24 flex items-center justify-center">
                          <motion.div className="absolute inset-0 border-2 border-dashed border-red-400/50 rounded-full" animate={{rotate: 360}} transition={{duration: 10, repeat: Infinity, ease: "linear"}} />
                          <motion.div className="absolute inset-2 border-2 border-dashed border-red-400/30 rounded-full" animate={{rotate: -360}} transition={{duration: 7, repeat: Infinity, ease: "linear"}} />
                          <AlertTriangle className="text-red-400 size-16 animate-pulse" style={{ filter: 'drop-shadow(0 0 10px #F00000)' }}/>
                      </div>
                  </div>
                  <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Confirmar Eliminación</DialogTitle>
                      <DialogDescription className="text-red-200/80">
                         ¿Estás seguro de que deseas eliminar el dominio verificado <strong>{domainToDelete}</strong>? Esta acción es irreversible. Podrás volver a verificar el dominio más adelante si lo deseas.
                      </DialogDescription>
                  </DialogHeader>
                   <div className="w-full mt-6 text-left">
                      <Label htmlFor="password-confirm" className="text-red-200/90">Para confirmar, escribe tu contraseña:</Label>
                      <div className="relative mt-2">
                           <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                           <Input id="password-confirm" type="password" className="pl-10 bg-black/40 border-red-500/30 focus:border-red-400" placeholder="••••••••"/>
                      </div>
                  </div>
              </div>

              <DialogFooter className="p-4 bg-black/20 border-t border-red-500/20 z-10 flex justify-between">
                  <Button variant="outline" className="text-white hover:bg-white hover:text-black" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                  <Button variant="destructive" className="bg-[#F00000] hover:bg-red-700" onClick={handleDelete}>
                      <Trash2 className="mr-2"/>
                      Eliminar Permanentemente
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    );

    return (
        <>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-5xl w-full h-[650px] flex flex-col p-0 gap-0 bg-black/80 backdrop-blur-xl border border-cyan-400/20 text-white overflow-hidden">
                <style>{`
                    .info-grid {
                        background-image:
                            linear-gradient(to right, hsl(190 100% 50% / 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, hsl(190 100% 50% / 0.1) 1px, transparent 1px);
                        background-size: 2rem 2rem;
                    }
                    @keyframes pulse-wave {
                      0% { transform: scale(0.8); opacity: 0; }
                      50% { opacity: 0.7; }
                      100% { transform: scale(2.5); opacity: 0; }
                    }
                    @keyframes illumination-pulse {
                        0%, 100% {
                            transform: scale(0.5);
                            opacity: 0;
                        }
                        50% {
                            transform: scale(1.2);
                            opacity: 1;
                        }
                    }
                    .icon-illuminated .illumination-pulse {
                        position: absolute;
                        inset: 0;
                        border-radius: 50%;
                        background: radial-gradient(circle, var(--glow-color) 0%, transparent 70%);
                        animation: illumination-pulse 3s infinite ease-out;
                    }
                    @keyframes hud-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>

                 <DialogHeader className="p-4 border-b border-cyan-400/20 bg-black/30 text-left z-10 flex flex-row justify-between items-center">
                    <DialogTitle className="flex items-center gap-3">
                         <div className="p-2 rounded-full bg-cyan-500/10 border-2 border-cyan-400/20">
                           <Globe className="text-cyan-300"/>
                        </div>
                        Gestor de Dominios y Correos
                    </DialogTitle>
                    <SystemStatusIndicator/>
                </DialogHeader>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">
                    {/* Left Column: Domain List */}
                    <div className="flex flex-col p-6 border-r border-cyan-400/20 bg-black/20">
                         <div className="flex bg-black/30 p-1 rounded-lg border border-cyan-400/20 mb-4 shrink-0">
                            <button onClick={() => setActiveTab('domains')} className={cn("flex-1 py-2 px-4 text-sm font-semibold rounded-md transition-colors", activeTab === 'domains' && 'bg-cyan-500/20 text-cyan-200')}>Dominios</button>
                            <button onClick={() => setActiveTab('subdomains')} className={cn("flex-1 py-2 px-4 text-sm font-semibold rounded-md transition-colors", activeTab === 'subdomains' && 'bg-cyan-500/20 text-cyan-200')}>Subdominios</button>
                        </div>
                        <ScrollArea className="flex-1 -m-6 p-6 mt-0 custom-scrollbar">
                             <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-2"
                                >
                                    {currentList.length > 0 ? currentList.map(d => (
                                        <div key={d.name} onClick={() => setSelectedDomain(d.name)} className={cn("w-full text-left p-3 rounded-lg flex items-center justify-between transition-all duration-200 border-2 cursor-pointer", selectedDomain === d.name ? "bg-cyan-500/20 border-cyan-400" : "bg-black/20 border-transparent hover:bg-cyan-500/10 hover:border-cyan-400/50")}>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <LedIndicator verified={d.is_verified}/>
                                                <p className="font-mono text-sm text-white/90 truncate" title={d.name}>{truncateName(d.name, 25)}</p>
                                            </div>
                                            {activeTab === 'domains' && selectedDomain === d.name && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/5 hover:bg-white text-red-500 hover:text-white" onClick={(e) => handleDeleteClick(e, d.name)} >
                                                     <Trash2 className="size-4"/>
                                                </Button>
                                            )}
                                        </div>
                                    )) : (
                                        <EmptyState type={activeTab === 'domains' ? 'Dominios' : 'Subdominios'} />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </ScrollArea>
                    </div>
                    {/* Right Column: Email List */}
                    <div className="flex flex-col p-6 bg-black/10 info-grid relative">
                         <div className="z-10 flex flex-col h-full">
                           <div className="flex justify-between items-center shrink-0 mb-4">
                               <h3 className="font-semibold text-cyan-300 text-sm flex items-center gap-2 min-w-0">
                                 <Mail className="size-4"/>
                                 <span className="truncate">Correos para: <span className="font-mono text-white" title={selectedDomain || ''}>{selectedDomain ? truncateName(selectedDomain, 15) : '...'}</span></span>
                               </h3>
                               <div className="flex items-center gap-1 p-1 rounded-md bg-black/30 border border-cyan-400/20">
                                    <Button variant={emailFilter === 'connected' ? 'secondary' : 'ghost'} size="icon" className="size-7 hover:bg-white/20" onClick={() => setEmailFilter('connected')}>
                                        <CheckCircle className="text-green-400"/>
                                    </Button>
                                    <Button variant={emailFilter === 'disconnected' ? 'secondary' : 'ghost'} size="icon" className="size-7 hover:bg-white/20" onClick={() => setEmailFilter('disconnected')}>
                                        <XCircle className="text-red-500"/>
                                    </Button>
                                     <Button variant={emailFilter === 'all' ? 'secondary' : 'ghost'} size="icon" className="size-7 hover:bg-white/20" onClick={() => setEmailFilter('all')}>
                                         <Layers style={{color: '#E18700'}}/>
                                     </Button>
                                </div>
                            </div>
                           <ScrollArea className="flex-1 -m-6 p-6 mt-0 custom-scrollbar">
                                <div className="space-y-2">
                                    {selectedDomain ? (
                                        emails.length > 0 ? emails.map(email => (
                                            <div key={email.address} className="p-3 bg-black/40 border border-cyan-400/10 rounded-lg flex items-center justify-between">
                                                <div className="flex items-center gap-3 min-w-0">
                                                   <LedIndicator verified={email.connected}/>
                                                   <span className="font-mono text-sm text-white/80 truncate" title={email.address}>{truncateName(email.address, 25)}</span>
                                                </div>
                                                <MoreHorizontal className="text-cyan-300/50" />
                                            </div>
                                        )) : (
                                             <div className="text-center text-cyan-200/50 pt-16">
                                                <p>No hay correos para este dominio.</p>
                                            </div>
                                        )
                                    ) : (
                                        <RightPanelPlaceholder />
                                    )}
                                </div>
                           </ScrollArea>
                        </div>
                    </div>
                </div>
                 <DialogFooter className="p-3 border-t border-cyan-400/20 bg-black/30 z-10 flex justify-between items-center gap-4">
                     <ConnectionSignal />
                     <div className="flex items-center gap-2">
                        <Button
                            className="h-11 px-4 text-white bg-gradient-to-r from-[#1700E6] to-[#009AFF] hover:from-[#00CE07] hover:to-[#A6EE00] hover:text-white"
                         >
                            <Plug className="mr-2"/>
                            Comprobación
                         </Button>
                         <Button variant="outline" className="text-white border-white/30 hover:bg-white hover:text-black h-11" onClick={() => onOpenChange(false)}>
                           <X className="mr-2"/>
                           Cerrar
                         </Button>
                     </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <DeleteConfirmationModal />
        </>
    );
}
