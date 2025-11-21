
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, AlertTriangle, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { type Domain } from './types';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';

interface DomainListProps {
    onSelect: (domain: Domain) => void;
}

async function getDomains(): Promise<Domain[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Usuario no autenticado.");
    }
    
    const { data, error } = await supabase
        .from('domains')
        .select('*')
        .eq('user_id', user.id);
    
    if (error) {
        console.error("Error fetching domains:", error);
        throw error;
    }

    return data || [];
}

export function DomainList({ onSelect }: DomainListProps) {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [isLoading, startLoading] = useTransition();

    useEffect(() => {
        startLoading(async () => {
            try {
                const fetchedDomains = await getDomains();
                setDomains(fetchedDomains);
            } catch (error) {
                console.error("Failed to load domains", error);
            }
        });
    }, []);
    
    const truncateName = (name: string, maxLength: number = 25): string => {
        if (name.length <= maxLength) {
            return name;
        }
        return `${name.substring(0, maxLength)}...`;
    };

    if (isLoading) {
        return (
            <div className="space-y-2 p-4">
                {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
        )
    }

    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-1">Seleccionar Dominio</h3>
            <p className="text-sm text-muted-foreground mb-4">Elige un dominio verificado para asociar tu nuevo subdominio.</p>
            <ScrollArea className="flex-1 -mx-4">
                <div className="space-y-2 px-4">
                    {domains.map((domain) => (
                        <motion.div
                            key={domain.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "group relative p-3 rounded-lg border-2 transition-all duration-300 flex items-center justify-between",
                                domain.is_verified ? "border-transparent bg-background/50 hover:bg-primary/10 hover:border-primary cursor-pointer" : "bg-muted/30 border-muted text-muted-foreground"
                            )}
                            onClick={() => domain.is_verified && onSelect(domain)}
                        >
                            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(120,119,198,0.15)_0%,rgba(255,255,255,0)_100%)] opacity-0 group-hover:opacity-100 transition-opacity"/>
                            <div className="flex items-center gap-3">
                                {domain.is_verified ? 
                                    <CheckCircle className="size-6 text-green-400 flex-shrink-0" /> : 
                                    <AlertTriangle className="size-6 text-red-400 flex-shrink-0" />
                                }
                                <div className="min-w-0">
                                  <p className="font-semibold text-foreground truncate" title={domain.domain_name}>{truncateName(domain.domain_name, 25)}</p>
                                  <p className="text-xs text-muted-foreground">{domain.is_verified ? 'Verificado' : 'Verificación pendiente'}</p>
                                </div>
                            </div>
                            {domain.is_verified && (
                                <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    Seleccionar
                                </Button>
                            )}
                        </motion.div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

