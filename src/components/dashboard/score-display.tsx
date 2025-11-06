
"use client";

import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { cn } from '@/lib/utils';

export const ScoreDisplay = ({ score }: { score: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));
  const circumference = 2 * Math.PI * 35; // radio de 35

  useEffect(() => {
    const controls = animate(count, score, {
      duration: 1.5,
      ease: "circOut",
    });
    return controls.stop;
  }, [score, count]);

  const getScoreGradient = () => {
    if (score >= 90) return 'url(#gradient-green)';
    if (score >= 70) return 'url(#gradient-yellow)';
    if (score >= 50) return 'url(#gradient-orange)';
    return 'url(#gradient-red)';
  };
  
  const getScoreColor = () => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  }

  const getScoreShadow = () => {
    if (score >= 90) return `drop-shadow(0 0 8px #22c55e)`;
    if (score >= 70) return `drop-shadow(0 0 8px #facc15)`;
    if (score >= 50) return `drop-shadow(0 0 8px #f97316)`;
    return `drop-shadow(0 0 8px #ef4444)`;
  }
  
  const getConfidenceLevel = () => {
    if (score >= 90) return { text: "Excelente", color: "text-green-300" };
    if (score >= 70) return { text: "Alto", color: "text-yellow-300" };
    if (score >= 50) return { text: "Medio", color: "text-orange-300" };
    return { text: "Bajo", color: "text-red-300" };
  };

  const confidence = getConfidenceLevel();
  const Particle = () => {
    const style = {
        '--size': `${Math.random() * 2 + 1}px`,
        '--x-start': `${Math.random() * 100}%`,
        '--x-end': `${(Math.random() - 0.5) * 200}px`,
        '--y-end': `${(Math.random() - 0.5) * 200}px`,
        '--duration': `${Math.random() * 5 + 4}s`,
        '--delay': `-${Math.random() * 9}s`,
        '--color-start': `hsl(${Math.random() * 60 + 180}, 100%, 70%)`,
        '--color-end': `hsl(${Math.random() * 60 + 240}, 100%, 70%)`,
    } as React.CSSProperties;
    return <div className="particle" style={style}></div>;
  };

  return (
    <div className="relative w-full p-3 rounded-xl bg-black/30 border border-cyan-400/20 flex flex-col items-center gap-2 overflow-hidden">
       <div className="absolute inset-0 z-0 opacity-40">
            {Array.from({ length: 25 }).map((_, i) => (
                <Particle key={i} />
            ))}
            <style>{`
              @keyframes particle-move { 
                0% { transform: translate(0, 0) scale(1); background-color: var(--color-start); opacity: 1; } 
                100% { transform: translate(var(--x-end), var(--y-end)) scale(0); background-color: var(--color-end); opacity: 0; } 
              }
              .particle {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  width: var(--size);
                  height: var(--size);
                  border-radius: 50%;
                  animation: particle-move var(--duration) var(--delay) linear infinite;
              }
            `}</style>
       </div>
       <h3 className="font-bold text-sm text-center text-cyan-300 z-10">Puntaje de Autenticidad</h3>
       <div className="relative w-28 h-28">
           <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80">
             <defs>
              <linearGradient id="gradient-green" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#4ade80"/><stop offset="100%" stopColor="#16a34a"/></linearGradient>
              <linearGradient id="gradient-yellow" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#fde047"/><stop offset="100%" stopColor="#facc15"/></linearGradient>
              <linearGradient id="gradient-orange" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#fb923c"/><stop offset="100%" stopColor="#f97316"/></linearGradient>
              <linearGradient id="gradient-red" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#f87171"/><stop offset="100%" stopColor="#ef4444"/></linearGradient>
            </defs>
            <circle cx="40" cy="40" r="35" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="transparent" />
            <motion.circle
                cx="40"
                cy="40"
                r="35"
                stroke={getScoreGradient()}
                strokeWidth="4"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 35}
                initial={{ strokeDashoffset: 2 * Math.PI * 35 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 35 - (score / 100) * (2 * Math.PI * 35) }}
                transition={{ duration: 1.5, ease: "circOut" }}
                transform="rotate(-90 40 40)"
            />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
             <motion.p className={cn("text-4xl font-bold", getScoreColor())} style={{ filter: getScoreShadow() }}>
                {rounded}
            </motion.p>
           </div>
       </div>
       <div className="z-10 text-center mt-2">
            <div className="relative w-32 h-px bg-cyan-400/20 my-1">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_4px_#00ADEC]"></div>
            </div>
            <p className={cn("text-sm font-semibold tracking-wider uppercase", confidence.color)}>{confidence.text}</p>
       </div>
    </div>
  )
}
