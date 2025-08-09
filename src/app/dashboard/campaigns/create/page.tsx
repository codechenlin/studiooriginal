
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Bot, Check, FileText, Mail, Sparkles, Wand2, Users, User, PlusCircle, List, Send, Search, Paperclip, FileImage, Server, XCircle, ChevronDown, CheckCircle, Tag, LayoutGrid, Eye, Pencil } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

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
    title: "Audiencia y Servidor",
    description: "Selecciona los destinatarios y el proveedor de envío.",
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

const servers = [
    { id: 'aws', name: 'AWS', connected: false },
    { id: 'mailgun', name: 'Mailgun', connected: false },
    { id: 'sendgrid', name: 'SendGrid', connected: false },
    { id: 'elasticemail', name: 'Elastic Email', connected: false },
    { id: 'blastengine', name: 'Blastengine', connected: false },
    { id: 'sparkpost', name: 'Sparkpost', connected: false },
    { id: 'smtp', name: 'SMTP', connected: false },
];

const templates = [
    { id: 1, name: 'Lanzamiento de Producto', category: 'Marketing', preview: 'https://placehold.co/400x500.png', hint: 'product launch' },
    { id: 2, name: 'Newsletter Semanal', category: 'Noticias', preview: 'https://placehold.co/400x500.png', hint: 'modern newsletter' },
    { id: 3, name: 'Promoción Especial', category: 'Ventas', preview: 'https://placehold.co/400x500.png', hint: 'special promotion' },
    { id: 4, name: 'Confirmación de Cuenta', category: 'Transaccional', preview: 'https://placehold.co/400x500.png', hint: 'account confirmation' },
    { id: 5, name: 'Carrito Abandonado', category: 'Ventas', preview: 'https://placehold.co/400x500.png', hint: 'shopping cart' },
    { id: 6, name: 'Anuncio de Evento', category: 'Marketing', preview: 'https://placehold.co/400x500.png', hint: 'event announcement' },
    { id: 7, name: 'Bienvenida a Nuevos Usuarios', category: 'Transaccional', preview: 'https://placehold.co/400x500.png', hint: 'welcome email' },
    { id: 8, name: 'Artículo de Blog', category: 'Noticias', preview: 'https://placehold.co/400x500.png', hint: 'blog post' },
    { id: 9, name: 'Encuesta de Satisfacción', category: 'Feedback', preview: 'https://placehold.co/400x500.png', hint: 'customer survey' },
    { id: 10, name: 'Feliz Cumpleaños', category: 'Personalizado', preview: 'https://placehold.co/400x500.png', hint: 'birthday celebration' },
];

