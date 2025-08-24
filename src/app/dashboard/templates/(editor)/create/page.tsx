
"use client";

import React, { useState, useTransition, useEffect, useRef, useCallback } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Toggle } from '@/components/ui/toggle';
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
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCw,
  Move,
  Scale,
  ArrowLeftRight,
  ArrowUpDown,
  Moon,
  Edit,
  Expand,
  Upload,
  View,
  Strikethrough,
  Highlighter,
  Link2Off,
  Palette as PaletteIcon,
  Sparkles,
  CaseSensitive,
  Eraser,
  Waves,
  Dot,
  Cloud,
  Leaf,
  Droplet,
  Layers,
  PlayCircle,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ColorPickerAdvanced } from '@/components/dashboard/color-picker-advanced';
import { useToast } from '@/hooks/use-toast';
import { HexColorPicker } from 'react-colorful';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';


const mainContentBlocks = [
  { name: "Columns", icon: Columns, id: 'columns' },
  { name: "Contenedor Flexible", icon: Shapes, id: 'wrapper' },
];

const columnContentBlocks = [
  { name: "Titulo", icon: Heading1, id: 'heading' },
  { name: "Texto", icon: Type, id: 'text' },
  { name: "Image", icon: ImageIcon, id: 'image' },
  { name: "Botón", icon: Square, id: 'button' },
  { name: "Separador", icon: Minus, id: 'separator' },
  { name: "Video Youtube", icon: Youtube, id: 'youtube' },
  { name: "Contador", icon: Timer, id: 'timer' },
  { name: "Emoji", icon: Smile, id: 'emoji-static' },
  { name: "Codigo HTML", icon: Code, id: 'html' },
];

const wrapperContentBlocks = [
   { name: "Emoji Interactivo", icon: Smile, id: 'emoji-interactive' },
];


const columnOptions = [
    { num: 1, icon: () => <div className="w-full h-8 bg-muted rounded-sm border border-border"></div> },
    { num: 2, icon: () => <div className="flex w-full h-8 gap-1"><div className="w-1/2 h-full bg-muted rounded-sm border border-border"></div><div className="w-1/2 h-full bg-muted rounded-sm border border-border"></div></div> },
    { num: 3, icon: () => <div className="flex w-full h-8 gap-1"><div className="w-1/3 h-full bg-muted rounded-sm border border-border"></div><div className="w-1/3 h-full bg-muted rounded-sm border border-border"></div><div className="w-1/3 h-full bg-muted rounded-sm border border-border"></div></div> },
    { num: 4, icon: () => <div className="flex w-full h-8 gap-1"><div className="w-1/4 h-full bg-muted rounded-sm border border-border"></div><div className="w-1/4 h-full bg-muted rounded-sm border border-border"></div><div className="w-1/4 h-full bg-muted rounded-sm border border-border"></div></div> },
];

const popularEmojis = Array.from(new Set([
    '😀', '😂', '😍', '🤔', '👍', '🎉', '🚀', '❤️', '🔥', '💰',
    '✅', '✉️', '🔗', '💡', '💯', '👋', '👇', '👉', '🎁', '📈',
    '📅', '🧠', '⭐', '✨', '🙌', '👀', '💼', '⏰', '💸', '📊',
    '💻', '📱', '🎯', '📣', '✍️', '😎', '😮', '🤯', '🙏', '💪',
    '🎊', '🎈', '▶️', '➡️', '⬅️', '⬆️', '⬇️', '⚠️', '❌', '⭕️',
    '🔴', '🔵', '⚫️', '⚪️', '🔶', '🔷'
]));
  
const googleFonts = [
  "Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", "Source Sans Pro",
  "Slabo 27px", "Raleway", "PT Sans", "Merriweather", "Noto Sans", "Poppins",
  "Ubuntu", "Playfair Display", "Lora", "Fira Sans", "Nunito Sans",
  "Quicksand", "Days One", "Russo One", "Inter", "Work Sans", "Rubik",
  "Karla", "Inconsolata", "Libre Baskerville", "Arvo", "Zilla Slab", "Pacifico",
  "Caveat", "Satisfy", "Dancing Script", "Permanent Marker", "Bangers", "Righteous",
  "Lobster", "Anton", "Passion One", "Josefin Sans", "Exo 2", "Cabin"
];

// --- STATE MANAGEMENT TYPES ---
type StaticPrimitiveBlockType = 'heading' | 'text' | 'image' | 'button' | 'separator' | 'youtube' | 'timer' | 'emoji-static' | 'html';
type InteractiveBlockType = 'emoji-interactive';

type BlockType = StaticPrimitiveBlockType | InteractiveBlockType | 'columns' | 'wrapper';
type Viewport = 'desktop' | 'tablet' | 'mobile';
type TextAlign = 'left' | 'center' | 'right';
type BackgroundFit = 'cover' | 'contain' | 'auto';
type GradientDirection = 'vertical' | 'horizontal' | 'radial';
type SeparatorLineStyle = 'solid' | 'dotted' | 'dashed';
type SeparatorShapeType = 'waves' | 'drops' | 'zigzag' | 'leaves' | 'scallops';

interface BaseBlock {
  id: string;
  type: StaticPrimitiveBlockType | InteractiveBlockType;
  payload: { [key: string]: any };
}

interface HeadingBlock extends BaseBlock {
    type: 'heading';
    payload: {
        text: string;
        styles: {
            color: string;
            fontFamily: string;
            fontSize: number;
            textAlign: TextAlign;
            fontWeight: 'normal' | 'bold';
            fontStyle: 'normal' | 'italic';
            textDecoration: 'none' | 'underline' | 'line-through';
            highlight?: string;
        }
    }
}

interface TextFragment {
    id: string;
    text: string;
    link?: {
        url: string;
        openInNewTab: boolean;
    };
    styles: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        strikethrough?: boolean;
        color?: string;
        highlight?: string;
        fontFamily?: string;
    };
}

interface TextBlock extends BaseBlock {
    type: 'text';
    payload: {
        fragments: TextFragment[];
        globalStyles: {
            textAlign: TextAlign;
            fontSize: number;
        }
    }
}


interface ButtonBlock extends BaseBlock {
    type: 'button';
    payload: {
        text: string;
        link: {
            url: string;
            openInNewTab: boolean;
        };
        textAlign: TextAlign;
        styles: {
            color: string;
            backgroundColor: string;
            borderRadius: number;
            background?: {
                type: 'solid' | 'gradient';
                color1: string;
                color2?: string;
                direction?: GradientDirection;
            }
        }
    }
}

interface SeparatorBlock extends BaseBlock {
    type: 'separator';
    payload: {
        height: number;
        style: 'invisible' | 'line' | 'shapes' | 'dots';
        line: {
            thickness: number;
            color: string;
            style: SeparatorLineStyle;
            borderRadius: number;
        };
        shapes: {
            type: SeparatorShapeType;
            background: {
              type: 'solid' | 'gradient';
              color1: string;
              color2?: string;
              direction?: GradientDirection;
            };
            frequency: number;
        };
        dots: {
            size: number;
            count: number;
            color: string;
        }
    }
}

interface StaticEmojiBlock extends BaseBlock {
    type: 'emoji-static';
    payload: {
        emoji: string;
        styles: {
            fontSize: number;
            textAlign: TextAlign;
            rotate: number;
        }
    }
}

interface YouTubeBlock extends BaseBlock {
    type: 'youtube';
    payload: {
        url: string;
        videoId: string | null;
        title: string;
        showTitle: boolean;
        duration: {
            hours: string;
            minutes: string;
            seconds: string;
        },
        showDuration: boolean;
        link: {
            url: string,
            openInNewTab: boolean;
        };
        styles: {
            playButtonType: 'default' | 'classic';
            borderRadius: number;
            border: {
                type: 'solid' | 'gradient';
                color1: string;
                color2?: string;
                direction?: GradientDirection;
            };
            borderWidth: number;
        }
    }
}

interface InteractiveEmojiBlock extends BaseBlock {
    type: 'emoji-interactive';
    payload: {
        emoji: string;
        x: number;
        y: number;
        scale: number;
        rotate: number;
    }
}

type PrimitiveBlock = BaseBlock | ButtonBlock | HeadingBlock | TextBlock | StaticEmojiBlock | SeparatorBlock | YouTubeBlock;
type InteractivePrimitiveBlock = InteractiveEmojiBlock;


interface Column {
  id: string;
  blocks: PrimitiveBlock[];
  width: number;
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
    alignment: number; // 0-100, for single column positioning
  };
}

interface WrapperStyles {
    borderRadius?: number;
    background?: {
      type: 'solid' | 'gradient';
      color1: string;
      color2?: string;
      direction?: GradientDirection;
    };
    backgroundImage?: {
        url: string;
        fit: BackgroundFit;
        positionX: number;
        positionY: number;
        zoom: number;
    }
}

interface WrapperBlock {
  id: string;
  type: 'wrapper';
  payload: {
    blocks: InteractivePrimitiveBlock[];
    height: number;
    styles: WrapperStyles;
  };
}


type CanvasBlock = ColumnsBlock | WrapperBlock;
type SelectedElement = 
  | { type: 'column', columnId: string, rowId: string } 
  | { type: 'primitive', primitiveId: string, columnId: string, rowId: string } 
  | { type: 'wrapper', wrapperId: string } 
  | { type: 'wrapper-primitive', primitiveId: string, wrapperId: string } 
  | null;


const ColumnDistributionEditor = ({ selectedElement, canvasContent, setCanvasContent }: {
    selectedElement: SelectedElement;
    canvasContent: CanvasBlock[];
    setCanvasContent: (content: CanvasBlock[]) => void;
}) => {
    if (selectedElement?.type !== 'column') return null;

    const row = canvasContent.find(r => r.id === selectedElement.rowId) as ColumnsBlock | undefined;
    if (!row) return null;

    const { columns } = row.payload;
    const columnIndex = columns.findIndex(c => c.id === selectedElement.columnId);
    if(columnIndex === -1) return null;

    const handleTwoColumnChange = (value: number) => {
        const newColumns = [...columns];
        const clampedValue = Math.max(10, Math.min(90, value));
        newColumns[0] = { ...newColumns[0], width: clampedValue };
        newColumns[1] = { ...newColumns[1], width: 100 - clampedValue };

        const updatedCanvasContent = canvasContent.map(r => {
            if (r.id === selectedElement.rowId) {
                return { ...r, payload: { ...r.payload, columns: newColumns } };
            }
            return r;
        });
        setCanvasContent(updatedCanvasContent);
    }
    
    const handleThreeColumnChange = (changedIndex: number, newValue: number) => {
        let newColumns = [...columns];
        const clampedValue = Math.max(10, Math.min(80, newValue));
    
        const remainingWidth = 100 - clampedValue;
        const otherIndices = [0, 1, 2].filter(i => i !== changedIndex);
    
        newColumns[changedIndex].width = clampedValue;
    
        if (changedIndex === 0) {
            let col2Width = newColumns[1].width;
            let col3Width = newColumns[2].width;
            const totalOtherWidth = col2Width + col3Width;

            let newCol2Width = (col2Width / totalOtherWidth) * remainingWidth;
            let newCol3Width = (col3Width / totalOtherWidth) * remainingWidth;
            
            if(newCol2Width < 10) {
                newCol2Width = 10;
                newCol3Width = remainingWidth - 10;
            }
            if(newCol3Width < 10) {
                newCol3Width = 10;
                newCol2Width = remainingWidth - 10;
            }

            newColumns[1].width = newCol2Width;
            newColumns[2].width = newCol3Width;
        } else if (changedIndex === 1) {
            let col3Width = 100 - newColumns[0].width - clampedValue;
            if (col3Width < 10) {
                col3Width = 10;
                newColumns[1].width = 100 - newColumns[0].width - 10;
            } else {
                 newColumns[1].width = clampedValue;
            }
            newColumns[2].width = 100 - newColumns[0].width - newColumns[1].width;
        } else { // changedIndex === 2
            let col2Width = 100 - newColumns[0].width - clampedValue;
             if (col2Width < 10) {
                col2Width = 10;
                newColumns[2].width = 100 - newColumns[0].width - 10;
            } else {
                newColumns[2].width = clampedValue;
            }
            newColumns[1].width = 100 - newColumns[0].width - newColumns[2].width;
        }
    
        setCanvasContent(canvasContent.map(r => 
            r.id === selectedElement.rowId ? { ...r, payload: { ...r.payload, columns: newColumns } } : r
        ));
    };

    const handleFourColumnChange = (changedIndex: number, newValue: number) => {
        let newColumns = [...columns];
        // Clamp the new value between 10 and 70
        let clampedValue = Math.max(10, Math.min(70, newValue));

        const otherIndices = [0, 1, 2, 3].filter(i => i > changedIndex);
        const fixedIndices = [0, 1, 2, 3].filter(i => i < changedIndex);
        
        const fixedWidth = fixedIndices.reduce((acc, i) => acc + newColumns[i].width, 0);

        // Check if the new value is possible
        const remainingForOthers = 100 - fixedWidth - clampedValue;
        if (remainingForOthers < otherIndices.length * 10) {
             clampedValue = 100 - fixedWidth - (otherIndices.length * 10);
        }

        newColumns[changedIndex].width = clampedValue;
        
        const remainingWidth = 100 - fixedWidth - clampedValue;
        const totalOtherWidth = otherIndices.reduce((acc, i) => acc + columns[i].width, 0); // use original width for proportion

        otherIndices.forEach(i => {
            const proportion = columns[i].width / totalOtherWidth;
            newColumns[i].width = remainingWidth * proportion;
        });

        // Due to rounding, ensure total is 100
        const finalTotalWidth = newColumns.reduce((sum, col) => sum + col.width, 0);
        const roundingError = 100 - finalTotalWidth;
        if (newColumns[3]) {
            newColumns[3].width += roundingError;
        }
        
        setCanvasContent(canvasContent.map(r => 
            r.id === selectedElement.rowId ? { ...r, payload: { ...r.payload, columns: newColumns } } : r
        ));
    };
    
    if(columns.length === 1) return null;

    if (columns.length === 2) {
        return (
             <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Columns /> Distribución de Columnas</h3>
                 <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Columna 1: {columns[0].width.toFixed(0)}%</span>
                        <span>Columna 2: {columns[1].width.toFixed(0)}%</span>
                    </div>
                     <Slider
                        value={[columns[0].width]}
                        max={90}
                        min={10}
                        step={1}
                        onValueChange={(value) => handleTwoColumnChange(value[0])}
                    />
                 </div>
            </div>
        )
    }
    
    if (columns.length === 3) {
      return (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2">
            <Columns /> Distribución de Columnas
          </h3>
          <div className="space-y-3">
            <Label>Columna 1: {columns[0].width.toFixed(0)}%</Label>
            <Slider
              value={[columns[0].width]}
              min={10}
              max={80}
              step={1}
              onValueChange={(val) => handleThreeColumnChange(0, val[0])}
            />
          </div>
          <div className="space-y-3">
            <Label>Columna 2: {columns[1].width.toFixed(0)}%</Label>
            <Slider
              value={[columns[1].width]}
              min={10}
              max={80}
              step={1}
              onValueChange={(val) => handleThreeColumnChange(1, val[0])}
            />
          </div>
          <div className="space-y-3">
             <Label>Columna 3: {columns[2].width.toFixed(0)}%</Label>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary/50" style={{ width: `${columns[2].width}%` }} />
              </div>
          </div>
        </div>
      );
    }
    
    if (columns.length === 4) {
      return (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2">
            <Columns /> Distribución de Columnas
          </h3>
          {[0, 1, 2].map(i => (
            <div key={i} className="space-y-3">
              <Label>Columna {i + 1}: {columns[i].width.toFixed(0)}%</Label>
              <Slider
                value={[columns[i].width]}
                min={10}
                max={70}
                step={1}
                onValueChange={(val) => handleFourColumnChange(i, val[0])}
              />
            </div>
          ))}
          <div className="space-y-3">
             <Label>Columna 4: {columns[3].width.toFixed(0)}%</Label>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary/50" style={{ width: `${columns[3].width}%` }} />
              </div>
          </div>
        </div>
      );
    }

    return null;
};


