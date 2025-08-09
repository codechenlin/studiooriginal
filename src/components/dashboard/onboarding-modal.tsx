
"use client";

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import Image from 'next/image';
import { Progress } from '../ui/progress';

const onboardingSteps = [
  {
    title: "¡Bienvenido a Mailflow AI!",
    description: "Este es tu centro de control. Desde aquí, podrás gestionar tus campañas, analizar resultados y optimizar tu estrategia de email marketing con el poder de la IA.",
    image: "https://placehold.co/600x400.png",
    aiHint: "dashboard overview"
  },
  {
    title: "Menú de Navegación",
    description: "En la barra lateral izquierda encontrarás todas las herramientas principales: campañas, listas de contactos, plantillas, automatizaciones y mucho más. ¡Explóralas!",
    image: "https://placehold.co/600x400.png",
    aiHint: "application sidebar"
  },
  {
    title: "Selector de Tema y Notificaciones",
    description: "Personaliza tu experiencia cambiando entre el modo oscuro y claro. El botón de campana te mantendrá al tanto de las notificaciones importantes.",
    image: "https://placehold.co/600x400.png",
    aiHint: "dark mode toggle"
  },
  {
    title: "Gestión de tu Perfil",
    description: "En la parte inferior del menú, puedes acceder a los ajustes de tu cuenta, ver tu perfil y cerrar sesión de forma segura. ¡Mantén tus datos actualizados!",
    image: "https://placehold.co/600x400.png",
    aiHint: "user profile"
  },
  {
    title: "¡Todo Listo para Empezar!",
    description: "Has completado el recorrido inicial. Ahora estás listo para crear tu primera campaña y llevar tu email marketing al siguiente nivel. ¡Mucho éxito!",
    image: "https://placehold.co/600x400.png",
    aiHint: "rocket launch"
  }
];

export function OnboardingModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  const cleanUrl = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('welcome');
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };
  
  const handleClose = () => {
    setIsOpen(false);
    cleanUrl();
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const progressValue = ((currentStep + 1) / onboardingSteps.length) * 100;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[625px] p-0 overflow-hidden border-2 border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/10">
         <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: "url(/bg-pattern.svg)", backgroundPosition: 'center' }}/>
         <div className="p-1.5 relative">
            <DialogHeader className="pt-6 px-6">
                <DialogTitle className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                    {onboardingSteps[currentStep].title}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-base">
                    {onboardingSteps[currentStep].description}
                </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/50 shadow-inner">
                    <Image 
                        src={onboardingSteps[currentStep].image} 
                        alt={onboardingSteps[currentStep].title} 
                        fill 
                        className="object-cover"
                        data-ai-hint={onboardingSteps[currentStep].aiHint}
                    />
                </div>
            </div>
            <DialogFooter className="px-6 pb-6 sm:justify-between items-center w-full">
                <Progress value={progressValue} className="w-full sm:w-1/3 h-2" indicatorClassName="bg-gradient-to-r from-success-start to-success-end" />
                <div className="flex gap-2 justify-end w-full sm:w-auto pt-4 sm:pt-0">
                    <Button variant="outline" onClick={handleClose}>Cancelar</Button>
                    <Button 
                        onClick={handleNext} 
                        className="bg-gradient-to-r from-primary to-accent/80 hover:opacity-90 transition-opacity"
                    >
                      {isLastStep ? 'Finalizar' : 'Siguiente'} <ArrowRight className="ml-2 size-4" />
                    </Button>
                </div>
            </DialogFooter>
         </div>
      </DialogContent>
    </Dialog>
  );
}
