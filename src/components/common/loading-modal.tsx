
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { BrainCircuit, Loader, Save, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadingModalVariant = 'generate' | 'save' | 'upload' | 'login';

const variantConfig = {
  generate: {
    icon: BrainCircuit,
    title: "La IA está pensando",
    description: "Analizando patrones y generando insights para ti.",
  },
  save: {
    icon: Save,
    title: "Guardando Cambios",
    description: "Tu trabajo está siendo almacenado de forma segura.",
  },
  upload: {
    icon: UploadCloud,
    title: "Subiendo Archivo",
    description: "Por favor espera mientras tu archivo se sube a la nube.",
  },
  login: {
    icon: Loader,
    title: "Iniciando Sesión",
    description: "Verificando tus credenciales. Un momento...",
  },
};

interface LoadingModalProps {
  isOpen: boolean;
  variant?: LoadingModalVariant;
}

export function LoadingModal({ isOpen, variant = 'generate' }: LoadingModalProps) {
  const { icon: Icon, title, description } = variantConfig[variant];

  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="sm:max-w-md bg-card/80 backdrop-blur-sm border-none p-0 overflow-hidden"
        showCloseButton={false}
      >
        <div className="p-8 text-center flex flex-col items-center">
          <Icon className="size-16 text-primary mb-4 animate-pulse" />
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </div>
        <div className="h-2 w-full bg-primary/20 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-accent animate-indeterminate-progress"></div>
        </div>
        <style jsx>{`
          @keyframes indeterminate-progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-indeterminate-progress {
            animation: indeterminate-progress 1.5s infinite ease-in-out;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