export default function CreateCampaignPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState<'regular' | 'plaintext' | null>(null);
  const [audienceType, setAudienceType] = useState<'list' | 'single' | null>(null);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

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
    if (currentStep === 0) return campaignName.trim() === '';
    if (currentStep === 1) return campaignType === null;
    if (currentStep === 2) return audienceType === null || selectedServer === null;
    if (currentStep === 3) return selectedTemplate === null;
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
           <Progress value={progressValue} className="mb-4 h-2" indicatorClassName="bg-gradient-to-r from-[#1700E6] to-[#009AFF]" />
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
        <CardContent className="min-h-[400px]">
            <div>
              {currentStep === 0 && (
                <div className="max-w-lg mx-auto space-y-4 pt-8">
                   <Label htmlFor="campaignName" className="text-lg font-medium flex items-center gap-2">
                     <Sparkles className="text-accent" style={{color: 'hsl(var(--accent-light-mode-override))'}}/>
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
                        className={cn( "p-6 border-2 rounded-lg text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex items-start gap-4", campaignType === 'regular' ? 'border-[#00EF10] shadow-[0_0_15px_#00EF1040]' : 'border-border' )}
                        >
                        <div className="p-3 rounded-full bg-accent/10"> <Mail className="size-6 text-accent" style={{color: 'hsl(var(--accent-light-mode-override))'}}/> </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">Constructor</h3>
                            <p className="text-muted-foreground text-sm">Campaña con contenido de correo HTML, además de imágenes y enlaces. Este es el tipo más común.</p>
                        </div>
                        {campaignType === 'regular' && <Check className="size-6 text-[#00EF10]" />}
                    </button>
                    <button
                        onClick={() => setCampaignType('plaintext')}
                        className={cn( "p-6 border-2 rounded-lg text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex items-start gap-4", campaignType === 'plaintext' ? 'border-[#00EF10] shadow-[0_0_15px_#00EF1040]' : 'border-border' )}
                        >
                        <div className="p-3 rounded-full bg-accent/10"> <FileText className="size-6 text-accent" style={{color: 'hsl(var(--accent-light-mode-override))'}}/> </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">Texto Plano</h3>
                            <p className="text-muted-foreground text-sm">Envía un correo de texto plano sin seguimiento de enlaces, imágenes o HTML.</p>
                        </div>
                        {campaignType === 'plaintext' && <Check className="size-6 text-[#00EF10]" />}
                    </button>
                </div>
              )}
               {currentStep === 2 && (
                <div className="max-w-3xl mx-auto space-y-8 pt-4">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-3"><Server className="text-primary"/>Seleccionar Servidor de Envío</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {servers.map(server => (
                                <button key={server.id} onClick={() => setSelectedServer(server.id)} className={cn("p-3 border-2 rounded-lg text-left transition-all duration-300 flex items-center gap-2 justify-between text-sm font-medium", selectedServer === server.id ? 'border-[#00EF10] shadow-[0_0_15px_#00EF1040]' : 'border-border')}>
                                    <span>{server.name}</span>
                                    {server.connected ? <CheckCircle className="size-5 text-green-500"/> : <XCircle className="size-5" style={{color: '#F00000'}}/>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative text-center my-2"> <div className="absolute inset-0 flex items-center"> <span className="w-full border-t border-dashed border-border/70" /> </div> <span className="relative bg-card px-4 text-xs text-muted-foreground uppercase">Seleccionar Audiencia</span> </div>
                  
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2"><List className="text-accent" style={{color: 'hsl(var(--accent-light-mode-override))'}}/> Enviar a una Lista de Contactos</h3>
                      <p className="text-sm text-muted-foreground">Selecciona una de tus listas de contactos para un envío masivo. Ideal para newsletters y anuncios.</p>
                       <Select onValueChange={(value) => setAudienceType('list')}>
                          <SelectTrigger className="py-6 text-base"> <SelectValue placeholder="Selecciona una lista..." /> </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="list-1">Lista de Clientes VIP (1,234 contactos)</SelectItem>
                            <SelectItem value="list-2">Suscriptores del Blog (5,678 contactos)</SelectItem>
                            <SelectItem value="list-3">Nuevos Registros - Q3 (890 contactos)</SelectItem>
                          </SelectContent>
                        </Select>
                      <Button variant="outline" size="sm" className="border-2 border-transparent hover:border-[#00EF10] hover:bg-card"> <PlusCircle className="mr-2" style={{color: 'hsl(var(--accent-light-mode-override))'}}/> Crear Nueva Lista </Button>
                  </div>
                  
                  <div className="relative text-center my-6"> <div className="absolute inset-0 flex items-center"> <span className="w-full border-t border-dashed border-border/70" /> </div> <span className="relative bg-card px-4 text-sm text-muted-foreground">O</span> </div>

                  <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2"><Send className="text-accent" style={{color: 'hsl(var(--accent-light-mode-override))'}}/> Enviar a un Destinatario Único</h3>
                      <p className="text-sm text-muted-foreground">Envía un correo electrónico a un solo contacto.</p>
                      <Input type="email" placeholder="ejemplo@dominio.com" className="py-6 text-base" onChange={() => setAudienceType('single')} />
                  </div>
                </div>
              )}
               {currentStep === 3 && (
                <div className="max-w-6xl mx-auto space-y-6 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Asunto del correo electrónico" className="py-6"/>
                        <Input placeholder="CC: admin@ejemplo.com, test@ejemplo.com" className="py-6"/>
                    </div>
                     <Button variant="outline" className="w-full md:w-auto border-2 border-transparent hover:border-[#00EF10] hover:text-foreground dark:hover:text-foreground hover:bg-transparent">
                        <Paperclip className="mr-2" style={{color: 'hsl(var(--accent-light-mode-override))'}}/> Adjuntar Archivos
                    </Button>
                    <div className="space-y-4 pt-4">
                         <div className="flex flex-col md:flex-row gap-4 justify-between">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                <Input placeholder="Buscar plantillas por nombre..." className="pl-10"/>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Filtrar por categoría"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las Categorías</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="news">Noticias</SelectItem>
                                    <SelectItem value="sales">Ventas</SelectItem>
                                    <SelectItem value="transactional">Transaccional</SelectItem>
                                    <SelectItem value="feedback">Feedback</SelectItem>
                                    <SelectItem value="personalized">Personalizado</SelectItem>
                                </SelectContent>
                            </Select>
                         </div>
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {templates.map(template => (
                                <Card key={template.id} 
                                    onClick={() => setSelectedTemplate(template.id)}
                                    className={cn(
                                        "overflow-hidden group cursor-pointer transition-all border-2",
                                        selectedTemplate === template.id ? 'border-[#00EF10] shadow-[0_0_15px_#00EF1040]' : 'border-transparent hover:shadow-primary/20 hover:border-primary'
                                    )}
                                >
                                    <CardContent className="p-0 relative">
                                        <Image src={template.preview} alt={template.name} width={400} height={500} className="object-cover transition-transform group-hover:scale-105" data-ai-hint={template.hint} />
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                                            <Button size="sm" className="w-full" style={{background: 'linear-gradient(to right, #AD00EC, #0018EC)'}}><Eye className="mr-1"/>Visualizar</Button>
                                            <Button size="sm" className="w-full" style={{background: 'linear-gradient(to right, #AD00EC, #0018EC)'}}><Pencil className="mr-1"/>Editar</Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-3 flex-col items-start">
                                        <h4 className="font-semibold text-sm truncate w-full">{template.name}</h4>
                                        <Badge variant="outline" className="mt-1 text-xs">{template.category}</Badge>
                                    </CardFooter>
                                </Card>
                            ))}
                         </div>
                    </div>
                </div>
              )}
            </div>
        </CardContent>
        <CardFooter className="flex justify-between p-6 border-t border-border/40">
            <Button 
                variant="outline" 
                onClick={goToPrevStep} 
                disabled={currentStep === 0}
                className="text-foreground hover:bg-[#F00000] hover:text-white active:bg-[#D00000] transition-colors"
            >
                <ArrowLeft className="mr-2" /> Anterior 
            </Button>
            <Button onClick={goToNextStep} disabled={isNextDisabled()} className="bg-gradient-to-r from-primary to-accent/80 hover:opacity-90 transition-opacity"> Siguiente <ArrowRight className="ml-2" /> </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
