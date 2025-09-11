
"use client";

import React, { useRef, useEffect } from 'react';

export function SphereAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const dots: {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
    }[] = [];
    const dotCount = 400;
    const dotRadius = 2;
    const sphereRadius = Math.min(width, height) * 0.4;
    const fov = 250;
    
    let mouse = { x: 0, y: 0 };
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX - width / 2;
        mouse.y = e.clientY - height / 2;
    });

    for (let i = 0; i < dotCount; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      dots.push({
        x: sphereRadius * Math.sin(phi) * Math.cos(theta),
        y: sphereRadius * Math.sin(phi) * Math.sin(theta),
        z: sphereRadius * Math.cos(phi),
        vx: 0.05 * (Math.random() - 0.5),
        vy: 0.05 * (Math.random() - 0.5),
        vz: 0.05 * (Math.random() - 0.5),
      });
    }

    function draw() {
      ctx!.save();
      ctx!.clearRect(0, 0, width, height);
      ctx!.translate(width / 2, height / 2);
      
      const rotX = mouse.y * 0.0001;
      const rotY = mouse.x * 0.0001;

      dots.forEach(dot => {
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);

        const y1 = dot.y * cosX - dot.z * sinX;
        const z1 = dot.z * cosX + dot.y * sinX;
        const x1 = dot.x * cosY - z1 * sinY;
        const z2 = z1 * cosY + dot.x * sinY;
        
        const scale = fov / (fov + z2);

        ctx!.beginPath();
        ctx!.arc(x1 * scale, y1 * scale, dotRadius * scale, 0, 2 * Math.PI);
        const opacity = Math.max(0, (z2 + sphereRadius) / (2 * sphereRadius));
        ctx!.fillStyle = `rgba(173, 0, 236, ${opacity})`;
        ctx!.fill();
      });
      ctx!.restore();
    }

    function update() {
       dots.forEach(dot => {
          dot.x += dot.vx;
          dot.y += dot.vy;
          dot.z += dot.vz;
           
          const distSq = dot.x*dot.x + dot.y*dot.y + dot.z*dot.z;
           if (distSq > sphereRadius * sphereRadius) {
              const theta = Math.random() * 2 * Math.PI;
              const phi = Math.acos((Math.random() * 2) - 1);
              dot.x = sphereRadius * Math.sin(phi) * Math.cos(theta);
              dot.y = sphereRadius * Math.sin(phi) * Math.sin(theta);
              dot.z = sphereRadius * Math.cos(phi);
           }
       });
    }

    let animationFrameId: number;
    function animate() {
      update();
      draw();
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();
      
    return () => {
      window.removeEventListener('resize', () => {});
      document.removeEventListener('mousemove', () => {});
      cancelAnimationFrame(animationFrameId);
    };

  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30 dark:opacity-50" />;
}
