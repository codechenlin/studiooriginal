
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Bot, Check, FileText, Mail, Sparkles, Wand2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const steps = [
  {
    title: "Información de Campaña",
    description: "Nombra tu campaña para identificarla fácilmente.",
  },
  {
    title: "Tipo de Campaña",
    description: "Elige el tipo de contenido para tu correo.",
  },
  {
    title: "Audiencia",
    description: "Selecciona los destinatarios de tu campaña.",
  },
  {
    title: "Contenido",
    description: "Diseña tu correo y escribe tu mensaje.",
  },
  {
    title: "Revisión y envío",
    description: "Confirma los detalles y envía tu campaña.",
  },
];

export default function CreateCampaignPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState<'regular' | 'plaintext' | null>(null);

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 0) {
      return campaignName.trim() === '';
    }
    if (currentStep === 1) {
      return campaignType === null;
    }
    return false;
  };
  
  const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground flex items-center gap-2">
            <Wand2 className="size-8"/>
            Crear Nueva Campaña
          </h1>
          <p className="text-muted-foreground">Sigue los pasos para configurar y lanzar tu próxima campaña exitosa.</p>
        </div>
      </div>
      
      <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
        <CardHeader>
           <Progress value={progressValue} className="mb-4 h-2" />
           <div className="flex items-center gap-2">
             <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Bot size={18} />
             </div>
             <div>
                <CardTitle>{steps[currentStep].title}</CardTitle>
                <CardDescription>{steps[currentStep].description}</CardDescription>
             </div>
           </div>
        </CardHeader>
        <CardContent className="min-h-[300px]">
            <div>
              {currentStep === 0 && (
                <div className="max-w-lg mx-auto space-y-4 pt-8">
                   <Label htmlFor="campaignName" className="text-lg font-medium flex items-center gap-2">
                     <Sparkles className="text-accent"/>
                     Nombre de la Campaña
                   </Label>
                   <Input
                    id="campaignName"
                    type="text"
                    placeholder="Ej: Lanzamiento de Verano"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="py-6 text-lg"
                  />
                  <p className="text-xs text-muted-foreground">Este nombre es solo para tu referencia interna.</p>
                </div>
              )}
               {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-4">
                    <button
                        onClick={() => setCampaignType('regular')}
                        className={cn(
                            "p-6 border-2 rounded-lg text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex items-start gap-4",
                            campaignType === 'regular' ? 'border-primary shadow-primary/20' : 'border-border'
                        )}
                        >
                        <div className="p-3 rounded-full bg-primary/10">
                            <Mail className="size-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">Constructor</h3>
                            <p className="text-muted-foreground text-sm">Campaña con contenido de correo HTML, además de imágenes y enlaces. Este es el tipo más común.</p>
                        </div>
                        {campaignType === 'regular' && <Check className="size-6 text-primary" />}
                    </button>
                    <button
                        onClick={() => setCampaignType('plaintext')}
                        className={cn(
                            "p-6 border-2 rounded-lg text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex items-start gap-4",
                            campaignType === 'plaintext' ? 'border-accent shadow-accent/20' : 'border-border'
                        )}
                        >
                        <div className="p-3 rounded-full bg-accent/10">
                            <FileText className="size-6 text-accent" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">Texto Plano</h3>
                            <p className="text-muted-foreground text-sm">Envía un correo de texto plano sin seguimiento de enlaces, imágenes o HTML.</p>
                        </div>
                        {campaignType === 'plaintext' && <Check className="size-6 text-accent" />}
                    </button>
                </div>
              )}
            </div>
        </CardContent>
        <div className="flex justify-between p-6 border-t border-border/40">
            <Button
              variant="outline"
              onClick={goToPrevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2" />
              Anterior
            </Button>
            <Button
              onClick={goToNextStep}
              disabled={isNextDisabled()}
              className="bg-gradient-to-r from-primary to-accent/80 hover:opacity-90 transition-opacity"
            >
              Siguiente
              <ArrowRight className="ml-2" />
            </Button>
          </div>
      </Card>
    </main>
  );
}
