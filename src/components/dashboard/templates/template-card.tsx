
'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brush, AlertTriangle, User, Calendar, Tags, Check, FileSignature, Eye, Trash2 } from 'lucide-react';
import { type TemplateWithAuthor, renameTemplate, deleteTemplate } from '@/app/dashboard/templates/actions';
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryManagerModal } from './category-manager-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TemplateRenderer } from './template-renderer';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TemplateCardProps {
    template: TemplateWithAuthor;
    allTemplates: TemplateWithAuthor[];
    onTemplateUpdate: () => void;
    onPreview: () => void;
}

export function TemplateCard({ template, allTemplates, onTemplateUpdate, onPreview }: TemplateCardProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isRenaming, setIsRenaming] = useState(false);
    const [isConfirmingEdit, setIsConfirmingEdit] = useState(false);
    const [isManagingCategories, setIsManagingCategories] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [newName, setNewName] = useState(template.name);
    const [isSaving, startSaving] = useTransition();

    const authorName = template.profiles?.full_name || 'Desconocido';
    const authorAvatar = template.profiles?.avatar_url;

    const categories = template.categories || [];
    const maxVisibleCategories = 2;
    const visibleCategories = categories.slice(0, maxVisibleCategories);
    const hiddenCategories = categories.slice(maxVisibleCategories);

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
    
    const handleDelete = async () => {
        startSaving(async () => {
            const result = await deleteTemplate(template.id);
            if (result.success) {
                toast({
                    title: 'Plantilla Eliminada',
                    description: `La plantilla "${template.name}" ha sido eliminada.`,
                });
                onTemplateUpdate();
            } else {
                toast({
                    title: 'Error al eliminar',
                    description: result.error,
                    variant: 'destructive',
                });
            }
            setIsDeleting(false);
        });
    };

    const handleEdit = () => {
        router.push(`/dashboard/templates/create?id=${template.id}`);
    }

    return (
        <>
            <Card className="overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1 flex flex-col">
                <CardContent className="p-0">
                    <div className="aspect-video bg-muted/30 relative flex items-center justify-center overflow-hidden">
                       <div className="absolute inset-0 w-full h-full">
                          <TemplateRenderer content={template.content?.slice(0, 1)} asCover />
                        </div>
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 sm:gap-4">
                           <Button size="icon" className="rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-white/10 backdrop-blur-sm hover:bg-white/20" onClick={onPreview}>
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
                <div className="p-4 flex flex-col items-start gap-3 bg-card/50 flex-grow relative">
                    <p className="font-semibold text-lg truncate w-full pr-10">{template.name}</p>
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
                             {categories.length > 0 ? (
                                <>
                                {visibleCategories.map(cat => (
                                    <Badge key={cat} style={{backgroundColor: '#1700E6'}} className="truncate max-w-[100px]">{cat}</Badge>
                                ))}
                                {hiddenCategories.length > 0 && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Badge variant="secondary">+{hiddenCategories.length}</Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{hiddenCategories.join(', ')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                </>
                             ) : (
                                <span>Sin categoría</span>
                             )}
                        </div>
                    </div>
                    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                         <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "group/c-btn size-8 bg-transparent border-2 text-[#E18700] border-[#E18700]",
                              "hover:bg-transparent hover:border-[#00CB07] hover:text-[#00CB07]",
                              "transition-colors"
                            )}
                            onClick={() => setIsManagingCategories(true)}
                          >
                            <Tags className="size-4 transition-colors text-[#E18700] group-hover/c-btn:text-[#00CB07]" />
                        </Button>
                         <Button
                            variant="ghost"
                            size="icon"
                             className={cn(
                              "group/d-btn size-8 bg-transparent border-2 text-[#F00000] border-[#F00000]",
                              "hover:bg-transparent hover:border-[#00CB07] hover:text-[#00CB07]",
                              "transition-colors"
                            )}
                            onClick={() => setIsDeleting(true)}
                          >
                            <Trash2 className="size-4 transition-colors text-[#F00000] group-hover/d-btn:text-[#00CB07]" />
                        </Button>
                    </div>
                </div>
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
            
            {/* Delete Confirmation Modal */}
            <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la plantilla &quot;{template.name}&quot; de nuestros servidores.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isSaving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isSaving ? 'Eliminando...' : 'Sí, eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            {/* Category Manager Modal */}
            <CategoryManagerModal 
                isOpen={isManagingCategories}
                onOpenChange={setIsManagingCategories}
                template={template}
                allTemplates={allTemplates}
                onTemplateUpdate={onTemplateUpdate}
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
