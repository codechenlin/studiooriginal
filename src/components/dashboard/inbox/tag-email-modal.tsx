
"use client";

import React, { useState } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { Check, PlusCircle, Tag, Tags, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColorPickerAdvanced } from '../color-picker-advanced';

interface TagEmailModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const existingTags = [
  { id: '1', name: 'Importante', color: '#ef4444' },
  { id: '2', name: 'Seguimiento', color: '#f97316' },
  { id: '3', name: 'Proyecto Alpha', color: '#3b82f6' },
  { id: '4', name: 'Facturas', color: '#16a34a' },
];

export function TagEmailModal({ isOpen, onOpenChange }: TagEmailModalProps) {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#8b5cf6');
  const [selectedExistingTag, setSelectedExistingTag] = useState<string | null>(null);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  const isCreatingNew = newTagName !== '' || newTagColor !== '#8b5cf6';

  const handleCancel = () => {
    if (isCreatingNew) {
      setIsConfirmCancelOpen(true);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setIsConfirmCancelOpen(false);
    // Reset state after closing animation
    setTimeout(() => {
      setNewTagName('');
      setNewTagColor('#8b5cf6');
      setSelectedExistingTag(null);
    }, 300);
  };
  
  const handleSelectExisting = (tagId: string) => {
    setSelectedExistingTag(tagId);
    setNewTagName('');
    setNewTagColor('#8b5cf6');
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl w-full h-[450px] flex p-0 gap-0 bg-zinc-900/90 backdrop-blur-xl border border-cyan-400/20 text-white overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>Etiquetar Correo</DialogTitle>
              <DialogDescription>
                Aplica una etiqueta existente o crea una nueva para organizar este correo.
              </DialogDescription>
            </DialogHeader>
           <style>{`
                .info-grid {
                    background-image:
                        linear-gradient(to right, hsl(190 100% 50% / 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, hsl(190 100% 50% / 0.1) 1px, transparent 1px);
                    background-size: 2rem 2rem;
                }
                .scan-line-info {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: radial-gradient(ellipse 50% 100% at 50% 0%, hsl(190 100% 50% / 0.5), transparent 80%);
                    animation: scan-info 5s infinite linear;
                }
                @keyframes scan-info {
                    0% { transform: translateY(-10px); }
                    100% { transform: translateY(100vh); }
                }
            `}</style>
          <div className="w-2/5 flex flex-col border-r border-cyan-400/20 bg-black/30 p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Tags className="text-cyan-400" />
              Etiquetas Existentes
            </h3>
            <ScrollArea className="flex-1 -mr-4 pr-4 custom-scrollbar">
              <div className="space-y-2">
                {existingTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleSelectExisting(tag.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg flex items-center justify-between transition-all duration-200 border-2",
                      selectedExistingTag === tag.id
                        ? "bg-cyan-500/20 border-cyan-400"
                        : "bg-black/20 border-transparent hover:bg-cyan-500/10 hover:border-cyan-400/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="size-4 rounded-full" style={{ backgroundColor: tag.color }} />
                      <span className="font-medium text-sm">{tag.name}</span>
                    </div>
                    {selectedExistingTag === tag.id && <Check className="size-5 text-cyan-300" />}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="w-3/5 flex flex-col relative overflow-hidden info-grid p-6">
             <div className="scan-line-info" />
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 z-10">
              <PlusCircle className="text-cyan-400" />
              Crear Nueva Etiqueta
            </h3>
            <div className="space-y-6 flex-1 flex flex-col z-10">
              <div>
                <Label htmlFor="tag-name">Nombre de la Etiqueta</Label>
                <Input
                  id="tag-name"
                  value={newTagName}
                  onChange={(e) => {
                    setNewTagName(e.target.value);
                    setSelectedExistingTag(null);
                  }}
                  placeholder="Ej: Prioridad Alta"
                  className="mt-1 bg-black/30 border-cyan-400/30"
                />
              </div>
              <div className="flex-1">
                <Label>Color de la Etiqueta</Label>
                 <ColorPickerAdvanced
                    color={newTagColor}
                    setColor={(color) => {
                        setNewTagColor(color);
                        setSelectedExistingTag(null);
                    }}
                    className="mt-1"
                />
              </div>
              <div>
                <Label>Vista Previa</Label>
                <div className="p-3 rounded-lg bg-black/30 border border-cyan-400/20 mt-1 flex justify-center">
                   <div
                    className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                    style={{
                      backgroundColor: newTagColor,
                      color: '#ffffff', // Simple text color for preview
                      border: `1px solid rgba(255, 255, 255, 0.5)`
                    }}
                  >
                    <Tag className="size-4" />
                    {newTagName || 'NombreEtiqueta'}
                  </div>
                </div>
              </div>
            </div>
             <DialogFooter className="pt-6 z-10">
                <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleCancel}>Cancelar</Button>
                <Button className="bg-cyan-600 hover:bg-cyan-500 text-white">Guardar Etiqueta</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isConfirmCancelOpen} onOpenChange={setIsConfirmCancelOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Descartar cambios?</AlertDialogTitle>
                <AlertDialogDescription>
                    Has empezado a crear una nueva etiqueta. Si cancelas, se perderá la información no guardada.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Continuar editando</AlertDialogCancel>
                <AlertDialogAction onClick={handleClose} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Sí, descartar
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
