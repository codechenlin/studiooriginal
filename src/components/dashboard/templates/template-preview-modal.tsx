
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TemplateRenderer } from './template-renderer';
import { type TemplateWithAuthor } from '@/app/dashboard/templates/actions';

interface TemplatePreviewModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    template: TemplateWithAuthor;
}

export function TemplatePreviewModal({ isOpen, onOpenChange, template }: TemplatePreviewModalProps) {
    if (!isOpen) return null;
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>Vista Previa de la Plantilla</DialogTitle>
                    <DialogDescription>Así es como se verá tu plantilla &quot;{template.name}&quot;.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 bg-muted/20">
                    <div className="p-4 sm:p-8">
                       <div className="max-w-3xl mx-auto bg-background shadow-lg rounded-lg overflow-hidden">
                          <TemplateRenderer content={template.content} />
                       </div>
                    </div>
                </ScrollArea>
                <DialogFooter className="p-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
