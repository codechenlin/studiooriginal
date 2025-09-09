
"use client";

import React, { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Toggle } from '@/components/ui/toggle';
import {
  Square,
  Type,
  ImageIcon,
  Columns,
  Minus,
  ArrowLeft,
  ChevronsUpDown,
  Laptop,
  Smartphone,
  Undo,
  Redo,
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
  Globe,
  RefreshCw,
  MessageSquare,
  CalendarIcon,
  CheckIcon,
  Search as SearchIcon,
  XCircle,
  ClipboardCheck,
  Code,
  ChevronUp,
  ChevronDown,
  LayoutDashboard,
  FileSignature,
  ImagePlay,
  FileImage,
  UploadCloud,
  Grip,
  ListFilter,
  File as FileIcon,
  PackageCheck,
  Info,
  GalleryVertical,
  Star,
  CheckCircle as CheckCircleIcon,
  FolderOpen,
  Image as LucideImage,
  Film,
  StarHalf,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ColorPickerAdvanced } from '@/components/dashboard/color-picker-advanced';
import { useToast } from '@/hooks/use-toast';
import { HexColorPicker } from 'react-colorful';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveTemplateAction, revalidatePath } from './actions';
import { listFiles, renameFile, deleteFiles, uploadFile, type StorageFile } from './gallery-actions';
import { createClient } from '@/lib/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Preloader } from '@/components/common/preloader';
import { LoadingModal } from '@/components/common/loading-modal';


const mainContentBlocks = [
  { name: "Columns", icon: Columns, id: 'columns' },
  { name: "Contenedor Flexible", icon: Shapes, id: 'wrapper' },
];

const columnContentBlocks = [
  { name: "Titulo", icon: Heading1, id: 'heading' },
  { name: "Texto", icon: Type, id: 'text' },
  { name: "Imagen", icon: ImageIcon, id: 'image' },
  { name: "Botón", icon: Square, id: 'button' },
  { name: "Separador", icon: Minus, id: 'separator' },
  { name: "Video Youtube", icon: Youtube, id: 'youtube' },
  { name: "Contador", icon: Timer, id: 'timer' },
  { name: "Emoji", icon: Smile, id: 'emoji-static' },
  { name: "Estrellas", icon: Star, id: 'rating' },
];

const wrapperContentBlocks = [
   { name: "Titulo", icon: Heading1, id: 'heading-interactive' },
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
    '🔴', '🔵', '⚫️', '⚪️', '🔶', '🔷', '▪️', '▫️', '▲', '▼',
    '←', '↑', '→', '↓', '↔️', '↕️', '↩️', '↪️', '➕', '➖',
    '➗', '✖️', '💲', '💶', '💷', '💴', '🔒', '🔓', '🔑', '🔔',
    '🕕', '🔎', '💡', '💤', '🌍', '🌎', '🌏'
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

const timezones = [
    { value: "Etc/UTC", label: "UTC - Coordinated Universal Time" },
    { value: "Etc/GMT", label: "GMT - Greenwich Mean Time" },
    { value: "America/New_York", label: "USA (East) - America/New_York" },
    { value: "America/Chicago", label: "USA (Central) - America/Chicago" },
    { value: "America/Denver", label: "USA (Mountain) - America/Denver" },
    { value: "America/Los_Angeles", label: "USA (Pacific) - America/Los_Angeles" },
    { value: "America/Toronto", label: "Canada - America/Toronto" },
    { value: "America/Vancouver", label: "Canada - America/Vancouver" },
    { value: "America/Mexico_City", label: "Mexico - America/Mexico_City" },
    { value: "America/Cancun", label: "Mexico - America/Cancun" },
    { value: "America/Chihuahua", label: "Mexico - America/Chihuahua" },
    { value: "America/Tijuana", label: "Mexico (Baja California) - America/Tijuana" },
    { value: "America/Bogota", label: "Colombia - America/Bogota" },
    { value: "America/Caracas", label: "Venezuela - America/Caracas" },
    { value: "America/Lima", label: "Peru - America/Lima" },
    { value: "America/La_Paz", label: "Bolivia - America/La_Paz" },
    { value: "America/El_Salvador", label: "El Salvador - America/El_Salvador" },
    { value: "America/Guatemala", label: "Guatemala - America/Guatemala" },
    { value: "America/Sao_Paulo", label: "Brazil - America/Sao_Paulo" },
    { value: "America/Bahia", label: "Brazil - America/Bahia" },
    { value: "America/Argentina/Buenos_Aires", label: "Argentina - America/Argentina/Buenos_Aires" },
    { value: "America/Santiago", label: "Chile - America/Santiago" },
    { value: "America/Asuncion", label: "Paraguay - America/Asuncion" },
    { value: "America/Montevideo", label: "Uruguay - America/Montevideo" },
    { value: "America/Godthab", label: "Greenland - America/Godthab" },
    { value: "Europe/London", label: "United Kingdom - Europe/London" },
    { value: "Europe/Madrid", label: "Spain - Europe/Madrid" },
    { value: "Europe/Barcelona", label: "Spain - Europe/Barcelona" },
    { value: "Europe/Berlin", label: "Germany - Europe/Berlin" },
    { value: "Europe/Paris", label: "France - Europe/Paris" },
    { value: "Europe/Rome", label: "Italy - Europe/Rome" },
    { value: "Europe/Moscow", label: "Russia - Europe/Moscow" },
    { value: "Europe/Oslo", label: "Norway - Europe/Oslo" },
    { value: "Europe/Stockholm", label: "Sweden - Europe/Stockholm" },
    { value: "Europe/Zurich", label: "Switzerland - Europe/Zurich" },
    { value: "Africa/Johannesburg", label: "South Africa - Africa/Johannesburg" },
    { value: "Africa/Cairo", label: "Egypt - Africa/Cairo" },
    { value: "Africa/Nairobi", label: "Kenya - Africa/Nairobi" },
    { value: "Africa/Lagos", label: "Nigeria - Africa/Lagos" },
    { value: "Asia/Shanghai", label: "China - Asia/Shanghai" },
    { value: "Asia/Tokyo", label: "Japan - Asia/Tokyo" },
    { value: "Asia/Dubai", label: "UAE - Asia/Dubai" },
    { value: "Australia/Sydney", label: "Australia (East) - Australia/Sydney" },
    { value: "Asia/Singapore", label: "Singapore - Asia/Singapore" },
    { value: "Asia/Kamchatka", label: "Russia - Asia/Kamchatka" },
    { value: "Asia/Omsk", label: "Russia - Asia/Omsk" },
    { value: "Asia/Kolkata", label: "India - Asia/Kolkata" },
    { value: "Pacific/Auckland", label: "New Zealand - Pacific/Auckland" },
    { value: "Asia/Jakarta", label: "Indonesia - Asia/Jakarta" },
    { value: "Asia/Manila", label: "Philippines - Asia/Manila" },
    { value: "Asia/Kuala_Lumpur", label: "Malaysia - Asia/Kuala_Lumpur" },
    { value: "Asia/Hong_Kong", label: "Hong Kong - Asia/Hong_Kong" },
];

// --- STATE MANAGEMENT TYPES ---
type BackgroundSource = 'upload' | 'url' | 'gallery';
type StaticPrimitiveBlockType = 'heading' | 'text' | 'image' | 'button' | 'separator' | 'youtube' | 'timer' | 'emoji-static' | 'rating';
type InteractiveBlockType = 'emoji-interactive' | 'heading-interactive';

type BlockType = StaticPrimitiveBlockType | InteractiveBlockType | 'columns' | 'wrapper';
type Viewport = 'desktop' | 'tablet' | 'mobile';
type TextAlign = 'left' | 'center' | 'right';
type BackgroundFit = 'cover' | 'contain' | 'auto';
type GradientDirection = 'vertical' | 'horizontal' | 'radial';
type SeparatorLineStyle = 'solid' | 'dotted' | 'dashed';
type SeparatorShapeType = 'waves' | 'drops' | 'zigzag' | 'leaves' | 'scallops';
type TimerEndAction = 'stop' | 'secondary_countdown' | 'message';

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

interface TimerBlock extends BaseBlock {
    type: 'timer';
    payload: {
        endDate: string; // ISO string
        timezone: string;
        design: 'digital' | 'analog' | 'minimalist';
        endAction: {
            type: TimerEndAction;
            message: string;
            secondaryEndDate?: string; // ISO string
        };
        styles: {
            fontFamily: string;
            numberColor: string;
            labelColor: string;
            borderRadius: number;
            background: {
                type: 'solid' | 'gradient';
                color1: string;
                color2: string;
                direction: GradientDirection;
            };
            strokeWidth: number;
            scale: number;
            minimalistLabelSize: number;
        }
    }
}

interface ImageBlock extends BaseBlock {
  type: 'image';
  payload: {
    url: string;
    alt: string;
    link: {
      url: string;
      openInNewTab: boolean;
    };
    styles: {
      positionX: number;
      positionY: number;
      zoom: number;
      borderRadius: number;
      border: {
        width: number;
        type: 'solid' | 'gradient';
        color1: string;
        color2?: string;
        direction?: GradientDirection;
      };
    };
  };
}


interface RatingBlock extends BaseBlock {
  type: 'rating';
  payload: {
    rating: number; // 0 to 5
    styles: {
      starStyle: 'pointed' | 'rounded';
      starSize: number;
      alignment: TextAlign;
      paddingY: number;
      spacing: number;
      filled: {
        type: 'solid' | 'gradient';
        color1: string;
        color2?: string;
        direction?: GradientDirection;
      };
      unfilled: {
        type: 'solid' | 'gradient';
        color1: string;
        color2?: string;
        direction?: GradientDirection;
      };
      border: {
        width: number;
        type: 'solid' | 'gradient';
        color1: string;
        color2?: string;
        direction?: GradientDirection;
      }
    }
  }
}

interface InteractiveEmojiBlock extends BaseBlock {
    type: 'emoji-interactive';
    payload: {
        name: string;
        emoji: string;
        x: number;
        y: number;
        scale: number;
        rotate: number;
    }
}

interface InteractiveHeadingBlock extends BaseBlock {
    type: 'heading-interactive';
    payload: {
        name: string;
        text: string;
        x: number;
        y: number;
        scale: number;
        rotate: number;
        styles: {
            color: string;
            fontFamily: string;
            fontWeight: 'normal' | 'bold';
            fontStyle: 'normal' | 'italic';
            textDecoration: 'none' | 'underline' | 'line-through';
            highlight?: string;
        }
    }
}

type PrimitiveBlock = BaseBlock | ButtonBlock | HeadingBlock | TextBlock | StaticEmojiBlock | SeparatorBlock | YouTubeBlock | TimerBlock | ImageBlock | RatingBlock;
type InteractivePrimitiveBlock = InteractiveEmojiBlock | InteractiveHeadingBlock;


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

const getSelectedBlockType = (element: SelectedElement, content: CanvasBlock[]): BlockType | null => {
    if (!element) return null;

    if (element.type === 'column') {
        return 'columns';
    }
    if (element.type === 'wrapper') {
        return 'wrapper';
    }
    if (element.type === 'primitive') {
        const row = content.find(r => r.id === element.rowId);
        if (row?.type !== 'columns') return null;
        const col = row.payload.columns.find(c => c.id === element.columnId);
        const block = col?.blocks.find(b => b.id === element.primitiveId);
        return block?.type || null;
    }
     if (element.type === 'wrapper-primitive') {
        const row = content.find(r => r.id === element.wrapperId);
        if (row?.type !== 'wrapper') return null;
        const block = row.payload.blocks.find(b => b.id === element.primitiveId);
        return block?.type || null;
    }

    return null;
}


const ColumnDistributionEditor = ({ selectedElement, canvasContent, setCanvasContent }: {
    selectedElement: SelectedElement;
    canvasContent: CanvasBlock[];
    setCanvasContent: (content: CanvasBlock[], recordHistory: boolean) => void;
}) => {
    if (selectedElement?.type !== 'column') return null;

    const row = canvasContent.find(r => r.id === selectedElement.rowId) as ColumnsBlock | undefined;
    if (!row) return null;

    const { columns } = row.payload;
    const columnIndex = columns.findIndex(c => c.id === selectedElement.columnId);
    if(columnIndex === -1) return null;

    const handleTwoColumnChange = (value: number) => {
        const newCanvasContent = canvasContent.map(r => {
            if (r.id === selectedElement.rowId && r.type === 'columns') {
                const newColumns = [...r.payload.columns];
                const clampedValue = Math.max(10, Math.min(90, value));
                newColumns[0] = { ...newColumns[0], width: clampedValue };
                newColumns[1] = { ...newColumns[1], width: 100 - clampedValue };
                return { ...r, payload: { ...r.payload, columns: newColumns } };
            }
            return r;
        });
        setCanvasContent(newCanvasContent as CanvasBlock[], true);
    }
    
    const handleThreeColumnChange = (changedIndex: number, newValue: number) => {
        const newCanvasContent = canvasContent.map(r => {
            if (r.id === selectedElement.rowId && r.type === 'columns') {
                let newColumns = [...r.payload.columns];
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
                return { ...r, payload: { ...r.payload, columns: newColumns } };
            }
            return r;
        });
        setCanvasContent(newCanvasContent as CanvasBlock[], true);
    };

    const handleFourColumnChange = (changedIndex: number, newValue: number) => {
        const newCanvasContent = canvasContent.map(r => {
            if (r.id === selectedElement.rowId && r.type === 'columns') {
                let newColumns = [...r.payload.columns];
                let clampedValue = Math.max(10, Math.min(70, newValue));

                const otherIndices = [0, 1, 2, 3].filter(i => i > changedIndex);
                const fixedIndices = [0, 1, 2, 3].filter(i => i < changedIndex);
                
                const fixedWidth = fixedIndices.reduce((acc, i) => acc + newColumns[i].width, 0);

                const remainingForOthers = 100 - fixedWidth - clampedValue;
                if (remainingForOthers < otherIndices.length * 10) {
                     clampedValue = 100 - fixedWidth - (otherIndices.length * 10);
                }

                newColumns[changedIndex].width = clampedValue;
                
                const remainingWidth = 100 - fixedWidth - clampedValue;
                const totalOtherWidth = otherIndices.reduce((acc, i) => acc + r.payload.columns[i].width, 0);

                otherIndices.forEach(i => {
                    const proportion = r.payload.columns[i].width / totalOtherWidth;
                    newColumns[i].width = remainingWidth * proportion;
                });

                const finalTotalWidth = newColumns.reduce((sum, col) => sum + col.width, 0);
                const roundingError = 100 - finalTotalWidth;
                if (newColumns[3]) {
                    newColumns[3].width += roundingError;
                }
                return { ...r, payload: { ...r.payload, columns: newColumns } };
            }
            return r;
        });
        setCanvasContent(newCanvasContent as CanvasBlock[], true);
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
  setCanvasContent: (content: CanvasBlock[], recordHistory: boolean) => void;
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
    let newCanvasContent = [...canvasContent];
    if (selectedElement.type === 'column') {
        newCanvasContent = canvasContent.map(row => {
            if (row.id === selectedElement.rowId && row.type === 'columns') {
                const newColumns = row.payload.columns.map(col => {
                    if (col.id === selectedElement.columnId) {
                        return { ...col, styles: { ...col.styles, [key]: value } };
                    }
                    return col;
                });
                return { ...row, payload: { ...row.payload, columns: newColumns } };
            }
            return row;
        });
    } else if (selectedElement.type === 'wrapper') {
        newCanvasContent = canvasContent.map(row => {
            if (row.id === selectedElement.wrapperId && row.type === 'wrapper') {
                const currentStyles = row.payload.styles || {};
                const newPayload = { ...row.payload, styles: { ...currentStyles, [key]: value } };
                return { ...row, payload: newPayload };
            }
            return row;
        });
    }
    setCanvasContent(newCanvasContent as CanvasBlock[], true);
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
                <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2">Imagen de Fondo</h3>
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
  setCanvasContent: (content: CanvasBlock[], recordHistory: boolean) => void;
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
        setCanvasContent(prev => prev.map(row => {
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
        }), true);
    }
    
    const updateStyle = (key: keyof ButtonBlock['payload']['styles'], value: any) => {
        setCanvasContent(prev => prev.map(row => {
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
        }), true);
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
  setCanvasContent: (content: CanvasBlock[], recordHistory: boolean) => void;
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
        setCanvasContent(prev => prev.map(row => {
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
        }), true);
    }

    const updateStyle = (key: keyof HeadingBlock['payload']['styles'], value: any) => {
        setCanvasContent(prev => prev.map(row => {
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
        }), true);
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
  setCanvasContent: (content: CanvasBlock[], recordHistory: boolean) => void;
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
        }), true);
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
        }), true);
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
        }), true);
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
        }), true);
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
        </div>
    );
};