const BackgroundEditor = ({ selectedElement, canvasContent, setCanvasContent, onOpenImageModal }: {
  selectedElement: SelectedElement;
  canvasContent: CanvasBlock[];
  setCanvasContent: (content: CanvasBlock[]) => void;
  onOpenImageModal: () => void;
}) => {
  if (!selectedElement || (selectedElement.type !== 'column' && selectedElement.type !== 'wrapper')) return null;

  const getElement = () => {
    if (selectedElement.type === 'column') {
      const row = canvasContent.find(r => r.id === selectedElement.rowId);
      if (row?.type !== 'columns') return null;
      return row?.payload.columns.find(c => c.id === selectedElement.columnId);
    }
    if (selectedElement.type === 'wrapper') {
      const row = canvasContent.find(r => r.id === selectedElement.wrapperId);
      return row?.type === 'wrapper' ? row : null;
    }
    return null;
  }
  
  const element = getElement();
  if (!element) return null;

  const styles = 'payload' in element && 'styles' in element.payload ? element.payload.styles : 'styles' in element ? element.styles : {};
  const { background, borderRadius } = styles || {};
  
  const updateStyle = (key: string, value: any) => {
    setCanvasContent(prevCanvasContent => {
        return prevCanvasContent.map(row => {
            if (selectedElement.type === 'column' && row.id === selectedElement.rowId && row.type === 'columns') {
                const newColumns = row.payload.columns.map(col => {
                    if (col.id === selectedElement.columnId) {
                        return { ...col, styles: { ...col.styles, [key]: value } };
                    }
                    return col;
                });
                return { ...row, payload: { ...row.payload, columns: newColumns } };
            }
            if (selectedElement.type === 'wrapper' && row.id === selectedElement.wrapperId && row.type === 'wrapper') {
                const currentStyles = row.payload.styles || {};
                const newPayload = { ...row.payload, styles: { ...currentStyles, [key]: value } };
                return { ...row, payload: newPayload };
            }
            return row;
        }) as CanvasBlock[];
    });
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
      const currentBg = background || { type: 'solid', color1: '#A020F0', direction: 'vertical' };
      updateStyle('background', {...currentBg, [colorProp]: value });
  }
  
  const setDirection = (direction: GradientDirection) => {
      if(background) {
          updateStyle('background', {...background, direction });
      }
  }

  const isWrapper = selectedElement.type === 'wrapper';

  return (
    <>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Paintbrush/>Fondo</h3>
        <Button 
          variant="outline" 
          size="icon" 
          className="size-7 border-[#F00000] text-[#F00000] hover:bg-[#F00000] hover:text-white dark:text-foreground dark:hover:text-white" 
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
    {isWrapper && (
      <>
        <Separator className="bg-border/20" />
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground/80">Radio del Borde</h3>
            <div className="flex items-center gap-2">
              <Slider 
                  value={[borderRadius || 0]}
                  max={40} 
                  step={1} 
                  onValueChange={(value) => updateStyle('borderRadius', value[0])}
              />
              <span className="text-xs text-muted-foreground w-12 text-right">{borderRadius || 0}px</span>
            </div>
        </div>
        <Separator className="bg-border/20" />
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><ImageIcon/>Imagen de Fondo</h3>
                {(styles as WrapperStyles)?.backgroundImage && (
                     <Button 
                        variant="outline" 
                        size="icon" 
                        className="size-7 border-[#F00000] text-[#F00000] hover:bg-[#F00000] hover:text-white dark:text-foreground dark:hover:text-white" 
                        onClick={() => updateStyle('backgroundImage', undefined)}
                        >
                        <Trash2 className="size-4"/>
                    </Button>
                )}
            </div>
             <div className="group rounded-md p-0.5 bg-transparent hover:bg-gradient-to-r from-primary to-accent transition-colors">
                <Button variant="outline" className="w-full hover:bg-transparent" onClick={onOpenImageModal}>
                    <Upload className="mr-2"/>
                    {(styles as WrapperStyles)?.backgroundImage ? 'Cambiar Imagen' : 'Añadir Imagen'}
                </Button>
            </div>
        </div>
      </>
    )}
    </>
  )
};

