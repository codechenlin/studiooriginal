
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
  Film
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


const renderBlock = (block: Block) => {
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

    case 'image':
      const { url, alt, styles, link } = payload;
      const imageElement = (
          <div style={{ width: `${styles.size}%`, margin: '0 auto' }}>
              <img src={url} alt={alt} style={{ width: '100%', borderRadius: `${styles.borderRadius}px`, border: `${styles.border.width}px solid ${styles.border.color1}` }} />
          </div>
      );
      if (link && link.url) {
          return <a href={link.url} target={link.openInNewTab ? '_blank' : '_self'}>{imageElement}</a>;
      }
      return imageElement;

    case 'separator':
      return <div style={{ height: `${payload.height}px`, width: '100%' }}><hr style={{borderTop: `${payload.line.thickness}px ${payload.line.style} ${payload.line.color}`}} /></div>;

    // Add other block types here as needed
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
                                        <div key={block.id}>{renderBlock(block)}</div>
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
