
"use client";

import React, { useState, useEffect, useCallback, useTransition } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  FileIcon,
  Image as ImageIcon,
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
import { Skeleton } from '../ui/skeleton';
import { MediaPreview } from '../admin/media-preview';
import { Separator } from '../ui/separator';

// Mock Data
const domains: Domain[] = [
    { id: '1', name: 'mailflow.ai', is_verified: true, emails: [{address: 'ventas@mailflow.ai', connected: true}, {address: 'soporte@mailflow.ai', connected: true}, {address: 'info@mailflow.ai', connected: false}], user_id: '', verification_code: '', created_at: '', updated_at: '' },
    { id: '2', name: 'daybuu.com', is_verified: true, emails: [{address: 'contacto@daybuu.com', connected: true}], user_id: '', verification_code: '', created_at: '', updated_at: '' },
    { id: '3', name: 'my-super-long-domain-name-that-needs-truncation.com', is_verified: true, emails: [{address: 'test@my-super-long-domain-name-that-needs-truncation.com', connected: false}], user_id: '', verification_code: '', created_at: '', updated_at: '' },
    { id: '4', name: 'another-domain.dev', is_verified: false, emails: [], user_id: '', verification_code: '', created_at: '', updated_at: '' },
];
const subdomains = [
    { id: 'sub1', name: 'marketing.mailflow.ai', verified: true, emails: [{address: 'newsletter@marketing.mailflow.ai', connected: true}] },
    { id: 'sub2', name: 'app.daybuu.com', verified: false, emails: [] },
    { id: 'sub3', name: 'another-very-long-subdomain-name-to-check-truncation.mailflow.ai', verified: true, emails: [{address: 'info@another-very-long-subdomain-name-to-check-truncation.mailflow.ai', connected: true}] },
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
  
const ConnectionSignal = () => {
    return (
      <div className="relative flex items-center justify-center w-8 h-8">
          <div className="absolute w-full h-full border-2 border-dashed border-[#E18700]/30 rounded-full animate-spin-slow" />
          <div className="flex items-end gap-0.5 h-3/5">
              <motion.div
                  className="w-1 bg-[#E18700] rounded-full"
                  animate={{ height: ['20%', '80%', '20%'] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              />
               <motion.div
                  className="w-1 bg-[#E18700] rounded-full"
                  animate={{ height: ['60%', '30%', '60%'] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              />
               <motion.div
                  className="w-1 bg-[#E18700] rounded-full"
                  animate={{ height: ['40%', '100%', '40%'] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              />
          </div>
      </div>
    );
};

export function DomainManagerModal({ isOpen, onOpenChange }: DomainManagerModalProps) {
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'domains' | 'subdomains'>('domains');
    const [emailFilter, setEmailFilter] = useState<'all' | 'connected' | 'disconnected'>('all');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const truncateName = (name: string, maxLength: number): string => {
        if (name.length <= maxLength) {
            return name;
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
                           ¿Estás seguro de que deseas eliminar el dominio verificado <strong>{selectedDomain}</strong>? Esta acción es irreversible. Podrás volver a verificar el dominio más adelante si lo deseas.
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
                    <Button variant="destructive" className="bg-[#F00000] hover:bg-red-700">
                        <Trash2 className="mr-2"/>
                        Eliminar Permanentemente
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    return (
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
                    .animate-pulse-wave {
                      position: absolute;
                      inset: 0;
                      border-radius: inherit;
                      border: 1px solid var(--wave-color);
                      animation: pulse-wave 1s infinite cubic-bezier(0.4, 0, 0.2, 1);
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
                `}</style>

                 <DialogHeader className="p-4 border-b border-cyan-400/20 bg-black/30 text-left z-10">
                    <DialogTitle className="flex items-center gap-3">
                         <div className="p-2 rounded-full bg-cyan-500/10 border-2 border-cyan-400/20">
                           <Globe className="text-cyan-300"/>
                        </div>
                        Gestor de Dominios y Correos
                    </DialogTitle>
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
                                                <Button variant="outline" size="sm" className="h-7 px-3 text-xs bg-cyan-900/50 border-cyan-400/30 text-cyan-300 hover:bg-white hover:text-black" onClick={(e) => e.stopPropagation()}>
                                                  <Code className="mr-2 size-3"/>
                                                  Detalles
                                                </Button>
                                                <span className="font-mono text-sm truncate" title={d.name}>{truncateName(d.name, 21)}</span>
                                            </div>
                                             {activeTab === 'domains' ? (
                                                <Button variant="ghost" size="icon" className="group" onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); }} >
                                                    <Trash2 className="size-4 text-[#F00000] transition-colors group-hover:text-white" />
                                                </Button>
                                            ) : (
                                                <MoreHorizontal className="text-cyan-300/50" />
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
                                                   <Button variant="outline" size="sm" className="h-7 px-3 text-xs bg-cyan-900/50 border-cyan-400/30 text-cyan-300 hover:bg-white hover:text-black" onClick={(e) => e.stopPropagation()}>
                                                      <Signal className="mr-2 size-3"/>
                                                      Informe
                                                    </Button>
                                                   <span className="font-mono text-sm text-white/80 truncate" title={email.address}>{truncateName(email.address, 19)}</span>
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
                 <DialogFooter className="p-3 border-t border-cyan-400/20 bg-black/30 z-10 flex justify-between items-center">
                    <Button variant="outline" className="text-white border-white/30 hover:bg-white hover:text-black" onClick={() => onOpenChange(false)}>
                       <X className="mr-2"/>
                       Cerrar
                     </Button>
                    <div className="flex items-center gap-4">
                         <div className="flex-1 p-2 rounded-lg border-2 bg-transparent min-w-[360px]" style={{ borderColor: '#E18700' }}> 
                            {selectedDomain && currentDomainData ? (
                                <div className="flex items-center justify-around gap-4">
                                    {/* Connected */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="size-3 rounded-sm bg-[#00CB07]"/>
                                        <span className="font-semibold text-white">Conexión Estable</span>
                                        <span className="font-mono text-lg text-white">{currentDomainData.emails.filter(e => e.connected).length}</span>
                                        <div className="px-1.5 py-0.5 bg-green-500/20 text-green-300 rounded-md text-xs font-semibold border border-green-500/30">Correos</div>
                                    </div>
                                    {/* Disconnected */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="size-3 rounded-sm bg-[#F00000]"/>
                                        <span className="font-semibold text-white">Error de Conexión</span>
                                        <span className="font-mono text-lg text-white">{currentDomainData.emails.filter(e => !e.connected).length}</span>
                                        <div className="px-1.5 py-0.5 bg-red-500/20 text-red-300 rounded-md text-xs font-semibold border border-red-500/30">Correos</div>
                                    </div>
                                    <ConnectionSignal />
                                </div>
                             ) : (
                                <div className="flex items-center justify-center gap-3 text-sm text-white">
                                    <Hourglass className="size-5 animate-spin-slow" />
                                    <span>Selecciona un dominio para ver el estado de conexión.</span>
                                </div>
                             )}
                         </div>
                     </div>
                </DialogFooter>
            </DialogContent>
            <DeleteConfirmationModal />
        </Dialog>
    );
}