const ButtonEditor = ({ selectedElement, canvasContent, setCanvasContent }: {
  selectedElement: SelectedElement;
  canvasContent: CanvasBlock[];
  setCanvasContent: (content: CanvasBlock[]) => void;
}) => {
    if(selectedElement?.type !== 'primitive') return null;
    
    const getElement = () => {
        const row = canvasContent.find(r => r.id === selectedElement.rowId);
        if (row?.type !== 'columns') return null;
        const col = row?.payload.columns.find(c => c.id === selectedElement.columnId);
        const block = col?.blocks.find(b => b.id === selectedElement.primitiveId);
        return block?.type === 'button' ? block as ButtonBlock : null;
    }
    const element = getElement();
    if(!element) return null;

    const updatePayload = (key: keyof ButtonBlock['payload'], value: any) => {
        const newCanvasContent = canvasContent.map(row => {
          if (row.id !== (selectedElement as { rowId: string }).rowId) return row;
          if (row.type !== 'columns') return row;
          const newColumns = row.payload.columns.map(col => {
            if (col.id === (selectedElement as { columnId: string }).columnId) {
                const newBlocks = col.blocks.map(block => {
                    if (block.id === selectedElement.primitiveId && block.type === 'button') {
                        return { ...block, payload: { ...block.payload, [key]: value }};
                    }
                    return block;
                })
                return {...col, blocks: newBlocks};
            }
            return col;
          });
          return { ...row, payload: { ...row.payload, columns: newColumns } };
        });
        setCanvasContent(newCanvasContent as CanvasBlock[]);
    }
    
    const updateStyle = (key: keyof ButtonBlock['payload']['styles'], value: any) => {
        const newCanvasContent = canvasContent.map(row => {
            if (row.id !== (selectedElement as { rowId: string }).rowId) return row;
            if (row.type !== 'columns') return row;
            const newColumns = row.payload.columns.map(col => {
                if (col.id === (selectedElement as { columnId: string }).columnId) {
                    const newBlocks = col.blocks.map(block => {
                        if (block.id === selectedElement.primitiveId && block.type === 'button') {
                             const currentStyles = block.payload.styles || {};
                            return { ...block, payload: { ...block.payload, styles: { ...currentStyles, [key]: value } } };
                        }
                        return block;
                    });
                    return { ...col, blocks: newBlocks };
                }
                return col;
            });
            return { ...row, payload: { ...row.payload, columns: newColumns } };
        });
        setCanvasContent(newCanvasContent as CanvasBlock[]);
    };

    const setTextAlign = (align: TextAlign) => {
        updatePayload('textAlign', align);
    };
    
    const { background, borderRadius } = element.payload.styles;
    
    const setBgType = (type: 'solid' | 'gradient') => {
        updateStyle('background', {
            type,
            color1: background?.color1 || '#A020F0',
            color2: background?.color2 || '#3357FF',
            direction: background?.direction || 'vertical',
        });
    };

    const setColor = (colorProp: 'color1' | 'color2', value: string) => {
        const currentBg = background || { type: 'solid', color1: '#A020F0', direction: 'vertical' };
        updateStyle('background', { ...currentBg, [colorProp]: value });
    };

    const setDirection = (direction: GradientDirection) => {
        if (background) {
            updateStyle('background', { ...background, direction });
        }
    };

    return (
        <>
            <div className="space-y-4">
                 <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Pencil/>Contenido del Botón</h3>
                 <div className="space-y-2">
                    <Label>Texto</Label>
                    <Input 
                        value={element.payload.text}
                        onChange={(e) => updatePayload('text', e.target.value)}
                        placeholder="Texto del botón"
                        className="bg-transparent border-border/50"
                    />
                 </div>
                 <div className="space-y-2">
                    <Label>URL del Enlace</Label>
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input 
                            value={element.payload.link.url}
                            onChange={(e) => updatePayload('link', { ...element.payload.link, url: e.target.value })}
                            placeholder="https://example.com"
                            className="bg-transparent border-border/50 pl-10"
                        />
                    </div>
                 </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox
                        id={`btn-new-tab-${element.id}`}
                        checked={element.payload.link.openInNewTab}
                        onCheckedChange={(checked) => updatePayload('link', { ...element.payload.link, openInNewTab: !!checked })}
                    />
                    <label
                        htmlFor={`btn-new-tab-${element.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Abrir en una nueva pestaña
                    </label>
                 </div>
            </div>
            <Separator className="bg-border/20"/>
            <div className="space-y-4">
                 <h3 className="text-sm font-medium text-foreground/80">Alineación</h3>
                 <div className="grid grid-cols-3 gap-2">
                    <Button variant={element.payload.textAlign === 'left' ? 'secondary' : 'outline'} size="icon" onClick={() => setTextAlign('left')}><AlignLeft/></Button>
                    <Button variant={element.payload.textAlign === 'center' ? 'secondary' : 'outline'} size="icon" onClick={() => setTextAlign('center')}><AlignCenter/></Button>
                    <Button variant={element.payload.textAlign === 'right' ? 'secondary' : 'outline'} size="icon" onClick={() => setTextAlign('right')}><AlignRight/></Button>
                 </div>
            </div>
            <Separator className="bg-border/20"/>
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground/80">Radio del Borde</h3>
                <div className="flex items-center gap-2">
                  <Slider 
                      value={[borderRadius || 0]}
                      max={20} 
                      step={1} 
                      onValueChange={(value) => updateStyle('borderRadius', value[0])}
                  />
                  <span className="text-xs text-muted-foreground w-12 text-right">{borderRadius || 0}px</span>
                </div>
            </div>
            <Separator className="bg-border/20"/>
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Paintbrush />Fondo del Botón</h3>
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
                                    <TooltipTrigger asChild><Button variant={background?.direction === 'vertical' ? 'secondary' : 'outline'} size="icon" onClick={() => setDirection('vertical')}><ArrowDown /></Button></TooltipTrigger>
                                    <TooltipContent><p>Vertical</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button variant={background?.direction === 'horizontal' ? 'secondary' : 'outline'} size="icon" onClick={() => setDirection('horizontal')}><ArrowRight /></Button></TooltipTrigger>
                                    <TooltipContent><p>Horizontal</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button variant={background?.direction === 'radial' ? 'secondary' : 'outline'} size="icon" onClick={() => setDirection('radial')}><Sun className="size-4" /></Button></TooltipTrigger>
                                    <TooltipContent><p>Radial</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                    </>
                )}
            </div>
        </>
    )
}

const HeadingEditor = ({ selectedElement, canvasContent, setCanvasContent }: {
  selectedElement: SelectedElement;
  canvasContent: CanvasBlock[];
  setCanvasContent: (content: CanvasBlock[]) => void;
}) => {
    if(selectedElement?.type !== 'primitive') return null;
    
    const getElement = () => {
        const row = canvasContent.find(r => r.id === selectedElement.rowId);
        if (row?.type !== 'columns') return null;
        const col = row.payload.columns.find(c => c.id === selectedElement.columnId);
        const block = col?.blocks.find(b => b.id === selectedElement.primitiveId);
        return block?.type === 'heading' ? block as HeadingBlock : null;
    }
    const element = getElement();
    if(!element) return null;

    const updatePayload = (key: keyof HeadingBlock['payload'], value: any) => {
        const newCanvasContent = canvasContent.map(row => {
          if (row.id !== (selectedElement as { rowId: string }).rowId) return row;
          if (row.type !== 'columns') return row;
          const newColumns = row.payload.columns.map(col => {
            if (col.id === (selectedElement as { columnId: string }).columnId) {
                const newBlocks = col.blocks.map(block => {
                    if (block.id === selectedElement.primitiveId && block.type === 'heading') {
                        return { ...block, payload: { ...block.payload, [key]: value }};
                    }
                    return block;
                })
                return {...col, blocks: newBlocks};
            }
            return col;
          });
          return { ...row, payload: { ...row.payload, columns: newColumns } };
        });
        setCanvasContent(newCanvasContent as CanvasBlock[]);
    }

    const updateStyle = (key: keyof HeadingBlock['payload']['styles'], value: any) => {
        const newCanvasContent = canvasContent.map(row => {
          if (row.id !== (selectedElement as { rowId: string }).rowId) return row;
          if (row.type !== 'columns') return row;
          const newColumns = row.payload.columns.map(col => {
            if (col.id === (selectedElement as { columnId: string }).columnId) {
                const newBlocks = col.blocks.map(block => {
                    if (block.id === selectedElement.primitiveId && block.type === 'heading') {
                        return { ...block, payload: { ...block.payload, styles: { ...block.payload.styles, [key]: value } }};
                    }
                    return block;
                })
                return {...col, blocks: newBlocks};
            }
            return col;
          });
          return { ...row, payload: { ...row.payload, columns: newColumns } };
        });
        setCanvasContent(newCanvasContent as CanvasBlock[]);
    }
    
    const { styles } = element.payload;

    const toggleDecoration = (decoration: 'underline' | 'line-through') => {
        const currentDecoration = styles.textDecoration;
        if (currentDecoration === decoration) {
            updateStyle('textDecoration', 'none');
        } else {
            updateStyle('textDecoration', decoration);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Pencil />Contenido de Texto</h3>
                <Label>Añadir Texto</Label>
                <Input
                    value={element.payload.text}
                    onChange={(e) => updatePayload('text', e.target.value)}
                    placeholder="Tu título aquí..."
                    className="bg-transparent border-border/50"
                />
            </div>
            <div className="space-y-3">
                <Label>Color del Texto</Label>
                <ColorPickerAdvanced color={styles.color} setColor={(c) => updateStyle('color', c)} />
            </div>

            <div className="space-y-3">
                <Label>Resaltado del Texto</Label>
                <Popover>
                    <PopoverTrigger asChild>
                         <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded-full border border-border"
                              style={{ backgroundColor: styles.highlight || 'transparent' }}
                            />
                            <div className="flex-1 truncate">{styles.highlight ? styles.highlight.toUpperCase() : 'Ninguno'}</div>
                          </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-none">
                        <div className="p-2">
                             <ColorPickerAdvanced color={styles.highlight || '#ffff00'} setColor={(c) => updateStyle('highlight', c)} />
                             <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => updateStyle('highlight', undefined)}><Eraser className="mr-2"/>Eliminar Resaltado</Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="space-y-3">
                <Label>Fuente</Label>
                <Select value={styles.fontFamily} onValueChange={(f) => updateStyle('fontFamily', f)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar fuente..." /></SelectTrigger>
                    <SelectContent>
                      {googleFonts.map(font => <SelectItem key={font} value={font} style={{fontFamily: font}}>{font}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="space-y-3">
                 <Label>Estilos</Label>
                 <div className="grid grid-cols-4 gap-2">
                    <Toggle pressed={styles.fontWeight === 'bold'} onPressedChange={(p) => updateStyle('fontWeight', p ? 'bold' : 'normal')}><Bold/></Toggle>
                    <Toggle pressed={styles.fontStyle === 'italic'} onPressedChange={(p) => updateStyle('fontStyle', p ? 'italic' : 'normal')}><Italic/></Toggle>
                    <Toggle 
                      pressed={styles.textDecoration === 'underline'} 
                      onPressedChange={() => toggleDecoration('underline')}
                    >
                      <Underline/>
                    </Toggle>
                    <Toggle pressed={styles.textDecoration === 'line-through'} onPressedChange={() => toggleDecoration('line-through')}><Strikethrough/></Toggle>
                 </div>
            </div>

            <Separator className="bg-border/20"/>
            
            <div className="space-y-4">
                 <h3 className="text-sm font-medium text-foreground/80">Alineación</h3>
                 <div className="grid grid-cols-3 gap-2">
                    <Button variant={styles.textAlign === 'left' ? 'secondary' : 'outline'} size="icon" onClick={() => updateStyle('textAlign','left')}><AlignLeft/></Button>
                    <Button variant={styles.textAlign === 'center' ? 'secondary' : 'outline'} size="icon" onClick={() => updateStyle('textAlign','center')}><AlignCenter/></Button>
                    <Button variant={styles.textAlign === 'right' ? 'secondary' : 'outline'} size="icon" onClick={() => updateStyle('textAlign','right')}><AlignRight/></Button>
                 </div>
            </div>

            <Separator className="bg-border/20"/>

            <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground/80">Tamaño de Fuente</h3>
                <div className="flex items-center gap-2">
                  <Slider 
                      value={[styles.fontSize]}
                      max={100}
                      min={12}
                      step={1} 
                      onValueChange={(value) => updateStyle('fontSize', value[0])}
                  />
                  <span className="text-xs text-muted-foreground w-12 text-right">{styles.fontSize}px</span>
                </div>
            </div>

        </div>
    )
}

const LinkPopoverContent = ({ initialUrl, initialNewTab, onAccept, onOpenChange }: { initialUrl: string; initialNewTab: boolean; onAccept: (url: string, newTab: boolean) => void, onOpenChange: (open: boolean) => void }) => {
    const [url, setUrl] = useState(initialUrl);
    const [openInNewTab, setOpenInNewTab] = useState(initialNewTab);

    const handleAccept = () => {
        onAccept(url, openInNewTab);
        onOpenChange(false);
    };

    return (
        <div className="space-y-3 p-1">
            <div className="space-y-1">
              <Label htmlFor="link-url" className="text-xs">URL del enlace</Label>
              <Input id="link-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://ejemplo.com" className="h-8" />
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="open-new-tab" checked={openInNewTab} onCheckedChange={(checked) => setOpenInNewTab(!!checked)} />
                <Label htmlFor="open-new-tab" className="text-xs">Abrir en nueva pestaña</Label>
            </div>
            <Button size="sm" className="w-full" onClick={handleAccept}>Aceptar</Button>
        </div>
    );
};


const TextEditor = ({ selectedElement, canvasContent, setCanvasContent }: {
  selectedElement: SelectedElement;
  canvasContent: CanvasBlock[];
  setCanvasContent: (content: CanvasBlock[]) => void;
}) => {
    const { toast } = useToast();
    const [fragmentToDelete, setFragmentToDelete] = useState<string | null>(null);
    const [activeLinkEditor, setActiveLinkEditor] = useState<string | null>(null);

    if (selectedElement?.type !== 'primitive' || getSelectedBlockType(selectedElement, canvasContent) !== 'text') {
        return <div className="text-center text-muted-foreground p-4 text-sm">Selecciona un bloque de Texto para ver sus opciones.</div>;
    }

    const getElement = () => {
        const row = canvasContent.find(r => r.id === selectedElement.rowId);
        if (row?.type !== 'columns') return null;
        const col = row.payload.columns.find(c => c.id === selectedElement.columnId);
        const block = col?.blocks.find(b => b.id === selectedElement.primitiveId);
        return block?.type === 'text' ? block as TextBlock : null;
    }
    const element = getElement();
    if (!element) return null;

    const updateBlockPayload = (key: keyof TextBlock['payload']['globalStyles'], value: any) => {
         setCanvasContent(prev => prev.map(row => {
            if (row.id !== selectedElement.rowId || row.type !== 'columns') return row;
            const newColumns = row.payload.columns.map(col => {
                if (col.id !== selectedElement.columnId) return col;
                const newBlocks = col.blocks.map(block => {
                    if (block.id !== selectedElement.primitiveId || block.type !== 'text') return block;
                    const newGlobalStyles = { ...block.payload.globalStyles, [key]: value };
                    return { ...block, payload: { ...block.payload, globalStyles: newGlobalStyles } };
                });
                return { ...col, blocks: newBlocks };
            });
            return { ...row, payload: { ...row.payload, columns: newColumns } };
        }));
    }

    const updateFragment = (fragmentId: string, newProps: Partial<TextFragment> | { styles: Partial<TextFragment['styles']> }) => {
        setCanvasContent(prev => prev.map(row => {
            if (row.id !== selectedElement.rowId || row.type !== 'columns') return row;
            
            const newColumns = row.payload.columns.map(col => {
                if (col.id !== selectedElement.columnId) return col;
                
                const newBlocks = col.blocks.map(block => {
                    if (block.id !== selectedElement.primitiveId || block.type !== 'text') return block;

                    const newFragments = block.payload.fragments.map(frag => {
                        if (frag.id === fragmentId) {
                            if ('styles' in newProps) {
                                return { ...frag, styles: { ...frag.styles, ...newProps.styles } };
                            }
                            return { ...frag, ...newProps };
                        }
                        return frag;
                    });
                    return { ...block, payload: { ...block.payload, fragments: newFragments } };
                });
                return { ...col, blocks: newBlocks };
            });
            return { ...row, payload: { ...row.payload, columns: newColumns } };
        }));
    };
    
    const handleAddFragment = () => {
        const newFragment: TextFragment = {
            id: `frag_${Date.now()}`,
            text: 'Nuevo texto... ',
            styles: {},
        };
        setCanvasContent(prev => prev.map(row => {
            if (row.id !== selectedElement.rowId || row.type !== 'columns') return row;
            const newColumns = row.payload.columns.map(col => {
                if (col.id !== selectedElement.columnId) return col;
                const newBlocks = col.blocks.map(block => {
                    if (block.id !== selectedElement.primitiveId || block.type !== 'text') return block;
                    return { ...block, payload: { ...block.payload, fragments: [...block.payload.fragments, newFragment] } };
                });
                return { ...col, blocks: newBlocks };
            });
            return { ...row, payload: { ...row.payload, columns: newColumns } };
        }));
    };
    
    const confirmDeleteFragment = (fragmentId: string) => {
        setFragmentToDelete(fragmentId);
    };

    const handleDeleteFragment = () => {
        if (!fragmentToDelete) return;
        setCanvasContent(prev => prev.map(row => {
            if (row.id !== selectedElement.rowId || row.type !== 'columns') return row;
            const newColumns = row.payload.columns.map(col => {
                if (col.id !== selectedElement.columnId) return col;
                const newBlocks = col.blocks.map(block => {
                    if (block.id !== selectedElement.primitiveId || block.type !== 'text') return block;
                    const fragments = block.payload.fragments.filter(f => f.id !== fragmentToDelete);
                    return { ...block, payload: { ...block.payload, fragments } };
                });
                return { ...col, blocks: newBlocks };
            });
            return { ...row, payload: { ...row.payload, columns: newColumns } };
        }));
        setFragmentToDelete(null);
    };
    
    const handleToggleStyle = (fragmentId: string, style: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
        const fragment = element.payload.fragments.find(f => f.id === fragmentId);
        if (fragment) {
            updateFragment(fragmentId, { styles: { ...fragment.styles, [style]: !fragment.styles[style] } });
        }
    };
    
    const handleSetLink = (fragmentId: string, url: string, openInNewTab: boolean) => {
        if (!url) {
            const { link, ...rest } = element.payload.fragments.find(f => f.id === fragmentId) || {};
            updateFragment(fragmentId, rest);
        } else {
            updateFragment(fragmentId, { link: { url, openInNewTab } });
            toast({
                title: "Enlace añadido",
                description: "La URL se ha añadido al texto seleccionado.",
                className: 'bg-[#00CB07] border-none text-white',
            });
        }
    };

    const handleCopySymbol = (symbol: string) => {
        navigator.clipboard.writeText(symbol);
        toast({
            title: 'Símbolo Copiado',
            description: `"${symbol}" ha sido copiado al portapapeles.`,
            className: 'bg-[#00CB07] border-none text-white',
        });
    };
    
    const { globalStyles } = element.payload;

    return (
        <div className="space-y-4">
             <Dialog open={!!fragmentToDelete} onOpenChange={(isOpen) => !isOpen && setFragmentToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Confirmar Eliminación</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar este fragmento de texto? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFragmentToDelete(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDeleteFragment}>Sí, eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="space-y-4">
                 <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Type/>Estilos Globales del Bloque</h3>
                 <div className="space-y-2">
                    <Label>Alineación General</Label>
                     <div className="grid grid-cols-3 gap-2">
                        <Button variant={globalStyles.textAlign === 'left' ? 'secondary' : 'outline'} size="icon" onClick={() => updateBlockPayload('textAlign', 'left')}><AlignLeft/></Button>
                        <Button variant={globalStyles.textAlign === 'center' ? 'secondary' : 'outline'} size="icon" onClick={() => updateBlockPayload('textAlign', 'center')}><AlignCenter/></Button>
                        <Button variant={globalStyles.textAlign === 'right' ? 'secondary' : 'outline'} size="icon" onClick={() => updateBlockPayload('textAlign', 'right')}><AlignRight/></Button>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label>Tamaño de Fuente General</Label>
                    <Slider 
                        value={[globalStyles.fontSize]} 
                        min={8} max={72} 
                        onValueChange={(v) => updateBlockPayload('fontSize', v[0])}
                    />
                 </div>
            </div>
            <Separator className="bg-border/20" />
            <div>
                <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Pencil />Editor de Fragmentos de Texto</h3>
                <p className="text-xs text-muted-foreground mt-1">Añade y estiliza fragmentos de texto individuales.</p>
            </div>
            <ScrollArea className="max-h-80 overflow-y-auto custom-scrollbar pr-2">
                <div className="space-y-3">
                    {element.payload.fragments.map(fragment => (
                        <div key={fragment.id} className="p-3 border rounded-lg bg-background/30 space-y-3">
                            <Textarea
                                value={fragment.text}
                                onChange={(e) => updateFragment(fragment.id, { text: e.target.value })}
                                className="w-full bg-background"
                                rows={2}
                            />
                             <div className="space-y-2">
                                <Label className="text-xs">Fuente</Label>
                                <Select value={fragment.styles.fontFamily || 'Roboto'} onValueChange={v => updateFragment(fragment.id, { styles: { ...fragment.styles, fontFamily: v } })}>
                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {googleFonts.map(font => <SelectItem key={font} value={font} style={{ fontFamily: font }}>{font}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-wrap gap-1 items-center">
                                <Toggle size="sm" pressed={fragment.styles.bold} onPressedChange={() => handleToggleStyle(fragment.id, 'bold')}><Bold /></Toggle>
                                <Toggle size="sm" pressed={fragment.styles.italic} onPressedChange={() => handleToggleStyle(fragment.id, 'italic')}><Italic /></Toggle>
                                <Toggle size="sm" pressed={fragment.styles.underline} onPressedChange={() => handleToggleStyle(fragment.id, 'underline')}><Underline /></Toggle>
                                <Toggle size="sm" pressed={fragment.styles.strikethrough} onPressedChange={() => handleToggleStyle(fragment.id, 'strikethrough')}><Strikethrough /></Toggle>
                                
                                <Popover>
                                    <PopoverTrigger asChild><Button variant="outline" size="sm" className="p-2 h-auto"><PaletteIcon size={16} /></Button></PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 border-none"><ColorPickerAdvanced color={fragment.styles.color || '#000000'} setColor={(c) => updateFragment(fragment.id, { styles: { ...fragment.styles, color: c } })} /></PopoverContent>
                                </Popover>
                                
                                <Popover>
                                    <PopoverTrigger asChild><Button variant="outline" size="sm" className="p-2 h-auto"><Highlighter size={16} /></Button></PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 border-none">
                                        <div className="p-2">
                                            <ColorPickerAdvanced color={fragment.styles.highlight || '#ffffff'} setColor={(c) => updateFragment(fragment.id, { styles: { ...fragment.styles, highlight: c } })} />
                                            <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => updateFragment(fragment.id, { styles: { ...fragment.styles, highlight: undefined } })}><Eraser className="mr-2"/>Eliminar Resaltado</Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                <Popover open={activeLinkEditor === fragment.id} onOpenChange={(open) => setActiveLinkEditor(open ? fragment.id : null)}>
                                    <PopoverTrigger asChild>
                                        <Button onMouseDown={(e) => e.preventDefault()} variant="outline" size="sm" className="p-2 h-auto">
                                            {fragment.link ? <Link2Off size={16} onClick={() => handleSetLink(fragment.id, '', false)} /> : <LinkIcon size={16} />}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-0">
                                        <LinkPopoverContent
                                            initialUrl={fragment.link?.url || ''}
                                            initialNewTab={fragment.link?.openInNewTab || false}
                                            onAccept={(url, newTab) => handleSetLink(fragment.id, url, newTab)}
                                            onOpenChange={(open) => !open && setActiveLinkEditor(null)}
                                        />
                                    </PopoverContent>
                                </Popover>

                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive ml-auto size-8" onClick={() => confirmDeleteFragment(fragment.id)}><Trash2 className="size-4" /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <Button variant="outline" className="w-full" onClick={handleAddFragment}><PlusCircle className="mr-2" />Añadir Fragmento de Texto</Button>
            
            <Separator className="bg-border/20" />
            
            <div>
                 <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Sparkles />Símbolos Rápidos</h3>
                 <div className="grid grid-cols-8 gap-1 mt-2">
                    {popularEmojis.map(emoji => (
                        <TooltipProvider key={emoji}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-lg" onClick={() => handleCopySymbol(emoji)}>{emoji}</Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Copiar "{emoji}"</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                 </div>
            </div>
        </div>
    );
};


const StaticEmojiEditor = ({ selectedElement, canvasContent, setCanvasContent }: {
  selectedElement: SelectedElement;
  canvasContent: CanvasBlock[];
  setCanvasContent: (content: CanvasBlock[]) => void;
}) => {
    if (selectedElement?.type !== 'primitive') return null;

    const getElement = () => {
        const row = canvasContent.find(r => r.id === selectedElement.rowId);
        if (row?.type !== 'columns') return null;
        const col = row.payload.columns.find(c => c.id === selectedElement.columnId);
        const block = col?.blocks.find(b => b.id === selectedElement.primitiveId);
        return block?.type === 'emoji-static' ? block as StaticEmojiBlock : null;
    }
    const element = getElement();
    if (!element) return null;

    const updatePayload = (key: keyof StaticEmojiBlock['payload'], value: any) => {
        const newCanvasContent = canvasContent.map(row => {
            if (row.id !== selectedElement.rowId) return row;
            if (row.type !== 'columns') return row;
            const newColumns = row.payload.columns.map(col => {
                if (col.id === selectedElement.columnId) {
                    const newBlocks = col.blocks.map(block => {
                        if (block.id === selectedElement.primitiveId && block.type === 'emoji-static') {
                            return { ...block, payload: { ...block.payload, [key]: value } };
                        }
                        return block;
                    });
                    return { ...col, blocks: newBlocks };
                }
                return col;
            });
            return { ...row, payload: { ...row.payload, columns: newColumns } };
        });
        setCanvasContent(newCanvasContent as CanvasBlock[]);
    };

    const updateStyle = (key: keyof StaticEmojiBlock['payload']['styles'], value: any) => {
        const newCanvasContent = canvasContent.map(row => {
            if (row.id !== selectedElement.rowId) return row;
            if (row.type !== 'columns') return row;
            const newColumns = row.payload.columns.map(col => {
                if (col.id === selectedElement.columnId) {
                    const newBlocks = col.blocks.map(block => {
                        if (block.id === selectedElement.primitiveId && block.type === 'emoji-static') {
                            const currentStyles = block.payload.styles || {};
                            return { ...block, payload: { ...block.payload, styles: { ...currentStyles, [key]: value } } };
                        }
                        return block;
                    });
                    return { ...col, blocks: newBlocks };
                }
                return col;
            });
            return { ...row, payload: { ...row.payload, columns: newColumns } };
        });
        setCanvasContent(newCanvasContent as CanvasBlock[]);
    };
    
    const { styles } = element.payload;

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Smile/>Emoji</h3>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full text-2xl h-14">{element.payload.emoji}</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 max-h-60 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-6 gap-1">
                            {popularEmojis.map(emoji => (
                                <button 
                                    key={emoji}
                                    onClick={() => updatePayload('emoji', emoji)}
                                    className="text-3xl p-1 rounded-lg hover:bg-accent transition-colors aspect-square flex items-center justify-center"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            
            <Separator className="bg-border/20"/>
            
            <div className="space-y-4">
                 <h3 className="text-sm font-medium text-foreground/80">Alineación</h3>
                 <div className="grid grid-cols-3 gap-2">
                    <Button variant={styles.textAlign === 'left' ? 'secondary' : 'outline'} size="icon" onClick={() => updateStyle('textAlign','left')}><AlignLeft/></Button>
                    <Button variant={styles.textAlign === 'center' ? 'secondary' : 'outline'} size="icon" onClick={() => updateStyle('textAlign','center')}><AlignCenter/></Button>
                    <Button variant={styles.textAlign === 'right' ? 'secondary' : 'outline'} size="icon" onClick={() => updateStyle('textAlign','right')}><AlignRight/></Button>
                 </div>
            </div>

            <Separator className="bg-border/20"/>

            <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground/80">Tamaño</h3>
                <div className="flex items-center gap-2">
                  <Slider 
                      value={[styles.fontSize]}
                      max={128}
                      min={16}
                      step={1} 
                      onValueChange={(value) => updateStyle('fontSize', value[0])}
                  />
                  <span className="text-xs text-muted-foreground w-12 text-right">{styles.fontSize}px</span>
                </div>
            </div>

            <Separator className="bg-border/20"/>

            <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><RotateCw/>Rotación</h3>
                <div className="flex items-center gap-2">
                  <Slider 
                      value={[styles.rotate || 0]}
                      max={360}
                      min={0}
                      step={1} 
                      onValueChange={(value) => updateStyle('rotate', value[0])}
                  />
                  <span className="text-xs text-muted-foreground w-12 text-right">{styles.rotate || 0}°</span>
                </div>
            </div>
        </div>
    )
}

const InteractiveEmojiEditor = ({ selectedElement, canvasContent, setCanvasContent }: {
  selectedElement: SelectedElement;
  canvasContent: CanvasBlock[];
  setCanvasContent: (content: CanvasBlock[]) => void;
}) => {
  if (selectedElement?.type !== 'wrapper-primitive') return null;

  const getElement = (): InteractiveEmojiBlock | null => {
    const row = canvasContent.find(r => r.id === selectedElement.wrapperId);
    if (row?.type !== 'wrapper') return null;
    const block = row.payload.blocks.find(b => b.id === selectedElement.primitiveId);
    return block?.type === 'emoji-interactive' ? block as InteractiveEmojiBlock : null;
  }
  const element = getElement();

  if (!element) return null;

  const updatePayload = (key: keyof InteractiveEmojiBlock['payload'], value: any) => {
    const newCanvasContent = canvasContent.map(row => {
      if (row.id === (selectedElement as { wrapperId: string }).wrapperId && row.type === 'wrapper') {
        const newBlocks = row.payload.blocks.map(block => {
          if (block.id === selectedElement.primitiveId && block.type === 'emoji-interactive') {
            return { ...block, payload: { ...block.payload, [key]: value } };
          }
          return block;
        });
        return { ...row, payload: { ...row.payload, blocks: newBlocks } };
      }
      return row;
    });
    setCanvasContent(newCanvasContent as CanvasBlock[]);
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Move />Posición</h3>
        <div className="space-y-3">
          <Label className="flex items-center gap-2"><ArrowLeftRight className="size-4" /> Eje X</Label>
           <Slider
              value={[element.payload.x]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => updatePayload('x', value[0])}
            />
        </div>
        <div className="space-y-3">
           <Label className="flex items-center gap-2"><ArrowUpDown className="size-4" /> Eje Y</Label>
           <Slider
              value={[element.payload.y]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => updatePayload('y', value[0])}
            />
        </div>
      </div>
      <Separator className="bg-border/20"/>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><RotateCw />Rotación</h3>
        <div className="flex items-center gap-2">
          <Slider
            value={[element.payload.rotate]}
            min={-180}
            max={180}
            step={1}
            onValueChange={(value) => updatePayload('rotate', value[0])}
          />
          <span className="text-xs text-muted-foreground w-16 text-right">{element.payload.rotate}°</span>
        </div>
      </div>
       <Separator className="bg-border/20"/>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Scale />Escala</h3>
         <div className="flex items-center gap-2">
            <Slider
              value={[element.payload.scale]}
              min={0.1}
              max={5}
              step={0.1}
              onValueChange={(value) => updatePayload('scale', value[0])}
            />
            <span className="text-xs text-muted-foreground w-16 text-right">x{element.payload.scale.toFixed(1)}</span>
        </div>
      </div>
    </div>
  )
}

const SeparatorEditor = ({ selectedElement, canvasContent, setCanvasContent }: {
  selectedElement: SelectedElement;
  canvasContent: CanvasBlock[];
  setCanvasContent: (content: CanvasBlock[]) => void;
}) => {
    if (selectedElement?.type !== 'primitive') return null;

    const getElement = (): SeparatorBlock | null => {
        const row = canvasContent.find(r => r.id === selectedElement.rowId);
        if (row?.type !== 'columns') return null;
        const col = row.payload.columns.find(c => c.id === selectedElement.columnId);
        const block = col?.blocks.find(b => b.id === selectedElement.primitiveId);
        return block?.type === 'separator' ? block as SeparatorBlock : null;
    }
    const element = getElement();
    if (!element) return null;
    
    const updatePayload = (key: keyof SeparatorBlock['payload'], value: any) => {
      setCanvasContent(prev => prev.map(row => {
          if (row.id !== selectedElement.rowId || row.type !== 'columns') return row;
          return {
              ...row,
              payload: {
                  ...row.payload,
                  columns: row.payload.columns.map(col => {
                      if (col.id !== selectedElement.columnId) return col;
                      return {
                          ...col,
                          blocks: col.blocks.map(block => {
                              if (block.id !== selectedElement.primitiveId || block.type !== 'separator') return block;
                              return { ...block, payload: { ...block.payload, [key]: value } };
                          })
                      };
                  })
              }
          };
      }));
    };
    
    const updateSubPayload = (mainKey: 'line' | 'shapes' | 'dots', subKey: string, value: any) => {
        setCanvasContent(prev => prev.map(row => {
            if (row.id !== selectedElement.rowId || row.type !== 'columns') return row;
            return {
                ...row,
                payload: {
                    ...row.payload,
                    columns: row.payload.columns.map(col => {
                        if (col.id !== selectedElement.columnId) return col;
                        return {
                            ...col,
                            blocks: col.blocks.map(block => {
                                if (block.id !== selectedElement.primitiveId || block.type !== 'separator') return block;
                                return {
                                    ...block,
                                    payload: {
                                        ...block.payload,
                                        [mainKey]: { ...block.payload[mainKey], [subKey]: value }
                                    }
                                };
                            })
                        };
                    })
                }
            };
        }));
    };

    const updateShapesBackground = (key: string, value: any) => {
        const currentBg = element.payload.shapes.background;
        updateSubPayload('shapes', 'background', { ...currentBg, [key]: value });
    }

    const { payload } = element;

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-medium text-foreground/80">Espaciado Vertical</h3>
                <div className="flex items-center gap-2 mt-2">
                    <Slider
                        value={[payload.height]}
                        min={0}
                        max={200}
                        step={1}
                        onValueChange={(v) => updatePayload('height', v[0])}
                    />
                    <Input
                        type="number"
                        className="w-20 h-8"
                        value={payload.height}
                        onChange={(e) => updatePayload('height', parseInt(e.target.value) || 0)}
                    />
                </div>
            </div>

            <Separator className="bg-border/20"/>
            
            <div>
                 <h3 className="text-sm font-medium text-foreground/80">Estilo del Separador</h3>
                 <Tabs value={payload.style} onValueChange={(v) => updatePayload('style', v as any)} className="w-full mt-2">
                    <TabsList className="grid grid-cols-4 h-auto">
                        <TabsTrigger value="invisible" className="text-xs">Invisible</TabsTrigger>
                        <TabsTrigger value="line" className="text-xs">Línea</TabsTrigger>
                        <TabsTrigger value="shapes" className="text-xs">Formas</TabsTrigger>
                        <TabsTrigger value="dots" className="text-xs">Puntos</TabsTrigger>
                    </TabsList>
                 </Tabs>
            </div>
            
            {payload.style === 'line' && (
                <div className="space-y-4 p-3 border rounded-md bg-background/30">
                    <div className="space-y-2">
                        <Label>Grosor</Label>
                        <Slider value={[payload.line.thickness]} min={1} max={20} onValueChange={(v) => updateSubPayload('line', 'thickness', v[0])} />
                    </div>
                     <div className="space-y-2">
                        <Label>Estilo de Línea</Label>
                        <Select value={payload.line.style} onValueChange={(v) => updateSubPayload('line', 'style', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="solid">Sólida</SelectItem>
                                <SelectItem value="dotted">Punteada</SelectItem>
                                <SelectItem value="dashed">Discontinua</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Radio del Borde</Label>
                        <Slider value={[payload.line.borderRadius]} min={0} max={10} onValueChange={(v) => updateSubPayload('line', 'borderRadius', v[0])} />
                    </div>
                     <div className="space-y-2">
                        <Label>Color</Label>
                        <ColorPickerAdvanced color={payload.line.color} setColor={(c) => updateSubPayload('line', 'color', c)} />
                    </div>
                </div>
            )}

            {payload.style === 'shapes' && (
                 <div className="space-y-4 p-3 border rounded-md bg-background/30">
                    <div className="space-y-2">
                        <Label>Tipo de Forma</Label>
                        <Select value={payload.shapes.type} onValueChange={v => updateSubPayload('shapes', 'type', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="waves"><Waves className="inline-block mr-2" />Olas</SelectItem>
                                <SelectItem value="drops"><Droplet className="inline-block mr-2" />Gotas</SelectItem>
                                <SelectItem value="zigzag"><Minus className="inline-block mr-2" />Zigzag</SelectItem>
                                <SelectItem value="leaves"><Leaf className="inline-block mr-2" />Hojas</SelectItem>
                                <SelectItem value="scallops"><Cloud className="inline-block mr-2" />Vieiras</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Frecuencia</Label>
                        <Slider value={[payload.shapes.frequency]} min={1} max={50} step={1} onValueChange={v => updateSubPayload('shapes', 'frequency', v[0])}/>
                    </div>
                     <Tabs value={payload.shapes.background.type} onValueChange={(v) => updateShapesBackground('type', v)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="solid">Sólido</TabsTrigger>
                            <TabsTrigger value="gradient">Degradado</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="space-y-3">
                        <Label>Color 1</Label>
                        <ColorPickerAdvanced color={payload.shapes.background.color1} setColor={(c) => updateShapesBackground('color1', c)} />
                    </div>
                    {payload.shapes.background.type === 'gradient' && (
                        <>
                            <div className="space-y-3">
                                <Label>Color 2</Label>
                                <ColorPickerAdvanced color={payload.shapes.background.color2 || '#3357FF'} setColor={(c) => updateShapesBackground('color2', c)} />
                            </div>
                            <div className="space-y-3">
                                <Label>Dirección</Label>
                                <Select value={payload.shapes.background.direction} onValueChange={v => updateShapesBackground('direction', v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="vertical">Vertical</SelectItem>
                                        <SelectItem value="horizontal">Horizontal</SelectItem>
                                        <SelectItem value="radial">Radial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </div>
            )}
            
            {payload.style === 'dots' && (
                <div className="space-y-4 p-3 border rounded-md bg-background/30">
                     <div className="space-y-2">
                        <Label>Tamaño de los Puntos</Label>
                        <Slider value={[payload.dots.size]} min={1} max={10} onValueChange={v => updateSubPayload('dots', 'size', v[0])}/>
                    </div>
                     <div className="space-y-2">
                        <Label>Cantidad de Puntos</Label>
                        <Slider value={[payload.dots.count]} min={3} max={20} onValueChange={v => updateSubPayload('dots', 'count', v[0])}/>
                    </div>
                    <div className="space-y-2">
                        <Label>Color de los Puntos</Label>
                        <ColorPickerAdvanced color={payload.dots.color} setColor={c => updateSubPayload('dots', 'color', c)} />
                    </div>
                </div>
            )}

        </div>
    )
}

const YouTubeEditor = ({ selectedElement, canvasContent, setCanvasContent }: {
  selectedElement: SelectedElement;
  canvasContent: CanvasBlock[];
  setCanvasContent: (content: CanvasBlock[]) => void;
}) => {
    if (selectedElement?.type !== 'primitive') return null;

    const getElement = (): YouTubeBlock | null => {
        const row = canvasContent.find(r => r.id === selectedElement.rowId);
        if (row?.type !== 'columns') return null;
        const col = row.payload.columns.find(c => c.id === selectedElement.columnId);
        const block = col?.blocks.find(b => b.id === selectedElement.primitiveId);
        return block?.type === 'youtube' ? block as YouTubeBlock : null;
    }
    const element = getElement();
    if (!element) return null;

    const updatePayload = (key: keyof YouTubeBlock['payload'], value: any) => {
      setCanvasContent(prev => prev.map(row => {
          if (row.id !== selectedElement.rowId || row.type !== 'columns') return row;
          return {
              ...row,
              payload: {
                  ...row.payload,
                  columns: row.payload.columns.map(col => {
                      if (col.id !== selectedElement.columnId) return col;
                      return {
                          ...col,
                          blocks: col.blocks.map(block => {
                              if (block.id !== selectedElement.primitiveId || block.type !== 'youtube') return block;
                              return { ...block, payload: { ...block.payload, [key]: value } };
                          })
                      };
                  })
              }
          };
      }));
    };

    const updateStyle = (key: keyof YouTubeBlock['payload']['styles'], value: any) => {
        updatePayload('styles', { ...element.payload.styles, [key]: value });
    }
    
    const updateLink = (key: keyof YouTubeBlock['payload']['link'], value: any) => {
        updatePayload('link', { ...element.payload.link, [key]: value });
    }

    const updateBorder = (key: string, value: any) => {
        updateStyle('border', { ...element.payload.styles.border, [key]: value });
    }

    const updateDuration = (unit: 'hours' | 'minutes' | 'seconds', value: string) => {
        const numericValue = value.replace(/[^0-9]/g, '').slice(0, 2);
        updatePayload('duration', { ...element.payload.duration, [unit]: numericValue });
    };

    const handleUrlChange = (newUrl: string) => {
        let videoId: string | null = null;
        try {
            const url = new URL(newUrl);
            if (url.hostname === "youtu.be") {
                videoId = url.pathname.slice(1);
            } else if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
                videoId = url.searchParams.get("v");
            }
        } catch (error) {
            // Invalid URL format
        }

        updatePayload('url', newUrl);
        updatePayload('videoId', videoId);
        if (videoId) {
            updatePayload('link', { ...element.payload.link, url: newUrl });
        } else {
            updatePayload('link', { ...element.payload.link, url: '' });
        }
    };
    
    const { border } = element.payload.styles;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Youtube />Video de YouTube</h3>
            <Label>URL del Video</Label>
            <Input 
                value={element.payload.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="bg-transparent border-border/50"
            />
            {element.payload.url && !element.payload.videoId && (
                <p className="text-xs text-destructive">URL de YouTube no válida.</p>
            )}
        </div>

        <div className="flex items-center space-x-2">
            <Checkbox
                id={`yt-new-tab-${element.id}`}
                checked={element.payload.link.openInNewTab}
                onCheckedChange={(checked) => updateLink('openInNewTab', !!checked)}
            />
            <label
                htmlFor={`yt-new-tab-${element.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                Abrir en una nueva pestaña
            </label>
        </div>

        <Separator className="bg-border/20"/>

        <div className="space-y-2">
            <Label>Título del Video (Opcional)</Label>
            <Input
                value={element.payload.title}
                onChange={(e) => updatePayload('title', e.target.value)}
                placeholder="Título personalizado aquí..."
                className="bg-transparent border-border/50"
            />
             <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                    id={`yt-show-title-${element.id}`}
                    checked={element.payload.showTitle}
                    onCheckedChange={(checked) => updatePayload('showTitle', !!checked)}
                />
                <label htmlFor={`yt-show-title-${element.id}`} className="text-sm font-medium leading-none">
                    Mostrar título en el video
                </label>
            </div>
        </div>

        <Separator className="bg-border/20" />

        <div className="space-y-2">
            <Label>Duración del Video (Opcional)</Label>
            <div className="flex items-center gap-2">
                <Input type="text" placeholder="HH" value={element.payload.duration.hours} onChange={e => updateDuration('hours', e.target.value)} className="w-14 text-center"/>
                <span>:</span>
                <Input type="text" placeholder="MM" value={element.payload.duration.minutes} onChange={e => updateDuration('minutes', e.target.value)} className="w-14 text-center"/>
                <span>:</span>
                <Input type="text" placeholder="SS" value={element.payload.duration.seconds} onChange={e => updateDuration('seconds', e.target.value)} className="w-14 text-center"/>
            </div>
            <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                    id={`yt-show-duration-${element.id}`}
                    checked={element.payload.showDuration}
                    onCheckedChange={(checked) => updatePayload('showDuration', !!checked)}
                />
                <label htmlFor={`yt-show-duration-${element.id}`} className="text-sm font-medium leading-none">
                    Mostrar duración en el video
                </label>
            </div>
        </div>


        <Separator className="bg-border/20"/>
        
        <div className="space-y-2">
            <Label>Estilo del Botón de Play</Label>
            <Select value={element.payload.styles.playButtonType} onValueChange={(v) => updateStyle('playButtonType', v)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">Por Defecto</SelectItem>
                    <SelectItem value="classic">Clásico</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <Separator className="bg-border/20"/>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground/80">Estilo del Borde</h3>
            <div className="space-y-2">
              <Label>Ancho del Borde</Label>
               <Slider
                  value={[element.payload.styles.borderWidth]}
                  min={0}
                  max={20}
                  step={1}
                  onValueChange={(v) => updateStyle('borderWidth', v[0])}
                />
            </div>
             <div className="space-y-2">
                <Label>Color del Borde</Label>
                 <Tabs value={border.type} onValueChange={(v) => updateBorder('type', v)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="solid">Sólido</TabsTrigger>
                        <TabsTrigger value="gradient">Degradado</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="space-y-3 pt-2">
                    <Label>Color 1</Label>
                    <ColorPickerAdvanced color={border.color1} setColor={(c) => updateBorder('color1', c)} />
                </div>
                {border.type === 'gradient' && (
                    <>
                    <div className="space-y-3">
                        <Label>Color 2</Label>
                        <ColorPickerAdvanced color={border.color2 || '#3357FF'} setColor={(c) => updateBorder('color2', c)} />
                    </div>
                    <div className="space-y-3">
                        <Label>Dirección del Degradado</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button variant={border.direction === 'vertical' ? 'secondary' : 'outline'} size="icon" onClick={() => updateBorder('direction', 'vertical')}><ArrowDown /></Button></TooltipTrigger>
                                    <TooltipContent><p>Vertical</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button variant={border.direction === 'horizontal' ? 'secondary' : 'outline'} size="icon" onClick={() => updateBorder('direction', 'horizontal')}><ArrowRight /></Button></TooltipTrigger>
                                    <TooltipContent><p>Horizontal</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button variant={border.direction === 'radial' ? 'secondary' : 'outline'} size="icon" onClick={() => updateBorder('direction', 'radial')}><Sun className="size-4" /></Button></TooltipTrigger>
                                    <TooltipContent><p>Radial</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                    </>
                )}
            </div>
             <div className="space-y-2">
                <Label>Radio del Borde</Label>
                 <Slider
                  value={[element.payload.styles.borderRadius]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) => updateStyle('borderRadius', v[0])}
                />
            </div>
        </div>
      </div>
    );
};

function ThemeToggle() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme");
    setIsDarkMode(storedTheme === "dark");
  }, []);
  
  React.useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle("dark", isDarkMode);
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    }
  }, [isDarkMode, mounted]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    toast({
      title: `Cambiado a modo ${newMode ? "oscuro" : "claro"}`,
    });
  };

  if (!mounted) {
    return <div className="size-8" />;
  }

  return (
    <div className="group rounded-full p-0.5 bg-transparent hover:bg-gradient-to-r from-primary to-accent transition-colors">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full size-8 bg-card dark:bg-card hover:bg-card/80 dark:hover:bg-card/80"
        >
          {isDarkMode ? (
            <Sun className="size-5 text-foreground" />
          ) : (
            <Moon className="size-5 text-foreground" />
          )}
          <span className="sr-only">Cambiar tema</span>
        </Button>
    </div>
  );
}

