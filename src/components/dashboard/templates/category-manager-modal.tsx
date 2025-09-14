
'use client';

import React, { useState, useTransition, useEffect, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { type TemplateWithAuthor, updateTemplateCategories, deleteCategory } from '@/app/dashboard/templates/actions';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Tag, Layers, Server, AlertTriangle, Database } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategoryManagerModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    template: TemplateWithAuthor;
    allTemplates: TemplateWithAuthor[];
    onTemplateUpdate: () => void;
}

export function CategoryManagerModal({ isOpen, onOpenChange, template, allTemplates, onTemplateUpdate }: CategoryManagerModalProps) {
    const { toast } = useToast();
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [allUniqueCategories, setAllUniqueCategories] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [isSaving, startSaving] = useTransition();
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

    const categoryCounts = useMemo(() => {
        const counts = new Map<string, number>();
        allTemplates.forEach(t => {
            t.categories?.forEach(c => {
                counts.set(c, (counts.get(c) || 0) + 1);
            });
        });
        return counts;
    }, [allTemplates]);

    useEffect(() => {
        if (isOpen) {
            setSelectedCategories(template.categories || []);
            const allCats = new Set<string>();
            allTemplates.forEach(t => {
                t.categories?.forEach(c => allCats.add(c));
            });
            setAllUniqueCategories(Array.from(allCats).sort());
        }
    }, [isOpen, template.categories, allTemplates]);

    const handleAddNewCategory = () => {
        const trimmed = newCategory.trim();
        if (trimmed && !allUniqueCategories.includes(trimmed)) {
            setAllUniqueCategories(prev => [...prev, trimmed].sort());
            setSelectedCategories(prev => [...prev, trimmed]);
            setNewCategory('');
        } else if (trimmed) {
            toast({ title: 'Categoría existente', description: 'Esta categoría ya existe.', variant: 'default' });
        }
    };

    const handleCategoryToggle = (category: string, checked: boolean) => {
        if (checked) {
            setSelectedCategories(prev => [...prev, category]);
        } else {
            setSelectedCategories(prev => prev.filter(c => c !== category));
        }
    };
    
    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;
        
        startSaving(async () => {
            const result = await deleteCategory(categoryToDelete);
            if(result.success) {
                toast({ title: 'Categoría Eliminada', description: `La categoría "${categoryToDelete}" ha sido eliminada de todas las plantillas.`, className: 'bg-green-500 text-white' });
                onTemplateUpdate(); // This will re-fetch templates and update categories
                setCategoryToDelete(null);
            } else {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
            }
        });
    }

    const handleSave = () => {
        startSaving(async () => {
            const result = await updateTemplateCategories(template.id, selectedCategories);
            if(result.success) {
                toast({ 
                  title: 'Éxito', 
                  description: 'Categorías actualizadas.', 
                  className: 'bg-[#00CB07] border-none text-white' 
                });
                onTemplateUpdate();
                onOpenChange(false);
            } else {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
            }
        });
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl bg-card/80 backdrop-blur-sm border-border/20">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Tag className="text-primary"/>
                            Gestionar Categorías para &quot;{template.name}&quot;
                        </DialogTitle>
                        <DialogDescription>
                            Asigna, crea o elimina categorías para organizar tus plantillas.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        {/* Left Column: Assign/Create */}
                        <div className="flex flex-col gap-4 p-4 border rounded-lg bg-background/50">
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2"><Layers /> Asignar Categorías</h3>
                                <ScrollArea className="h-40">
                                    <div className="space-y-2 pr-4">
                                        {allUniqueCategories.length > 0 ? allUniqueCategories.map(category => (
                                            <div key={category} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`cat-${category}`}
                                                    checked={selectedCategories.includes(category)}
                                                    onCheckedChange={(checked) => handleCategoryToggle(category, !!checked)}
                                                />
                                                <label htmlFor={`cat-${category}`} className="text-sm font-medium leading-none cursor-pointer">
                                                    {category}
                                                </label>
                                            </div>
                                        )) : <p className="text-sm text-muted-foreground">No hay categorías existentes.</p>}
                                    </div>
                                </ScrollArea>
                            </div>
                            <Separator/>
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2"><PlusCircle /> Crear Nueva Categoría</h3>
                                <div className="flex gap-2">
                                    <Input 
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        placeholder="Ej: Anuncios Globales"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddNewCategory()}
                                    />
                                    <Button onClick={handleAddNewCategory} size="icon" variant="outline"><PlusCircle className="size-4"/></Button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Manage All */}
                        <div className="flex flex-col gap-4 p-4 border rounded-lg bg-background/50">
                             <h3 className="font-semibold mb-3 flex items-center gap-2"><Database /> Administrador de Categorías</h3>
                             <ScrollArea className="h-56">
                                <div className="space-y-2 pr-4">
                                    {allUniqueCategories.length > 0 ? allUniqueCategories.map(category => (
                                        <div key={category} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{category}</span>
                                                <div className="px-1.5 py-0.5 text-xs rounded-full bg-primary/20 text-primary font-mono">{categoryCounts.get(category) || 0}</div>
                                            </div>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 border border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setCategoryToDelete(category)}>
                                                <Trash2 className="size-4"/>
                                            </Button>
                                        </div>
                                    )) : (
                                        <div className="text-center text-muted-foreground pt-10">
                                            <Tag className="mx-auto size-10 mb-2"/>
                                            <p className="text-sm">No se han creado categorías.</p>
                                        </div>
                                    )}
                                </div>
                             </ScrollArea>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Confirmar Eliminación</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de que quieres eliminar la categoría &quot;{categoryToDelete}&quot;?
                            Esta acción la eliminará de <span className="font-bold">{categoryCounts.get(categoryToDelete || '') || 0}</span> plantilla(s). Esta acción es irreversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteCategory} disabled={isSaving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                           {isSaving ? 'Eliminando...' : 'Sí, eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

    