
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { type Domain, getVerifiedDomains } from './db-actions'; // Import getVerifiedDomains
import { Skeleton } from '@/components/ui/skeleton';

interface DomainListProps {
    onSelect: (domain: Domain) => void;
    renderLoading: () => React.ReactNode;
}

export function DomainList({ onSelect, renderLoading }: DomainListProps) {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [isLoading, startLoading] = useTransition();

    useEffect(() => {
        startLoading(async () => {
            try {
                const result = await getVerifiedDomains();
                if(result.success && result.data){
                    setDomains(result.data);
                } else {
                    console.error("Failed to load domains", result.error);
                }
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
        return <>{renderLoading()}</>;
    }

    return (
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
    );
}
