
'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brush, AlertTriangle, User, Calendar, Tags, Check, FileSignature, Eye } from 'lucide-react';
import { type TemplateWithAuthor, renameTemplate } from '@/app/dashboard/templates/actions';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryManagerModal } from './category-manager-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TemplateRenderer } from './template-renderer';
import { TemplatePreviewModal } from './template-preview-modal';

interface TemplateCardProps {
    template: TemplateWithAuthor;
    onTemplateUpdate: () => void;
}

export function TemplateCard({ template, onTemplateUpdate }: TemplateCardProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isRenaming, setIsRenaming] = useState(false);
    const [isConfirmingEdit, setIsConfirmingEdit] = useState(false);
    const [isManagingCategories, setIsManagingCategories] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [newName, setNewName] = useState(template.name);
    const [isSaving, startSaving] = useTransition();

    const authorName = template.profiles?.full_name || 'Desconocido';
    const authorAvatar = template.profiles?.avatar_url;

    const handleRename = async () => {
        if (!newName.trim() || newName === template.name) {
            setIsRenaming(false);
            return;
        }
        startSaving(async () => {
            const result = await renameTemplate(template.id, newName);
            if (result.success) {
                toast({
                    title: '¡Éxito!',
                    description: 'Plantilla renombrada correctamente.',
                    className: 'bg-green-500 text-white'
                });
                onTemplateUpdate();
            } else {
                toast({
                    title: 'Error',
                    description: result.error,
                    variant: 'destructive',
                });
            }
            setIsRenaming(false);
        });
    }

    const handleEdit = () => {
        router.push(`/dashboard/templates/create?id=${template.id}`);
    }

    return (
        <>
            <Card className="overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1 flex flex-col">
                <CardContent className="p-0">
                    <div className="aspect-video bg-muted/30 relative flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full transform scale-[0.25] origin-top-left pointer-events-none">
                          <TemplateRenderer content={template.content} />
                        </div>
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 sm:gap-4">
                           <Button size="icon" className="rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-white/10 backdrop-blur-sm hover:bg-white/20" onClick={() => setIsPreviewing(true)}>
                                <Eye className="text-white"/>
                            </Button>
                            <Button size="icon" className="rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-white/10 backdrop-blur-sm hover:bg-white/20" onClick={() => setIsConfirmingEdit(true)}>
                                <Brush className="text-white"/>
                            </Button>
                            <Button size="icon" className="rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-white/10 backdrop-blur-sm hover:bg-white/20" onClick={() => setIsRenaming(true)}>
                                <FileSignature className="text-white"/>
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter 
                    className="p-4 flex flex-col items-start gap-3 bg-card/50 cursor-pointer flex-grow"
                    onClick={() => setIsManagingCategories(true)}
                >
                    <p className="font-semibold text-lg truncate w-full">{template.name}</p>
                    <div className="w-full text-xs text-muted-foreground space-y-2 mt-auto">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={authorAvatar || ''} alt={authorName} />
                                <AvatarFallback><User className="size-3"/></AvatarFallback>
                            </Avatar>
                            <span>{authorName}</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <Calendar className="size-4"/>
                            <span title={format(new Date(template.updated_at), "d 'de' MMMM, yyyy 'a las' HH:mm")}>
                                {formatDistanceToNow(new Date(template.updated_at), { addSuffix: true, locale: es })}
                            </span>
                        </div>
                         <div className="flex items-center gap-2 flex-wrap">
                            <Tags className="size-4"/>
                             {template.categories && template.categories.length > 0 ? (
                                template.categories.map(cat => <Badge key={cat} variant="secondary">{cat}</Badge>)
                             ) : (
                                <span>Sin categoría</span>
                             )}
                        </div>
                    </div>
                </CardFooter>
            </Card>

            {/* Rename Modal */}
            <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Renombrar Plantilla</DialogTitle>
                        <DialogDescription>Ingresa el nuevo nombre para tu plantilla.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input 
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRenaming(false)}>Cancelar</Button>
                        <Button onClick={handleRename} disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Edit Modal */}
            <Dialog open={isConfirmingEdit} onOpenChange={setIsConfirmingEdit}>
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Brush/> Editar Plantilla</DialogTitle>
                        <DialogDescription>
                           Serás redirigido al editor para modificar la plantilla &quot;{template.name}&quot;. ¿Deseas continuar?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmingEdit(false)}>Cancelar</Button>
                        <Button onClick={handleEdit}><Check className="mr-2"/>Sí, editar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Category Manager Modal */}
            <CategoryManagerModal 
                isOpen={isManagingCategories}
                onOpenChange={setIsManagingCategories}
                template={template}
                onTemplateUpdate={onTemplateUpdate}
            />

            {/* Preview Modal */}
            <TemplatePreviewModal 
              isOpen={isPreviewing}
              onOpenChange={setIsPreviewing}
              template={template}
            />
        </>
    );
}

export function TemplateCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <Skeleton className="aspect-video w-full" />
            </CardContent>
            <CardFooter className="p-4 flex flex-col items-start gap-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
            </CardFooter>
        </Card>
    );
}
