
"use client";

import React from 'react';
import { HexColorPicker } from "react-colorful";
import { cn } from '@/lib/utils';

type ColorPickerProps = {
  color: string;
  setColor: (color: string) => void;
  className?: string;
};

export function ColorPicker({ color, setColor, className }: ColorPickerProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
       <HexColorPicker color={color} onChange={setColor} className="!w-full" />
       <input 
         className="mt-2 w-full p-2 border border-input rounded-md bg-transparent"
         value={color}
         onChange={(e) => setColor(e.target.value)}
       />
    </div>
  );
}
