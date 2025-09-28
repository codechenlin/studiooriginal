
"use client";

import React from 'react';
import { HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StorageIndicatorProps {
    used: number;
    total: number;
    gradientColors?: [string, string];
}

export function StorageIndicator({ used, total, gradientColors }: StorageIndicatorProps) {
    const percentage = total > 0 ? (used / total) * 100 : 0;
    const circumference = 2 * Math.PI * 45; // 45 is the radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const arcColor = gradientColors ? `url(#storageGradient)` : 'hsl(var(--primary))';
    const shadowColor = gradientColors ? gradientColors[1] : 'hsl(var(--primary))';

    return (
        <div className="w-64 h-24 rounded-lg bg-card/80 border border-border/50 backdrop-blur-sm p-3 flex items-center gap-3">
            <div className="relative size-20">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                     {gradientColors && (
                        <defs>
                            <linearGradient id="storageGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={gradientColors[0]} />
                                <stop offset="100%" stopColor={gradientColors[1]} />
                            </linearGradient>
                        </defs>
                    )}
                    {/* Background track */}
                    <circle
                        className="stroke-current text-muted/20"
                        strokeWidth="8"
                        cx="50"
                        cy="50"
                        r="45"
                        fill="transparent"
                    />
                    {/* Progress arc */}
                    <circle
                        className="stroke-current transition-all duration-1000 ease-out"
                        strokeWidth="8"
                        cx="50"
                        cy="50"
                        r="45"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                        style={{
                            filter: `drop-shadow(0 0 5px ${shadowColor})`,
                            stroke: arcColor
                        }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-foreground drop-shadow-lg hud-glitch" data-text={`${Math.round(percentage)}%`}>{Math.round(percentage)}%</span>
                </div>
            </div>
            <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                    <HardDrive className="size-4" />
                    ALMACENAMIENTO
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-bold text-foreground">{used.toFixed(1)} GB</span> usado de {total} GB
                </p>
            </div>
        </div>
    );
}