const StaticEmojiEditor = ({ selectedElement, canvasContent, setCanvasContent }: {
  selectedElement: SelectedElement;
  canvasContent: CanvasBlock[];
  setCanvasContent: (content: CanvasBlock[], recordHistory: boolean) => void;
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
        setCanvasContent(prev => prev.map(row => {
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
        }), true);
    };

    const updateStyle = (key: keyof StaticEmojiBlock['payload']['styles'], value: any) => {
        setCanvasContent(prev => prev.map(row => {
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
        }), true);
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
  setCanvasContent: (content: CanvasBlock[], recordHistory: boolean) => void;
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
    setCanvasContent(prev => prev.map(row => {
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
    }), true);
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

const InteractiveHeadingEditor = ({ selectedElement, canvasContent, setCanvasContent }: {
  selectedElement: SelectedElement;
  canvasContent: CanvasBlock[];
  setCanvasContent: (content: CanvasBlock[], recordHistory: boolean) => void;
}) => {
    if(selectedElement?.type !== 'wrapper-primitive' || getSelectedBlockType(selectedElement, canvasContent) !== 'heading-interactive') return null;
    
    const getElement = () => {
        const row = canvasContent.find(r => r.id === selectedElement.wrapperId);
        if (row?.type !== 'wrapper') return null;
        const block = row.payload.blocks.find(b => b.id === selectedElement.primitiveId);
        return block?.type === 'heading-interactive' ? block as InteractiveHeadingBlock : null;
    }
    const element = getElement();
    if(!element) return null;

    const updatePayload = (key: keyof Omit<InteractiveHeadingBlock['payload'], 'styles'>, value: any) => {
        setCanvasContent(prev => prev.map(row => {
          if (row.id !== selectedElement.wrapperId || row.type !== 'wrapper') return row;
          const newBlocks = row.payload.blocks.map(block => {
              if (block.id === selectedElement.primitiveId && block.type === 'heading-interactive') {
                  return { ...block, payload: { ...block.payload, [key]: value } };
              }
              return block;
          })
          return { ...row, payload: { ...row.payload, blocks: newBlocks } };
        }), true);
    }

    const updateStyle = (key: keyof InteractiveHeadingBlock['payload']['styles'], value: any) => {
        setCanvasContent(prev => prev.map(row => {
          if (row.id !== selectedElement.wrapperId || row.type !== 'wrapper') return row;
          const newBlocks = row.payload.blocks.map(block => {
              if (block.id === selectedElement.primitiveId && block.type === 'heading-interactive') {
                  return { ...block, payload: { ...block.payload, styles: { ...block.payload.styles, [key]: value } } };
              }
              return block;
          })
          return { ...row, payload: { ...row.payload, blocks: newBlocks } };
        }), true);
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
  setCanvasContent: (content: CanvasBlock[], recordHistory: boolean) => void;
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
      }), true);
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
        }), true);
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
  setCanvasContent: (content: CanvasBlock[], recordHistory: boolean) => void;
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
      }), true);
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

