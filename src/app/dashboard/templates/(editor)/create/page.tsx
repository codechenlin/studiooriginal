
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Square,
  Type,
  Image as ImageIcon,
  Columns,
  Minus,
  ArrowLeft,
  ChevronsUpDown,
  Laptop,
  Smartphone,
  Undo,
  Redo,
  Save,
  Rocket,
  Palette,
  Bold,
  Italic,
  Underline,
  Heading1,
} from 'lucide-react';

const contentBlocks = [
  { name: "Columns", icon: Columns },
  { name: "Heading", icon: Heading1 },
  { name: "Text", icon: Type },
  { name: "Image", icon: ImageIcon },
  { name: "Button", icon: Square },
  { name: "Separator", icon: Minus },
];

export default function CreateTemplatePage() {
  return (
    <div className="flex h-screen max-h-screen bg-transparent text-foreground overflow-hidden">
      {/* Left Panel: Content & Blocks */}
      <aside className="w-80 border-r border-border/20 flex flex-col bg-card/5">
        <header className="flex items-center justify-between p-2 border-b bg-card/5 border-border/20 backdrop-blur-sm h-[61px]">
            <div className="flex items-center gap-2">
                <Input defaultValue="Plantilla sin título" className="text-lg font-semibold border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-auto bg-transparent"/>
            </div>
        </header>
        <ScrollArea className="flex-1">
          <div className="p-4 grid grid-cols-2 gap-4">
            {contentBlocks.map((block) => (
              <Card 
                key={block.name} 
                className="group bg-card/5 border-black/20 dark:border-border/20 flex flex-col items-center justify-center p-4 aspect-square cursor-grab transition-all hover:bg-primary/10 hover:border-black/50 dark:hover:border-primary/50 hover:shadow-lg"
              >
                <block.icon className="size-8 text-[#00B0F0] transition-colors" />
                <span className="text-sm font-medium text-center text-foreground/80">{block.name}</span>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Center Panel: Editor/Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-2 border-b bg-card/5 border-border/20 backdrop-blur-sm h-[61px] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Undo/></Button>
            <Button variant="ghost" size="icon"><Redo/></Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Laptop/></Button>
            <Button variant="ghost" size="icon"><Smartphone/></Button>
          </div>
          <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-xs"><ArrowLeft className="mr-1"/> Volver</Button>
               <div className="group rounded-md p-0.5 bg-transparent hover:bg-gradient-to-r from-[#00CE07] to-[#A6EE00] transition-colors">
                   <Button variant="outline" size="sm" className="bg-transparent text-foreground dark:text-white hover:bg-transparent hover:text-black dark:hover:text-white">
                      <Save className="mr-1"/> Guardar
                  </Button>
              </div>
               <div className="group rounded-md p-0.5 bg-gradient-to-r from-primary to-accent/80 transition-colors">
                  <Button className="bg-card/20 dark:bg-card/20 hover:bg-card/30 dark:hover:bg-card/30 text-foreground">
                      <Rocket className="mr-2"/> Publicar
                  </Button>
              </div>
          </div>
        </header>

        <div className="flex-1 bg-transparent p-8 overflow-auto">
            <div className="bg-card/5 max-w-3xl mx-auto shadow-2xl rounded-lg h-[1200px] p-8">
               <div className="border-2 border-dashed border-border/30 rounded-lg h-full flex items-center justify-center text-muted-foreground">
                   <p>Arrastra un bloque para empezar a construir tu plantilla.</p>
               </div>
            </div>
        </div>
      </main>

      {/* Right Panel: Style & Configuration */}
      <aside className="w-80 border-l border-border/20 flex flex-col bg-card/5">
         <header className="h-[61px] border-b border-border/20 flex-shrink-0">
             <Tabs defaultValue="style" className="flex-1 flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-2 m-2 bg-card/10 border-border/20">
                    <TabsTrigger value="style"><Palette className="mr-2"/> Estilo</TabsTrigger>
                    <TabsTrigger value="config"><ChevronsUpDown className="mr-2"/> Capas</TabsTrigger>
                </TabsList>
             </Tabs>
         </header>
         <Separator className="bg-border/20" />
         <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground/80">Dimensiones</h3>
                  <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                          <div><Label>Ancho</Label><Input className="bg-transparent border-border/50" placeholder="600px"/></div>
                          <div><Label>Alto</Label><Input className="bg-transparent border-border/50" placeholder="Auto"/></div>
                      </div>
                      <div><Label>Padding</Label><Input className="bg-transparent border-border/50" placeholder="16px"/></div>
                  </div>
              </div>

              <Separator className="bg-border/20" />

              <div className="space-y-4">
                   <h3 className="text-sm font-medium text-foreground/80">Tipografía</h3>
                   <div className="space-y-4">
                      <div>
                          <Label>Fuente</Label>
                          <Select>
                              <SelectTrigger className="bg-transparent border-border/50"><SelectValue placeholder="Seleccionar fuente" /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="arial">Arial</SelectItem>
                                  <SelectItem value="helvetica">Helvetica</SelectItem>
                                  <SelectItem value="georgia">Georgia</SelectItem>
                                  <SelectItem value="times">Times New Roman</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <div><Label>Tamaño</Label><Input className="bg-transparent border-border/50" placeholder="16px"/></div>
                          <div><Label>Peso</Label><Input className="bg-transparent border-border/50" placeholder="Normal"/></div>
                      </div>
                       <div className="grid grid-cols-3 gap-1">
                          <Button variant="outline" size="sm" className="bg-transparent border-border/50"><Bold/></Button>
                          <Button variant="outline" size="sm" className="bg-transparent border-border/50"><Italic/></Button>
                          <Button variant="outline" size="sm" className="bg-transparent border-border/50"><Underline/></Button>
                      </div>
                   </div>
              </div>

              <Separator className="bg-border/20" />

              <div className="space-y-4">
                 <h3 className="text-sm font-medium text-foreground/80">Fondo y Borde</h3>
                 <div className="space-y-4">
                      <div><Label>Color de Fondo</Label><Input className="bg-transparent border-border/50" placeholder="#000000"/></div>
                      <div><Label>Color de Borde</Label><Input className="bg-transparent border-border/50" placeholder="#333333"/></div>
                      <div><Label>Radio del Borde</Label><Slider defaultValue={[8]} max={40} step={1} /></div>
                 </div>
              </div>
          </div>
         </ScrollArea>
      </aside>
    </div>
  );
}
