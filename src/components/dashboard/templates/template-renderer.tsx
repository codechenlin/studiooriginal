
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Timer, 
  Smile, 
  Square,
  Type,
  Youtube,
  Minus,
  Heading1,
  ImageIcon as ImageIconType,
  Star,
  ToggleLeft,
  Pentagon,
  Film,
  Wind,
  Layers,
  ChevronUp,
  ChevronDown,
  ArrowDown,
  ArrowRight,
  Sun,
  Circle,
  Triangle,
  Diamond,
  Heart,
  Hexagon,
  Octagon,
  Waves,
  Droplet,
  Leaf,
  Cloud
} from 'lucide-react';
import { Inter } from 'next/font/google';

// Define types based on what we see in create/page.tsx
// This is a simplified version for rendering only
type Block = {
  id: string;
  type: string;
  payload: any;
};

type Column = {
  id: string;
  width: number;
  blocks: Block[];
  styles?: any;
};

type CanvasBlock = {
  id: string;
  type: 'columns' | 'wrapper';
  payload: {
    columns?: Column[];
    blocks?: Block[];
    height?: number;
    styles?: any;
  };
};

const inter = Inter({ subsets: ['latin'] });


const PointedStar = ({ size, fill, stroke, strokeWidth }: { size: number; fill: string; stroke: string; strokeWidth: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
);

const UniversoStar = ({ size, fill, stroke, strokeWidth }: { size: number; fill: string; stroke: string; strokeWidth: number }) => (
     <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <path d="M12 0C11.34 6.03 6.03 11.34 0 12c6.03.66 11.34 5.97 12 12c.66-6.03 5.97-11.34 12-12C17.97 11.34 12.66 6.03 12 0z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
);

const ModernoStar = ({ size, fill, stroke, strokeWidth }: { size: number; fill: string; stroke: string; strokeWidth: number }) => (
    <svg width={size} height={size} viewBox="0 0 19 18" style={{ flexShrink: 0 }}>
        <path d="M9.5 14.25l-5.584 2.936 1.066-6.218L.465 6.564l6.243-.907L9.5 0l2.792 5.657 6.243.907-4.517 4.404 1.066 6.218z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
);


// Simplified Renderer Components
const renderFragment = (fragment: any) => {
    const style: React.CSSProperties = {
        fontWeight: fragment.styles.bold ? 'bold' : 'normal',
        fontStyle: fragment.styles.italic ? 'italic' : 'normal',
        textDecoration: [fragment.styles.underline && 'underline', fragment.styles.strikethrough && 'line-through'].filter(Boolean).join(' '),
        color: fragment.styles.color,
        backgroundColor: fragment.styles.highlight,
        fontFamily: fragment.styles.fontFamily,
    };

    const content = <span style={style}>{fragment.text}</span>;

    if (fragment.link?.url) {
        return (
            <a href={fragment.link.url} target={fragment.link.openInNewTab ? '_blank' : '_self'} rel="noopener noreferrer" style={{color: 'hsl(var(--primary))', textDecoration: 'underline'}}>
                {content}
            </a>
        );
    }
    return content;
};


const renderBlock = (block: Block, colCount: number = 1) => {
  const { type, payload } = block;

  const style: React.CSSProperties = {
    padding: '8px',
    textAlign: payload.styles?.textAlign || 'left',
    width: '100%',
  };

  switch (type) {
    case 'heading':
      return <h1 style={{ ...style, fontSize: `${payload.styles.fontSize}px`, fontWeight: payload.styles.fontWeight, fontFamily: payload.styles.fontFamily, color: payload.styles.color, backgroundColor: payload.styles.highlight, textDecoration: payload.styles.textDecoration }}>{payload.text}</h1>;
    
    case 'text':
      return <p style={{...style, fontSize: `${payload.globalStyles.fontSize}px`}}>{payload.fragments.map((frag: any) => <React.Fragment key={frag.id}>{renderFragment(frag)}</React.Fragment>)}</p>;
    
    case 'button':
      const buttonStyle: React.CSSProperties = {
          color: payload.styles.color,
          borderRadius: `${payload.styles.borderRadius}px`,
          padding: '10px 20px',
          border: 'none',
          cursor: 'pointer',
          textDecoration: 'none',
          display: 'inline-block',
          fontWeight: 'bold',
      };
      if (payload.styles.background?.type === 'solid') {
          buttonStyle.backgroundColor = payload.styles.background.color1;
      } else if (payload.styles.background?.type === 'gradient') {
          const { direction, color1, color2 } = payload.styles.background;
          buttonStyle.backgroundImage = `linear-gradient(${direction === 'horizontal' ? 'to right' : 'to bottom'}, ${color1}, ${color2})`;
      }
      return (
        <div style={{ textAlign: payload.textAlign, padding: '8px' }}>
          <a href={payload.link.url} target={payload.link.openInNewTab ? '_blank' : '_self'} style={buttonStyle}>
            {payload.text}
          </a>
        </div>
      );

    case 'image': {
        const { url, alt, styles, link } = payload;
        const { size, borderRadius, zoom, positionX, positionY, border } = styles;

        const outerWrapperStyle: React.CSSProperties = {
            width: `${size}%`,
            margin: 'auto',
            padding: '8px',
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
            height: 'auto',
            maxWidth: 'none',
            top: `${positionY}%`,
            left: `${positionX}%`,
            transform: `translate(-${positionX}%, -${positionY}%)`,
            objectFit: 'cover',
        };

        const imageElement = (
            <div style={outerWrapperStyle}>
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
    case 'separator': {
        const { height, style: separatorStyle, line, shapes, dots } = payload;
        if (separatorStyle === 'invisible') {
            return <div style={{ height: `${height}px` }} />;
        }
        if (separatorStyle === 'line') {
            return <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center' }}><div style={{ flex: 1, borderTop: `${line.thickness}px ${line.style} ${line.color}`, borderRadius: `${line.borderRadius}px` }} /></div>
        }
        if (separatorStyle === 'dots') {
            return (
                <div style={{ height: `${height}px`, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    {Array.from({ length: dots.count }).map((_, i) => (
                        <div key={i} style={{ width: `${dots.size}px`, height: `${dots.size}px`, borderRadius: '50%', backgroundColor: dots.color, boxShadow: `0 0 8px ${dots.color}` }} />
                    ))}
                </div>
            )
        }
        // Fallback for shapes or other styles
        return <div style={{ height: `${height}px` }}><hr /></div>;
    }
    
    case 'youtube': {
        const { videoId, styles, link, title, showTitle, duration, showDuration } = payload;
        const thumbnailUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400.png?text=YouTube+Video';
        const sizeVariant = colCount === 1 ? 'lg' : colCount === 2 ? 'md' : 'sm';
        const playButtonSize = { lg: '68px', md: '48px', sm: '36px' };
        const titleSize = { lg: '1.25rem', md: '1rem', sm: '0.875rem' };
        const durationSize = { lg: '0.875rem', md: '0.75rem', sm: '0.7rem' };
        return (
             <div style={{padding: '8px'}}>
                <a href={link.url} target={link.openInNewTab ? '_blank' : '_self'} style={{display: 'block', position: 'relative', borderRadius: `${styles.borderRadius}px`, overflow: 'hidden'}}>
                    <img src={thumbnailUrl} alt={title} style={{width: '100%', display: 'block'}}/>
                    <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: playButtonSize[sizeVariant], height: 'auto'}}>
                        <svg viewBox="0 0 68 48"><path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path><path d="M 45,24 27,14 27,34" fill="#fff"></path></svg>
                    </div>
                </a>
            </div>
        )
    }

    case 'timer':
        return <div className="p-4 text-center text-muted-foreground bg-muted/50 rounded-md">⏳ El contador dinámico se mostrará aquí en el correo final.</div>;

    case 'switch':
        return <div className="p-4 text-center text-muted-foreground bg-muted/50 rounded-md">🤫 El contenido secreto interactivo se mostrará aquí.</div>;

    case 'rating': {
        const { rating, styles } = payload;
        const StarComponent = {
            pointed: PointedStar,
            universo: UniversoStar,
            moderno: ModernoStar,
        }[styles.starStyle] || PointedStar;
        return (
            <div style={{ display: 'flex', justifyContent: styles.alignment, gap: `${styles.spacing}px`, padding: `${styles.paddingY}px 8px` }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <StarComponent key={i} size={styles.starSize} fill={i < rating ? styles.filled.color1 : styles.unfilled.color1} stroke={styles.border.color1} strokeWidth={styles.border.width} />
                ))}
            </div>
        )
    }
    case 'shapes': {
         const { shape, styles: shapeStyles } = payload;
         const { size, background, blur, shadow } = shapeStyles;
         const shapePaths: {[key: string]: string} = {
            square: "M10,10 H90 V90 H10 Z",
            circle: "M50,10 a40,40 0 1,1 0,80 a40,40 0 1,1 0,-80",
            triangle: "M10,90 L50,10 L90,90 Z",
            rhombus: "M50,5 L95,50 L50,95 L5,50 Z",
            pentagon: "M50,5 L95,38 L78,95 L22,95 L5,38 Z",
            hexagon: "M25,10 L75,10 L95,50 L75,90 L25,90 L5,50 Z",
            octagon: "M30,10 L70,10 L90,30 L90,70 L70,90 L30,90 L10,70 L10,30 Z",
            heart: "M50,30 A20,20 0 0,1 90,30 Q90,60 50,90 Q10,60 10,30 A20,20 0 0,1 50,30 Z",
            diamond: "M50,5 L95,50 L50,95 L5,50 Z",
            star: "M50,5 L61,35 L95,35 L68,55 L78,90 L50,70 L22,90 L32,55 L5,35 L39,35 Z"
        };
        return (
            <div style={{ width: `${size}%`, margin: 'auto' }}>
                <svg viewBox="0 0 100 100" style={{ filter: `blur(${blur}px)`}}>
                    <path d={shapePaths[shape]} fill={background.color1} />
                </svg>
            </div>
        )
    }
    case 'gif': {
         const { url, alt, styles: gifStyles } = payload;
        return (
            <div style={{ width: `${gifStyles.size}%`, margin: 'auto', padding: '8px' }}>
                <img src={url} alt={alt} style={{ width: '100%', borderRadius: `${gifStyles.borderRadius}px` }} />
            </div>
        )
    }

    default:
      return (
        <div className="p-2 border border-dashed rounded-md text-xs text-muted-foreground flex items-center gap-2">
          <Type /> Bloque de tipo '{type}' no implementado para vista previa.
        </div>
      );
  }
};

const getElementStyle = (styles: any = {}) => {
    const style: React.CSSProperties = {};
    const { background, borderRadius, backgroundImage } = styles;

    if (borderRadius) style.borderRadius = `${borderRadius}px`;

    if (background) {
        if (background.type === 'solid') {
            style.backgroundColor = background.color1;
        } else if (background.type === 'gradient') {
            const { direction, color1, color2 } = background;
            style.backgroundImage = `linear-gradient(${direction === 'horizontal' ? 'to right' : 'to bottom'}, ${color1}, ${color2})`;
        }
    }
    
    if (backgroundImage && backgroundImage.url) {
      style.backgroundImage = `url(${backgroundImage.url})`,
      style.backgroundSize = backgroundImage.fit === 'auto' ? `${backgroundImage.zoom}%` : backgroundImage.fit,
      style.backgroundPosition = `${backgroundImage.positionX}% ${backgroundImage.positionY}%`,
      style.backgroundRepeat = 'no-repeat'
    }

    return style;
};

export const TemplateRenderer = ({ content }: { content: any }) => {
    if (!content || !Array.isArray(content) || content.length === 0) {
        return (
            <div className="flex items-center justify-center h-full bg-muted/50 text-muted-foreground">
                <p>Esta plantilla está vacía.</p>
            </div>
        );
    }
    
    return (
        <div className={cn("bg-background", inter.className)}>
            {content.map((canvasBlock: CanvasBlock) => (
                <div key={canvasBlock.id}>
                    {canvasBlock.type === 'columns' && canvasBlock.payload.columns && (
                        <div style={{ display: 'flex', width: '100%' }}>
                            {canvasBlock.payload.columns.map((col) => (
                                <div key={col.id} style={{ flexBasis: `${col.width}%`, ...getElementStyle(col.styles) }}>
                                    {col.blocks.map(block => (
                                        <div key={block.id}>{renderBlock(block, canvasBlock.payload.columns?.length)}</div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                    {canvasBlock.type === 'wrapper' && canvasBlock.payload.blocks && (
                       <div className="relative" style={{ height: `${canvasBlock.payload.height}px`, ...getElementStyle(canvasBlock.payload.styles)}}>
                           {canvasBlock.payload.blocks.map(block => (
                               <div key={block.id} style={{ position: 'absolute', left: `${block.payload.x}%`, top: `${block.payload.y}%`, transform: `translate(-50%, -50%) scale(${block.payload.scale || 1}) rotate(${block.payload.rotate || 0}deg)` }}>
                                   {block.type === 'emoji-interactive' && <span style={{fontSize: '48px'}}>{block.payload.emoji}</span>}
                                   {block.type === 'heading-interactive' && <h1 style={{fontSize: '32px', fontWeight: 'bold', color: block.payload.styles.color, fontFamily: block.payload.styles.fontFamily}}>{block.payload.text}</h1>}
                               </div>
                           ))}
                       </div>
                    )}
                </div>
            ))}
        </div>
    );
};
