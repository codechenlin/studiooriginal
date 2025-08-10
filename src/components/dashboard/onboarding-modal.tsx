
"use client";

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X, LayoutDashboard, Mails, Users, LayoutTemplate, Zap, Server, Plug, Code, Settings, Bell, Sun, Moon, User as UserIcon, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import { Progress } from '../ui/progress';

const onboardingSteps = [
  {
    title: "¡Bienvenido a Mailflow AI!",
    description: "Este es tu Dashboard o centro de control. Desde aquí, podrás gestionar tus campañas, analizar resultados y optimizar tu estrategia con el poder de la IA.",
    image: "https://placehold.co/600x400.png",
    aiHint: "dashboard analytics",
    icon: LayoutDashboard,
  },
  {
    title: "Gestión de Campañas",
    description: "Busca la opción 'Campaña' en el menú lateral. Aquí podrás crear nuevos envíos de correo desde cero o ver el historial de todas tus campañas pasadas.",
    image: "https://placehold.co/600x400.png",
    aiHint: "email campaign list",
    icon: Mails,
  },
  {
    title: "Administra tus Listas",
    description: "En 'Lista', puedes importar, crear y segmentar tus listas de contactos. Una buena gestión de tu audiencia es clave para el éxito.",
    image: "https://placehold.co/600x400.png",
    aiHint: "contact list interface",
    icon: Users,
  },
  {
    title: "Plantillas de Correo",
    description: "En la sección 'Plantillas', puedes diseñar, guardar y reutilizar tus correos para ahorrar tiempo y mantener una imagen de marca consistente.",
    image: "https://placehold.co/600x400.png",
    aiHint: "email template builder",
    icon: LayoutTemplate,
  },
  {
    title: "Automatización Inteligente",
    description: "Con 'Automatización', crea flujos de trabajo que se disparan por acciones del usuario, como correos de bienvenida o recordatorios de carritos abandonados.",
    image: "https://placehold.co/600x400.png",
    aiHint: "automation workflow nodes",
    icon: Zap,
  },
   {
    title: "Configura tus Servidores",
    description: "En 'Servidores', conecta tus propios proveedores de envío de correo (como AWS, SendGrid, etc.) para gestionar tus envíos de forma centralizada.",
    image: "https://placehold.co/600x400.png",
    aiHint: "server configuration screen",
    icon: Server,
  },
  {
    title: "Integración y API",
    description: "Las secciones 'Integración' y 'API Campaña' son para usuarios avanzados que deseen conectar Mailflow AI con otras aplicaciones o servicios externos.",
    image: "https://placehold.co/600x400.png",
    aiHint: "api code integration",
    icon: Plug,
  },
  {
    title: "Ajustes Generales",
    description: "En 'Ajustes', podrás configurar las preferencias generales de la aplicación para adaptarla a tus necesidades y flujo de trabajo.",
    image: "https://placehold.co/600x400.png",
    aiHint: "application settings page",
    icon: Settings,
  },
  {
    title: "Notificaciones y Tema",
    description: "Los botones de campana y luna/sol te permiten ver notificaciones importantes y personalizar la apariencia entre modo claro y oscuro.",
    image: "https://placehold.co/600x400.png",
    aiHint: "notification bell icon",
    icon: Bell,
  },
  {
    title: "Tu Perfil de Usuario",
    description: "En la parte inferior del menú, puedes acceder a tu perfil para gestionar tus datos personales, ver tu plan y cerrar sesión de forma segura.",
    image: "https://placehold.co/600x400.png",
    aiHint: "user profile dropdown",
    icon: UserIcon,
  },
  {
    title: "¡Todo Listo para Empezar!",
    description: "Has completado el recorrido. Ahora estás listo para crear tu primera campaña y llevar tu email marketing al siguiente nivel. ¡Mucho éxito!",
    image: "https://placehold.co/600x400.png",
    aiHint: "rocket launch space",
    icon: null,
  }
];

type OnboardingModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function OnboardingModal({ isOpen, onOpenChange }: OnboardingModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);

  const cleanUrl = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('welcome');
    const newUrl = newParams.size > 0 ? `${pathname}?${newParams.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  };
  
  const handleClose = () => {
    onOpenChange(false);
    cleanUrl();
    // Reset step for next time it opens
    setTimeout(() => setCurrentStep(0), 300);
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
  const CurrentIcon = onboardingSteps[currentStep].icon;
  
  // Reset step when modal is re-opened
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[625px] p-0 overflow-hidden border-2 border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/10">
         <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: "url(/bg-pattern.svg)", backgroundPosition: 'center' }}/>
         <div className="p-1.5 relative">
            <DialogHeader className="pt-6 px-6">
                <DialogTitle className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground flex items-center gap-2">
                     {CurrentIcon && <CurrentIcon className="size-7 text-primary" />}
                    <span>{onboardingSteps[currentStep].title}</span>
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
                    <Button variant="outline" onClick={handleClose} className="hover:bg-[#F00000] hover:text-white">Cancelar</Button>
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
