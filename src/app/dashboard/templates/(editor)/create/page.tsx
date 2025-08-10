
"use client";

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
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
  Pencil,
  Youtube,
  Timer,
  Smile,
  Code,
  Shapes,
  LayoutGrid,
  Box,
  PlusCircle,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Trash2,
  AlertTriangle,
  Tablet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const contentBlocks = [
  { name: "Columns", icon: Columns, id: 'columns' },
  { name: "Heading", icon: Heading1, id: 'heading' },
  { name: "Text", icon: Type, id: 'text' },
  { name: "Image", icon: ImageIcon, id: 'image' },
  { name: "Button", icon: Square, id: 'button' },
  { name: "Separator", icon: Minus, id: 'separator' },
  { name: "Video Youtube", icon: Youtube, id: 'youtube' },
  { name: "Contador", icon: Timer, id: 'timer' },
  { name: "Iconos", icon: Shapes, id: 'icons' },
  { name: "Emojis", icon: Smile, id: 'emojis' },
  { name: "Codigo HTML", icon: Code, id: 'html' },
];

const columnOptions = [
    { num: 1, icon: () => <div className="w-full h-8 bg-muted rounded-sm border border-border"></div> },
    { num: 2, icon: () => <div className="flex w-full h-8 gap-1"><div className="w-1/2 h-full bg-muted rounded-sm border border-border"></div><div className="w-1/2 h-full bg-muted rounded-sm border border-border"></div></div> },
    { num: 3, icon: () => <div className="flex w-full h-8 gap-1"><div className="w-1/3 h-full bg-muted rounded-sm border border-border"></div><div className="w-1/3 h-full bg-muted rounded-sm border border-border"></div><div className="w-1/3 h-full bg-muted rounded-sm border border-border"></div></div> },
    { num: 4, icon: () => <div className="flex w-full h-8 gap-1"><div className="w-1/4 h-full bg-muted rounded-sm border border-border"></div><div className="w-1/4 h-full bg-muted rounded-sm border border-border"></div><div className="w-1/4 h-full bg-muted rounded-sm border border-border"></div><div className="w-1/4 h-full bg-muted rounded-sm border border-border"></div></div> },
    { num: 5, icon: () => <div className="flex w-full h-8 gap-1"><div className="w-1/5 h-full bg-muted rounded-sm border border-border"></div><div className="w-1/5 h-full bg-muted rounded-sm border border-border"></div><div className="w-1/5 h-full bg-muted rounded-sm border border-border"></div><div className="w-1/5 h-full bg-muted rounded-sm border border-border"></div><div className="w-1/5 h-full bg-muted rounded-sm border border-border"></div></div> },
];

// --- STATE MANAGEMENT TYPES ---
type PrimitiveBlockType = 'heading' | 'text' | 'image' | 'button' | 'separator' | 'youtube' | 'timer' | 'icons' | 'emojis' | 'html';
type Viewport = 'desktop' | 'tablet' | 'mobile';

interface PrimitiveBlock {
  id: string;
  type: PrimitiveBlockType;
  payload: {
    [key: string]: any;
  };
}

interface Column {
  id: string;
  blocks: PrimitiveBlock[];
}

interface ColumnsBlock {
  id: string;
  type: 'columns';
  payload: {
    columns: Column[];
  };
}

type CanvasBlock = ColumnsBlock;


