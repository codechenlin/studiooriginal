

"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Droplets,
  Paintbrush,
  XIcon,
  ArrowRight,
  Sun,
  Circle,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ColorPickerAdvanced } from '@/components/dashboard/color-picker-advanced';

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

type GradientDirection = 'vertical' | 'horizontal' | 'radial';

interface Column {
  id: string;
  blocks: PrimitiveBlock[];
  styles: {
    borderRadius?: number;
    background?: {
      type: 'solid' | 'gradient';
      color1: string;
      color2?: string;
      direction?: GradientDirection;
    }
  }
}

interface ColumnsBlock {
  id: string;
  type: 'columns';
  payload: {
    columns: Column[];
  };
}

type CanvasBlock = ColumnsBlock;
type SelectedElement = { type: 'column', columnId: string, rowId: string } | { type: 'primitive', primitiveId: string, columnId: string, rowId: string } | null;

const BackgroundEditor = ({ selectedElement, canvasContent, setCanvasContent }: {
  selectedElement: SelectedElement;
  canvasContent: CanvasBlock[];
  setCanvasContent: (content: CanvasBlock[]) => void;
}) => {
  if (!selectedElement || selectedElement.type !== 'column') return null;

  const getElement = () => {
    if (selectedElement.type === 'column') {
      const row = canvasContent.find(r => r.id === selectedElement.rowId);
      return row?.payload.columns.find(c => c.id === selectedElement.columnId);
    }
    return null;
  }
  
  const element = getElement();
  if (!element) return null;

  const { background, borderRadius } = element.styles;

  const updateStyle = (key: keyof Column['styles'], value: any) => {
    const newCanvasContent = canvasContent.map(row => {
      if (row.id !== (selectedElement as { rowId: string }).rowId) return row;
      const newColumns = row.payload.columns.map(col => {
        if (col.id === (selectedElement as { columnId: string }).columnId) {
          return { ...col, styles: { ...col.styles, [key]: value } };
        }
        return col;
      });
      return { ...row, payload: { columns: newColumns } };
    });
    setCanvasContent(newCanvasContent);
  };
  
  const setBgType = (type: 'solid' | 'gradient') => {
     updateStyle('background', {
        type,
        color1: background?.color1 || '#A020F0',
        color2: background?.color2 || '#3357FF',
        direction: background?.direction || 'vertical',
     });
  };

  const setColor = (colorProp: 'color1' | 'color2', value: string) => {
      if(background){
          updateStyle('background', {...background, [colorProp]: value });
      } else {
          updateStyle('background', { type: 'solid', color1: value, direction: 'vertical' });
      }
  }
  
  const setDirection = (direction: GradientDirection) => {
      if(background) {
          updateStyle('background', {...background, direction });
      }
  }

  return (
    <>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Paintbrush/>Fondo de Columna</h3>
        <Button 
          variant="outline" 
          size="icon" 
          className="size-7 border-[#F00000] hover:bg-[#F00000] hover:text-white" 
          onClick={() => updateStyle('background', undefined)}
        >
            <Trash2 className="size-4"/>
        </Button>
      </div>
       <Tabs value={background?.type || 'solid'} onValueChange={(value) => setBgType(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="solid">Sólido</TabsTrigger>
          <TabsTrigger value="gradient">Degradado</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="space-y-3">
        <Label>Color 1</Label>
        <ColorPickerAdvanced color={background?.color1 || '#A020F0'} setColor={(c) => setColor('color1', c)} />
      </div>
      {background?.type === 'gradient' && (
        <>
          <div className="space-y-3">
            <Label>Color 2</Label>
            <ColorPickerAdvanced color={background?.color2 || '#3357FF'} setColor={(c) => setColor('color2', c)} />
          </div>
          <div className="space-y-3">
             <Label>Dirección del Degradado</Label>
             <div className="grid grid-cols-3 gap-2">
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant={background?.direction === 'vertical' ? 'secondary' : 'outline'} size="icon" onClick={() => setDirection('vertical')}><ArrowDown/></Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Vertical</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant={background?.direction === 'horizontal' ? 'secondary' : 'outline'} size="icon" onClick={() => setDirection('horizontal')}><ArrowRight/></Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Horizontal</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant={background?.direction === 'radial' ? 'secondary' : 'outline'} size="icon" onClick={() => setDirection('radial')}><Sun className="size-4"/></Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Radial</p></TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
             </div>
          </div>
        </>
      )}
    </div>
    <Separator className="bg-border/20" />
    <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground/80">Radio del Borde</h3>
        <div className="flex items-center gap-2">
          <Slider 
              defaultValue={[borderRadius || 8]} 
              max={40} 
              step={1} 
              onValueChange={(value) => updateStyle('borderRadius', value[0])}
          />
          <span className="text-xs text-muted-foreground w-12 text-right">{borderRadius || 0}px</span>
        </div>
    </div>
    </>
  )
};


export default function CreateTemplatePage() {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [templateName, setTemplateName] = useState("Plantilla sin título");
  const [tempTemplateName, setTempTemplateName] = useState(templateName);
  
  // Modals State
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [selectedColumnLayout, setSelectedColumnLayout] = useState<number | null>(null);
  const [isBlockSelectorOpen, setIsBlockSelectorOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{rowId: string, colId?: string, primId?: string} | null>(null);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  
  // Canvas State
  const [canvasContent, setCanvasContent] = useState<CanvasBlock[]>([]);
  const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
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
            styles: {
              borderRadius: 8,
            },
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
  
  const promptDeleteItem = (rowId: string, colId?: string, primId?: string) => {
    setItemToDelete({ rowId, colId, primId });
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteItem = () => {
    if (!itemToDelete) return;

    let newCanvasContent;

    if (itemToDelete.primId && itemToDelete.colId) { // Deleting a primitive block
        newCanvasContent = canvasContent.map(row => {
            if (row.id !== itemToDelete.rowId) return row;
            return {
                ...row,
                payload: {
                    ...row.payload,
                    columns: row.payload.columns.map(col => {
                        if (col.id !== itemToDelete.colId) return col;
                        return {
                            ...col,
                            blocks: col.blocks.filter(block => block.id !== itemToDelete.primId),
                        }
                    })
                }
            }
        });
    } else { // Deleting a whole row
        newCanvasContent = canvasContent.filter(row => row.id !== itemToDelete.rowId);
    }
    
    setCanvasContent(newCanvasContent);
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const renderBlock = (block: PrimitiveBlock, rowId: string, colId: string) => {
     const isSelected = selectedElement?.type === 'primitive' && selectedElement.primitiveId === block.id;
    return (
       <div 
        key={block.id}
        className={cn(
            "group/primitive relative w-full",
            isSelected && "ring-2 ring-accent ring-offset-2 ring-offset-card rounded-md"
        )}
        onClick={(e) => { e.stopPropagation(); setSelectedElement({type: 'primitive', primitiveId: block.id, columnId: colId, rowId})}}
       >
         <div className="absolute top-0 -right-8 flex items-center gap-1 opacity-0 group-hover/primitive:opacity-100 transition-opacity">
             <Button variant="destructive" size="icon" className="size-6" onClick={(e) => {e.stopPropagation(); promptDeleteItem(rowId, colId, block.id)}}>
                <X className="size-3.5" />
             </Button>
         </div>
        {
          (() => {
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
          })()
        }
      </div>
    )
  }

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const newCanvasContent = [...canvasContent];
    const item = newCanvasContent.splice(index, 1)[0];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    newCanvasContent.splice(newIndex, 0, item);
    setCanvasContent(newCanvasContent);
  };

  const handleSaveTemplateName = () => {
    setTemplateName(tempTemplateName);
    setIsEditNameModalOpen(false);
  };

  useEffect(() => {
    setTempTemplateName(templateName);
  }, [isEditNameModalOpen, templateName]);

  const viewportClasses = {
    desktop: 'max-w-4xl', 
    tablet: 'max-w-xl',  
    mobile: 'max-w-sm', 
  };
  
  const getColumnStyle = (col: Column) => {
    const style: React.CSSProperties = {};

    if (col.styles.borderRadius !== undefined) {
        style.borderRadius = `${col.styles.borderRadius}px`;
    }

    if (col.styles.background) {
      const { type, color1, color2, direction } = col.styles.background;
      if (type === 'solid') {
        style.backgroundColor = color1;
      }
      if (type === 'gradient') {
        if (direction === 'radial') {
          style.backgroundImage = `radial-gradient(${color1}, ${color2})`;
        } else {
          const angle = direction === 'horizontal' ? 'to right' : 'to bottom';
          style.backgroundImage = `linear-gradient(${angle}, ${color1}, ${color2})`;
        }
      }
    }
    return style;
  };

  return (
    <div className="flex h-screen max-h-screen bg-transparent text-foreground overflow-hidden">
      <aside className="w-56 border-r border-r-black/10 dark:border-border/20 flex flex-col bg-card/5">
        <header className="flex items-center justify-between p-2 border-b bg-card/5 border-border/20 backdrop-blur-sm h-[61px] z-10 shrink-0">
          <div className="flex items-center gap-1 flex-1 min-w-0">
              <span className="text-base font-semibold truncate flex-1">{templateName}</span>
              <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => setIsEditNameModalOpen(true)}>
                <Pencil className="size-4" />
              </Button>
          </div>
        </header>
        <div className="p-4">
            <Card 
              onClick={() => handleBlockClick('columns')}
              className="group bg-card/5 border-black/20 dark:border-border/20 flex flex-col items-center justify-center p-4 cursor-pointer transition-all hover:bg-primary/10 hover:border-black/50 dark:hover:border-primary/50 hover:shadow-lg"
            >
              <Columns className="size-10 text-[#00B0F0] transition-colors" />
              <span className="text-md font-semibold text-center text-foreground/80 mt-2">Columns</span>
               <span className="text-xs font-medium text-center text-muted-foreground">1 - 5</span>
            </Card>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
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
                        <p>Mira cómo se ve en <span className="font-bold">Escritorio</span></p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant={viewport === 'tablet' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewport('tablet')}><Tablet/></Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Comprueba la vista para <span className="font-bold">Tableta</span></p>
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

         <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="p-8">
            <div className={cn("bg-background/80 dark:bg-zinc-900/80 dark:border dark:border-white/10 mx-auto shadow-2xl rounded-lg min-h-[1200px] transition-all duration-300 ease-in-out", viewportClasses[viewport])}>
               {canvasContent.length === 0 ? (
                 <div className="border-2 border-dashed border-border/30 dark:border-border/30 rounded-lg h-full flex items-center justify-center text-center text-muted-foreground p-4">
                   <p>Haz clic en el bloque "Columns" de la izquierda para empezar a construir tu plantilla.</p>
                 </div>
               ) : (
                <div className="p-4">
                  <AnimatePresence>
                  {canvasContent.map((block, index) => (
                    <motion.div 
                      key={block.id} 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="group/row relative p-2 rounded-lg hover:bg-primary/5"
                    >
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
                         <Button variant="destructive" size="icon" className="size-7" onClick={() => promptDeleteItem(block.id)}>
                            <Trash2 className="size-4" />
                         </Button>
                      </div>

                      <div className="flex overflow-x-auto custom-scrollbar">
                        {block.payload.columns.map((col) => (
                          <div 
                              key={col.id}
                              onClick={(e) => { e.stopPropagation(); setSelectedElement({type: 'column', columnId: col.id, rowId: block.id})}}
                              style={getColumnStyle(col)}
                              className={cn(
                                "flex-1 p-2 border-2 border-dashed min-h-[100px] flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors min-w-[120px]",
                                selectedElement?.type === 'column' && selectedElement.columnId === col.id ? 'border-primary border-solid' : 'border-transparent'
                              )}
                          >
                             {col.blocks.length > 0 ? (
                                 col.blocks.map(b => renderBlock(b, block.id, col.id))
                             ) : (
                               <Button variant="outline" size="sm" className="h-auto py-2 px-4 flex flex-col" onClick={(e) => { e.stopPropagation(); handleOpenBlockSelector(col.id); }}>
                                 <PlusCircle className="mb-1"/>
                                 <span className="text-xs font-medium -mb-0.5">Añadir</span>
                                 <span className="text-xs font-medium">Bloque</span>
                               </Button>
                             )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </div>
               )}
            </div>
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
         <ScrollArea className="flex-1 custom-scrollbar">
            <div className="p-4 space-y-4">
              
              { selectedElement?.type === 'column' ? (
                 <BackgroundEditor selectedElement={selectedElement} canvasContent={canvasContent} setCanvasContent={setCanvasContent} />
              ) : (
                <>
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
                </>
              )}
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
            <Button type="button" variant="destructive" onClick={handleDeleteItem}>
              Sí, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       <Dialog open={isEditNameModalOpen} onOpenChange={setIsEditNameModalOpen}>
        <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Editar Nombre de la Plantilla</DialogTitle>
            <DialogDescription>
              Cambia el nombre de tu plantilla para identificarla fácilmente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={tempTemplateName}
              onChange={(e) => setTempTemplateName(e.target.value)}
              placeholder="Mi increíble plantilla"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditNameModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveTemplateName}>
              Guardar Nombre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