const DateTimePickerModal = ({ isOpen, onOpenChange, initialDate, onAccept, title, description }: { isOpen: boolean, onOpenChange: (open: boolean) => void, initialDate: string, onAccept: (date: Date) => void, title: string, description: string }) => {
    const [date, setDate] = useState<Date | undefined>(new Date(initialDate));
    const [hours, setHours] = useState(() => new Date(initialDate).getHours());
    const [minutes, setMinutes] = useState(() => new Date(initialDate).getMinutes());
  
    useEffect(() => {
        if (isOpen) {
            const initial = new Date(initialDate);
            setDate(initial);
            setHours(initial.getHours());
            setMinutes(initial.getMinutes());
        }
    }, [initialDate, isOpen]);

    const handleAccept = () => {
      if (date) {
        const newDate = new Date(date);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        newDate.setSeconds(0);
        onAccept(newDate);
        onOpenChange(false);
      }
    };
  
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center">
                     <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                    <div className="flex items-center justify-center gap-2 p-2 border-t w-full">
                      <Input
                        type="number"
                        min="0"
                        max="23"
                        value={hours.toString().padStart(2, '0')}
                        onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value, 10) || 0)))}
                        className="w-20 text-center"
                      />
                      <span className="font-bold">:</span>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={minutes.toString().padStart(2, '0')}
                        onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0)))}
                        className="w-20 text-center"
                      />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleAccept}><CheckIcon className="mr-2"/>Aceptar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const TimezonePickerModal = ({ isOpen, onOpenChange, onAccept, currentValue }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onAccept: (tz: string) => void, currentValue: string }) => {
    const [selectedValue, setSelectedValue] = useState(currentValue);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTimezones = timezones.filter(tz => tz.label.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleAccept = () => {
        onAccept(selectedValue);
        onOpenChange(false);
    }

    useEffect(() => {
        if(isOpen) {
            setSelectedValue(currentValue);
            setSearchTerm('');
        }
    }, [isOpen, currentValue])

    return (
         <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm">
                 <DialogHeader>
                    <DialogTitle>Seleccionar Zona Horaria</DialogTitle>
                    <DialogDescription>Elige la zona horaria para tu contador.</DialogDescription>
                </DialogHeader>
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar zona horaria..." 
                        className="pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <ScrollArea className="h-72">
                    <div className="pr-4">
                        {filteredTimezones.map(tz => (
                             <Button
                                key={tz.value}
                                variant="ghost"
                                className={cn("w-full justify-between mb-1", selectedValue === tz.value && "bg-muted")}
                                onClick={() => setSelectedValue(tz.value)}
                              >
                                <span className="text-left flex-1">{tz.label}</span>
                                {selectedValue === tz.value && <div className="size-2 rounded-full" style={{backgroundColor: '#00CB07', boxShadow: '0 0 6px #00CB07'}}/>}
                              </Button>
                           )
                        )}
                    </div>
                </ScrollArea>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleAccept}><CheckIcon className="mr-2"/>Aceptar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const TimerEditor = ({ selectedElement, canvasContent, setCanvasContent, onOpenCopyModal }: {
  selectedElement: SelectedElement;
  canvasContent: CanvasBlock[];
  setCanvasContent: (content: CanvasBlock[], recordHistory: boolean) => void;
  onOpenCopyModal: (emoji: string) => void;
}) => {
    // This is a complete reconstruction of the TimerEditor component.
    const { toast } = useToast();
    if (selectedElement?.type !== 'primitive') return null;
    
    const [isDateTimePickerOpen, setIsDateTimePickerOpen] = useState(false);
    const [isSecondaryPickerOpen, setIsSecondaryPickerOpen] = useState(false);
    const [isTimezonePickerOpen, setIsTimezonePickerOpen] = useState(false);
    const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);

    const getElement = (): TimerBlock | null => {
        const row = canvasContent.find(r => r.id === selectedElement.rowId);
        if (row?.type !== 'columns') return null;
        const col = row.payload.columns.find(c => c.id === selectedElement.columnId);
        const block = col?.blocks.find(b => b.id === selectedElement.primitiveId);
        return block?.type === 'timer' ? block as TimerBlock : null;
    }
    const element = getElement();
    if (!element) return null;

    const updatePayload = (key: keyof TimerBlock['payload'], value: any) => {
         setCanvasContent(prev => prev.map(row => {
            if (row.id !== selectedElement.rowId || row.type !== 'columns') return row;
            return {
                ...row,
                payload: { ...row.payload, columns: row.payload.columns.map(col => {
                    if (col.id !== selectedElement.columnId) return col;
                    return { ...col, blocks: col.blocks.map(block => {
                        if (block.id !== selectedElement.primitiveId || block.type !== 'timer') return block;
                        return { ...block, payload: { ...block.payload, [key]: value } };
                    }) };
                }) }
            };
        }), true);
    };

    const updateStyle = (key: keyof TimerBlock['payload']['styles'], value: any) => {
        updatePayload('styles', { ...element.payload.styles, [key]: value });
    }
    const updateEndAction = (key: keyof TimerBlock['payload']['endAction'], value: any) => {
        updatePayload('endAction', { ...element.payload.endAction, [key]: value });
    }
    const updateBackground = (key: string, value: any) => {
        updateStyle('background', { ...element.payload.styles.background, [key]: value });
    }

    const handleDateAccept = (date: Date, isSecondary: boolean = false) => {
        const isoString = date.toISOString();
        if (isSecondary) {
            updateEndAction('secondaryEndDate', isoString);
        } else {
            updatePayload('endDate', isoString);
        }

        toast({
            title: "Fecha Actualizada",
            description: `El contador ha sido configurado para finalizar el ${format(date, "PPP 'a las' HH:mm")}.`,
            className: 'bg-[#00CB07] border-none text-white',
        });
    };

    const handleTimezoneAccept = (tzValue: string) => {
        updatePayload('timezone', tzValue);
        const tzLabel = timezones.find(tz => tz.value === tzValue)?.label || tzValue;
        toast({
            title: "¡Zona Horaria Actualizada!",
            description: `El contador ahora corre en el tiempo del mundo real para: ${tzLabel}.`,
            className: 'bg-[#00CB07] border-none text-white',
        });
    };
    
    const handleInsertEmoji = (emoji: string) => {
        navigator.clipboard.writeText(emoji);
        onOpenCopyModal(emoji);
        setIsEmojiModalOpen(false);
    };

    const { styles, endDate, timezone, design, endAction } = element.payload;
    const tomorrow = new Date(endDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const currentTimezoneLabel = timezones.find(tz => tz.value === timezone)?.label || timezone;

    return (
        <div className="space-y-4">
             <DateTimePickerModal 
                isOpen={isDateTimePickerOpen}
                onOpenChange={setIsDateTimePickerOpen}
                initialDate={endDate}
                onAccept={(d) => handleDateAccept(d)}
                title="Establecer Fecha de Finalización"
                description="Selecciona la fecha y hora exactas en que terminará la cuenta regresiva."
            />
             <TimezonePickerModal 
                isOpen={isTimezonePickerOpen}
                onOpenChange={setIsTimezonePickerOpen}
                currentValue={timezone}
                onAccept={handleTimezoneAccept}
            />
            <DateTimePickerModal 
                isOpen={isSecondaryPickerOpen}
                onOpenChange={setIsSecondaryPickerOpen}
                initialDate={endAction.secondaryEndDate || new Date(tomorrow).toISOString()}
                onAccept={(d) => {
                    if (new Date(d) <= new Date(endDate)) {
                        toast({
                            variant: 'destructive',
                            title: 'Fecha Inválida',
                            description: 'La segunda fecha debe ser posterior a la primera.'
                        })
                    } else {
                        handleDateAccept(d, true)
                    }
                }}
                title="Establecer Segundo Contador"
                description="Elige la fecha y hora para la segunda cuenta regresiva."
            />
             <Dialog open={isEmojiModalOpen} onOpenChange={setIsEmojiModalOpen}>
                <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm">
                    <DialogHeader>
                        <DialogTitle>Seleccionar Símbolo Rápido</DialogTitle>
                        <DialogDescription>Haz clic en un símbolo para copiarlo a tu portapapeles.</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-72">
                         <div className="grid grid-cols-8 gap-1 p-1">
                            {popularEmojis.map(emoji => (
                                <TooltipProvider key={emoji}>
                                    <Tooltip>
                                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="text-lg" onClick={() => handleInsertEmoji(emoji)}>{emoji}</Button></TooltipTrigger>
                                        <TooltipContent><p>Copiar "{emoji}"</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
            <div>
                <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Timer/>Configuración del Contador</h3>
            </div>
            <div className="space-y-2">
                <Label>Fecha y Hora de Finalización</Label>
                <Button variant="outline" className="w-full justify-start text-left font-normal" onClick={() => setIsDateTimePickerOpen(true)}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(new Date(endDate), "PPP, HH:mm") : <span>Seleccionar fecha</span>}
                </Button>
            </div>
            <div className="space-y-2">
                <Label>Zona Horaria</Label>
                 <Button variant="outline" className="w-full justify-start text-left font-normal" onClick={() => setIsTimezonePickerOpen(true)}>
                     <Globe className="mr-2 h-4 w-4" />
                     <span className="truncate">Seleccionar Zona Horaria</span>
                </Button>
                <p className="text-xs text-muted-foreground">Actual: <span className="font-medium text-foreground truncate">{currentTimezoneLabel}</span></p>
            </div>
            <div className="space-y-2">
                <Label>Tamaño Global</Label>
                <Slider
                    value={[styles.scale]}
                    min={0.5} max={1.5} step={0.05}
                    onValueChange={(v) => updateStyle('scale', v[0])}
                />
            </div>

            <Separator className="bg-border/20"/>
            
            <div>
                <h3 className="text-sm font-medium text-foreground/80">Diseño</h3>
                <Tabs value={design} onValueChange={(v) => updatePayload('design', v)} className="w-full mt-2">
                    <TabsList className="grid grid-cols-3">
                        <TabsTrigger value="digital">Digital</TabsTrigger>
                        <TabsTrigger value="analog">Analógico</TabsTrigger>
                        <TabsTrigger value="minimalist">Minimalista</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

             <div className="space-y-2">
                <Label>Fuente de los Números</Label>
                <Select value={styles.fontFamily} onValueChange={(v) => updateStyle('fontFamily', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {googleFonts.map(font => <SelectItem key={font} value={font} style={{ fontFamily: font }}>{font}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Color de los Números</Label>
                <ColorPickerAdvanced color={styles.numberColor} setColor={(c) => updateStyle('numberColor', c)} />
            </div>
             <div className="space-y-2">
                <Label>Color de las Etiquetas</Label>
                <ColorPickerAdvanced color={styles.labelColor} setColor={(c) => updateStyle('labelColor', c)} />
            </div>

            <div className="space-y-2">
                 <Label>{design === 'minimalist' ? 'Grosor de la Barra' : (design === 'analog' ? 'Grosor de la Barra' : 'Radio del Borde')}</Label>
                <Slider 
                  value={[design === 'minimalist' ? styles.strokeWidth : (design === 'analog' ? styles.strokeWidth : styles.borderRadius)]}
                  max={design === 'minimalist' ? 10 : (design === 'analog' ? 15 : 30)}
                  min={design === 'minimalist' ? 1 : (design === 'analog' ? 2 : 0)}
                  step={1}
                  onValueChange={(v) => updateStyle(design === 'minimalist' ? 'strokeWidth' : (design === 'analog' ? 'strokeWidth' : 'borderRadius'), v[0])} />
            </div>

            {design === 'minimalist' && (
                <div className="space-y-2">
                    <Label>Tamaño del Texto</Label>
                    <Slider
                        value={[styles.minimalistLabelSize]}
                        min={0.5} max={1} step={0.05}
                        onValueChange={(v) => updateStyle('minimalistLabelSize', v[0])}
                    />
                </div>
             )}

            <div className="space-y-2">
                <Label>Fondo</Label>
                <Tabs value={styles.background.type} onValueChange={(v) => updateBackground('type', v)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="solid">Sólido</TabsTrigger><TabsTrigger value="gradient">Degradado</TabsTrigger></TabsList>
                </Tabs>
                <div className="space-y-2 pt-2">
                    <Label>Color 1</Label><ColorPickerAdvanced color={styles.background.color1} setColor={c => updateBackground('color1', c)} />
                </div>
                {styles.background.type === 'gradient' && (
                  <>
                    <div className="space-y-2 pt-2">
                      <Label>Color 2</Label>
                      <ColorPickerAdvanced color={styles.background.color2} setColor={c => updateBackground('color2', c)} />
                    </div>
                    <div className="space-y-3">
                        <Label>Dirección del Degradado</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button variant={styles.background.direction === 'vertical' ? 'secondary' : 'outline'} size="icon" onClick={() => updateBackground('direction', 'vertical')}><ArrowDown /></Button></TooltipTrigger>
                                    <TooltipContent><p>Vertical</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button variant={styles.background.direction === 'horizontal' ? 'secondary' : 'outline'} size="icon" onClick={() => updateBackground('direction', 'horizontal')}><ArrowRight /></Button></TooltipTrigger>
                                    <TooltipContent><p>Horizontal</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button variant={styles.background.direction === 'radial' ? 'secondary' : 'outline'} size="icon" onClick={() => updateBackground('direction', 'radial')}><Sun className="size-4" /></Button></TooltipTrigger>
                                    <TooltipContent><p>Radial</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                  </>
                )}
            </div>

            <Separator className="bg-border/20"/>

            <div>
                <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Sparkles/>Acción al Finalizar</h3>
                 <Select value={endAction.type} onValueChange={(v) => updateEndAction('type', v as TimerEndAction)}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="stop"><XCircle className="inline-block mr-2" />Detener en 00</SelectItem>
                        <SelectItem value="secondary_countdown"><RefreshCw className="inline-block mr-2" />Segundo Contador</SelectItem>
                        <SelectItem value="message"><MessageSquare className="inline-block mr-2" />Mostrar Mensaje</SelectItem>
                    </SelectContent>
                </Select>
                {endAction.type === 'message' && (
                    <div className="mt-2 space-y-2">
                        <Label>Mensaje a mostrar</Label>
                        <Textarea value={endAction.message} onChange={(e) => updateEndAction('message', e.target.value)} placeholder="¡La oferta ha terminado!"/>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setIsEmojiModalOpen(true)}>
                            <Smile className="mr-2"/>
                            Añadir Símbolo Rápido
                        </Button>
                    </div>
                )}
                {endAction.type === 'secondary_countdown' && (
                    <div className="mt-2 space-y-2">
                        <Label>Segunda Fecha de Finalización</Label>
                         <Button variant="outline" className="w-full justify-start text-left font-normal" onClick={() => setIsSecondaryPickerOpen(true)}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endAction.secondaryEndDate ? format(new Date(endAction.secondaryEndDate), "PPP, HH:mm") : <span>Seleccionar fecha</span>}
                        </Button>
                        <p className="text-xs text-muted-foreground">La segunda fecha debe ser posterior a la primera fecha de finalización.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const TimerComponent = React.memo(({ block }: { block: TimerBlock }) => {
  const { endDate, timezone, design, endAction, styles } = block.payload;
  const [currentStage, setCurrentStage] = useState<'primary' | 'secondary'>('primary');
  const [isFinished, setIsFinished] = useState(false);

  const targetDate = currentStage === 'primary' ? endDate : endAction.secondaryEndDate;
  const initialStartDateRef = useRef(new Date());

  const calculateTimeLeft = useCallback(() => {
    if (!targetDate) return {};
    try {
      const end = new Date(targetDate);
      const now = new Date();
      // Directly use the valid IANA timezone identifier
      const nowInTimezone = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
      const timeZoneOffset = nowInTimezone.getTime() - now.getTime();
      const correctedNow = new Date(now.getTime() + timeZoneOffset);
      const difference = end.getTime() - correctedNow.getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
    } catch (e) {
      console.error("Invalid time zone specified:", timezone);
    }
    return {};
  }, [targetDate, timezone]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    setIsFinished(false);
    setCurrentStage('primary');
    initialStartDateRef.current = new Date();
  }, [endDate, endAction.secondaryEndDate]);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      if (Object.keys(newTimeLeft).length === 0) {
        if (currentStage === 'primary' && endAction.type === 'secondary_countdown' && endAction.secondaryEndDate) {
          setCurrentStage('secondary');
        } else {
          setIsFinished(true);
          clearInterval(timer);
        }
      } else {
        setTimeLeft(newTimeLeft);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft, currentStage, endAction]);

  if (isFinished && endAction.type === 'message') {
    return (
      <div className="p-4 text-center w-full flex justify-center" style={{ fontSize: `${styles.scale * 16}px` }}>
        <p className="text-lg font-semibold" style={{ fontFamily: styles.fontFamily }}>{endAction.message}</p>
      </div>
    );
  }

  const timeUnits = isFinished && endAction.type === 'stop' ? { days: 0, hours: 0, minutes: 0, seconds: 0 } : timeLeft;

  const timeData = [
    { label: 'Días', value: timeUnits.days },
    { label: 'Horas', value: timeUnits.hours },
    { label: 'Minutos', value: timeUnits.minutes },
    { label: 'Segundos', value: timeUnits.seconds },
  ];
  
  const getProgress = (unit: 'Días' | 'Horas' | 'Minutos' | 'Segundos') => {
      if (isFinished) return 0;
      const end = new Date(targetDate!);
      const start = initialStartDateRef.current;
      const totalDuration = end.getTime() - start.getTime();
      if (totalDuration <= 0) return 1;

      const daysLeft = timeUnits.days || 0;
      const hoursLeft = timeUnits.hours || 0;
      const minutesLeft = timeUnits.minutes || 0;
      const secondsLeft = timeUnits.seconds || 0;
      const totalDays = Math.floor(totalDuration / (1000 * 60 * 60 * 24));

      switch (unit) {
        case 'Días': return totalDays > 0 ? (daysLeft / totalDays) : (daysLeft > 0 ? 1 : 0);
        case 'Horas': return (hoursLeft / 23);
        case 'Minutos': return (minutesLeft / 59);
        case 'Segundos': return (secondsLeft / 59);
        default: return 0;
      }
  };

  const renderDigital = () => {
    const baseStyle: React.CSSProperties = {
      borderRadius: `${styles.borderRadius}px`,
      color: styles.numberColor,
      fontFamily: styles.fontFamily,
    };
    if (styles.background.type === 'solid') {
      baseStyle.backgroundColor = styles.background.color1;
    } else {
      const { direction, color1, color2 } = styles.background;
      if (direction === 'radial') {
        baseStyle.backgroundImage = `radial-gradient(circle, ${color1}, ${color2})`;
      } else {
        const angle = direction === 'horizontal' ? 'to right' : 'to bottom';
        baseStyle.backgroundImage = `linear-gradient(${angle}, ${color1}, ${color2})`;
      }
    }

    return (
      <div className="w-full flex justify-center">
        <div className="flex flex-wrap justify-center items-center gap-1 md:gap-2 p-1" style={{ fontSize: `${styles.scale * 16}px` }}>
          {timeData.map(unit => (
            <div key={unit.label} className="flex flex-col items-center">
              <div style={baseStyle} className="flex items-center justify-center p-2 w-[4em] h-[4em] text-[2em] font-bold">
                {String(unit.value || 0).padStart(2, '0')}
              </div>
              <p className="text-xs mt-1" style={{ color: styles.labelColor, fontFamily: styles.fontFamily }}>{unit.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderAnalog = () => {
    const { background } = styles;
    const gradientId = `analog-grad-${block.id}`;

    return (
      <div className="flex w-full justify-center">
        <div className="flex flex-wrap justify-center items-center gap-1 p-1" style={{ fontSize: `${styles.scale * 16}px` }}>
          <svg width="0" height="0" className="absolute">
            <defs>
              {background.type === 'gradient' && (
                <linearGradient id={gradientId} gradientTransform={background.direction === 'horizontal' ? 'rotate(90)' : (background.direction === 'vertical' ? 'rotate(0)' : undefined)}>
                  <stop offset="0%" stopColor={background.color1} />
                  <stop offset="100%" stopColor={background.color2 || background.color1} />
                </linearGradient>
              )}
              {background.type === 'gradient' && background.direction === 'radial' && (
                <radialGradient id={`${gradientId}-radial`}>
                  <stop offset="0%" stopColor={background.color1} />
                  <stop offset="100%" stopColor={background.color2 || background.color1} />
                </radialGradient>
              )}
            </defs>
          </svg>
          {timeData.map(unit => (
            <div key={unit.label} className="flex flex-col items-center flex-shrink-0" style={{ width: '6em', height: '7em' }}>
              <div className="relative w-full h-[6em]">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle className="stroke-current text-muted/20" strokeWidth={styles.strokeWidth} cx="50" cy="50" r="40" fill="transparent" />
                  <circle
                    strokeWidth={styles.strokeWidth}
                    cx="50" cy="50" r="40" fill="transparent"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - getProgress(unit.label as any))}
                    transform="rotate(-90 50 50)"
                    strokeLinecap="round"
                    stroke={background.type === 'solid'
                      ? background.color1
                      : (background.direction === 'radial' ? `url(#${gradientId}-radial)` : `url(#${gradientId})`)
                    }
                  />
                  <text x="50" y="50" textAnchor="middle" dy="0.3em" className="text-[1.25em] font-bold fill-current" style={{ color: styles.numberColor, fontFamily: styles.fontFamily }}>
                    {String(unit.value || 0).padStart(2, '0')}
                  </text>
                </svg>
              </div>
              <p className="text-[0.75em] -mt-[0.5em]" style={{ color: styles.labelColor, fontFamily: styles.fontFamily }}>{unit.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderMinimalist = () => {
    const { background } = styles;
    const gradientId = `minimalist-grad-${block.id}`;
    const pathLength = 400;
    return (
        <div className="w-full flex justify-center items-center" style={{ fontSize: `${styles.scale * 14}px` }}>
            <div className="flex justify-center items-center flex-wrap gap-x-1 gap-y-2 p-1" style={{ fontFamily: styles.fontFamily }}>
                <svg width="0" height="0" className="absolute">
                  <defs>
                    {background.type === 'gradient' && (
                        <linearGradient id={gradientId} gradientTransform={background.direction === 'horizontal' ? 'rotate(90)' : (background.direction === 'vertical' ? 'rotate(0)' : undefined)}>
                          <stop offset="0%" stopColor={background.color1} />
                          <stop offset="100%" stopColor={background.color2 || background.color1} />
                        </linearGradient>
                      )}
                      {background.type === 'gradient' && background.direction === 'radial' && (
                        <radialGradient id={`${gradientId}-radial`}>
                          <stop offset="0%" stopColor={background.color1} />
                          <stop offset="100%" stopColor={background.color2 || background.color1} />
                        </radialGradient>
                      )}
                  </defs>
                </svg>
                {timeData.map((unit) => (
                    <div key={unit.label} className="relative flex flex-col items-center justify-center flex-shrink-0" style={{ width: '5em', height: '5em' }}>
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120">
                            <path
                                d="M 10,10 H 110 V 110 H 10 Z"
                                fill="none"
                                stroke="hsl(var(--ai-track))"
                                strokeWidth={styles.strokeWidth}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                            <path
                                d="M 10,10 H 110 V 110 H 10 Z"
                                fill="none"
                                stroke={background.type === 'solid' ? background.color1 : (background.direction === 'radial' ? `url(#${gradientId}-radial)` : `url(#${gradientId})`)}
                                strokeWidth={styles.strokeWidth}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                strokeDasharray={pathLength}
                                strokeDashoffset={pathLength * (1 - getProgress(unit.label as any))}
                            />
                        </svg>
                        <div className="z-10 flex flex-col items-center justify-center">
                             <span className="font-light" style={{ fontSize: '1.5em', color: styles.numberColor }}>{String(unit.value || 0).padStart(2, '0')}</span>
                             <p className="uppercase tracking-widest text-muted-foreground pt-2" style={{color: styles.labelColor, fontSize: `${styles.minimalistLabelSize * 0.6}em` }}>{unit.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };


  const renderContent = () => {
    switch (design) {
      case 'analog': return renderAnalog();
      case 'minimalist': return renderMinimalist();
      case 'digital':
      default:
        return renderDigital();
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-center overflow-hidden">
      {renderContent()}
    </div>
  );
});
TimerComponent.displayName = 'TimerComponent';


const BackgroundManagerModal = React.memo(({ open, onOpenChange, onApply, initialValue }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApply: (state?: WrapperStyles['backgroundImage']) => void;
    initialValue?: WrapperStyles['backgroundImage'];
}) => {
    const [internalState, setInternalState] = useState(initialValue);
    const [activeSource, setActiveSource] = useState<BackgroundSource>('upload');
    const [isUploading, setIsUploading] = useState(false);
    const [galleryFiles, setGalleryFiles] = useState<StorageFile[]>([]);
    const [isGalleryLoading, setIsGalleryLoading] = useState(false);
    const [supabaseUrl, setSupabaseUrl] = useState('');
    const { toast } = useToast();

    const handleUpdateInternalState = (key: keyof NonNullable<typeof internalState>, value: any) => {
      setInternalState(prevState => {
        const defaultState: NonNullable<WrapperStyles['backgroundImage']> = {
          url: '', fit: 'cover', positionX: 50, positionY: 50, zoom: 100,
        };
        const currentState = prevState || defaultState;
        return { ...currentState, [key]: value };
      });
    };
    
    useEffect(() => {
        const defaultState: NonNullable<WrapperStyles['backgroundImage']> = {
            url: '', fit: 'cover', positionX: 50, positionY: 50, zoom: 100,
        };
        const stateToSet = (initialValue && initialValue.url) ? { ...defaultState, ...initialValue } : defaultState;
        setInternalState(stateToSet);
        if (open) {
            setActiveSource(initialValue?.url ? 'gallery' : 'upload');
        }
    }, [open, initialValue]);


    const fetchGalleryFiles = useCallback(async () => {
        setIsGalleryLoading(true);
        const result = await listFiles();
        if (result.success && result.data) {
            setGalleryFiles(result.data.files);
            setSupabaseUrl(result.data.baseUrl);
        } else {
            toast({ title: "Error al cargar la galería", description: result.error, variant: 'destructive' });
        }
        setIsGalleryLoading(false);
    }, [toast]);

    useEffect(() => {
        if (open && activeSource === 'gallery' && galleryFiles.length === 0) {
            fetchGalleryFiles();
        }
    }, [open, activeSource, galleryFiles.length, fetchGalleryFiles]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        const result = await uploadFile(formData);
        setIsUploading(false);

        if (result.success && result.data?.uploadedFile) {
            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/template_backgrounds/${result.data.uploadedFile.name}`;
            handleUpdateInternalState('url', publicUrl);
            toast({ title: '¡Éxito!', description: 'Imagen subida y lista para aplicar.', className: 'bg-green-500 text-white' });
        } else {
            toast({ title: 'Error al subir', description: result.error, variant: 'destructive' });
        }
    };
    
    const handleApply = () => {
        onApply(internalState?.url ? internalState : undefined);
        onOpenChange(false);
    };

    const handleGallerySelect = (file: StorageFile) => {
        if (supabaseUrl) {
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/template_backgrounds/${file.name}`;
            handleUpdateInternalState('url', publicUrl);
        }
    };

    const getFileUrl = (file: StorageFile) => `${supabaseUrl}/storage/v1/object/public/template_backgrounds/${file.name}`;

    return (
       <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl w-full h-[550px] flex flex-col p-0 gap-0 bg-zinc-900/90 border-zinc-700 backdrop-blur-xl text-white">
            <DialogHeader className="p-4 border-b border-zinc-800 shrink-0 z-10">
                <DialogTitle className="flex items-center gap-2 text-base"><ImageIcon className="text-primary"/>Gestionar Imagen de Fondo</DialogTitle>
            </DialogHeader>
            <div className="flex-1 grid grid-cols-12 overflow-hidden z-10">
                <div className="col-span-7 flex flex-col bg-black/30 p-4 border-r border-zinc-800">
                    <Label className="text-zinc-300 text-sm mb-2">Vista previa</Label>
                    <div className="w-full flex-1 rounded-lg overflow-hidden border-2 border-dashed border-zinc-700 bg-zinc-900/50">
                        {internalState?.url ? (
                            <div className="w-full h-full" style={{
                                backgroundImage: `url(${internalState.url})`,
                                backgroundSize: internalState.fit === 'auto' ? `${internalState.zoom}%` : internalState.fit,
                                backgroundPosition: `${internalState.positionX}% ${internalState.positionY}%`,
                                backgroundRepeat: 'no-repeat',
                            }} />
                        ) : (
                            <div className="text-center text-zinc-500 p-8 flex flex-col items-center justify-center h-full">
                                <ImageIcon className="mx-auto size-12" />
                                <p className="mt-2 text-sm">Vista previa de la imagen</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-span-5 flex flex-col p-4 space-y-3 overflow-y-auto custom-scrollbar">
                     <div className="flex justify-center items-center gap-1 bg-black/20 p-1 rounded-lg border border-zinc-700">
                         {(['upload', 'url', 'gallery'] as BackgroundSource[]).map((source) => (
                             <button
                                key={source}
                                onClick={() => setActiveSource(source)}
                                className={cn("led-button relative flex-1 py-2 px-3 text-sm font-semibold rounded-md transition-colors duration-300 z-10 flex items-center justify-center gap-2",
                                    activeSource === source && "active"
                                )}
                            >
                                <span className="led-light"></span>
                                <span className="relative z-20 capitalize">
                                    {source === 'upload' ? 'Cargar' : (source === 'url' ? 'URL' : 'Galería')}
                                </span>
                            </button>
                         ))}
                     </div>
                      <div className="flex-1 pt-2">
                         {activeSource === 'upload' && (
                            <div className="space-y-2">
                                <Label htmlFor="image-upload" className="flex items-center gap-2 text-zinc-300 text-sm"><UploadCloud/> Subir Archivo</Label>
                                <Input id="image-upload" type="file" accept="image/png, image/jpeg, image/gif, image/webp" onChange={handleFileChange} disabled={isUploading} className="text-zinc-300 text-xs border-zinc-700 file:text-primary file:font-semibold"/>
                                {isUploading && <div className="flex items-center gap-2 text-xs text-zinc-400"><RefreshCw className="size-4 animate-spin"/>Subiendo...</div>}
                            </div>
                        )}
                        {activeSource === 'url' && (
                            <div className="space-y-2">
                                <Label htmlFor="image-url" className="flex items-center gap-2 text-zinc-300 text-sm"><LinkIcon/> URL de la Imagen</Label>
                                <Input id="image-url" placeholder="https://example.com/image.png" value={internalState?.url || ''} onChange={(e) => handleUpdateInternalState('url', e.target.value)} className="border-zinc-700 text-zinc-200 text-sm h-9"/>
                            </div>
                        )}
                        {activeSource === 'gallery' && (
                           <div className="h-full min-h-[150px] flex flex-col">
                                {isGalleryLoading ? (
                                    <div className="grid grid-cols-4 gap-2">
                                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg bg-zinc-700" />)}
                                    </div>
                                ) : galleryFiles.length > 0 ? (
                                    <ScrollArea className="flex-1 -mr-3 pr-3 h-32">
                                        <div className="grid grid-cols-4 gap-2">
                                            {galleryFiles.map(file => (
                                                <Card key={file.id} onClick={() => handleGallerySelect(file)} className={cn("relative group overflow-hidden cursor-pointer aspect-square bg-zinc-800", internalState?.url === getFileUrl(file) && "ring-2 ring-primary ring-offset-2 ring-offset-zinc-900")}>
                                                    <img src={getFileUrl(file.name)} alt={file.name} className="w-full h-full object-cover"/>
                                                    {internalState?.url === getFileUrl(file) && <div className="absolute top-1 right-1 p-0.5 bg-primary rounded-full"><CheckIcon className="text-white size-3"/></div>}
                                                </Card>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                ) : (
                                    <p className="text-center text-zinc-500 text-sm h-full flex items-center justify-center">Tu galería está vacía</p>
                                )}
                           </div>
                        )}
                    </div>
                     <div className="space-y-3 text-sm p-3 rounded-lg bg-black/20 border border-zinc-800">
                        <Label className="text-zinc-300 text-sm">Ajustes de la Imagen</Label>
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs">Ajuste</Label>
                            <Select value={internalState?.fit || 'cover'} onValueChange={(value: BackgroundFit) => handleUpdateInternalState('fit', value)}>
                                <SelectTrigger className="border-zinc-700 text-zinc-200 h-9 text-xs"><SelectValue/></SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700 text-white"><SelectItem value="cover">Cubrir</SelectItem><SelectItem value="contain">Contener</SelectItem><SelectItem value="auto">Automático/Zoom</SelectItem></SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-3">
                            <Label className="flex items-center gap-1.5 text-zinc-400 text-xs"><Expand className="size-3"/> Zoom</Label>
                            <Slider value={[internalState?.zoom || 100]} min={10} max={300} onValueChange={(v) => handleUpdateInternalState('zoom', v[0])} disabled={internalState?.fit !== 'auto'}/>
                        </div>
                         <div className="flex items-center gap-2">
                            <div className="flex-1 space-y-1">
                                <Label className="flex items-center gap-1.5 text-zinc-400 text-xs"><ArrowLeftRight className="size-3"/> Horizontal</Label>
                                <Slider value={[internalState?.positionX || 50]} onValueChange={(v) => handleUpdateInternalState('positionX', v[0])}/>
                            </div>
                            <Separator orientation="vertical" className="h-10 bg-zinc-700 mx-1"/>
                            <div className="flex-1 space-y-1">
                                <Label className="flex items-center gap-1.5 text-zinc-400 text-xs"><ArrowUpDown className="size-3"/> Vertical</Label>
                                <Slider value={[internalState?.positionY || 50]} onValueChange={(v) => handleUpdateInternalState('positionY', v[0])}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter className="p-3 border-t border-zinc-800 shrink-0 bg-zinc-900/50 z-10 flex justify-between">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">Cancelar</Button>
                <Button onClick={handleApply} disabled={!internalState?.url || isUploading} className="bg-primary hover:bg-primary/80 text-white">
                    {isUploading ? <RefreshCw className="mr-2 size-4 animate-spin"/> : <CheckIcon className="mr-2"/>}
                    Aplicar Imagen
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    );
});
BackgroundManagerModal.displayName = 'BackgroundManagerModal';

const ImageEditor = ({ selectedElement, canvasContent, setCanvasContent }: {
  selectedElement: SelectedElement;
  canvasContent: CanvasBlock[];
  setCanvasContent: (content: CanvasBlock[], recordHistory: boolean) => void;
}) => {
    const { toast } = useToast();
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    
    if(selectedElement?.type !== 'primitive' || getSelectedBlockType(selectedElement, canvasContent) !== 'image') return null;

    const getElement = (): ImageBlock | null => {
        const row = canvasContent.find(r => r.id === selectedElement.rowId);
        if (row?.type !== 'columns') return null;
        const col = row?.payload.columns.find(c => c.id === selectedElement.columnId);
        const block = col?.blocks.find(b => b.id === selectedElement.primitiveId);
        return block?.type === 'image' ? block as ImageBlock : null;
    }
    const element = getElement();

    if(!element) return null;

    const updatePayload = (key: keyof ImageBlock['payload'], value: any, record: boolean = true) => {
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
                              if (block.id !== selectedElement.primitiveId || block.type !== 'image') return block;
                              return { ...block, payload: { ...block.payload, [key]: value } };
                          })
                      };
                  })
              }
          };
        }), record);
    };
  
    const updateStyle = (key: keyof ImageBlock['payload']['styles'], value: any, record: boolean = true) => {
        updatePayload('styles', { ...element.payload.styles, [key]: value }, record);
    };

    const updateBorder = (key: string, value: any) => {
        updateStyle('border', { ...element.payload.styles.border, [key]: value });
    };

    const handleGallerySelect = (fileUrl: string) => {
      updatePayload('url', fileUrl);
      setIsGalleryOpen(false);
    };

    const setDirection = (direction: GradientDirection) => {
        updateBorder('direction', direction);
    };
    
    const { border, borderRadius, zoom, positionX, positionY } = element.payload.styles;

    return (
        <div className="space-y-4">
            <ImageBlockGalleryModal open={isGalleryOpen} onOpenChange={setIsGalleryOpen} onSelect={handleGallerySelect} />
            <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><ImageIcon/>Gestionar Imagen</h3>
             <div className="space-y-2">
                <div>
                  <Label htmlFor="image-url-editor" className="text-xs text-muted-foreground">O añade una URL de imagen</Label>
                  <Input id="image-url-editor" value={element.payload.url} onChange={(e) => updatePayload('url', e.target.value)} placeholder="https://example.com/image.png" />
                </div>
                 <Button variant="outline" className="w-full" onClick={() => setIsGalleryOpen(true)}>
                    <GalleryVertical className="mr-2"/>Abrir Galería
                </Button>
            </div>
            
            <div className="space-y-2">
                <Label>Texto Alternativo</Label>
                <Input 
                  value={element.payload.alt}
                  onChange={(e) => updatePayload('alt', e.target.value)}
                  placeholder="Describe la imagen"
                />
            </div>
            <Separator />
             <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground/80">Ajustes de la Imagen</h3>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Expand/>Zoom</Label>
                    <Slider 
                        value={[zoom]} 
                        min={100} max={300} 
                        onValueChange={(v) => updateStyle('zoom', v[0], false)}
                        onValueCommit={(v) => updateStyle('zoom', v[0], true)}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-1">
                        <Label className="flex items-center gap-1.5 text-xs"><ArrowLeftRight className="size-3"/> Horizontal (X)</Label>
                        <Slider 
                            value={[positionX]} 
                            onValueChange={(v) => updateStyle('positionX', v[0], false)}
                            onValueCommit={(v) => updateStyle('positionX', v[0], true)}
                        />
                    </div>
                    <div className="flex-1 space-y-1">
                        <Label className="flex items-center gap-1.5 text-xs"><ArrowUpDown className="size-3"/> Vertical (Y)</Label>
                        <Slider 
                            value={[positionY]} 
                            onValueChange={(v) => updateStyle('positionY', v[0], false)}
                            onValueCommit={(v) => updateStyle('positionY', v[0], true)}
                        />
                    </div>
                </div>
            </div>
            <Separator/>
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground/80">Estilos del Borde</h3>
                <div className="space-y-2">
                  <Label>Ancho del Borde</Label>
                  <Slider value={[border.width]} max={20} onValueChange={(v) => updateBorder('width', v[0])} />
                </div>
                <div className="space-y-2">
                  <Label>Radio del Borde</Label>
                  <Slider value={[borderRadius]} max={100} onValueChange={(v) => updateStyle('borderRadius', v[0])} />
                </div>
                <div className="space-y-2">
                    <Label>Color del Borde</Label>
                    <Tabs value={border.type} onValueChange={(v) => updateBorder('type', v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="solid">Sólido</TabsTrigger><TabsTrigger value="gradient">Degradado</TabsTrigger></TabsList>
                    </Tabs>
                    <div className="pt-2 space-y-2">
                        <Label>Color 1</Label>
                        <ColorPickerAdvanced color={border.color1} setColor={c => updateBorder('color1', c)} />
                    </div>
                    {border.type === 'gradient' && (
                        <div className="pt-2 space-y-2">
                            <Label>Color 2</Label>
                            <ColorPickerAdvanced color={border.color2 || '#3357FF'} setColor={c => updateBorder('color2', c)} />
                             <div className="space-y-3">
                                <Label>Dirección del Degradado</Label>
                                <div className="grid grid-cols-3 gap-2">
                                     <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild><Button variant={border.direction === 'vertical' ? 'secondary' : 'outline'} size="icon" onClick={() => setDirection('vertical')}><ArrowDown/></Button></TooltipTrigger>
                                            <TooltipContent><p>Vertical</p></TooltipContent>
                                        </Tooltip>
                                         <Tooltip>
                                            <TooltipTrigger asChild><Button variant={border.direction === 'horizontal' ? 'secondary' : 'outline'} size="icon" onClick={() => setDirection('horizontal')}><ArrowRight/></Button></TooltipTrigger>
                                            <TooltipContent><p>Horizontal</p></TooltipContent>
                                        </Tooltip>
                                         <Tooltip>
                                            <TooltipTrigger asChild><Button variant={border.direction === 'radial' ? 'secondary' : 'outline'} size="icon" onClick={() => setDirection('radial')}><Sun className="size-4"/></Button></TooltipTrigger>
                                            <TooltipContent><p>Radial</p></TooltipContent>
                                         </Tooltip>
                                     </TooltipProvider>
                                 </div>
                              </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const RatingEditor = ({ selectedElement, canvasContent, setCanvasContent }: {
  selectedElement: SelectedElement;
  canvasContent: CanvasBlock[];
  setCanvasContent: (content: CanvasBlock[], recordHistory: boolean) => void;
}) => {
    if (selectedElement?.type !== 'primitive' || getSelectedBlockType(selectedElement, canvasContent) !== 'rating') {
        return <div className="text-center text-muted-foreground p-4 text-sm">Selecciona un bloque de Estrellas para ver sus opciones.</div>;
    }

    const getElement = (): RatingBlock | null => {
        const row = canvasContent.find(r => r.id === selectedElement.rowId);
        if (row?.type !== 'columns') return null;
        const col = row.payload.columns.find(c => c.id === selectedElement.columnId);
        const block = col?.blocks.find(b => b.id === selectedElement.primitiveId);
        return block?.type === 'rating' ? block as RatingBlock : null;
    }
    const element = getElement();
    if (!element) return null;
    
    const updatePayload = (key: keyof RatingBlock['payload'], value: any) => {
        setCanvasContent(prev => prev.map(row => {
          if (row.id !== selectedElement.rowId || row.type !== 'columns') return row;
          return { ...row, payload: { ...row.payload, columns: row.payload.columns.map(col => {
            if (col.id !== selectedElement.columnId) return col;
            return { ...col, blocks: col.blocks.map(block => {
              if (block.id !== selectedElement.primitiveId || block.type !== 'rating') return block;
              return { ...block, payload: { ...block.payload, [key]: value } };
            })};
          })}};
        }), true);
    };

    const updateStyle = (key: keyof RatingBlock['payload']['styles'], value: any) => {
        updatePayload('styles', { ...element.payload.styles, [key]: value });
    };

    const updateSubStyle = (mainKey: 'filled' | 'unfilled' | 'border', subKey: string, value: any) => {
        updateStyle(mainKey, { ...element.payload.styles[mainKey], [subKey]: value });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Star/>Editor de Estrellas</h3>
            <div className="space-y-2">
                <Label>Calificación ({element.payload.rating} / 5)</Label>
                <Slider 
                    value={[element.payload.rating]}
                    min={0} max={5} step={0.5}
                    onValueChange={v => updatePayload('rating', v[0])}
                />
            </div>
             <div className="space-y-2">
                <Label>Diseño de Estrella</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant={element.payload.styles.starStyle === 'pointed' ? 'secondary' : 'outline'} onClick={() => updateStyle('starStyle', 'pointed')}><Star className="mr-2"/> Puntiaguda</Button>
                    <Button variant={element.payload.styles.starStyle === 'rounded' ? 'secondary' : 'outline'} onClick={() => updateStyle('starStyle', 'rounded')}><StarHalf className="mr-2"/> Redondeada</Button>
                 </div>
            </div>
            <div className="space-y-2">
                <Label>Alineación</Label>
                <div className="grid grid-cols-3 gap-2">
                    <Button variant={element.payload.styles.alignment === 'left' ? 'secondary' : 'outline'} size="icon" onClick={() => updateStyle('alignment','left')}><AlignLeft/></Button>
                    <Button variant={element.payload.styles.alignment === 'center' ? 'secondary' : 'outline'} size="icon" onClick={() => updateStyle('alignment','center')}><AlignCenter/></Button>
                    <Button variant={element.payload.styles.alignment === 'right' ? 'secondary' : 'outline'} size="icon" onClick={() => updateStyle('alignment','right')}><AlignRight/></Button>
                 </div>
            </div>
            <Separator />
            <h3 className="text-sm font-medium text-foreground/80">Estilos de Estrella</h3>
            <div className="space-y-2">
                <Label>Tamaño de Estrella</Label>
                <Slider value={[element.payload.styles.starSize]} min={10} max={100} onValueChange={v => updateStyle('starSize', v[0])} />
            </div>
            <div className="space-y-2">
                <Label>Espaciado entre Estrellas</Label>
                <Slider value={[element.payload.styles.spacing]} min={0} max={20} step={1} onValueChange={v => updateStyle('spacing', v[0])} />
            </div>
            <div className="space-y-2">
                <Label>Relleno Vertical (Arriba/Abajo)</Label>
                <Slider value={[element.payload.styles.paddingY]} min={0} max={50} step={1} onValueChange={v => updateStyle('paddingY', v[0])} />
            </div>
            <Separator />
            <h3 className="text-sm font-medium text-foreground/80">Relleno de Estrellas Llenas</h3>
            <ColorEditor subStyle="filled" styles={element.payload.styles.filled} updateFunc={updateSubStyle} />
            <Separator />
            <h3 className="text-sm font-medium text-foreground/80">Relleno de Estrellas Vacías</h3>
            <ColorEditor subStyle="unfilled" styles={element.payload.styles.unfilled} updateFunc={updateSubStyle} />
            <Separator />
            <h3 className="text-sm font-medium text-foreground/80">Borde de Estrellas</h3>
            <div className="space-y-2">
                <Label>Ancho del Borde</Label>
                <Slider value={[element.payload.styles.border.width]} min={0} max={10} onValueChange={v => updateSubStyle('border', 'width', v[0])}/>
            </div>
            <ColorEditor subStyle="border" styles={element.payload.styles.border} updateFunc={updateSubStyle} />
        </div>
    )
}

const ColorEditor = ({ subStyle, styles, updateFunc }: {
    subStyle: 'filled' | 'unfilled' | 'border',
    styles: { type: 'solid' | 'gradient', color1: string, color2?: string, direction?: GradientDirection },
    updateFunc: (mainKey: 'filled' | 'unfilled' | 'border', subKey: string, value: any) => void
}) => {
    const setDirection = (direction: GradientDirection) => {
        updateFunc(subStyle, 'direction', direction);
    };

    return (
        <div className="space-y-4">
            <Tabs value={styles.type} onValueChange={(v) => updateFunc(subStyle, 'type', v)} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="solid">Sólido</TabsTrigger>
                    <TabsTrigger value="gradient">Degradado</TabsTrigger>
                </TabsList>
            </Tabs>
            <div className="space-y-2">
                <Label>Color 1</Label>
                <ColorPickerAdvanced color={styles.color1} setColor={c => updateFunc(subStyle, 'color1', c)} />
            </div>
            {styles.type === 'gradient' && (
                <>
                    <div className="space-y-2">
                        <Label>Color 2</Label>
                        <ColorPickerAdvanced color={styles.color2 || '#ffffff'} setColor={c => updateFunc(subStyle, 'color2', c)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Dirección</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button variant={styles.direction === 'vertical' ? 'secondary' : 'outline'} size="icon" onClick={() => setDirection('vertical')}><ArrowDown/></Button></TooltipTrigger>
                                    <TooltipContent><p>Vertical</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button variant={styles.direction === 'horizontal' ? 'secondary' : 'outline'} size="icon" onClick={() => setDirection('horizontal')}><ArrowRight/></Button></TooltipTrigger>
                                    <TooltipContent><p>Horizontal</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button variant={styles.direction === 'radial' ? 'secondary' : 'outline'} size="icon" onClick={() => setDirection('radial')}><Sun className="size-4"/></Button></TooltipTrigger>
                                    <TooltipContent><p>Radial</p></TooltipContent>
                                 </Tooltip>
                             </TooltipProvider>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const RatingComponent = ({ block }: { block: RatingBlock }) => {
    const { rating, styles } = block.payload;
    const { starSize, alignment, paddingY, spacing, starStyle } = styles;

    const pointedStarPath = "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";
    const roundedStarPath = "M12 2c-1.5 3-3.08 3.42-5.5 5.5s-2.5 4-5.5 5.5c-3-1.5-3.42-3.08-5.5-5.5s-4-2.5-5.5-5.5c1.5-3 3.08-3.42 5.5-5.5s2.5-4 5.5-5.5c3 1.5 3.42 3.08 5.5 5.5s4 2.5 5.5 5.5z";


    const renderStar = (index: number) => {
        const fillValue = Math.max(0, Math.min(1, rating - index));
        const uniqueId = `${block.id}-${index}`;
        
        const getFill = (type: 'filled' | 'unfilled' | 'border') => {
            const config = styles[type];
            if (config.type === 'gradient') return `url(#${type}-${uniqueId})`;
            return config.color1;
        };
        
        const starPath = starStyle === 'pointed' ? pointedStarPath : roundedStarPath;

        return (
            <svg key={index} width={starSize} height={starSize} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                 <defs>
                    {(['filled', 'unfilled', 'border'] as const).map(type => {
                        const config = styles[type];
                        if (config.type === 'gradient') {
                            if (config.direction === 'radial') {
                                return <radialGradient key={type} id={`${type}-${uniqueId}`}><stop offset="0%" stopColor={config.color1} /><stop offset="100%" stopColor={config.color2} /></radialGradient>;
                            }
                            return <linearGradient key={type} id={`${type}-${uniqueId}`} gradientTransform={config.direction === 'horizontal' ? 'rotate(90)' : 'rotate(0)'}><stop offset="0%" stopColor={config.color1} /><stop offset="100%" stopColor={config.color2} /></linearGradient>;
                        }
                        return null;
                    })}
                    <clipPath id={`clip-${uniqueId}`}>
                       <rect x="0" y="0" width={24 * fillValue} height="24" />
                    </clipPath>
                 </defs>
                <path d={starPath} fill={getFill('unfilled')} stroke={styles.border.width > 0 ? getFill('border') : 'none'} strokeWidth={styles.border.width} strokeLinejoin={starStyle === 'rounded' ? 'round' : 'miter'} strokeLinecap="round" style={{ paintOrder: 'stroke' }} />
                <path d={starPath} fill={getFill('filled')} stroke="none" clipPath={`url(#clip-${uniqueId})`} />
                { styles.border.width > 0 && <path d={starPath} fill="none" stroke={getFill('border')} strokeWidth={styles.border.width} strokeLinejoin={starStyle === 'rounded' ? 'round' : 'miter'} strokeLinecap="round" /> }
            </svg>
        );
    };

    const alignClass = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end'
    };

    return (
        <div className={cn("flex w-full", alignClass[alignment])} style={{paddingTop: `${paddingY}px`, paddingBottom: `${paddingY}px`}}>
            <div className="flex" style={{ gap: `${spacing}px`}}>
                {Array.from({ length: 5 }).map((_, i) => renderStar(i))}
            </div>
        </div>
    );
}

const FileManagerModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [supabaseUrl, setSupabaseUrl] = useState('');
    const [activeSource, setActiveSource] = useState<'gallery' | 'upload' | 'url'>('gallery');
    const [filterType, setFilterType] = useState<'images' | 'gifs'>('images');
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [selectedFileForPreview, setSelectedFileForPreview] = useState<StorageFile | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isRenaming, setIsRenaming] = useState<string | null>(null);
    const [tempName, setTempName] = useState("");
    const [urlInputValue, setUrlInputValue] = useState("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


    const fetchFiles = useCallback(async () => {
        setIsLoading(true);
        const result = await listFiles();
        if (result.success && result.data) {
            setFiles(result.data.files);
            setSupabaseUrl(result.data.baseUrl);
             if (result.data.files.length > 0) {
                const currentPreviewExists = result.data.files.some(f => f.id === selectedFileForPreview?.id);
                if (!currentPreviewExists) {
                    setSelectedFileForPreview(result.data.files[0]);
                }
            } else {
                setSelectedFileForPreview(null);
            }
        } else {
            toast({ title: 'Error al cargar archivos', description: result.error, variant: 'destructive' });
        }
        setIsLoading(false);
    }, [toast, selectedFileForPreview?.id]);

    useEffect(() => {
        if (open) {
            fetchFiles();
        } else {
            setSelectedFiles([]);
            setIsMultiSelectMode(false);
            setSelectedFileForPreview(null);
        }
    }, [open, fetchFiles]);

    const handleFileSelect = (file: StorageFile) => {
        if (isMultiSelectMode) {
            setSelectedFiles(prev => 
                prev.includes(file.name) 
                    ? prev.filter(name => name !== file.name) 
                    : [...prev, file.name]
            );
        }
        setSelectedFileForPreview(file);
    };
    
    const handleUpload = async (uploadedFile: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', uploadedFile);
        const result = await uploadFile(formData);
        setIsUploading(false);
        if (result.success) {
            toast({ title: "Subida Exitosa", description: "Tu archivo ha sido subido.", className: "bg-green-500 text-white" });
            fetchFiles();
            setActiveSource('gallery');
        } else {
            toast({ title: "Error al Subir", description: result.error, variant: 'destructive' });
        }
    };

    const handleDelete = async () => {
        const pathsToDelete = isMultiSelectMode && selectedFiles.length > 0 ? selectedFiles : selectedFileForPreview ? [selectedFileForPreview.name] : [];
        if (pathsToDelete.length === 0) {
            setIsDeleteDialogOpen(false);
            return;
        }

        const result = await deleteFiles({ paths: pathsToDelete });
        if (result.success) {
            toast({ title: "Archivos Eliminados", description: `${pathsToDelete.length} archivo(s) han sido eliminados.` });
            fetchFiles();
            setSelectedFiles([]);
            if(!isMultiSelectMode) setSelectedFileForPreview(null);
        } else {
            toast({ title: "Error al Eliminar", description: result.error, variant: 'destructive' });
        }
        setIsDeleteDialogOpen(false);
    };
    
    const startRename = (file: StorageFile) => {
      setIsRenaming(file.name);
      setTempName(file.name.split('/').pop() || "");
    }
    
    const handleRename = async () => {
        if (!isRenaming || !tempName) return;
        
        const oldPath = isRenaming;
        const result = await renameFile({ oldPath, newName: tempName });

        if (result.success) {
            toast({ title: "Renombrado", description: "El archivo ha sido renombrado." });
            fetchFiles();
        } else {
            toast({ title: "Error al Renombrar", description: result.error, variant: 'destructive' });
        }
        setIsRenaming(null);
    }
    
    const getFileUrl = (filePath: string) => `${supabaseUrl}/storage/v1/object/public/template_backgrounds/${filePath}`;
    
    const filteredFiles = files.filter(file => {
        if(filterType === 'gifs') return file.metadata.mimetype === 'image/gif';
        if(filterType === 'images') return file.metadata.mimetype !== 'image/gif';
        return true;
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-full h-[90vh] flex flex-col p-0 gap-0 bg-background/90 dark:bg-zinc-900/90 border-border/20 dark:border-zinc-700 backdrop-blur-xl text-foreground dark:text-white shadow-2xl shadow-primary/20">
                <DialogHeader className="p-2.5 border-b border-border/10 dark:border-zinc-800 shrink-0">
                  <DialogTitle>Gestor de Archivos</DialogTitle>
                  <DialogDescription>
                    Sube, gestiona y selecciona imágenes y GIFs para tus plantillas.
                  </DialogDescription>
                </DialogHeader>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente
                            {isMultiSelectMode ? ` ${selectedFiles.length} archivos` : ' el archivo seleccionado'}.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Main Content Area */}
                <div className="flex-1 grid grid-cols-12 overflow-hidden">
                    <div className="col-span-8 md:col-span-9 flex flex-col bg-background/50 dark:bg-black/30 border-r border-border/10 dark:border-zinc-800">
                        {/* Top Control Bar */}
                        <div className="shrink-0 p-2.5 border-b border-border/10 dark:border-zinc-800 flex flex-wrap items-center gap-4">
                             <div className="flex items-center gap-1 bg-muted/50 dark:bg-black/20 p-1 rounded-lg border border-border/20 dark:border-zinc-700">
                                 {(['gallery', 'upload', 'url'] as const).map((source) => (
                                     <button key={source} onClick={() => setActiveSource(source)} className={cn("led-button relative py-1.5 px-3 text-sm font-semibold rounded-md transition-colors duration-300 z-10 flex items-center justify-center gap-2 text-foreground/70 dark:text-white/70", activeSource === source && "active text-foreground dark:text-white")}>
                                         <span className="led-light"></span><span className="relative z-20 capitalize">
                                             {source === 'upload' ? 'Subir' : (source === 'url' ? 'URL' : 'Galería')}
                                         </span>
                                     </button>
                                 ))}
                             </div>
                            <Separator orientation="vertical" className="h-6 bg-border/20 dark:bg-zinc-700"/>
                            <div className="flex items-center gap-1 bg-muted/50 dark:bg-black/20 p-1 rounded-lg border border-border/20 dark:border-zinc-700">
                                <button onClick={() => setFilterType('images')} className={cn("led-button relative py-1.5 px-3 text-sm font-semibold rounded-md transition-colors duration-300 z-10 flex items-center justify-center gap-2 text-foreground/70 dark:text-white/70", filterType === 'images' && "active text-foreground dark:text-white border-primary/50")}>
                                   <span className="led-light"></span><span className="relative z-20 capitalize flex items-center"><LucideImage className="inline-block mr-2 size-4"/>Imágenes</span>
                                </button>
                                 <button onClick={() => setFilterType('gifs')} className={cn("led-button relative py-1.5 px-3 text-sm font-semibold rounded-md transition-colors duration-300 z-10 flex items-center justify-center gap-2 text-foreground/70 dark:text-white/70", filterType === 'gifs' && "active text-foreground dark:text-white border-primary/50")}>
                                   <span className="led-light"></span><span className="relative z-20 capitalize flex items-center"><Film className="inline-block mr-2 size-4"/>GIFs</span>
                                </button>
                            </div>
                             <div className="flex-grow"/>
                             <div className="flex items-center gap-2">
                                <Button variant={isMultiSelectMode ? "secondary" : "outline"} size="sm" onClick={() => setIsMultiSelectMode(!isMultiSelectMode)} className={cn("led-button border-border/50 dark:border-zinc-600 hover:bg-muted dark:hover:bg-white/10 hover:border-border dark:hover:border-zinc-400", isMultiSelectMode && "active")}>
                                     <span className="led-light"></span><span className="relative z-20">Seleccionar Varios</span>
                                </Button>
                                {(isMultiSelectMode ? selectedFiles.length > 0 : !!selectedFileForPreview) && (
                                    <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                                        <Trash2 className="mr-2"/> Eliminar
                                    </Button>
                                )}
                             </div>
                        </div>

                        {/* Dynamic Content */}
                        <ScrollArea className="flex-1 p-4">
                            {activeSource === 'gallery' && (
                                isLoading ? <div className="text-center p-8 text-muted-foreground">Cargando...</div> :
                                filteredFiles.length === 0 ? <div className="text-center text-muted-foreground p-8">No hay archivos en esta categoría.</div> :
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {filteredFiles.map(file => (
                                        <Card key={file.id} onClick={() => handleFileSelect(file)} className={cn("relative group overflow-hidden cursor-pointer aspect-square bg-muted/30 dark:bg-zinc-800 border-2", (isMultiSelectMode && selectedFiles.includes(file.name)) || (!isMultiSelectMode && selectedFileForPreview?.id === file.id) ? "border-primary" : "border-transparent hover:border-primary/50")}>
                                           <img src={getFileUrl(file.name)} alt={file.name} className="w-full h-full object-cover"/>
                                           {isMultiSelectMode && selectedFiles.includes(file.name) && <div className="absolute top-1.5 right-1.5 p-1 bg-primary rounded-full"><CheckIcon className="text-white size-4"/></div>}
                                           <div className="absolute bottom-0 left-0 w-full p-1.5 bg-gradient-to-t from-black/80 to-transparent"><p className="text-xs text-white truncate">{file.name.split('/').pop()}</p></div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                            {activeSource === 'upload' && (
                                <div className="h-full flex items-center justify-center p-4">
                                    <div className="p-8 border-2 border-dashed border-border/50 dark:border-zinc-700 rounded-lg text-center w-full max-w-lg">
                                        <UploadCloud className="mx-auto size-12 text-muted-foreground"/>
                                        <h3 className="mt-4 text-lg font-semibold">Arrastra y suelta o haz clic para subir</h3>
                                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF hasta 10MB</p>
                                        <Input id="file-upload-input" type="file" className="sr-only" onChange={(e) => e.target.files && handleUpload(e.target.files[0])} disabled={isUploading}/>
                                        <Button asChild variant="default" className="mt-4 bg-primary"><Label htmlFor="file-upload-input">{isUploading ? <RefreshCw className="animate-spin mr-2"/> : <Upload className="mr-2"/>}Seleccionar Archivo</Label></Button>
                                    </div>
                                </div>
                            )}
                            {activeSource === 'url' && (
                                <div className="h-full flex items-center justify-center p-4">
                                    <div className="p-8 border border-border/30 dark:border-zinc-800 rounded-lg text-center w-full max-w-lg bg-background dark:bg-black/20">
                                         <LinkIcon className="mx-auto size-12 text-muted-foreground"/>
                                         <h3 className="mt-4 text-lg font-semibold">Añadir desde URL</h3>
                                         <p className="text-xs text-muted-foreground mt-1">Pega una URL de imagen para subirla a tu galería.</p>
                                         <div className="flex gap-2 mt-4">
                                            <Input value={urlInputValue} onChange={e => setUrlInputValue(e.target.value)} placeholder="https://..." className="bg-muted/50 dark:bg-zinc-800 border-border/50 dark:border-zinc-700"/>
                                            <Button>Añadir</Button>
                                         </div>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Side Panel */}
                    <div className="col-span-4 md:col-span-3 p-4 space-y-4 overflow-y-auto custom-scrollbar bg-background/50 dark:bg-black/20">
                        {selectedFileForPreview ? (
                            <>
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Vista Previa</h4>
                                    <div className="aspect-video bg-muted/20 dark:bg-black rounded-lg overflow-hidden border border-border/20 dark:border-zinc-700">
                                        <img src={getFileUrl(selectedFileForPreview.name)} alt="Preview" className="w-full h-full object-contain"/>
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <h4 className="text-sm font-semibold text-muted-foreground">Información</h4>
                                    <div className="p-3 bg-muted/50 dark:bg-black/20 rounded-lg border border-border/20 dark:border-zinc-800 space-y-2">
                                        <div className="flex items-center gap-2">
                                            {isRenaming === selectedFileForPreview.name ? (
                                                <Input value={tempName} onChange={e => setTempName(e.target.value)} onBlur={handleRename} onKeyDown={e => e.key === 'Enter' && handleRename()} autoFocus className="h-7 text-xs bg-background dark:bg-zinc-800 border-border/50 dark:border-zinc-600"/>
                                            ) : (
                                               <p className="font-mono text-xs truncate flex-1 text-muted-foreground">{selectedFileForPreview.name.split('/').pop()}</p>
                                            )}
                                            <Button variant="ghost" size="icon" className="size-6 shrink-0 text-muted-foreground hover:text-foreground" onClick={() => startRename(selectedFileForPreview)}><Pencil className="size-3.5"/></Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Tamaño: {(selectedFileForPreview.metadata.size / 1024).toFixed(2)} KB</p>
                                        <p className="text-xs text-muted-foreground">Subido: {format(new Date(selectedFileForPreview.created_at), 'dd MMM, yyyy')}</p>
                                    </div>
                                </div>
                                 <div className="space-y-2">
                                     <h4 className="text-sm font-semibold text-muted-foreground">Acciones</h4>
                                     <Button variant="outline" className="w-full border-border/50 dark:border-zinc-700 text-muted-foreground hover:text-foreground dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white" onClick={() => window.open(getFileUrl(selectedFileForPreview.name), '_blank')}>
                                        <Expand className="mr-2"/>Ver en Pantalla Completa
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                                <div>
                                    <ImageIcon className="size-16 mx-auto"/>
                                    <p className="mt-2 text-sm">Selecciona un archivo</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                 <DialogFooter className="p-2.5 border-t border-border/10 dark:border-zinc-800 shrink-0 bg-background/80 dark:bg-zinc-900/50 z-10">
                    <Button type="button" onClick={() => onOpenChange(false)} variant="outline" className="dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-700">Salir</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ImageBlockGalleryModal = ({ open, onOpenChange, onSelect }: { open: boolean, onOpenChange: (open: boolean) => void, onSelect: (url: string) => void }) => {
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [supabaseUrl, setSupabaseUrl] = useState('');

    const fetchFiles = useCallback(async () => {
        setIsLoading(true);
        const result = await listFiles();
        if (result.success && result.data) {
            setFiles(result.data.files);
            setSupabaseUrl(result.data.baseUrl);
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
        setIsLoading(false);
    }, [toast]);

    useEffect(() => {
        if (open) {
            fetchFiles();
        }
    }, [open, fetchFiles]);
    
    const getFileUrl = (filePath: string) => `${supabaseUrl}/storage/v1/object/public/template_backgrounds/${filePath}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[70vh] bg-card/90 backdrop-blur-sm">
                <DialogHeader>
                    <DialogTitle>Galería de Imágenes</DialogTitle>
                    <DialogDescription>Selecciona una imagen subida previamente para tu bloque de contenido.</DialogDescription>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex items-center justify-center h-full"><p>Cargando archivos...</p></div>
                ) : (
                   <ScrollArea className="h-full">
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pr-4">
                      {files.map(file => (
                         <Card key={file.id} onClick={() => onSelect(getFileUrl(file.name))} className="cursor-pointer hover:ring-2 hover:ring-primary overflow-hidden">
                            <CardContent className="p-0 aspect-square">
                                <img src={getFileUrl(file.name)} alt={file.name.split('/').pop()} className="w-full h-full object-cover"/>
                            </CardContent>
                            <CardFooter className="p-2">
                               <p className="text-xs truncate">{file.name.split('/').pop()}</p>
                            </CardFooter>
                         </Card>
                      ))}
                    </div>
                   </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    )
};


export default function CreateTemplatePage() {
  const router = useRouter();
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [canvasContent, _setCanvasContent] = useState<CanvasBlock[]>([]);
  const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
  const [templateName, setTemplateName] = useState('Mi Plantilla Increíble');
  const [tempTemplateName, setTempTemplateName] = useState(templateName);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode for editor
  const [itemToDelete, setItemToDelete] = useState<{ rowId: string, colId?: string, primId?: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // State for block selectors
  const [activeContainer, setActiveContainer] = useState<{ id: string; type: 'column' | 'wrapper' } | null>(null);
  const [isColumnBlockSelectorOpen, setIsColumnBlockSelectorOpen] = useState(false);
  const [isWrapperBlockSelectorOpen, setIsWrapperBlockSelectorOpen] = useState(false);

  // State for wrapper actions
  const [isActionSelectorModalOpen, setIsActionSelectorModalOpen] = useState(false);
  const [actionTargetWrapperId, setActionTargetWrapperId] = useState<string | null>(null);
  const [clickPosition, setClickPosition] = useState<{x: number, y: number} | null>(null);
  const [isEmojiSelectorOpen, setIsEmojiSelectorOpen] = useState(false);

  // States for resizing
  const [isResizing, setIsResizing] = useState(false);
  const [resizingWrapperId, setResizingWrapperId] = useState<string | null>(null);

  // State for background image modal
  const [isBgImageModalOpen, setIsBgImageModalOpen] = useState(false);
  
  const [isCopySuccessModalOpen, setIsCopySuccessModalOpen] = useState(false);

  // New states for the modals
  const [isInitialNameModalOpen, setIsInitialNameModalOpen] = useState(false);
  const [isConfirmExitModalOpen, setIsConfirmExitModalOpen] = useState(false);
  
  // Gallery Modal State
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  
  const [userId, setUserId] = useState<string | null>(null);


  const [templateId, setTemplateId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, startSaving] = useTransition();
  
  // Undo/Redo states
  const [history, setHistory] = useState<CanvasBlock[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true); // For preloader
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  const wrapperRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { toast } = useToast();
  
  const setCanvasContent = useCallback((newContent: CanvasBlock[] | ((prev: CanvasBlock[]) => CanvasBlock[]), recordHistory: boolean = true) => {
    _setCanvasContent(prev => {
        const newContentValue = typeof newContent === 'function' ? newContent(prev) : newContent;
        if(recordHistory) {
            const newHistory = history.slice(0, historyIndex + 1);
            setHistory([...newHistory, newContentValue]);
            setHistoryIndex(newHistory.length);
        }
        return newContentValue;
    });
  }, [history, historyIndex]);

  const handleUndo = () => {
      if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          _setCanvasContent(history[newIndex]);
          setSelectedElement(null);
      }
  };

  const handleRedo = () => {
      if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          _setCanvasContent(history[newIndex]);
          setSelectedElement(null);
      }
  };


  const handlePublish = () => {
    setLoadingAction('save');
    startSaving(async () => {
      const result = await saveTemplateAction({
        name: templateName,
        content: canvasContent,
        templateId: templateId ?? undefined,
      });
      setLoadingAction(null);

      if (result.success && result.data) {
        if (!templateId) {
          setTemplateId(result.data.id);
        }
        setLastSaved(new Date(result.data.updated_at));
        toast({
          title: "¡Plantilla Guardada!",
          description: "Tu obra maestra está a salvo en nuestra base de datos.",
          className: 'bg-gradient-to-r from-[#AD00EC] to-[#1700E6] border-none text-white',
        });
      } else {
        toast({
          title: "Error al Guardar",
          description: result.error || "No se pudo guardar la plantilla. Intenta de nuevo.",
          variant: "destructive",
        });
      }
    });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  useEffect(() => {
    // Show preloader for a bit
    const timer = setTimeout(() => setIsLoading(false), 1500);

    // After preloader, show the initial name modal
    if (!isLoading) {
      setIsInitialNameModalOpen(true);
    }
    
    const getUserId = async () => {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if(session?.user) {
            setUserId(session.user.id);
        }
    };
    getUserId();

    return () => clearTimeout(timer);
  }, [isLoading]);
  
  const ThemeToggle = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDarkMode ? <Sun /> : <Moon />}
          </Button></TooltipTrigger>
        <TooltipContent>
          <p>Cambiar a modo {isDarkMode ? 'claro' : 'oscuro'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  
  const handleBlockClick = (type: BlockType) => {
      if (type === 'columns') {
          setIsColumnModalOpen(true);
      } else if (type === 'wrapper') {
        const newWrapper: WrapperBlock = {
            id: `wrap_${Date.now()}`,
            type: 'wrapper',
            payload: {
                blocks: [],
                height: 300,
                styles: {
                    background: {
                        type: 'solid',
                        color1: 'rgba(255,255,255,0.05)',
                    }
                }
            }
        };
        setCanvasContent(prev => [...prev, newWrapper]);
      }
  }

  const handleAddColumns = (numColumns: number) => {
    const newColumnsBlock: ColumnsBlock = {
      id: `row_${Date.now()}`,
      type: 'columns',
      payload: {
        columns: Array.from({ length: numColumns }, (_, i) => ({
          id: `col_${Date.now()}_${i}`,
          blocks: [],
          width: 100 / numColumns,
           styles: {}
        })),
        alignment: 50,
      }
    };
    setCanvasContent(prev => [...prev, newColumnsBlock]);
    setIsColumnModalOpen(false);
  };
  
  const handleOpenBlockSelector = (containerId: string, containerType: 'column' | 'wrapper', e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveContainer({ id: containerId, type: containerType });
      if (containerType === 'column') {
        setIsColumnBlockSelectorOpen(true);
      } else {
        setIsWrapperBlockSelectorOpen(true);
      }
  };
  
  const handleAddBlockToColumn = (type: StaticPrimitiveBlockType) => {
      if (!activeContainer || activeContainer.type !== 'column') return;

      let newBlock: PrimitiveBlock;
      const basePayload = { id: `${type}_${Date.now()}` };

      switch(type) {
         case 'heading':
            newBlock = {
                ...basePayload,
                type: 'heading',
                payload: {
                    text: 'Escribe tu título aquí',
                    styles: {
                        color: isDarkMode ? '#FFFFFF' : '#000000',
                        fontFamily: 'Roboto',
                        fontSize: 32,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontStyle: 'normal',
                        textDecoration: 'none'
                    }
                }
            };
            break;
        case 'text':
            newBlock = {
                ...basePayload,
                type: 'text',
                payload: {
                    fragments: [
                        { id: `frag_${Date.now()}`, text: 'Este es un bloque de texto editable. ¡Haz clic para personalizarlo! ', styles: { color: isDarkMode ? '#CCCCCC' : '#333333' } }
                    ],
                    globalStyles: {
                        textAlign: 'left',
                        fontSize: 16
                    }
                }
            };
            break;
        case 'image':
          newBlock = {
            ...basePayload,
            type: 'image',
            payload: {
              url: 'https://placehold.co/600x400.png?text=Nueva+Imagen',
              alt: 'Placeholder image',
              link: { url: '#', openInNewTab: false },
              styles: {
                positionX: 50,
                positionY: 50,
                zoom: 100,
                borderRadius: 8,
                border: {
                  width: 0,
                  type: 'solid',
                  color1: '#A020F0',
                  color2: '#3357FF',
                  direction: 'vertical'
                }
              }
            }
          };
          break;
         case 'button':
            newBlock = {
                ...basePayload,
                type: 'button',
                payload: {
                    text: 'Haz Clic Aquí',
                    link: { url: '#', openInNewTab: false },
                    textAlign: 'center',
                    styles: {
                        color: '#FFFFFF',
                        backgroundColor: '#A020F0',
                        borderRadius: 8,
                         background: { type: 'solid', color1: '#A020F0' }
                    }
                }
            };
            break;
        case 'emoji-static':
             newBlock = {
                ...basePayload,
                type: 'emoji-static',
                payload: {
                    emoji: '🚀',
                    styles: {
                        fontSize: 64,
                        textAlign: 'center',
                        rotate: 0,
                    }
                }
            };
            break;
        case 'separator':
            newBlock = {
                ...basePayload,
                type: 'separator',
                payload: {
                    height: 20,
                    style: 'invisible',
                    line: { thickness: 1, color: '#CCCCCC', style: 'solid', borderRadius: 0 },
                    shapes: { type: 'waves', background: { type: 'solid', color1: '#A020F0' }, frequency: 20 },
                    dots: { size: 4, count: 10, color: '#CCCCCC' }
                }
            };
            break;
        case 'youtube':
            newBlock = {
                ...basePayload,
                type: 'youtube',
                payload: {
                    url: '', videoId: null, title: 'Título de tu video', showTitle: true,
                    duration: { hours: '', minutes: '', seconds: '' }, showDuration: false,
                    link: { url: '', openInNewTab: false },
                    styles: { playButtonType: 'default', borderRadius: 12, borderWidth: 0, border: { type: 'solid', color1: '#FF0000' } }
                }
            };
            break;
        case 'timer':
            const defaultEndDate = new Date();
            defaultEndDate.setDate(defaultEndDate.getDate() + 7);
             newBlock = {
                ...basePayload,
                type: 'timer',
                payload: {
                    endDate: defaultEndDate.toISOString(),
                    timezone: 'Etc/UTC',
                    design: 'minimalist',
                    endAction: { type: 'stop', message: '¡La oferta ha terminado!' },
                    styles: {
                        fontFamily: 'Roboto', numberColor: isDarkMode ? '#FFFFFF' : '#000000', labelColor: isDarkMode ? '#999999' : '#666666',
                        borderRadius: 15, background: { type: 'gradient', color1: '#AD00EC', color2: '#0018EC', direction: 'vertical' },
                        strokeWidth: 4, scale: 1, minimalistLabelSize: 1
                    }
                }
            };
            break;
        case 'rating':
            newBlock = {
                ...basePayload,
                type: 'rating',
                payload: {
                    rating: 4.5,
                    styles: {
                        starStyle: 'pointed',
                        starSize: 40,
                        alignment: 'center',
                        paddingY: 10,
                        spacing: 4,
                        filled: { type: 'solid', color1: '#FFD700', color2: '#FFA500', direction: 'horizontal' },
                        unfilled: { type: 'solid', color1: '#444444' },
                        border: { width: 1, type: 'solid', color1: '#666666' },
                    }
                }
            };
            break;
          default:
              newBlock = { ...basePayload, type: 'text', payload: { text: `Contenido para ${type}` } };
      }

      setCanvasContent(prev => prev.map(row => {
          if (row.type !== 'columns') return row;
          const newColumns = row.payload.columns.map(col => {
              if (col.id === activeContainer?.id) {
                  return { ...col, blocks: [...col.blocks, newBlock] };
              }
              return col;
          }));
          return { ...row, payload: { ...row.payload, columns: newColumns } };
      }));
      setIsColumnBlockSelectorOpen(false);
  };
  
  const handleAddBlockToWrapper = (type: InteractiveBlockType) => {
    if (!activeContainer || activeContainer.type !== 'wrapper' || !clickPosition) return;
    
    setIsActionSelectorModalOpen(false);
    setIsWrapperBlockSelectorOpen(false);

    if (type === 'emoji-interactive') {
        setIsEmojiSelectorOpen(true);
    } else if (type === 'heading-interactive') {
         const wrapperElement = wrapperRefs.current[activeContainer.id];
         if (!wrapperElement) return;

         const rect = wrapperElement.getBoundingClientRect();
         const xPercent = (clickPosition.x / rect.width) * 100;
         const yPercent = (clickPosition.y / rect.height) * 100;

         const newBlock: InteractiveHeadingBlock = {
            id: `iheading_${Date.now()}`,
            type: 'heading-interactive',
            payload: {
                name: `Titulo-${Math.floor(Math.random() * 1000)}`,
                text: 'Título Interactivo',
                x: xPercent, y: yPercent, scale: 1, rotate: 0,
                styles: {
                    color: isDarkMode ? '#FFFFFF' : '#000000',
                    fontFamily: 'Roboto',
                    fontWeight: 'bold',
                    fontStyle: 'normal',
                    textDecoration: 'none'
                }
            }
         };

         setCanvasContent(prev => prev.map(row => {
            if (row.id === activeContainer.id && row.type === 'wrapper') {
                return { ...row, payload: { ...row.payload, blocks: [...row.payload.blocks, newBlock] } };
            }
            return row;
         }));
         setClickPosition(null);
         setActiveContainer(null);
    }
  };

  const handleSelectEmojiForWrapper = (emoji: string) => {
     if (!activeContainer || activeContainer.type !== 'wrapper' || !clickPosition) return;
     
     const wrapperElement = wrapperRefs.current[activeContainer.id];
     if (!wrapperElement) return;

     const rect = wrapperElement.getBoundingClientRect();
     const xPercent = (clickPosition.x / rect.width) * 100;
     const yPercent = (clickPosition.y / rect.height) * 100;
     
     const newBlock: InteractiveEmojiBlock = {
        id: `emoji_${Date.now()}`,
        type: 'emoji-interactive',
        payload: {
            name: `Emoji-${Math.floor(Math.random() * 1000)}`,
            emoji,
            x: xPercent,
            y: yPercent,
            scale: 1,
            rotate: 0,
        }
     };

     setCanvasContent(prev => prev.map(row => {
        if (row.id === activeContainer.id && row.type === 'wrapper') {
            return {
                ...row,
                payload: { ...row.payload, blocks: [...row.payload.blocks, newBlock] }
            }
        }
        return row;
     }));
     setIsEmojiSelectorOpen(false);
     setClickPosition(null);
     setActiveContainer(null);
  }
  
  const promptDeleteItem = (rowId: string, colId?: string, primId?: string) => {
      setItemToDelete({ rowId, colId, primId });
      setIsDeleteModalOpen(true);
  };

  const handleDeleteItem = () => {
    if (!itemToDelete) return;
    const { rowId, colId, primId } = itemToDelete;

    setCanvasContent(prev => {
        let newCanvasContent = [...prev];

        if (primId && colId) { // Deleting a primitive from a column
            newCanvasContent = newCanvasContent.map(row => {
                if (row.id === rowId && row.type === 'columns') {
                    const newCols = row.payload.columns.map(col => {
                        if (col.id === colId) {
                            return { ...col, blocks: col.blocks.filter(b => b.id !== primId) };
                        }
                        return col;
                    });
                    return { ...row, payload: { ...row.payload, columns: newCols } };
                }
                return row;
            });
        } else if (primId && !colId) { // Deleting a primitive from a wrapper
             newCanvasContent = newCanvasContent.map(row => {
                if (row.id === rowId && row.type === 'wrapper') {
                    const newBlocks = row.payload.blocks.filter(b => b.id !== primId);
                    return { ...row, payload: { ...row.payload, blocks: newBlocks }};
                }
                return row;
             });
        } else if (colId) { // Deleting a column - not implemented, delete the whole row
            newCanvasContent = newCanvasContent.filter(row => row.id !== rowId);
        } else { // Deleting a row (ColumnsBlock or WrapperBlock)
            newCanvasContent = newCanvasContent.filter(row => row.id !== rowId);
        }

        return newCanvasContent;
    }, true);

    setSelectedElement(null);
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };
  
  const getFragmentStyle = (fragment: TextFragment): React.CSSProperties => {
    const style: React.CSSProperties = {};
    if (fragment.styles.bold) style.fontWeight = 'bold';
    if (fragment.styles.italic) style.fontStyle = 'italic';
    if (fragment.styles.color) style.color = fragment.styles.color;
    if (fragment.styles.highlight) style.backgroundColor = fragment.styles.highlight;
    if (fragment.styles.fontFamily) style.fontFamily = fragment.styles.fontFamily;
    
    let textDecoration = '';
    if (fragment.styles.underline) textDecoration += ' underline';
    if (fragment.styles.strikethrough) textDecoration += ' line-through';
    if(textDecoration) style.textDecoration = textDecoration.trim();

    return style;
  };
  
  const getButtonStyle = (block: ButtonBlock): React.CSSProperties => {
    const { styles } = block.payload;
    const style: React.CSSProperties = {
      color: styles.color,
      borderRadius: `${styles.borderRadius}px`,
      padding: '10px 20px',
      border: 'none',
      cursor: 'pointer',
      display: 'inline-block',
      fontWeight: 'bold',
    };
    if(styles.background?.type === 'solid') {
      style.backgroundColor = styles.background.color1;
    } else if (styles.background?.type === 'gradient') {
        const { direction, color1, color2 } = styles.background;
        if (direction === 'radial') {
          style.backgroundImage = `radial-gradient(circle, ${color1}, ${color2})`;
        } else {
          const angle = direction === 'horizontal' ? 'to right' : 'to bottom';
          style.backgroundImage = `linear-gradient(${angle}, ${color1}, ${color2})`;
        }
    }
    return style;
  };
  
  const getButtonContainerStyle = (block: ButtonBlock): React.CSSProperties => {
    return {
      textAlign: block.payload.textAlign,
      padding: '8px',
    }
  }

  const getHeadingStyle = (block: HeadingBlock | InteractiveHeadingBlock): React.CSSProperties => {
      const { styles } = block.payload;
      const interactiveStyles: React.CSSProperties = 'scale' in block.payload 
      ? { transform: `scale(${block.payload.scale})` } 
      : { fontSize: `${(block.payload as HeadingBlock['payload']).styles.fontSize}px`, textAlign: (block.payload as HeadingBlock['payload']).styles.textAlign as TextAlign};

      const style: React.CSSProperties = {
          color: styles.color,
          fontFamily: styles.fontFamily,
          fontWeight: styles.fontWeight,
          fontStyle: styles.fontStyle,
          padding: '8px',
          wordBreak: 'break-word',
          whiteSpace: 'nowrap',
          ...interactiveStyles,
      };
      
      if (styles.highlight) {
          style.backgroundColor = styles.highlight;
      }
      
      let textDecoration = '';
      if (styles.textDecoration === 'underline') textDecoration = 'underline';
      if (styles.textDecoration === 'line-through') textDecoration = 'line-through';
      if (textDecoration) style.textDecoration = textDecoration;
      
      return style;
  };

  const getStaticEmojiStyle = (block: StaticEmojiBlock): React.CSSProperties => {
    return {
        fontSize: `${block.payload.styles.fontSize}px`,
        transform: `rotate(${block.payload.styles.rotate}deg)`,
        display: 'inline-block',
        padding: '8px',
    }
  };
  
  const LineSeparator = ({ block }: { block: SeparatorBlock }) => {
    const { height, line } = block.payload;
    return (
        <div style={{ height: `${height}px`, width: '100%', display: 'flex', alignItems: 'center' }}>
            <div style={{
                height: `${line.thickness}px`,
                width: '100%',
                backgroundColor: line.color,
                borderStyle: line.style,
                borderRadius: `${line.borderRadius}px`,
            }} />
        </div>
    );
  };
  
  const ShapesSeparator = ({ block }: { block: SeparatorBlock }) => {
    const { height, shapes } = block.payload;
    const { type, background, frequency } = shapes;
    
    const bgStyle: React.CSSProperties = {};
    if (background.type === 'solid') {
      bgStyle.backgroundColor = background.color1;
    } else if (background.type === 'gradient') {
      const { direction, color1, color2 } = background;
      if (direction === 'radial') {
        bgStyle.backgroundImage = `radial-gradient(circle, ${color1}, ${color2})`;
      } else {
        const angle = direction === 'horizontal' ? 'to right' : 'to bottom';
        bgStyle.backgroundImage = `linear-gradient(${angle}, ${color1}, ${color2})`;
      }
    }

    const getPathForShape = () => {
        let path = '';
        const numRepeats = frequency || 20;

        switch(type) {
            case 'waves':
                path = `M0,50 Q${50/numRepeats},0 ${100/numRepeats},50 T${200/numRepeats},50`;
                return <path d={path} strokeWidth="0" className="fill-current" style={{ transform: `scale(${numRepeats}, 1)` }} />;
            case 'zigzag':
                 path = `M0,50 L${50/numRepeats},0 L${100/numRepeats},50`;
                 return <path d={path} strokeWidth="0" className="fill-current" style={{ transform: `scale(${numRepeats}, 1)` }}/>;
            case 'drops':
                path = `M0,0 A50,50 0 0 1 100,0 L100,100 L0,100 Z`; // Simplified path
                return <path d={path} strokeWidth="0" className="fill-current" style={{ transform: `scale(1, ${height/100})` }} />;
            case 'leaves':
            case 'scallops':
            default:
                return null;
        }
    }

    return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" style={{color: bgStyle.backgroundColor, backgroundImage: bgStyle.backgroundImage}}>
           {getPathForShape()}
        </svg>
    )
  };
  
  const renderPrimitiveBlock = (block: PrimitiveBlock, rowId: string, colId: string, colCount: number) => {
     const isSelected = selectedElement?.type === 'primitive' && selectedElement.primitiveId === block.id;

    return (
       <div 
        key={block.id}
        className={cn(
            "group/primitive relative w-full overflow-hidden",
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
                const safeGlobalStyles = textBlock.payload.globalStyles || { textAlign: 'left', fontSize: 16 };
                return (
                    <p style={{ padding: '8px', wordBreak: 'break-word', whiteSpace: 'pre-wrap', textAlign: safeGlobalStyles.textAlign, fontSize: `${safeGlobalStyles.fontSize}px` }}>
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
              case 'image': {
                const imageBlock = block as ImageBlock;
                const { url, alt, styles, link } = imageBlock.payload;
                const { borderRadius, zoom, positionX, positionY, border } = styles;

                const wrapperStyle: React.CSSProperties = {
                    width: '100%',
                    height: 'auto',
                    padding: '8px'
                };
                
                const borderWrapperStyle: React.CSSProperties = {
                    padding: `${border.width}px`,
                    borderRadius: `${borderRadius}px`,
                };
                
                if (border.width > 0) {
                    if (border.type === 'solid') {
                        borderWrapperStyle.backgroundColor = border.color1;
                    } else if (border.type === 'gradient') {
                        const { direction, color1, color2 } = border;
                        const angle = direction === 'horizontal' ? 'to right' : 'to bottom';
                        borderWrapperStyle.background = direction === 'radial'
                            ? `radial-gradient(circle, ${color1}, ${color2})`
                            : `linear-gradient(${angle}, ${color1}, ${color2})`;
                    }
                }
                
                const imageContainerStyle: React.CSSProperties = {
                    borderRadius: `${Math.max(0, borderRadius - border.width)}px`,
                    overflow: 'hidden',
                    height: 0,
                    paddingBottom: '75%', // Maintain 4:3 aspect ratio
                    position: 'relative',
                };
                
                const imageStyle: React.CSSProperties = {
                    position: 'absolute',
                    width: `${zoom}%`,
                    height: `${zoom}%`,
                    top: `${positionY}%`,
                    left: `${positionX}%`,
                    transform: `translate(-${positionX}%, -${positionY}%) scale(1)`,
                    objectFit: 'cover',
                };

                const imageElement = (
                    <div style={wrapperStyle}>
                        <div style={borderWrapperStyle}>
                           <div style={imageContainerStyle}>
                               <img src={url} alt={alt} style={imageStyle} />
                           </div>
                        </div>
                    </div>
                );
            
                if (link && link.url && link.url !== '#') {
                    return (
                        <a href={link.url} target={link.openInNewTab ? '_blank' : '_self'} rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                            {imageElement}
                        </a>
                    );
                }
                return imageElement;
              }
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
                      default: `svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 48"><path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"/><path d="M 45,24 27,14 27,34" fill="#fff"/></svg>`,
                      classic: `svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><path fill-opacity="0.8" fill="#212121" d="M25.8 8.1c-.2-1.5-.9-2.8-2.1-3.9-1.2-1.2-2.5-1.9-4-2.1C16 2 14 2 14 2s-2 0-5.7.2C6.8 2.3 5.4 3 4.2 4.1 3 5.3 2.3 6.7 2.1 8.1 2 10 2 14 2 14s0 4 .1 5.9c.2 1.5.9 2.8 2.1 3.9 1.2 1.2 2.5 1.9 4 2.1 3.7.2 5.7.2 5.7.2s2 0 5.7-.2c1.5-.2 2.8-.9 4-2.1 1.2-1.2 1.9-2.5 2.1-4 .1-1.9.1-5.9.1-5.9s0-4-.1-5.9z"/><path fill="#FFFFFF" d="M11 10v8l7-4z"/></svg>`,
                    };
                    
                     const sizeVariant = colCount === 1 ? 'lg' : colCount === 2 ? 'md' : colCount === 3 ? 'sm' : 'xs';
                    const playButtonSize = { lg: 'w-32 h-24', md: 'w-16 h-12', sm: 'w-12 h-9', xs: 'w-12 h-9' };

                    const titleSize = { lg: 'text-2xl p-4', md: 'text-lg p-3', sm: 'text-sm p-2', xs: 'text-xs px-2 pt-1 pb-0' };
                    const durationSize = { lg: 'text-base', md: 'text-sm', sm: 'text-xs', xs: 'text-xs' };

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
                                className="w-full h-full relative aspect-video bg-black/5"
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
                                          "block bg-center bg-no-repeat bg-contain transition-transform hover:scale-110", 
                                          playButtonSize[sizeVariant],
                                          link.url && videoId ? "cursor-pointer" : "cursor-default"
                                        )}
                                        style={{ backgroundImage: `url('data:image/svg+xml;base64,${btoa(playButtonSvg[styles.playButtonType])}')` }}
                                        onClick={(e) => {
                                            if (!link.url || !videoId) e.preventDefault();
                                            e.stopPropagation();
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
              case 'timer': {
                 const timerBlock = block as TimerBlock;
                 return <TimerComponent block={timerBlock} />;
              }
              case 'rating': {
                return <RatingComponent block={block as RatingBlock} />;
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
    setCanvasContent(prev => {
        const newCanvasContent = [...prev];
        const item = newCanvasContent.splice(index, 1)[0];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        newCanvasContent.splice(newIndex, 0, item);
        return newCanvasContent;
    }, true);
  };

  const handleSaveTemplateName = () => {
    if (tempTemplateName.trim() === '') {
        toast({
            title: 'Nombre requerido',
            description: 'Por favor, dale un nombre a tu plantilla.',
            variant: 'destructive',
        });
        return;
    }
    setTemplateName(tempTemplateName);
    setIsEditNameModalOpen(false);
    if(isInitialNameModalOpen){
        setIsInitialNameModalOpen(false);
        handlePublish()
    } else {
        handlePublish();
    }
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
        setCanvasContent(prev => prev.map(block => {
          if (block.id === resizingWrapperId && block.type === 'wrapper') {
            return {
              ...block,
              payload: { ...block.payload, height: Math.max(50, newHeight) } // min height 50
            };
          }
          return block;
        }), false);
      }
    }
  }, [isResizing, resizingWrapperId, setCanvasContent]);
  
  const handleMouseUpResize = useCallback(() => {
    if (isResizing) {
        setIsResizing(false);
        setResizingWrapperId(null);
        // Record history on mouse up
        setCanvasContent(prev => [...prev], true);
    }
  }, [isResizing, setCanvasContent]);
  
  const handleOpenCopyModal = (emoji: string) => {
    setIsCopySuccessModalOpen(true);
  };

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
    
    // Set background color first
    if (background) {
      const { type, color1, color2, direction } = background;
      if (type === 'solid') {
        style.backgroundColor = color1;
      } else if (type === 'gradient') {
        if (direction === 'radial') {
          style.backgroundImage = `radial-gradient(${color1}, ${color2})`;
        } else {
          const angle = direction === 'horizontal' ? 'to right' : 'to bottom';
          style.backgroundImage = `linear-gradient(${angle}, ${color1}, ${color2})`;
        }
      }
    }
    
    // Override with background image if it exists
    if (backgroundImage && backgroundImage.url) {
      style.backgroundImage = `url(${backgroundImage.url})`,
      style.backgroundSize = backgroundImage.fit === 'auto' ? `${backgroundImage.zoom}%` : backgroundImage.fit,
      style.backgroundPosition = `${backgroundImage.positionX}% ${backgroundImage.positionY}%`,
      style.backgroundRepeat = 'no-repeat'
    }
    
    return style;
  };
  
  const handleOpenBgImageModal = useCallback(() => {
    if (selectedElement?.type === 'wrapper') {
      setIsBgImageModalOpen(true);
    }
  }, [selectedElement]);
  

  const handleApplyBackgroundImage = useCallback((newState?: WrapperStyles['backgroundImage']) => {
      if (selectedElement?.type !== 'wrapper') return;
      const wrapperId = selectedElement.wrapperId;

      setCanvasContent(prev => prev.map(row => {
          if (row.id === wrapperId && row.type === 'wrapper') {
              const currentStyles = row.payload.styles || {};
              const newPayload = { ...row.payload, styles: { ...currentStyles, backgroundImage: newState } };
              return { ...row, payload: newPayload };
          }
          return row;
      }), true);
      setIsBgImageModalOpen(false);
  }, [selectedElement, setCanvasContent]);

  const WrapperComponent = React.memo(({ block, index }: { block: WrapperBlock, index: number }) => {
      const wrapperRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
          wrapperRefs.current[block.id] = wrapperRef.current;
      }, [block.id]);
      
      const handleWrapperClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.interactive-primitive')) return;

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
              {block.payload.blocks.map((b, bIndex) => {
                  const isSelected = selectedElement?.type === 'wrapper-primitive' && selectedElement.primitiveId === b.id;
                  
                  const commonStyles: React.CSSProperties = {
                       left: `${b.payload.x}%`,
                       top: `${b.payload.y}%`,
                       transform: `translate(-50%, -50%) scale(${b.payload.scale}) rotate(${b.payload.rotate}deg)`,
                       zIndex: bIndex,
                  };
                  
                  if (b.type === 'emoji-interactive') {
                    return (
                        <div
                          key={b.id}
                          className={cn(
                            "interactive-primitive absolute text-4xl cursor-pointer select-none", 
                            isSelected ? "ring-2 ring-accent z-10 p-2" : ""
                          )}
                          style={{
                             ...commonStyles,
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
                  } else if (b.type === 'heading-interactive') {
                    const headingBlock = b as InteractiveHeadingBlock;
                    const style = getHeadingStyle(headingBlock);
                    
                    return (
                        <div
                          key={b.id}
                          className={cn(
                            "interactive-primitive absolute cursor-pointer select-none",
                            isSelected ? "ring-2 ring-accent z-10" : ""
                          )}
                          style={commonStyles}
                           onClick={(e) => {
                            e.stopPropagation();
                            setSelectedElement({ type: 'wrapper-primitive', primitiveId: b.id, wrapperId: block.id });
                          }}
                        >
                            <div style={{ textAlign: 'center', display: 'inline-block', whiteSpace: 'nowrap' }}>
                                <span style={style}>
                                  {headingBlock.payload.text}
                                </span>
                            </div>
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
                          "flex-grow p-2 border-2 border-dashed min-h-[100px] flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors min-w-0 group/column",
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

const LayerPanel = () => {
    const { toast } = useToast();
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
    const [tempName, setTempName] = useState('');

    const selectedWrapper = canvasContent.find(
      (block): block is WrapperBlock =>
        block.type === 'wrapper' &&
        ((selectedElement?.type === 'wrapper' && block.id === selectedElement.wrapperId) ||
          (selectedElement?.type === 'wrapper-primitive' && block.id === selectedElement.wrapperId))
    );

    const reorderLayers = (wrapperId: string, fromIndex: number, toIndex: number) => {
        if (!selectedWrapper || toIndex < 0 || toIndex >= selectedWrapper.payload.blocks.length) return;

        setCanvasContent(prev => prev.map(row => {
            if (row.id === wrapperId && row.type === 'wrapper') {
                const newBlocks = Array.from(row.payload.blocks);
                const [movedItem] = newBlocks.splice(fromIndex, 1);
                newBlocks.splice(toIndex, 0, movedItem);
                return { ...row, payload: { ...row.payload, blocks: newBlocks } };
            }
            return row;
        }), true);
    };

    const handleRename = (blockId: string, newName: string) => {
        if (!selectedWrapper) return;
        
        if (newName.length > 20) {
            toast({
                title: "Límite de caracteres excedido",
                description: "El nombre no puede exceder los 20 caracteres.",
                variant: 'destructive',
            });
            return;
        }

        const trimmedName = newName.trim();
        if (trimmedName === '') {
            setEditingBlockId(null);
            return;
        }

        const isNameTaken = selectedWrapper.payload.blocks.some(b => b.id !== blockId && b.payload.name === trimmedName);

        if (isNameTaken) {
             toast({
                title: "¡Nombre en uso!",
                description: "Cada capa debe tener un identificador único en el lienzo. Por favor, elige otro nombre.",
                variant: 'destructive',
                style: { backgroundColor: '#F00000', color: 'white' }
            });
            return;
        }

        setCanvasContent(prev => prev.map(row => {
            if (row.id === selectedWrapper.id && row.type === 'wrapper') {
                const newBlocks = row.payload.blocks.map(block => {
                    if (block.id === blockId) {
                        return { ...block, payload: { ...block.payload, name: trimmedName } };
                    }
                    return block;
                });
                return { ...row, payload: { ...row.payload, blocks: newBlocks } };
            }
            return row;
        }), true);
        setEditingBlockId(null);
    }
    
    if (!selectedWrapper) {
        return (
            <div className="text-center text-muted-foreground p-4 text-sm">
                Selecciona un Contenedor Flexible en el lienzo para ver sus capas.
            </div>
        );
    }
    
    const blocksInVisualOrder = [...selectedWrapper.payload.blocks].reverse();

    return (
        <div className="p-2 space-y-2">
             <div className="px-2 pb-2 text-center">
                 <h3 className="font-semibold flex items-center justify-center gap-2"><Shapes className="text-primary"/>Contenedor Flexible</h3>
                 <p className="text-xs text-muted-foreground mt-1">Gestiona el posicionamiento de tus bloques de contenido, asigna niveles de prioridad para definir qué bloques al frente y cuáles quedan atrás</p>
             </div>
             <div className="space-y-1">
                {blocksInVisualOrder.map((block, visualIndex) => {
                    const originalIndex = selectedWrapper.payload.blocks.length - 1 - visualIndex;
                    const Icon = wrapperContentBlocks.find(b => b.id === block.type)?.icon || Smile;
                    const isSelected = selectedElement?.type === 'wrapper-primitive' && selectedElement.primitiveId === block.id;

                    return (
                        <div
                            key={block.id}
                            className={cn(
                              "group/layer-item relative overflow-hidden rounded-lg p-2 transition-colors cursor-pointer border border-transparent",
                              isSelected ? "bg-primary/20 border-primary/50" : "hover:bg-muted/50"
                            )}
                            onClick={() => {
                                if (isSelected) {
                                    setSelectedElement({ type: 'wrapper', wrapperId: selectedWrapper.id });
                                } else {
                                    setSelectedElement({ type: 'wrapper-primitive', primitiveId: block.id, wrapperId: selectedWrapper.id });
                                }
                            }}
                        >
                             <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-muted rounded-md">
                                    <Icon className="size-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                {editingBlockId === block.id ? (
                                    <Input 
                                        defaultValue={block.payload.name}
                                        onBlur={(e) => handleRename(block.id, e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleRename(block.id, e.currentTarget.value) }}
                                        autoFocus
                                        maxLength={20}
                                        className="h-7 text-sm flex-1"
                                    />
                                ) : (
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm font-medium truncate">{block.payload.name}</p>
                                    </div>
                                )}
                                </div>
                            </div>
                            
                            <div className={cn("pl-9 pt-2 mt-2 border-t border-border/10", isSelected ? "block" : "hidden group-hover/layer-item:block")}>
                                <div className="flex items-center justify-between gap-2">
                                     <p className="text-xs text-muted-foreground">Acciones</p>
                                     <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingBlockId(block.id) }}
                                            className="group/button size-7 flex items-center justify-center rounded-md bg-zinc-700/50 hover:bg-cyan-400/80 border border-cyan-400/30 hover:border-cyan-300 transition-all"
                                        >
                                            <Pencil className="size-4 text-cyan-300 group-hover/button:text-white transition-colors"/>
                                        </button>
                                        <div className="flex flex-col gap-0.5">
                                            <button 
                                                onClick={(e) => {e.stopPropagation(); reorderLayers(selectedWrapper.id, originalIndex, originalIndex + 1)}} disabled={originalIndex === selectedWrapper.payload.blocks.length - 1}
                                                className="group/button size-6 flex items-center justify-center rounded-md bg-zinc-700/50 hover:bg-green-400/80 border border-green-400/30 hover:border-green-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ChevronUp className="size-4 text-green-300 group-hover/button:text-white transition-colors"/>
                                            </button>
                                            <button 
                                                onClick={(e) => {e.stopPropagation(); reorderLayers(selectedWrapper.id, originalIndex, originalIndex - 1)}} disabled={originalIndex === 0}
                                                className="group/button size-6 flex items-center justify-center rounded-md bg-zinc-700/50 hover:bg-green-400/80 border border-green-400/30 hover:border-green-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ChevronDown className="size-4 text-green-300 group-hover/button:text-white transition-colors"/>
                                            </button>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
             </div>
        </div>
    );
};

  if (isLoading) {
      return <Preloader />
  }

  return (
    <div className="flex h-screen max-h-screen bg-transparent text-foreground overflow-hidden">
        <LoadingModal isOpen={!!loadingAction} variant={loadingAction as any} />
      <aside className="w-40 border-r border-r-black/10 dark:border-border/20 flex flex-col bg-card/5">
        <header className="flex items-center justify-between p-4 border-b bg-card/5 border-border/20 backdrop-blur-sm h-[61px] z-10 shrink-0">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-lg font-semibold truncate flex-1">{templateName}</span>
              <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => setIsEditNameModalOpen(true)}>
                <Pencil className="size-4" />
              </Button>
          </div>
        </header>
        <div className="p-2 space-y-2 flex-1 flex flex-col">
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
                className="group bg-card/5 border-black/20 dark:border-border/20 flex flex-col items-center justify-center p-4 aspect-square cursor-pointer transition-all hover:bg-primary/10 hover:border-black/50 dark:hover:border-primary/50 hover:shadow-lg"
              >
                <block.icon className="size-8 text-[#00B0F0] transition-colors" />
                <span className="text-sm font-semibold text-center text-foreground/80 mt-2">{block.name}</span>
                 {block.id === 'columns' && <span className="text-xs font-medium text-center text-muted-foreground">1 - 4</span>}
              </Card>
            ))}
            <div className="mt-auto pb-2 space-y-2">
                <div className="relative w-[calc(100%-1rem)] mx-auto h-[3px] my-2 overflow-hidden bg-muted/10 rounded-full">
                    <div className="tech-scanner" />
                </div>
                <button
                  onClick={() => setIsConfirmExitModalOpen(true)}
                  className="group relative inline-flex w-full flex-col items-center justify-center overflow-hidden rounded-lg p-3 text-sm font-semibold text-white transition-all duration-300 ai-core-button"
                >
                  <div className="ai-core-border-animation"></div>
                  <div className="ai-core"></div>
                  <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
                      <LayoutDashboard className="size-7" />
                      <span className="mt-1 text-xs font-bold text-center">Regresar al Menú Principal</span>
                  </div>
              </button>
            </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between p-2 border-b bg-card/5 border-border/20 backdrop-blur-sm h-[61px] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleUndo} disabled={historyIndex === 0}><Undo/></Button>
            <Button variant="ghost" size="icon" onClick={handleRedo} disabled={historyIndex === history.length - 1}><Redo/></Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-black/10 dark:bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                <Cloud className="size-4 text-green-400"/>
                <span>{lastSaved ? `Guardado a las ${format(lastSaved, 'HH:mm')}` : 'Sin guardar'}</span>
            </div>
            <TooltipProvider>
              <div className="flex items-center gap-2 p-1 bg-card/10 rounded-lg border border-border/20">
                  <Tooltip>
                      <TooltipTrigger asChild><Button variant={viewport === 'desktop' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewport('desktop')}><Laptop/></Button></TooltipTrigger>
                      <TooltipContent>
                          <p>Mira cómo se ve en <span className="font-bold">Escritorio</span></p>
                      </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                      <TooltipTrigger asChild><Button variant={viewport === 'tablet' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewport('tablet')}><Tablet/></Button></TooltipTrigger>
                      <TooltipContent>
                          <p>Comprueba la vista para <span className="font-bold">Tabletas</span></p>
                      </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                      <TooltipTrigger asChild><Button variant={viewport === 'mobile' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewport('mobile')}><Smartphone/></Button></TooltipTrigger>
                      <TooltipContent>
                          <p>Comprueba la vista para <span className="font-bold">Móvil</span></p>
                      </TooltipContent>
                  </Tooltip>
              </div>
            </TooltipProvider>
          </div>
           <div className="flex items-center gap-4">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => { setIsFileManagerOpen(true); }}>
                                <FileIcon />
                           </Button></TooltipTrigger>
                        <TooltipContent>
                            <p>Abrir Gestor de Archivos</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <ThemeToggle />
                <Button 
                    onClick={handlePublish}
                    disabled={isSaving}
                    className="group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-md bg-gradient-to-r from-[#AD00EC] to-[#1700E6] px-6 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_theme(colors.purple.500/50%)]"
                >
                    <div className="absolute -inset-0.5 -z-10 animate-spin-slow rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    {isSaving ? <RefreshCw className="mr-2 animate-spin"/> : <Rocket className="mr-2"/>}
                    {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
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
        <Tabs defaultValue="style" className="w-full flex flex-col h-full">
            <header className="h-[61px] border-b border-border/20 flex-shrink-0 p-2 flex items-center">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="style"><PaletteIcon className="mr-2"/>Estilo</TabsTrigger>
                    <TabsTrigger value="layers"><Layers className="mr-2"/>Capas</TabsTrigger>
                </TabsList>
            </header>
            <ScrollArea className="flex-1 custom-scrollbar">
                <TabsContent value="style">
                    <div className="p-4 space-y-6">
                        <StyleEditorHeader />
                        { (selectedElement?.type === 'column') && (
                        <>
                        <BackgroundEditor 
                            selectedElement={selectedElement} 
                            canvasContent={canvasContent} 
                            setCanvasContent={setCanvasContent}
                            onOpenImageModal={handleOpenBgImageModal}
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
                            onOpenImageModal={handleOpenBgImageModal}
                        />
                        )}
                        { selectedElement?.type === 'primitive' && getSelectedBlockType(selectedElement, canvasContent) === 'button' && (
                            <ButtonEditor selectedElement={selectedElement} canvasContent={canvasContent} setCanvasContent={setCanvasContent} />
                        )}
                        { selectedElement?.type === 'primitive' && getSelectedBlockType(selectedElement, canvasContent) === 'heading' && (
                            <HeadingEditor selectedElement={selectedElement} canvasContent={canvasContent} setCanvasContent={setCanvasContent} />
                        )}
                         { selectedElement?.type === 'primitive' && getSelectedBlockType(selectedElement, canvasContent) === 'image' && (
                            <ImageEditor selectedElement={selectedElement} canvasContent={canvasContent} setCanvasContent={setCanvasContent} />
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
                        { selectedElement?.type === 'wrapper-primitive' && getSelectedBlockType(selectedElement, canvasContent) === 'heading-interactive' && (
                            <InteractiveHeadingEditor selectedElement={selectedElement} canvasContent={canvasContent} setCanvasContent={setCanvasContent} />
                        )}
                        { selectedElement?.type === 'primitive' && getSelectedBlockType(selectedElement, canvasContent) === 'separator' && (
                            <SeparatorEditor selectedElement={selectedElement} canvasContent={canvasContent} setCanvasContent={setCanvasContent} />
                        )}
                        { selectedElement?.type === 'primitive' && getSelectedBlockType(selectedElement, canvasContent) === 'youtube' && (
                            <YouTubeEditor selectedElement={selectedElement} canvasContent={canvasContent} setCanvasContent={setCanvasContent} />
                        )}
                        { selectedElement?.type === 'primitive' && getSelectedBlockType(selectedElement, canvasContent) === 'timer' && (
                            <TimerEditor selectedElement={selectedElement} canvasContent={canvasContent} setCanvasContent={setCanvasContent} onOpenCopyModal={handleOpenCopyModal} />
                        )}
                         { selectedElement?.type === 'primitive' && getSelectedBlockType(selectedElement, canvasContent) === 'rating' && (
                            <RatingEditor selectedElement={selectedElement} canvasContent={canvasContent} setCanvasContent={setCanvasContent} />
                        )}
                        
                        { !selectedElement && (
                            <div className="text-center text-muted-foreground p-4 text-sm">
                                Selecciona un elemento en el lienzo para ver sus opciones de estilo.
                            </div>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="layers">
                    <LayerPanel />
                </TabsContent>
            </ScrollArea>
        </Tabs>
      </aside>

      <BackgroundManagerModal
        open={isBgImageModalOpen}
        onOpenChange={setIsBgImageModalOpen}
        onApply={handleApplyBackgroundImage}
        initialValue={
            selectedElement?.type === 'wrapper'
            ? (canvasContent.find(r => r.id === selectedElement.wrapperId) as WrapperBlock | undefined)?.payload.styles.backgroundImage
            : undefined
        }
       />

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

      <Dialog open={isWrapperBlockSelectorOpen} onOpenChange={(open) => {
          if(!open) {
            setClickPosition(null);
            setActiveContainer(null);
          }
          setIsWrapperBlockSelectorOpen(open);
      }}>
        <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm">
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
              Cambia el nombre de tu plantilla para identificar fácilmente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={tempTemplateName}
              onChange={(e) => setTempTemplateName(e.target.value)}
              placeholder="Mi increíble plantilla"
              maxLength={20}
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
      
      <Dialog open={isCopySuccessModalOpen} onOpenChange={setIsCopySuccessModalOpen}>
        <DialogContent className="sm:max-w-sm bg-card/90 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-full border-4 border-green-500/30">
                <ClipboardCheck className="size-8 text-green-500" />
              </div>
              ¡Símbolo Copiado!
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              El emoji está listo para que lo pegues donde quieras.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="w-full" onClick={() => setIsCopySuccessModalOpen(false)}>
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isActionSelectorModalOpen} onOpenChange={(open) => {
          if(!open) {
            setIsActionSelectorModalOpen(false);
            setClickPosition(null);
            setActiveContainer(null);
          }
      }}>
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
      
       {/* Initial Name Modal */}
       <Dialog open={isInitialNameModalOpen} onOpenChange={setIsInitialNameModalOpen}>
        <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm">
          <DialogHeader>
             <div className="flex justify-center pb-4">
                <FileSignature className="size-12 text-primary" />
             </div>
            <DialogTitle className="text-center text-xl">¡Inicia tu Obra Maestra!</DialogTitle>
            <DialogDescription className="text-center">
              Dale un nombre a tu nueva plantilla para comenzar a dar vida a tus ideas.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={tempTemplateName}
              onChange={(e) => setTempTemplateName(e.target.value)}
              placeholder="Ej: Newsletter de Bienvenida"
              autoFocus
              maxLength={20}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTemplateName()}
            />
          </div>
          <DialogFooter className="sm:justify-between">
             <Button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="text-white bg-[#A11C00] hover:bg-[#F00000]"
            >
              Cancelar
            </Button>
            <Button 
                type="button" 
                onClick={() => {
                  handleSaveTemplateName();
                }}
                className="bg-primary text-primary-foreground hover:bg-[#00CB07] hover:text-white"
            >
              Guardar y Empezar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Exit Modal */}
       <Dialog open={isConfirmExitModalOpen} onOpenChange={setIsConfirmExitModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card/80 backdrop-blur-sm">
          <DialogHeader>
             <div className="flex justify-center pb-4">
                <AlertTriangle className="size-12 text-amber-400" />
             </div>
            <DialogTitle className="text-center text-xl">¿Estás seguro de que quieres abandonar el editor?</DialogTitle>
            <DialogDescription className="text-center">
                Los cambios no guardados se perderán en el vacío digital.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground bg-black/10 dark:bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                    <Cloud className="size-4 text-green-400"/>
                    <span>Último guardado a las {lastSaved ? format(lastSaved, 'HH:mm') : 'No se ha guardado'}</span>
                </div>
                 <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                      handlePublish();
                      toast({ title: "Progreso Guardado", description: "Tus últimos cambios están a salvo."});
                  }}
                  className="text-white bg-gradient-to-r from-primary to-accent hover:from-[#00CE07] hover:to-[#A6EE00] hover:text-white"
                >
                  Guardar ahora
                </Button>
            </div>
             <Button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-full text-lg py-6 bg-[#A11C00] text-white hover:bg-[#F00000]"
            >
              Si, salir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <FileManagerModal
        open={isFileManagerOpen}
        onOpenChange={setIsFileManagerOpen}
      />
    </div>
  );
}