export default function CreateTemplatePage() {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  
  // Modals State
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [selectedColumnLayout, setSelectedColumnLayout] = useState<number | null>(null);
  const [isBlockSelectorOpen, setIsBlockSelectorOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<number | null>(null);

  
  // Canvas State
  const [canvasContent, setCanvasContent] = useState<CanvasBlock[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    setLastSaved(new Date());
  };
  
  const handleBlockClick = (blockId: string) => {
    if (blockId === 'columns') {
      setSelectedColumnLayout(null);
      setIsColumnModalOpen(true);
    }
  };

  const handleAddColumns = () => {
    if (selectedColumnLayout) {
      const newBlock: ColumnsBlock = {
        id: `block_${Date.now()}`,
        type: 'columns',
        payload: {
          columns: Array.from({ length: selectedColumnLayout }).map((_, i) => ({
            id: `col_${Date.now()}_${i}`,
            blocks: [],
          })),
        },
      };
      setCanvasContent([...canvasContent, newBlock]);
      setIsColumnModalOpen(false);
    }
  };

  const handleOpenBlockSelector = (columnId: string) => {
    setActiveColumnId(columnId);
    setIsBlockSelectorOpen(true);
  };

  const handleSelectBlockToAdd = (blockType: PrimitiveBlockType) => {
    if (!activeColumnId) return;

    const newBlock: PrimitiveBlock = {
      id: `${blockType}_${Date.now()}`,
      type: blockType,
      payload: {
        ...(blockType === 'heading' && { text: 'Título principal' }),
      },
    };

    const newCanvasContent = canvasContent.map(row => {
      const newColumns = row.payload.columns.map(col => {
        if (col.id === activeColumnId) {
          return { ...col, blocks: [...col.blocks, newBlock] };
        }
        return col;
      });
      return { ...row, payload: { columns: newColumns } };
    });

    setCanvasContent(newCanvasContent);
    setIsBlockSelectorOpen(false);
    setActiveColumnId(null);
  };
  
  const handleHeadingTextChange = (blockId: string, newText: string) => {
    const newCanvasContent = canvasContent.map(row => ({
      ...row,
      payload: {
        columns: row.payload.columns.map(col => ({
          ...col,
          blocks: col.blocks.map(block => {
            if (block.id === blockId) {
              return { ...block, payload: { ...block.payload, text: newText } };
            }
            return block;
          })
        }))
      }
    }));
    setCanvasContent(newCanvasContent);
  };

  const renderBlock = (block: PrimitiveBlock) => {
    switch(block.type) {
      case 'heading':
        return (
          <h1 
            contentEditable 
            suppressContentEditableWarning 
            onBlur={(e) => handleHeadingTextChange(block.id, e.currentTarget.textContent || '')}
            className="text-4xl font-bold w-full p-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
          >
            {block.payload.text}
          </h1>
        );
      default:
        return (
          <div className="p-2 border border-dashed rounded-md text-xs text-muted-foreground">
            Block: {block.type}
          </div>
        )
    }
  }

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    startTransition(() => {
        const newCanvasContent = [...canvasContent];
        const item = newCanvasContent.splice(index, 1)[0];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        newCanvasContent.splice(newIndex, 0, item);
        setCanvasContent(newCanvasContent);
    });
  };

  const promptDeleteBlock = (index: number) => {
    setBlockToDelete(index);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteBlock = () => {
    if (blockToDelete !== null) {
      setCanvasContent(canvasContent.filter((_, i) => i !== blockToDelete));
      setIsDeleteModalOpen(false);
      setBlockToDelete(null);
    }
  };

  const viewportClasses = {
    desktop: 'max-w-3xl', // 768px
    tablet: 'max-w-xl',  // 640px
    mobile: 'max-w-sm', // 384px
  };

  return (
    <div className="flex h-screen max-h-screen bg-transparent text-foreground overflow-hidden">
      <aside className="w-80 border-r border-r-black/10 dark:border-border/20 flex flex-col bg-card/5">
        <header className="flex items-center justify-between p-2 border-b bg-card/5 border-border/20 backdrop-blur-sm h-[61px]">
            <div className="flex items-center gap-2">
                <Input defaultValue="Plantilla sin título" className="text-lg font-semibold border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-auto bg-transparent"/>
                <Button variant="ghost" size="icon" className="size-8 shrink-0">
                  <Pencil className="size-4" />
                </Button>
            </div>
        </header>
        <ScrollArea className="flex-1 h-[calc(100vh-61px)]">
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {contentBlocks.slice(0, 6).map((block) => (
                <Card 
                  key={block.id} 
                  onClick={() => handleBlockClick(block.id)}
                  className="group bg-card/5 border-black/20 dark:border-border/20 flex flex-col items-center justify-center p-4 aspect-square cursor-pointer transition-all hover:bg-primary/10 hover:border-black/50 dark:hover:border-primary/50 hover:shadow-lg"
                >
                  <block.icon className="size-8 text-[#00B0F0] transition-colors" />
                  <span className="text-sm font-medium text-center text-foreground/80">{block.name}</span>
                </Card>
              ))}
            </div>
             <div className="mt-4 grid grid-cols-2 gap-4">
                {contentBlocks.slice(6).map((block) => (
                    <Card
                    key={block.id}
                    onClick={() => handleBlockClick(block.id)}
                    className="group bg-card/5 border-black/20 dark:border-border/20 flex flex-col items-center justify-center p-4 aspect-square cursor-pointer transition-all hover:bg-primary/10 hover:border-black/50 dark:hover:border-primary/50 hover:shadow-lg"
                    >
                    <block.icon className="size-8 text-[#00B0F0] transition-colors" />
                    <span className="text-sm font-medium text-center text-foreground/80">{block.name}</span>
                    </Card>
                ))}
            </div>
          </div>
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-2 border-b bg-card/5 border-border/20 backdrop-blur-sm h-[61px] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Undo/></Button>
            <Button variant="ghost" size="icon"><Redo/></Button>
          </div>
          <TooltipProvider>
            <div className="flex items-center gap-2 p-1 bg-card/10 rounded-lg border border-border/20">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant={viewport === 'desktop' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewport('desktop')}><Laptop/></Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Visualiza en <span className="font-bold">Escritorio</span></p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant={viewport === 'tablet' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewport('tablet')}><Tablet/></Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Mira cómo se ve en una <span className="font-bold">Tableta</span></p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant={viewport === 'mobile' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewport('mobile')}><Smartphone/></Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Comprueba la vista para <span className="font-bold">Móvil</span></p>
                    </TooltipContent>
                </Tooltip>
            </div>
          </TooltipProvider>
          <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground">
                {lastSaved
                  ? `Último guardado: ${lastSaved.toLocaleTimeString()}`
                  : "Aún sin guardar"}
              </div>
               <div className="group rounded-md p-0.5 bg-transparent hover:bg-gradient-to-r from-[#00CE07] to-[#A6EE00] transition-colors">
                   <Button variant="outline" size="sm" onClick={handleSave} className="bg-transparent text-foreground dark:text-white hover:bg-transparent hover:text-black dark:hover:text-white">
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
            <div className={cn("bg-background/80 dark:bg-zinc-900/50 dark:border dark:border-white/10 mx-auto shadow-2xl rounded-lg min-h-[1200px] p-8 transition-all duration-300 ease-in-out", viewportClasses[viewport])}>
               {canvasContent.length === 0 ? (
                 <div className="border-2 border-dashed border-border/30 dark:border-border/30 rounded-lg h-full flex items-center justify-center text-center text-muted-foreground">
                   <p>Arrastra un bloque desde el panel izquierdo para empezar a construir tu plantilla. <br/> Comienza con un bloque de 'Columns'.</p>
                 </div>
               ) : (
                <div className="space-y-2">
                  {canvasContent.map((block, index) => (
                    <div key={block.id} className={cn("group/row relative p-2 rounded-lg hover:bg-primary/5 transition-all duration-300", isPending && 'opacity-50')}>
                      <div className="absolute top-1/2 -left-8 -translate-y-1/2 flex flex-col items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity bg-card p-1.5 rounded-md border shadow-md">
                          <Button variant="ghost" size="icon" className="size-6" disabled={index === 0} onClick={() => handleMoveBlock(index, 'up')}>
                            <ArrowUp className="size-4" />
                          </Button>
                          <GripVertical className="size-5 text-muted-foreground cursor-grab" />
                          <Button variant="ghost" size="icon" className="size-6" disabled={index === canvasContent.length - 1} onClick={() => handleMoveBlock(index, 'down')}>
                            <ArrowDown className="size-4" />
                          </Button>
                      </div>

                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                         <Button variant="destructive" size="icon" className="size-7" onClick={() => promptDeleteBlock(index)}>
                            <Trash2 className="size-4" />
                         </Button>
                      </div>

                      <div className="flex gap-4">
                        {block.payload.columns.map((col) => (
                          <div key={col.id} className="flex-1 p-2 border-2 border-dashed border-transparent rounded-lg min-h-[100px] flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors">
                             {col.blocks.length > 0 ? (
                                 col.blocks.map(b => <div key={b.id} className="w-full">{renderBlock(b)}</div>)
                             ) : (
                               <Button variant="outline" size="sm" className="h-auto py-2 px-4 flex flex-col" onClick={() => handleOpenBlockSelector(col.id)}>
                                 <PlusCircle className="mb-1"/>
                                 <span className="text-xs font-medium -mb-0.5">Añadir</span>
                                 <span className="text-xs font-medium">Bloque</span>
                               </Button>
                             )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
               )}
            </div>
        </div>
      </main>

      <aside className="w-80 border-l border-l-black/10 dark:border-border/20 flex flex-col bg-card/5">
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

       <Dialog open={isColumnModalOpen} onOpenChange={setIsColumnModalOpen}>
        <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><LayoutGrid className="text-primary"/>Seleccionar Estructura de Columnas</DialogTitle>
            <DialogDescription>
              Elige cuántas secciones de columnas quieres añadir a tu plantilla. Podrás arrastrar contenido a cada sección.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {columnOptions.map(option => (
              <button
                key={option.num}
                onClick={() => setSelectedColumnLayout(option.num)}
                className={cn(
                  "w-full p-2 border-2 rounded-lg transition-all flex items-center gap-4",
                  selectedColumnLayout === option.num
                    ? 'border-primary shadow-lg'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="flex items-center justify-center p-2 bg-muted rounded-md w-12 h-12">
                   <Box className="text-primary" />
                </div>
                 <div className="flex-1 text-left">
                  <p className="font-semibold">{option.num} {option.num > 1 ? 'Columnas' : 'Columna'}</p>
                  <div className="mt-1">
                    <option.icon />
                  </div>
                </div>
                 {selectedColumnLayout === option.num && <div className="w-5 h-5 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleAddColumns} disabled={!selectedColumnLayout}>
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
       <Dialog open={isBlockSelectorOpen} onOpenChange={setIsBlockSelectorOpen}>
        <DialogContent className="sm:max-w-2xl bg-card/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><PlusCircle className="text-primary"/>Añadir un Nuevo Bloque</DialogTitle>
            <DialogDescription>
              Selecciona un bloque de contenido para añadirlo a la columna.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-3 gap-4 p-4">
                {contentBlocks.filter(b => b.id !== 'columns').map((block) => (
                  <Card 
                    key={block.id} 
                    onClick={() => handleSelectBlockToAdd(block.id as PrimitiveBlockType)}
                    className="group bg-card/5 border-black/20 dark:border-border/20 flex flex-col items-center justify-center p-4 aspect-square cursor-pointer transition-all hover:bg-primary/10 hover:border-black/50 dark:hover:border-primary/50 hover:shadow-lg"
                  >
                    <block.icon className="size-8 text-[#00B0F0] transition-colors" />
                    <span className="text-sm font-medium text-center text-foreground/80 mt-2">{block.name}</span>
                  </Card>
                ))}
              </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive"/>
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este bloque? Todos los contenidos dentro de él se perderán permanentemente. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteBlock}>
              Sí, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
