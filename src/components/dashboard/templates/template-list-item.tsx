
'use client';

import React, { useState, useTransition } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Brush, FileSignature, Eye, Trash2, Check } from 'lucide-react';
import { type TemplateWithAuthor, renameTemplate, updateTemplateCategories } from '@/app/dashboard/templates/actions';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { TemplatePreviewModal } from './template-preview-modal';
import { Skeleton } from '@/components/ui/skeleton';

interface TemplateListItemProps {
  template: TemplateWithAuthor;
  onTemplateUpdate: () => void;
}

export function TemplateListItem({ template, onTemplateUpdate }: TemplateListItemProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isRenaming, setIsRenaming] = useState(false);
  const [isConfirmingEdit, setIsConfirmingEdit] = useState(false);
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
        toast({ title: 'Éxito', description: 'Plantilla renombrada.' });
        onTemplateUpdate();
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
      setIsRenaming(false);
    });
  };

  const handleEdit = () => {
    router.push(`/dashboard/templates/create?id=${template.id}`);
  };

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{template.name}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={authorAvatar || ''} alt={authorName} />
              <AvatarFallback><User className="size-4" /></AvatarFallback>
            </Avatar>
            <span>{authorName}</span>
          </div>
        </TableCell>
        <TableCell>{formatDistanceToNow(new Date(template.updated_at), { addSuffix: true, locale: es })}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setIsPreviewing(true)}><Eye className="mr-2"/>Previsualizar</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsConfirmingEdit(true)}><Brush className="mr-2"/>Editar</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsRenaming(true)}><FileSignature className="mr-2"/>Renombrar</DropdownMenuItem>
              {/* <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/>Eliminar</DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      
      {/* Modals */}
      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Renombrar Plantilla</DialogTitle>
                  <DialogDescription>Ingresa el nuevo nombre para tu plantilla.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRename()}/>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRenaming(false)}>Cancelar</Button>
                  <Button onClick={handleRename} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar'}</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

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
      
      <TemplatePreviewModal 
        isOpen={isPreviewing}
        onOpenChange={setIsPreviewing}
        template={template}
      />
    </>
  );
}

export function TemplateListItemSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
            <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
            <TableCell><Skeleton className="h-5 w-2/3" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
        </TableRow>
    );
}

