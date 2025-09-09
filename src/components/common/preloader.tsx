
"use client";

import React from 'react';
import { Atom } from 'lucide-react';

export function Preloader() {
  return (
    <div className="w-full h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <style>{`
        @keyframes rotate-back-and-forth {
          0% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        .animate-rotate-back-and-forth {
          animation: rotate-back-and-forth 4s linear infinite;
        }
      `}</style>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="relative flex flex-col items-center justify-center text-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-spin" style={{ animationDuration: '3s', animationTimingFunction: 'linear' }}></div>
          <div className="absolute inset-2 border-4 border-accent/20 rounded-full animate-spin" style={{ animationDuration: '2.5s', animationDirection: 'reverse', animationTimingFunction: 'ease-in-out' }}></div>
          <div className="absolute inset-4 flex items-center justify-center">
            <Atom className="text-primary size-12 animate-rotate-back-and-forth" />
          </div>
        </div>
        <p className="mt-4 text-lg font-semibold text-foreground tracking-widest uppercase">CARGANDO</p>
        <p className="text-sm text-muted-foreground">Inicializando interfaz...</p>
      </div>
    </div>
  );
}
