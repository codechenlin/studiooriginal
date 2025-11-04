
"use client";

import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { cn } from '@/lib/utils';

export const ScoreDisplay = ({ score }: { score: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));
  const circumference = 2 * Math.PI * 40; // radio de 40

  useEffect(() => {
    const controls = animate(count, score, {
      duration: 1.5,
      ease: "circOut",
    });
    return controls.stop;
  }, [score, count]);

  const getScoreColor = () => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };
  
  const getScoreBg = () => {
    if (score >= 90) return 'url(#gradient-green)';
    if (score >= 70) return 'url(#gradient-yellow)';
    if (score >= 50) return 'url(#gradient-orange)';
    return 'url(#gradient-red)';
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

  return (
    <div className="relative w-full p-4 rounded-2xl bg-black/30 border border-cyan-400/20 flex flex-col items-center gap-3 overflow-hidden">
       <div className="absolute inset-0 z-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_70%)]">
            {Array.from({ length: 20 }).map((_, i) => (
                <div 
                    key={i} 
                    className="absolute w-0.5 h-0.5 bg-cyan-300 rounded-full"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animation: `particle-move ${Math.random() * 5 + 3}s linear ${Math.random() * -8}s infinite`,
                    }}
                />
            ))}
            <style>{`@keyframes particle-move { 0% { transform: translate(0, 0); opacity: 1; } 100% { transform: translate(${(Math.random() - 0.5) * 150}px, ${(Math.random() - 0.5) * 150}px); opacity: 0; } }`}</style>
       </div>
       <h3 className="font-bold text-base text-center text-cyan-300 z-10">Puntaje de Autenticidad</h3>
       <div className="relative w-24 h-24">
           <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
             <defs>
              <linearGradient id="gradient-green" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#4ade80"/><stop offset="100%" stopColor="#16a34a"/></linearGradient>
              <linearGradient id="gradient-yellow" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#fde047"/><stop offset="100%" stopColor="#facc15"/></linearGradient>
              <linearGradient id="gradient-orange" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#fb923c"/><stop offset="100%" stopColor="#f97316"/></linearGradient>
              <linearGradient id="gradient-red" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#f87171"/><stop offset="100%" stopColor="#ef4444"/></linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="transparent" />
            <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke={getScoreBg()}
                strokeWidth="3"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
                transition={{ duration: 1.5, ease: "circOut" }}
                transform="rotate(-90 50 50)"
            />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
             <motion.p className={cn("text-3xl font-bold", getScoreColor())} style={{ filter: getScoreShadow() }}>
                {rounded}
            </motion.p>
            <p className={cn("text-[10px] font-semibold tracking-wider uppercase", confidence.color)}>{confidence.text}</p>
           </div>
       </div>
    </div>
  )
}