function getSelectedBlockType(selectedElement: SelectedElement, canvasContent: CanvasBlock[]): StaticPrimitiveBlockType | InteractiveBlockType | 'column' | 'wrapper' | null {
    if (!selectedElement) return null;

    switch (selectedElement.type) {
        case 'column':
            return 'column';
        case 'wrapper':
            return 'wrapper';
        case 'wrapper-primitive': {
            const wrapper = canvasContent.find(r => r.id === selectedElement.wrapperId) as WrapperBlock | undefined;
            const block = wrapper?.payload.blocks.find(b => b.id === selectedElement.primitiveId);
            return block?.type || null;
        }
        case 'primitive': {
            const row = canvasContent.find(r => r.id === selectedElement.rowId) as ColumnsBlock | undefined;
            const col = row?.payload.columns.find(c => c.id === selectedElement.columnId);
            const block = col?.blocks.find(b => b.id === selectedElement.primitiveId);
            return block?.type || null;
        }
        default:
            return null;
    }
}


export default function CreateTemplatePage() {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [templateName, setTemplateName] = useState("Plantilla sin título");
  const [tempTemplateName, setTempTemplateName] = useState(templateName);
  const { toast } = useToast();
  
  // Modals State
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isColumnBlockSelectorOpen, setIsColumnBlockSelectorOpen] = useState(false);
  const [isWrapperBlockSelectorOpen, setIsWrapperBlockSelectorOpen] = useState(false);
  const [isEmojiSelectorOpen, setIsEmojiSelectorOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [activeContainer, setActiveContainer] = useState<{ id: string, type: 'column' | 'wrapper' } | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{rowId: string, colId?: string, primId?: string} | null>(null);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [isActionSelectorModalOpen, setIsActionSelectorModalOpen] = useState(false);
  const [actionTargetWrapperId, setActionTargetWrapperId] = useState<string | null>(null);
  const [imageModalState, setImageModalState] = useState({
      url: '',
      fit: 'cover' as BackgroundFit,
      positionX: 50,
      positionY: 50,
      zoom: 100,
  });

  // Canvas State
  const [canvasContent, setCanvasContent] = useState<CanvasBlock[]>([]);
  const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);

  // Wrapper resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizingWrapperId, setResizingWrapperId] = useState<string | null>(null);

  const wrapperRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const handleSave = () => {
    setLastSaved(new Date());
  };
  
  const handleBlockClick = (blockId: BlockType) => {
    if (blockId === 'columns') {
      setIsColumnModalOpen(true);
    }
    if (blockId === 'wrapper') {
      const newBlock: WrapperBlock = {
        id: `wrapper_${Date.now()}`,
        type: 'wrapper',
        payload: {
          blocks: [],
          height: 200,
          styles: {},
        },
      };
      setCanvasContent([...canvasContent, newBlock]);
    }
  };

  const handleAddColumns = (numColumns: number) => {
    if (numColumns) {
      const newBlock: ColumnsBlock = {
        id: `block_${Date.now()}`,
        type: 'columns',
        payload: {
          columns: Array.from({ length: numColumns }).map((_, i) => ({
            id: `col_${Date.now()}_${i}`,
            blocks: [],
            styles: {},
            width: 100 / numColumns,
          })),
          alignment: 50,
        },
      };
      setCanvasContent([...canvasContent, newBlock]);
      setIsColumnModalOpen(false);
    }
  };

  const handleOpenBlockSelector = (containerId: string, type: 'column' | 'wrapper', event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const containerElement = target.closest('.group\\/wrapper, .group\\/column');
    if (containerElement) {
        const rect = containerElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setClickPosition({ x, y });
    } else {
        setClickPosition({ x: 50, y: 50 }); // Fallback
    }

    setActiveContainer({ id: containerId, type });

    if (type === 'column') {
        setIsColumnBlockSelectorOpen(true);
    } else if (type === 'wrapper') {
        setIsWrapperBlockSelectorOpen(true);
    }
  };

  const handleAddBlockToColumn = (blockType: StaticPrimitiveBlockType) => {
    if (!activeContainer || activeContainer.type !== 'column') return;
     let newBlock: PrimitiveBlock;

    if (blockType === 'button') {
        newBlock = {
            id: `button_${Date.now()}`,
            type: 'button',
            payload: { 
              text: 'Botón', 
              link: { url: '#', openInNewTab: false },
              textAlign: 'center', 
              styles: { 
                borderRadius: 8, 
                color: '#FFFFFF', 
                backgroundColor: '#A020F0',
                background: { type: 'solid', color1: '#A020F0' } 
              } 
            },
        };
    } else if (blockType === 'heading') {
        newBlock = {
            id: `heading_${Date.now()}`,
            type: 'heading',
            payload: { 
                text: 'Título principal',
                styles: {
                    color: '#000000',
                    fontFamily: 'Roboto',
                    fontSize: 32,
                    textAlign: 'left',
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    textDecoration: 'none',
                }
            },
        };
    } else if (blockType === 'text') {
        newBlock = {
            id: `text_${Date.now()}`,
            type: 'text',
            payload: {
                fragments: [{ id: `frag_${Date.now()}`, text: 'Este es un párrafo de texto. ', styles: {} }],
                globalStyles: { textAlign: 'left', fontSize: 16 }
            },
        };
    } else if (blockType === 'emoji-static') {
        newBlock = {
            id: `emoji-static_${Date.now()}`,
            type: 'emoji-static',
            payload: {
                emoji: '😀',
                styles: {
                    fontSize: 48,
                    textAlign: 'center',
                    rotate: 0,
                }
            }
        };
    } else if (blockType === 'separator') {
        newBlock = {
            id: `separator_${Date.now()}`,
            type: 'separator',
            payload: {
                height: 20,
                style: 'line',
                line: {
                    thickness: 2,
                    color: '#cccccc',
                    style: 'solid',
                    borderRadius: 0,
                },
                shapes: {
                    type: 'waves',
                    background: {
                        type: 'solid',
                        color1: '#A020F0',
                        color2: '#3357FF',
                        direction: 'vertical'
                    },
                    frequency: 5,
                },
                dots: {
                    size: 4,
                    count: 10,
                    color: '#cccccc',
                }
            },
        };
    } else if (blockType === 'youtube') {
        newBlock = {
            id: `youtube_${Date.now()}`,
            type: 'youtube',
            payload: {
                url: '',
                videoId: null,
                title: '',
                showTitle: false,
                duration: {
                    hours: '',
                    minutes: '',
                    seconds: '',
                },
                showDuration: false,
                link: {
                  url: '',
                  openInNewTab: false,
                },
                styles: {
                    playButtonType: 'default',
                    borderRadius: 12,
                    border: {
                        type: 'solid',
                        color1: '#000000',
                        color2: '#ffffff',
                        direction: 'vertical'
                    },
                    borderWidth: 0,
                }
            }
        };
    } else {
        newBlock = {
            id: `${blockType}_${Date.now()}`,
            type: blockType,
            payload: {},
        };
    }

    const newCanvasContent = canvasContent.map((row) => {
      if (row.type === 'columns') {
        const newColumns = row.payload.columns.map((col) => {
          if (col.id === activeContainer.id) {
            return { ...col, blocks: [...col.blocks, newBlock] };
          }
          return col;
        });
        return { ...row, payload: { ...row.payload, columns: newColumns } };
      }
      return row;
    });

    setCanvasContent(newCanvasContent as CanvasBlock[]);
    setIsColumnBlockSelectorOpen(false);
    setActiveContainer(null);
  }

 const handleAddBlockToWrapper = (blockType: InteractiveBlockType) => {
    if (!activeContainer || activeContainer.type !== 'wrapper') return;
     if (blockType === 'emoji-interactive') {
      setIsWrapperBlockSelectorOpen(false);
      setIsEmojiSelectorOpen(true);
    }
  };

  
  const handleSelectEmojiForWrapper = (emoji: string) => {
    if (!activeContainer || !clickPosition || !wrapperRefs.current[activeContainer.id]) return;

    const containerRect = wrapperRefs.current[activeContainer.id]!.getBoundingClientRect();
    const xPercent = (clickPosition.x / containerRect.width) * 100;
    const yPercent = (clickPosition.y / containerRect.height) * 100;
    
    const newBlock: InteractiveEmojiBlock = {
      id: `emoji_${Date.now()}`,
      type: 'emoji-interactive',
      payload: {
        emoji,
        x: xPercent, 
        y: yPercent,
        scale: 1,
        rotate: 0,
      }
    };

    const newCanvasContent = canvasContent.map(row => {
      if (row.type === 'wrapper' && row.id === activeContainer.id) {
        return { ...row, payload: { ...row.payload, blocks: [...row.payload.blocks, newBlock] } };
      }
      return row;
    });

    setCanvasContent(newCanvasContent as CanvasBlock[]);
    setIsEmojiSelectorOpen(false);
    setActiveContainer(null);
    setClickPosition(null);
  }
  
  const promptDeleteItem = (rowId: string, colId?: string, primId?: string) => {
    setItemToDelete({ rowId, colId, primId });
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteItem = () => {
    if (!itemToDelete) return;
  
    let newCanvasContent;
  
    if (itemToDelete.primId && itemToDelete.colId) { // Deleting a primitive from a column
      newCanvasContent = canvasContent.map((row) => {
        if (row.id !== itemToDelete.rowId || row.type !== 'columns') return row;
        
        const newColumns = row.payload.columns.map((col) => {
          if (col.id !== itemToDelete.colId) return col;
          return { ...col, blocks: col.blocks.filter((block) => block.id !== itemToDelete!.primId) };
        });
        return { ...row, payload: { ...row.payload, columns: newColumns } };
      });
    } else if (itemToDelete.primId) { // Deleting a primitive from a wrapper
       newCanvasContent = canvasContent.map((row) => {
        if (row.id !== itemToDelete.rowId || row.type !== 'wrapper') return row;
  
        const newBlocks = row.payload.blocks.filter((block) => block.id !== itemToDelete!.primId);
        return { ...row, payload: { ...row.payload, blocks: newBlocks } };
      });
    } else { // Deleting a whole row (ColumnsBlock or WrapperBlock)
      newCanvasContent = canvasContent.filter((row) => row.id !== itemToDelete.rowId);
    }
  
    setCanvasContent(newCanvasContent as CanvasBlock[]);
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    setSelectedElement(null);
  };
  
  const getButtonStyle = (block: ButtonBlock) => {
    const style: React.CSSProperties = {
        padding: '10px 20px',
        border: 'none',
        cursor: 'pointer',
    };
    const { styles } = block.payload;

    if(styles.borderRadius !== undefined) {
        style.borderRadius = `${styles.borderRadius}px`;
    }
    
    style.color = styles.color;

    if(styles.background) {
        if(styles.background.type === 'solid') {
            style.backgroundColor = styles.background.color1;
        } else if (styles.background.type === 'gradient') {
             if (styles.background.direction === 'radial') {
              style.backgroundImage = `radial-gradient(${styles.background.color1}, ${styles.background.color2})`;
            } else {
              const angle = styles.background.direction === 'horizontal' ? 'to right' : 'to bottom';
              style.backgroundImage = `linear-gradient(${angle}, ${styles.background.color1}, ${styles.background.color2})`;
            }
        }
    } else {
      style.backgroundColor = styles.backgroundColor;
    }
    return style;
  }
  
  const getButtonContainerStyle = (block: ButtonBlock): React.CSSProperties => {
    const textAlignToJustifyContent = {
        left: 'flex-start',
        center: 'center',
        right: 'flex-end',
    }
    return {
        display: 'flex',
        justifyContent: textAlignToJustifyContent[block.payload.textAlign] || 'center'
    }
  }

  const getHeadingStyle = (block: HeadingBlock): React.CSSProperties => {
    const { color, fontFamily, fontSize, textAlign, fontWeight, fontStyle, textDecoration, highlight } = block.payload.styles;
    const style: React.CSSProperties = {
        color: color || '#000000',
        fontFamily: fontFamily || 'Arial, sans-serif',
        fontSize: `${fontSize || 32}px`,
        fontWeight: fontWeight || 'normal',
        fontStyle: fontStyle || 'normal',
        textDecoration: textDecoration || 'none',
        padding: '8px',
        wordBreak: 'break-word',
    };
    
    if(highlight) {
      style.backgroundColor = highlight;
      style.display = 'inline';
      style.lineHeight = 'normal'; 
    }

    const containerStyle: React.CSSProperties = {
      textAlign: textAlign || 'left',
      width: '100%',
    };

    return { ...style, ...containerStyle };
  };

 const getFragmentStyle = (fragment: TextFragment): React.CSSProperties => {
    const style: React.CSSProperties = {};
    if (fragment.styles.bold) style.fontWeight = 'bold';
    if (fragment.styles.italic) style.fontStyle = 'italic';
    
    let textDecoration = '';
    if (fragment.styles.underline) textDecoration += ' underline';
    if (fragment.styles.strikethrough) textDecoration += ' line-through';
    if (textDecoration) style.textDecoration = textDecoration.trim();

    if (fragment.styles.color) style.color = fragment.styles.color;
    if (fragment.styles.highlight) style.backgroundColor = fragment.styles.highlight;
    if(fragment.styles.fontFamily) style.fontFamily = fragment.styles.fontFamily;
    return style;
  };

  const getStaticEmojiStyle = (block: StaticEmojiBlock): React.CSSProperties => {
    const { fontSize, textAlign, rotate } = block.payload.styles;
    return {
        fontSize: `${fontSize || 48}px`,
        textAlign: textAlign || 'center',
        width: '100%',
        padding: '8px',
        transform: `rotate(${rotate || 0}deg)`,
        display: 'inline-block',
    };
  };

  const generateShapePath = (
    type: SeparatorShapeType,
    frequency: number,
    width: number,
    height: number
  ): string => {
    if (width <= 0 || height <= 0) return "";
    let path = "";
  
    switch (type) {
      case 'waves': {
        const amplitude = height / 2;
        path = `M0,${amplitude}`;
        for (let i = 0; i <= frequency * 2; i++) {
          const x = (i / (frequency * 2)) * width;
          const y = amplitude + (amplitude * 0.8) * Math.sin((i / frequency) * Math.PI);
          path += ` L${x.toFixed(2)},${y.toFixed(2)}`;
        }
        break;
      }
      case 'drops': {
        path = `M0,0`;
        const segmentWidth = width / frequency;
        const dropHeight = height * 0.9;
        const dropWidth = Math.min(segmentWidth * 0.6, height * 0.5); 
        for (let i = 0; i < frequency; i++) {
            const startX = i * segmentWidth + (segmentWidth - dropWidth) / 2;
            const midX = startX + dropWidth / 2;
            const endX = startX + dropWidth;
            path += ` M${midX},${height * 0.1} Q${startX},${height * 0.5} ${midX},${dropHeight} Q${endX},${height * 0.5} ${midX},${height * 0.1} Z`;
        }
        break;
      }
      case 'zigzag': {
        path = `M0,${height/2}`;
        for (let i = 0; i <= frequency * 2; i++) {
            const x = (i / (frequency * 2)) * width;
            const y = i % 2 === 0 ? 0 : height;
            path += ` L${x.toFixed(2)},${y.toFixed(2)}`;
        }
        break;
      }
      case 'leaves': {
         path = '';
         const segmentWidth = width / frequency;
         const leafHeight = height * 0.8;
         const leafWidth = Math.min(segmentWidth * 0.8, height * 1.5);
        for (let i = 0; i < frequency; i++) {
          const startX = i * segmentWidth + (segmentWidth - leafWidth) / 2;
          const midX = startX + leafWidth / 2;
          const endX = startX + leafWidth;
          const midY = height / 2;
          path += ` M${startX},${midY} Q${midX},${midY - leafHeight/2} ${endX},${midY} Q${midX},${midY + leafHeight/2} ${startX},${midY} Z`;
        }
        break;
      }
       case 'scallops': {
        path = `M-1,${height}`;
        const segmentWidth = width / frequency;
        const r = Math.min(segmentWidth / 2, height);
        for (let i = 0; i < frequency; i++) {
          const x1 = i * segmentWidth;
          const x2 = x1 + segmentWidth;
          path += ` A ${r} ${r} 0 0 1 ${x2} ${height}`;
        }
        path += ` L${width + 1},${height} L${width+1},0 L-1,0 Z`;
        break;
      }
    }
    return path;
  };
  
  
  const ShapesSeparator = ({ block }: { block: SeparatorBlock }) => {
    const ref = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: block.payload.height });
    const { type, background, frequency } = block.payload.shapes;

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width } = entries[0].contentRect;
                setDimensions({ width, height: block.payload.height });
            }
        });
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [block.payload.height]);
    
    useEffect(() => {
        setDimensions(prev => ({ ...prev, height: block.payload.height }));
    }, [block.payload.height]);

    const pathData = generateShapePath(type, frequency, dimensions.width, dimensions.height);
    
    const getFill = () => {
        const gradientId = `shape-gradient-${block.id}`;
        if (background.type === 'solid') {
            return background.color1;
        }
        if (background.type === 'gradient') {
             return `url(#${gradientId})`;
        }
        return 'none';
    };

    return (
        <svg ref={ref} width="100%" height={`${block.payload.height}px`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            {background.type === 'gradient' && (
                <defs>
                    <linearGradient id={`shape-gradient-${block.id}`} x1="0%" y1="0%" x2={background.direction === 'horizontal' ? '100%' : '0%'} y2={background.direction === 'vertical' ? '100%' : '0%'}>
                        <stop offset="0%" stopColor={background.color1} />
                        <stop offset="100%" stopColor={background.color2} />
                    </linearGradient>
                    <radialGradient id={`shape-gradient-${block.id}`}>
                        <stop offset="0%" stopColor={background.color1} />
                        <stop offset="100%" stopColor={background.color2} />
                    </radialGradient>
                </defs>
            )}
            <path d={pathData} fill={getFill()} stroke="none" />
        </svg>
    );
  }

   const LineSeparator = ({ block }: { block: SeparatorBlock }) => {
    const { thickness, borderRadius, color, style } = block.payload.line;
    
     const lineStyle: React.CSSProperties = {
        height: `${thickness}px`,
        borderRadius: `${borderRadius}px`,
        width: '100%',
        backgroundColor: style === 'solid' ? color : 'transparent',
    };
    
    if (style !== 'solid') {
        const lineSegment = style === 'dashed' ? '10px' : `${thickness}px`;
        const gap = style === 'dashed' ? '5px' : `${thickness}px`;
        lineStyle.backgroundImage = `repeating-linear-gradient(to right, ${color} 0, ${color} ${lineSegment}, transparent ${lineSegment}, transparent calc(${lineSegment} + ${gap}))`;
    }

    const containerStyle: React.CSSProperties = {
        height: `${block.payload.height}px`,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: `0 1px`
    };

    return (
        <div style={containerStyle}>
            <div style={lineStyle}></div>
        </div>
    );
};
  
  const renderPrimitiveBlock = (block: PrimitiveBlock, rowId: string, colId: string, colCount: number) => {
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
        {
          (() => {
             switch(block.type) {
              case 'heading':
                const headingBlock = block as HeadingBlock;
                const {textAlign, ...textStyles} = getHeadingStyle(headingBlock);
                return (
                  <div style={{ textAlign: textAlign as TextAlign }}>
                    <span style={textStyles}>
                      {headingBlock.payload.text}
                    </span>
                  </div>
                );
              case 'text':
                const textBlock = block as TextBlock;
                return (
                    <p style={{ padding: '8px', wordBreak: 'break-word', whiteSpace: 'pre-wrap', textAlign: textBlock.payload.globalStyles.textAlign, fontSize: `${textBlock.payload.globalStyles.fontSize}px` }}>
                        {textBlock.payload.fragments.map(fragment => {
                            const El = fragment.link ? 'a' : 'span';
                             const props = fragment.link ? { 
                                href: fragment.link.url, 
                                target: fragment.link.openInNewTab ? '_blank' : '_self',
                                rel: 'noopener noreferrer', 
                                style: { color: 'hsl(var(--primary))', textDecoration: 'underline' } 
                            } : {};
                            return (
                                <El key={fragment.id} {...props}>
                                    <span style={getFragmentStyle(fragment)}>{fragment.text}</span>
                                </El>
                            );
                        })}
                    </p>
                );
              case 'emoji-static':
                return <div style={{textAlign: (block as StaticEmojiBlock).payload.styles.textAlign}}><p style={getStaticEmojiStyle(block as StaticEmojiBlock)}>{(block as StaticEmojiBlock).payload.emoji}</p></div>
              case 'button':
                  const buttonBlock = block as ButtonBlock;
                  const buttonElement = (
                    <button style={getButtonStyle(buttonBlock)}>
                        {buttonBlock.payload.text}
                    </button>
                  );
                  return (
                      <div style={getButtonContainerStyle(buttonBlock)}>
                        {buttonBlock.payload.link.url && buttonBlock.payload.link.url !== '#' ? (
                           <a href={buttonBlock.payload.link.url} target={buttonBlock.payload.link.openInNewTab ? '_blank' : '_self'} rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                {buttonElement}
                           </a>
                        ) : (
                           buttonElement
                        )}
                      </div>
                  );
                case 'separator':
                    const separatorBlock = block as SeparatorBlock;
                    const { payload } = separatorBlock;
                    return (
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {payload.style === 'invisible' && <div style={{ height: `${payload.height}px` }} />}
                            {payload.style === 'line' && <LineSeparator block={separatorBlock} />}
                            {payload.style === 'shapes' && (
                               <div className="w-full h-full" style={{ height: `${payload.height}px` }}><ShapesSeparator block={separatorBlock} /></div>
                            )}
                            {payload.style === 'dots' && (
                                <div className="flex justify-around items-center w-full" style={{ height: `${payload.height}px` }}>
                                    {Array.from({ length: payload.dots.count }).map((_, i) => (
                                        <div key={i} style={{
                                            width: `${payload.dots.size}px`,
                                            height: `${payload.dots.size}px`,
                                            borderRadius: '50%',
                                            backgroundColor: payload.dots.color,
                                            boxShadow: `0 0 8px ${payload.dots.color}`
                                        }} />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                case 'youtube': {
                    const youtubeBlock = block as YouTubeBlock;
                    const { videoId, styles, link, title, showTitle, duration, showDuration } = youtubeBlock.payload;
                    const thumbnailUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400.png?text=YouTube+Video';

                    const playButtonSvg = {
                        default: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" version="1.1" viewBox="0 0 68 48" width="100%"><path class="ytp-large-play-button-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path><path d="M 45,24 27,14 27,34" fill="#fff"></path></svg>`,
                        classic: `<svg xmlns="http://www.w3.org/2000/svg" width="90" height="64" viewBox="0 0 90 64" fill="none"><rect width="90" height="64" rx="18" fill="red" fill-opacity="0.9"/><path d="M60 32L36 45.8564L36 18.1436L60 32Z" fill="white"/></svg>`,
                    };
                    
                    const sizeVariant = colCount === 1 ? 'lg' : colCount === 2 ? 'md' : 'sm';
                    const playButtonSize = { lg: 'w-16 h-12', md: 'w-14 h-10', sm: 'w-12 h-9' };
                    const titleSize = { lg: 'text-2xl p-4', md: 'text-lg p-3', sm: 'text-xs px-2 pt-1 pb-0' };
                    const durationSize = { lg: 'text-base', md: 'text-sm', sm: 'text-xs' };

                    const formatDuration = () => {
                        const { hours, minutes, seconds } = duration;
                        const h = parseInt(hours || '0', 10);
                        const m = parseInt(minutes || '0', 10);
                        const s = parseInt(seconds || '0', 10);

                        if (isNaN(h) && isNaN(m) && isNaN(s)) return null;

                        const parts = [];
                        if (h > 0) parts.push(h.toString());
                        if(h > 0 || m > 0) {
                           parts.push(m.toString().padStart(h > 0 ? 2 : 1, '0'));
                        }
                        if (s > 0 || m > 0 || h > 0) {
                             parts.push(s.toString().padStart(2, '0'));
                        }

                        if (parts.length === 0) return null;
                        if(parts.length === 1 && m > 0) return `0:${parts[0].padStart(2,'0')}`;
                        if(parts.length === 1) return `0:0${parts[0]}`;
                        
                        return parts.join(':');
                    };
                    const displayDuration = showDuration ? formatDuration() : null;
                    
                    const { border } = styles;
                    let borderStyle: React.CSSProperties = {};
                    if(border.type === 'solid') {
                        borderStyle.background = border.color1;
                    } else if (border.type === 'gradient') {
                         if (border.direction === 'radial') {
                          borderStyle.background = `radial-gradient(${border.color1}, ${border.color2})`;
                        } else {
                          const angle = border.direction === 'horizontal' ? 'to right' : 'to bottom';
                          borderStyle.background = `linear-gradient(${angle}, ${border.color1}, ${border.color2})`;
                        }
                    }

                    return (
                        <div className="p-2 w-full h-full">
                           <div 
                            style={{
                                ...borderStyle,
                                borderRadius: `${styles.borderRadius}px`,
                                padding: `${styles.borderWidth}px`
                            }}
                            className="w-full h-full"
                           >
                            <div
                                className="w-full h-full relative aspect-video"
                                style={{
                                  borderRadius: `${styles.borderRadius > 0 ? styles.borderRadius - styles.borderWidth : 0}px`,
                                  overflow: 'hidden',
                                }}
                            >
                                <img src={thumbnailUrl} alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover" />
                                
                                {showTitle && title && (
                                    <div className={cn("absolute top-0 left-0 w-full text-white bg-gradient-to-b from-black/60 to-transparent pointer-events-none", titleSize[sizeVariant])}>
                                        <p className="font-semibold truncate">{title}</p>
                                    </div>
                                )}

                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                     <a 
                                        href={link.url && videoId ? link.url : undefined} 
                                        target={link.url && videoId ? (link.openInNewTab ? '_blank' : '_self') : undefined} 
                                        rel="noopener noreferrer"
                                        className={cn(
                                          "block bg-center bg-no-repeat bg-contain", 
                                          playButtonSize[sizeVariant],
                                          link.url && videoId ? "cursor-pointer" : "cursor-default"
                                        )}
                                        style={{ backgroundImage: `url('data:image/svg+xml;base64,${btoa(playButtonSvg[styles.playButtonType])}')` }}
                                        onClick={(e) => {
                                            if (!link.url || !videoId) e.preventDefault();
                                        }}
                                     >
                                         <span className="sr-only">Play Video</span>
                                     </a>
                                </div>
                                {displayDuration && (
                                    <div className={cn("absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white font-mono rounded-md pointer-events-none", durationSize[sizeVariant])}>
                                        {displayDuration}
                                    </div>
                                )}
                            </div>
                           </div>
                        </div>
                    );
                }
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
  
  // --- Wrapper Resize Logic ---
  const handleMouseDownResize = (e: React.MouseEvent, wrapperId: string) => {
    e.preventDefault();
    setIsResizing(true);
    setResizingWrapperId(wrapperId);
  };
  
  const handleMouseMoveResize = useCallback((e: MouseEvent) => {
    if (isResizing && resizingWrapperId) {
      const wrapperElement = document.getElementById(resizingWrapperId);
      if(wrapperElement){
        const newHeight = e.clientY - wrapperElement.getBoundingClientRect().top;
        const updatedCanvasContent = canvasContent.map(block => {
          if (block.id === resizingWrapperId && block.type === 'wrapper') {
            return {
              ...block,
              payload: { ...block.payload, height: Math.max(50, newHeight) } // min height 50
            };
          }
          return block;
        });
        setCanvasContent(updatedCanvasContent as CanvasBlock[]);
      }
    }
  }, [isResizing, resizingWrapperId, canvasContent, setCanvasContent]);
  
  const handleMouseUpResize = useCallback(() => {
    setIsResizing(false);
    setResizingWrapperId(null);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMoveResize);
      document.addEventListener('mouseup', handleMouseUpResize);
    } else {
      document.removeEventListener('mousemove', handleMouseMoveResize);
      document.removeEventListener('mouseup', handleMouseUpResize);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveResize);
      document.removeEventListener('mouseup', handleMouseUpResize);
    };
  }, [isResizing, handleMouseMoveResize, handleMouseUpResize]);

  useEffect(() => {
    setTempTemplateName(templateName);
  }, [isEditNameModalOpen, templateName]);

  const viewportClasses = {
    desktop: 'max-w-4xl', 
    tablet: 'max-w-xl',  
    mobile: 'max-w-sm', 
  };
  
  const getElementStyle = (element: ColumnsBlock | WrapperBlock | Column) => {
    const styles = 'payload' in element && 'styles' in element.payload ? element.payload.styles : 'styles' in element ? element.styles : {};
    const { background, borderRadius, backgroundImage } = styles || {};

    const style: React.CSSProperties = {};

    if (borderRadius !== undefined) {
      style.borderRadius = `${borderRadius}px`;
    }

    if (background) {
      const { type, color1, color2, direction } = background;
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
    
    if (backgroundImage) {
        style.backgroundImage = `url(${backgroundImage.url})`;
        style.backgroundSize = backgroundImage.fit === 'auto' ? `${backgroundImage.zoom}%` : backgroundImage.fit,
        style.backgroundPosition = `${backgroundImage.positionX}% ${backgroundImage.positionY}%`,
        style.backgroundRepeat = 'no-repeat';
    }
    
    return style;
  };
  
  
  const handleOpenImageModal = () => {
    if (selectedElement?.type === 'wrapper') {
        const wrapper = canvasContent.find(r => r.id === selectedElement.wrapperId) as WrapperBlock | undefined;
        const currentBgImage = wrapper?.payload.styles.backgroundImage;
        setImageModalState({
            url: currentBgImage?.url || '',
            fit: currentBgImage?.fit || 'cover',
            positionX: currentBgImage?.positionX || 50,
            positionY: currentBgImage?.positionY || 50,
            zoom: currentBgImage?.zoom || 100,
        });
    }
    setIsImageModalOpen(true);
  };
  
  const handleApplyBackgroundImage = () => {
     if (selectedElement?.type !== 'wrapper') return;

    setCanvasContent(prevCanvasContent => 
        prevCanvasContent.map(row => {
            if (row.id === selectedElement.wrapperId && row.type === 'wrapper') {
                const currentStyles = row.payload.styles || {};
                const newPayload = { ...row.payload, styles: { ...currentStyles, backgroundImage: imageModalState } };
                return { ...row, payload: newPayload };
            }
            return row;
        }) as CanvasBlock[]
    );
    setIsImageModalOpen(false);
  }

  const WrapperComponent = React.memo(({ block, index }: { block: WrapperBlock, index: number }) => {
      const wrapperRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
          wrapperRefs.current[block.id] = wrapperRef.current;
      }, [block.id]);
      
      const handleWrapperClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.interactive-emoji')) return;

        setActionTargetWrapperId(block.id);

        const containerElement = target.closest('.group\\/wrapper');
        if (containerElement) {
            const rect = containerElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setClickPosition({ x, y });
        } else {
            setClickPosition({ x: 50, y: 50 }); // Fallback
        }

        setIsActionSelectorModalOpen(true);
    };

      return (
        <div 
          key={block.id} 
          className="group/row relative"
        >
          <div className="absolute top-1/2 -left-8 -translate-y-1/2 flex flex-col items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity bg-card p-1.5 rounded-md border shadow-md z-10">
              <Button variant="ghost" size="icon" className="size-6" disabled={index === 0} onClick={() => handleMoveBlock(index, 'up')}>
                  <ArrowUp className="size-4" />
              </Button>
              <GripVertical className="size-5 text-muted-foreground cursor-grab" />
              <Button variant="ghost" size="icon" className="size-6" disabled={index === canvasContent.length - 1} onClick={() => handleMoveBlock(index, 'down')}>
                  <ArrowDown className="size-4" />
              </Button>
          </div>
    
           <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 -right-8 size-7 opacity-0 group-hover/row:opacity-100 transition-opacity z-10"
              onClick={() => promptDeleteItem(block.id)}
            >
              <Trash2 className="size-4" />
            </Button>
    
          <div
            id={block.id}
            ref={wrapperRef}
            className="group/wrapper relative border-2 border-dashed border-purple-500 overflow-hidden" 
            style={{ height: `${block.payload.height}px`, ...getElementStyle(block) }}
            onClick={handleWrapperClick}
          >
            <div className="w-full h-full relative">
              {block.payload.blocks.map(b => {
                if (b.type === 'emoji-interactive') {
                  const isSelected = selectedElement?.type === 'wrapper-primitive' && selectedElement.primitiveId === b.id;
                  return (
                      <div
                        key={b.id}
                        className={cn(
                          "interactive-emoji absolute text-4xl cursor-pointer select-none", 
                          isSelected ? "ring-2 ring-accent z-10 p-2" : "z-0"
                        )}
                        style={{
                           left: `${b.payload.x}%`,
                           top: `${b.payload.y}%`,
                           transform: `translate(-50%, -50%) scale(${b.payload.scale}) rotate(${b.payload.rotate}deg)`,
                           fontSize: '48px',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedElement({ type: 'wrapper-primitive', primitiveId: b.id, wrapperId: block.id });
                        }}
                      >
                       {b.payload.emoji}
                      </div>
                  )
                }
                return null;
              })}
            </div>
            <div 
               onMouseDown={(e) => handleMouseDownResize(e, block.id)}
               className="absolute bottom-0 left-0 w-full h-4 flex items-center justify-center cursor-ns-resize z-20 group"
            >
                 <div className="w-24 h-2 rounded-full bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 group-hover:from-primary/80 group-hover:via-accent/80 group-hover:to-primary/80 transition-all flex items-center justify-center">
                    <ChevronsUpDown className="size-4 text-white/50 group-hover:text-white/80 transition-colors"/>
                </div>
            </div>
          </div>
        </div>
      );
    });
    WrapperComponent.displayName = 'WrapperComponent';

  const renderCanvasBlock = (block: CanvasBlock, index: number) => {
    if (block.type === 'wrapper') {
        return <WrapperComponent key={block.id} block={block} index={index} />;
    }
    
    const blockId = block.id;
    const { columns } = block.payload;

    return (
        <div 
            key={block.id} 
            id={block.id}
            className="group/row relative"
        >
        <div className="absolute top-1/2 -left-8 -translate-y-1/2 flex flex-col items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity bg-card p-1.5 rounded-md border shadow-md z-10">
            <Button variant="ghost" size="icon" className="size-6" disabled={index === 0} onClick={() => handleMoveBlock(index, 'up')}>
                <ArrowUp className="size-4" />
            </Button>
            <GripVertical className="size-5 text-muted-foreground cursor-grab" />
            <Button variant="ghost" size="icon" className="size-6" disabled={index === canvasContent.length - 1} onClick={() => handleMoveBlock(index, 'down')}>
                <ArrowDown className="size-4" />
            </Button>
        </div>

        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 -right-8 size-7 opacity-0 group-hover/row:opacity-100 transition-opacity z-10"
          onClick={() => promptDeleteItem(block.id)}
        >
          <Trash2 className="size-4" />
        </Button>
        
        {block.type === 'columns' && (
            <div className="flex w-full relative">
              {block.payload.columns.map((col) => (
                <React.Fragment key={col.id}>
                    <div 
                        style={{ ...getElementStyle(col), flexBasis: `${col.width}%` }}
                        className={cn(
                          "flex-grow p-2 border-2 border-dashed min-h-[100px] flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors min-w-[120px] group/column",
                          selectedElement?.type === 'column' && selectedElement.columnId === col.id ? 'border-primary border-solid' : 'border-transparent'
                        )}
                         onClick={(e) => { e.stopPropagation(); setSelectedElement({type: 'column', columnId: col.id, rowId: block.id})}}
                    >
                       {col.blocks.length > 0 ? (
                           <div className="flex flex-col gap-2 w-full">
                               {col.blocks.map(b => renderPrimitiveBlock(b, block.id, col.id, columns.length))}
                               <Button variant="outline" size="sm" className="w-full mt-2" onClick={(e) => { e.stopPropagation(); handleOpenBlockSelector(col.id, 'column', e); }}><PlusCircle className="mr-2"/>Añadir</Button>
                           </div>
                       ) : (
                         <Button variant="outline" size="sm" className="h-auto py-2 px-4 flex flex-col" onClick={(e) => { e.stopPropagation(); handleOpenBlockSelector(col.id, 'column', e); }}>
                           <PlusCircle className="mb-1"/>
                           <span className="text-xs font-medium -mb-0.5">Añadir</span>
                           <span className="text-xs font-medium">Bloque</span>
                         </Button>
                       )}
                    </div>
                </React.Fragment>
              ))}
            </div>
        )}
        </div>
    );
  }

  const StyleEditorHeader = () => {
    if (!selectedElement) return null;

    let blockName = '';

    const blockType = getSelectedBlockType(selectedElement, canvasContent);
    
    if (blockType) {
        const foundBlock = [...columnContentBlocks, ...wrapperContentBlocks, ...mainContentBlocks].find(b => b.id === blockType);
        if (foundBlock) {
             blockName = `Bloque ${foundBlock.name.toLowerCase()}`;
        } else if (blockType === 'column') {
             blockName = 'Columna';
        } else if (blockType === 'wrapper') {
            blockName = 'Contenedor';
        }
    }

    const handleDelete = () => {
        switch (selectedElement.type) {
            case 'column':
                promptDeleteItem(selectedElement.rowId);
                break;
            case 'wrapper':
                promptDeleteItem(selectedElement.wrapperId);
                break;
            case 'primitive':
                promptDeleteItem(selectedElement.rowId, selectedElement.columnId, selectedElement.primitiveId);
                break;
            case 'wrapper-primitive':
                promptDeleteItem(selectedElement.wrapperId, undefined, selectedElement.primitiveId);
                break;
        }
    };
    
    if (!blockName) return null;

    return (
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={handleDelete}
          className="w-full justify-between text-[#F00000] border-[#F00000] hover:bg-[#F00000] hover:text-white dark:text-foreground dark:hover:text-white dark:hover:bg-[#F00000] dark:border-[#F00000]"
        >
          <span className="capitalize">{blockName}</span>
          <Trash2 className="size-4" />
        </Button>
      </div>
    );
};


  return (
    <div className="flex h-screen max-h-screen bg-transparent text-foreground overflow-hidden">
      <aside className="w-40 border-r border-r-black/10 dark:border-border/20 flex flex-col bg-card/5">
        <header className="flex items-center justify-between p-4 border-b bg-card/5 border-border/20 backdrop-blur-sm h-[61px] z-10 shrink-0">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-lg font-semibold truncate flex-1">{templateName}</span>
              <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => setIsEditNameModalOpen(true)}>
                <Pencil className="size-4" />
              </Button>
          </div>
        </header>
        <div className="p-2 space-y-2">
            <Dialog open={isColumnModalOpen} onOpenChange={setIsColumnModalOpen}>
              <DialogTrigger asChild>
                 <Card 
                  className="group bg-card/5 border-black/20 dark:border-border/20 flex flex-col items-center justify-center p-2 cursor-pointer transition-all hover:bg-primary/10 hover:border-black/50 dark:hover:border-primary/50 hover:shadow-lg"
                 >
                  <Columns className="size-8 text-[#00B0F0] transition-colors" />
                  <span className="text-sm font-semibold text-center text-foreground/80 mt-2">Columns</span>
                  <span className="text-xs font-medium text-center text-muted-foreground">1 - 4</span>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl bg-card/80 backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><LayoutGrid className="text-primary"/>Seleccionar Estructura de Columnas</DialogTitle>
                    <DialogDescription>
                      Elige cuántas secciones de columnas quieres añadir a tu plantilla. Podrás arrastrar contenido a cada sección.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    {columnOptions.map(option => (
                      <button
                        key={option.num}
                        onClick={() => handleAddColumns(option.num)}
                        className={cn(
                          "w-full p-2 border-2 rounded-lg transition-all flex items-center gap-4 relative",
                          "bg-card/50 hover:bg-primary/10 hover:border-primary/50"
                        )}
                      >
                         <div className="flex items-center justify-center p-3 bg-muted rounded-md">
                           <Box className="text-primary size-7" />
                        </div>
                         <div className="flex-1 text-left">
                          <p className="font-semibold">{option.num} {option.num > 1 ? 'Columnas' : 'Columna'}</p>
                          <div className="mt-2">
                            <option.icon />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
              </DialogContent>
            </Dialog>
            {mainContentBlocks.slice(1).map(block => (
               <Card 
                key={block.id}
                onClick={() => handleBlockClick(block.id as BlockType)}
                className="group bg-card/5 border-black/20 dark:border-border/20 flex flex-col items-center justify-center p-2 cursor-pointer transition-all hover:bg-primary/10 hover:border-black/50 dark:hover:border-primary/50 hover:shadow-lg"
              >
                <block.icon className="size-8 text-[#00B0F0] transition-colors" />
                <span className="text-sm font-semibold text-center text-foreground/80 mt-2">{block.name}</span>
                 {block.id === 'columns' && <span className="text-xs font-medium text-center text-muted-foreground">1 - 4</span>}
              </Card>
            ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between p-2 border-b bg-card/5 border-border/20 backdrop-blur-sm h-[61px] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Undo/></Button>
            <Button variant="ghost" size="icon"><Redo/></Button>
          </div>
          <div className="flex items-center gap-4">
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
             <ThemeToggle />
          </div>
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

         <div id="editor-canvas" className="flex-1 overflow-auto custom-scrollbar relative">
          <div className="p-8">
            <div className={cn("bg-background/80 dark:bg-zinc-900/80 dark:border dark:border-white/10 mx-auto shadow-2xl rounded-lg min-h-[1200px] transition-all duration-300 ease-in-out", viewportClasses[viewport])}>
                 {canvasContent.length === 0 ? (
                   <div className="border-2 border-dashed border-border/30 dark:border-border/30 rounded-lg h-full flex items-center justify-center text-center text-muted-foreground p-4">
                     <p>Haz clic en "Columns" o "Contenedor Flexible" de la izquierda para empezar.</p>
                   </div>
                 ) : (
                  <div className="flex flex-col gap-4">
                      {canvasContent.map((block, index) => renderCanvasBlock(block, index))}
                  </div>
                 )}
            </div>
          </div>
        </div>
      </main>

      <aside className="w-80 border-l border-l-black/10 dark:border-border/20 flex flex-col bg-card/5">
         <header className="h-[61px] border-b border-border/20 flex-shrink-0 p-2 flex items-center">
            <Tabs defaultValue="style" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="style"><PaletteIcon className="mr-2"/>Estilo</TabsTrigger>
                    <TabsTrigger value="layers"><Layers className="mr-2"/>Capas</TabsTrigger>
                </TabsList>
            </Tabs>
        </header>
         <ScrollArea className="flex-1 custom-scrollbar">
           <Tabs defaultValue="style" className="w-full">
              <TabsContent value="style">
                 <div className="p-4 space-y-6">
                  <StyleEditorHeader />
                  { (selectedElement?.type === 'column') && (
                    <>
                     <BackgroundEditor 
                        selectedElement={selectedElement} 
                        canvasContent={canvasContent} 
                        setCanvasContent={setCanvasContent}
                        onOpenImageModal={handleOpenImageModal}
                     />
                        <Separator className="bg-border/20" />
                        <ColumnDistributionEditor 
                            selectedElement={selectedElement}
                            canvasContent={canvasContent}
                            setCanvasContent={setCanvasContent}
                        />
                    </>
                  )}
                   { (selectedElement?.type === 'wrapper') && (
                     <BackgroundEditor 
                        selectedElement={selectedElement} 
                        canvasContent={canvasContent} 
                        setCanvasContent={setCanvasContent}
                        onOpenImageModal={handleOpenImageModal}
                     />
                  )}
                  { selectedElement?.type === 'primitive' && getSelectedBlockType(selectedElement, canvasContent) === 'button' && (
                      <ButtonEditor selectedElement={selectedElement} canvasContent={canvasContent} setCanvasContent={setCanvasContent} />
                  )}
                   { selectedElement?.type === 'primitive' && getSelectedBlockType(selectedElement, canvasContent) === 'heading' && (
                      <HeadingEditor selectedElement={selectedElement} canvasContent={canvasContent} setCanvasContent={setCanvasContent} />
                  )}
                   { selectedElement?.type === 'primitive' && getSelectedBlockType(selectedElement, canvasContent) === 'text' && (
                      <TextEditor selectedElement={selectedElement} canvasContent={canvasContent} setCanvasContent={setCanvasContent} />
                  )}
                  { selectedElement?.type === 'primitive' && getSelectedBlockType(selectedElement, canvasContent) === 'emoji-static' && (
                      <StaticEmojiEditor selectedElement={selectedElement} canvasContent={canvasContent} setCanvasContent={setCanvasContent} />
                  )}
                   { selectedElement?.type === 'wrapper-primitive' && getSelectedBlockType(selectedElement, canvasContent) === 'emoji-interactive' && (
                      <InteractiveEmojiEditor selectedElement={selectedElement} canvasContent={canvasContent} setCanvasContent={setCanvasContent} />
                  )}
                   { selectedElement?.type === 'primitive' && getSelectedBlockType(selectedElement, canvasContent) === 'separator' && (
                      <SeparatorEditor selectedElement={selectedElement} canvasContent={canvasContent} setCanvasContent={setCanvasContent} />
                  )}
                  { selectedElement?.type === 'primitive' && getSelectedBlockType(selectedElement, canvasContent) === 'youtube' && (
                      <YouTubeEditor selectedElement={selectedElement} canvasContent={canvasContent} setCanvasContent={setCanvasContent} />
                  )}
                  
                  { !selectedElement && (
                     <div className="text-center text-muted-foreground p-4 text-sm">
                        Selecciona un elemento en el lienzo para ver sus opciones de estilo.
                     </div>
                  )}
              </div>
              </TabsContent>
              <TabsContent value="layers">
                  {/* Layers content will go here */}
              </TabsContent>
           </Tabs>
         </ScrollArea>
      </aside>

       <Dialog open={isColumnBlockSelectorOpen} onOpenChange={setIsColumnBlockSelectorOpen}>
        <DialogContent className="sm:max-w-2xl bg-card/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><PlusCircle className="text-primary"/>Añadir Bloque a Columna</DialogTitle>
            <DialogDescription>
              Selecciona un bloque de contenido para añadirlo a la columna.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-3 gap-4 p-4">
                {columnContentBlocks.map((block) => (
                  <Card 
                    key={block.id} 
                    onClick={() => handleAddBlockToColumn(block.id as StaticPrimitiveBlockType)}
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

       <Dialog open={isWrapperBlockSelectorOpen} onOpenChange={setIsWrapperBlockSelectorOpen}>
        <DialogContent className="sm:max-w-2xl bg-card/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><PlusCircle className="text-primary"/>Añadir Bloque a Contenedor</DialogTitle>
            <DialogDescription>
              Selecciona un bloque de contenido para añadirlo al contenedor flexible.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-3 gap-4 p-4">
                {wrapperContentBlocks.map((block) => (
                  <Card 
                    key={block.id} 
                    onClick={() => handleAddBlockToWrapper(block.id as InteractiveBlockType)}
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
              ¿Estás seguro de que deseas eliminar este elemento? Todos los contenidos dentro de él se perderán permanentemente. Esta acción no se puede deshacer.
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
      
      <Dialog open={isEmojiSelectorOpen} onOpenChange={setIsEmojiSelectorOpen}>
        <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm">
            <DialogHeader>
                <DialogTitle>Seleccionar Emoji</DialogTitle>
                <DialogDescription>
                    Elige un emoji para insertar en tu plantilla.
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-60">
                 <div className="grid grid-cols-6 gap-2 p-4">
                    {popularEmojis.map((emoji) => (
                        <button 
                            key={emoji}
                            onClick={() => handleSelectEmojiForWrapper(emoji)}
                            className="text-3xl p-2 rounded-lg hover:bg-accent transition-colors"
                        >
                            {emoji}
                        </button>
                    ))}
                 </div>
            </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isActionSelectorModalOpen} onOpenChange={setIsActionSelectorModalOpen}>
          <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm">
              <DialogHeader>
                  <DialogTitle>¿Qué deseas hacer?</DialogTitle>
                  <DialogDescription>
                      Selecciona una acción para el contenedor flexible.
                  </DialogDescription>
              </DialogHeader>
              <div className="flex gap-4 py-4">
                  <Button 
                      variant="outline" 
                      className="flex-1 h-24 flex-col gap-2"
                      onClick={() => {
                          if (actionTargetWrapperId) {
                              setSelectedElement({ type: 'wrapper', wrapperId: actionTargetWrapperId });
                          }
                          setIsActionSelectorModalOpen(false);
                      }}
                  >
                      <Edit className="size-6 text-primary"/>
                      Editar Contenedor
                  </Button>
                  <Button 
                      variant="outline" 
                      className="flex-1 h-24 flex-col gap-2"
                      onClick={() => {
                           if (actionTargetWrapperId) {
                              setActiveContainer({ id: actionTargetWrapperId, type: 'wrapper' });
                              setIsWrapperBlockSelectorOpen(true);
                           }
                          setIsActionSelectorModalOpen(false);
                      }}
                  >
                      <PlusCircle className="size-6 text-accent" style={{color: 'hsl(var(--accent-light-mode-override))'}}/>
                      Añadir Bloque
                  </Button>
              </div>
          </DialogContent>
      </Dialog>
      
       <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="sm:max-w-4xl bg-card/90 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle>Gestionar Imagen de Fondo</DialogTitle>
            <DialogDescription>
              Añade una URL y ajusta la posición y el tamaño de tu imagen de fondo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">URL de la Imagen</Label>
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.png"
                  value={imageModalState.url}
                  onChange={(e) => setImageModalState({ ...imageModalState, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ajuste de Imagen</Label>
                <Select
                  value={imageModalState.fit}
                  onValueChange={(value: BackgroundFit) => setImageModalState({ ...imageModalState, fit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar ajuste" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cubrir (Cover)</SelectItem>
                    <SelectItem value="contain">Contener (Contain)</SelectItem>
                    <SelectItem value="auto">Automático/Zoom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                 <Label className="flex items-center gap-2"><ArrowLeftRight className="size-4"/> Posición Horizontal</Label>
                <Slider
                  value={[imageModalState.positionX]}
                  onValueChange={(v) => setImageModalState({ ...imageModalState, positionX: v[0] })}
                />
              </div>
               <div className="space-y-2">
                 <Label className="flex items-center gap-2"><ArrowUpDown className="size-4"/> Posición Vertical</Label>
                <Slider
                  value={[imageModalState.positionY]}
                  onValueChange={(v) => setImageModalState({ ...imageModalState, positionY: v[0] })}
                />
              </div>
              <div className="space-y-2">
                 <Label className="flex items-center gap-2"><Expand className="size-4"/> Zoom (solo con ajuste 'Auto')</Label>
                <Slider
                  value={[imageModalState.zoom]}
                  min={10} max={300}
                  onValueChange={(v) => setImageModalState({ ...imageModalState, zoom: v[0] })}
                  disabled={imageModalState.fit !== 'auto'}
                />
              </div>
            </div>
            <div className="flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden border border-dashed">
                {imageModalState.url ? (
                    <div className="w-full h-full" style={{
                        backgroundImage: `url(${imageModalState.url})`,
                        backgroundSize: imageModalState.fit === 'auto' ? `${imageModalState.zoom}%` : imageModalState.fit,
                        backgroundPosition: `${imageModalState.positionX}% ${imageModalState.positionY}%`,
                        backgroundRepeat: 'no-repeat',
                    }} />
                ) : (
                    <div className="text-center text-muted-foreground p-8">
                        <ImageIcon className="mx-auto size-12" />
                        <p className="mt-2">Vista previa de la imagen</p>
                    </div>
                )}
            </div>
          </div>
          <DialogFooter>
             <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleApplyBackgroundImage} disabled={!imageModalState.url}>
                Aplicar Imagen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
