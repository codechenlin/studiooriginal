
'use client';

import React, { useState, useTransition, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { type TemplateWithAuthor, updateTemplateCategories } from '@/app/dashboard/templates/actions';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, X } from 'lucide-react';

interface CategoryManagerModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    template: TemplateWithAuthor;
    onTemplateUpdate: () => void;
}

export function CategoryManagerModal({ isOpen, onOpenChange, template, onTemplateUpdate }: CategoryManagerModalProps) {
    const { toast } = useToast();
    const [allCategories, setAllCategories] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [isSaving, startSaving] = useTransition();

    useEffect(() => {
        if (isOpen) {
            // In a real app, you'd fetch all unique categories from your DB
            // For now, we'll just use the ones from the template
            // A better approach would be to pass allCategories as a prop
            setSelectedCategories(template.categories || []);
            // This is a placeholder. Ideally, you fetch all categories from the server.
            setAllCategories(Array.from(new Set([...(template.categories || []), "Promoción", "Newsletter", "Anuncio"])));
        }
    }, [isOpen, template.categories]);

    const handleAddNewCategory = () => {
        const trimmed = newCategory.trim();
        if (trimmed && !allCategories.includes(trimmed)) {
            const updatedCategories = [...allCategories, trimmed];
            setAllCategories(updatedCategories);
            setSelectedCategories([...selectedCategories, trimmed]);
            setNewCategory('');
        }
    };

    const handleCategoryToggle = (category: string, checked: boolean) => {
        if (checked) {
            setSelectedCategories(prev => [...prev, category]);
        } else {
            setSelectedCategories(prev => prev.filter(c => c !== category));
        }
    };

    const handleSave = () => {
        startSaving(async () => {
            const result = await updateTemplateCategories(template.id, selectedCategories);
            if(result.success) {
                toast({ title: 'Éxito', description: 'Categorías actualizadas.', className: 'bg-green-500 text-white' });
                onTemplateUpdate();
                onOpenChange(false);
            } else {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
            }
        });
    }

    return (
         <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Gestionar Categorías</DialogTitle>
                    <DialogDescription>
                        Asigna categorías a tu plantilla &quot;{template.name}&quot; para una mejor organización.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium">Categorías Existentes</h4>
                        <div className="max-h-40 overflow-y-auto pr-2 space-y-2">
                            {allCategories.map(category => (
                                <div key={category} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={category}
                                        checked={selectedCategories.includes(category)}
                                        onCheckedChange={(checked) => handleCategoryToggle(category, !!checked)}
                                    />
                                    <label htmlFor={category} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {category}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-medium">Crear Nueva Categoría</h4>
                        <div className="flex gap-2">
                             <Input 
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Ej: Ventas Q4"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddNewCategory()}
                             />
                             <Button onClick={handleAddNewCategory} size="icon" variant="outline">
                                <PlusCircle className="size-4"/>
                             </Button>
                        </div>
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
    );
}
