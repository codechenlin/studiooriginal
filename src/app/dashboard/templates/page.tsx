
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { History, PlusCircle, Search, LayoutGrid, List, FolderOpen } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { getTemplates, type TemplateWithAuthor } from './actions';
import { useToast } from '@/hooks/use-toast';
import { TemplateCard, TemplateCardSkeleton } from '@/components/dashboard/templates/template-card';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CategoryFilter, CategoryFilterSkeleton } from '@/components/dashboard/templates/category-filter';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<TemplateWithAuthor[]>([]);
    const [isLoading, startLoading] = useTransition();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [allCategories, setAllCategories] = useState<string[]>([]);
    const [layout, setLayout] = useState<'grid' | 'list'>('grid');

    const fetchTemplatesData = React.useCallback(() => {
        startLoading(async () => {
            const result = await getTemplates();
            if (result.success && result.data) {
                setTemplates(result.data);
                const categories = new Set(result.data.flatMap(t => t.categories || []));
                setAllCategories(Array.from(categories));
            } else {
                toast({
                    title: 'Error al cargar plantillas',
                    description: result.error,
                    variant: 'destructive'
                });
            }
        });
    }, [toast]);

    useEffect(() => {
        fetchTemplatesData();
    }, [fetchTemplatesData]);

    const filteredTemplates = templates
      .filter(template => template.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(template => 
          selectedCategories.length === 0 ||
          (template.categories && selectedCategories.some(cat => template.categories.includes(cat)))
      );

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground flex items-center gap-2">
                        <History className="size-8"/>
                        Mis Plantillas
                    </h1>
                    <p className="text-muted-foreground">Aquí puedes ver, editar y gestionar todas tus plantillas guardadas.</p>
                </div>
                <Link href="/dashboard/templates/create">
                    <Button className="bg-gradient-to-r from-primary to-accent/80 hover:opacity-90 transition-opacity">
                        <PlusCircle className="mr-2"/>
                        Crear Nueva Plantilla
                    </Button>
                </Link>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                    <Input 
                        placeholder="Buscar por nombre de plantilla..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    {isLoading ? 
                        <CategoryFilterSkeleton /> : 
                        <CategoryFilter 
                            allCategories={allCategories}
                            selectedCategories={selectedCategories}
                            setSelectedCategories={setSelectedCategories}
                        />}
                    <ToggleGroup type="single" value={layout} onValueChange={(value) => value && setLayout(value as any)} className="ml-auto">
                      <ToggleGroupItem value="grid" aria-label="Grid view"><LayoutGrid/></ToggleGroupItem>
                      <ToggleGroupItem value="list" aria-label="List view"><List/></ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>

            <div className="flex-1">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => <TemplateCardSkeleton key={i}/>)}
                    </div>
                ) : filteredTemplates.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-lg h-full">
                        <FolderOpen className="size-16 mb-4 text-primary/50" />
                        <h3 className="text-xl font-semibold text-foreground">Aún no hay plantillas</h3>
                        <p className="mt-2 max-w-md">Parece que tu lienzo está en blanco. ¡Haz clic en "Crear Nueva Plantilla" para empezar a diseñar tu primera obra maestra!</p>
                         <Link href="/dashboard/templates/create" className="mt-6">
                            <Button className="bg-gradient-to-r from-primary to-accent/80 hover:opacity-90 transition-opacity">
                                <PlusCircle className="mr-2"/>
                                Crear mi Primera Plantilla
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map(template => (
                           <TemplateCard key={template.id} template={template} onTemplateUpdate={fetchTemplatesData} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
