'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MeshGradientProps {
  className?: string;
  children?: React.ReactNode;
  intensity?: 'subtle' | 'medium' | 'vibrant';
  speed?: 'slow' | 'medium' | 'fast';
}

export function MeshGradient({
  className,
  children,
  intensity = 'medium',
  speed = 'medium',
}: MeshGradientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const intensityConfig = {
    subtle: { opacity: 0.3, blur: 100 },
    medium: { opacity: 0.5, blur: 80 },
    vibrant: { opacity: 0.7, blur: 60 },
  };

  const speedConfig = {
    slow: 25,
    medium: 15,
    fast: 8,
  };

  const config = intensityConfig[intensity];
  const duration = speedConfig[speed];

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary blob - Purple */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '50%',
            height: '50%',
            background: 'radial-gradient(circle, hsl(262, 80%, 60%) 0%, transparent 70%)',
            filter: `blur(${config.blur}px)`,
            opacity: config.opacity,
          }}
          animate={{
            x: ['0%', '50%', '20%', '60%', '0%'],
            y: ['0%', '30%', '60%', '20%', '0%'],
            scale: [1, 1.2, 0.9, 1.1, 1],
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Secondary blob - Cyan */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '45%',
            height: '45%',
            background: 'radial-gradient(circle, hsl(190, 80%, 50%) 0%, transparent 70%)',
            filter: `blur(${config.blur}px)`,
            opacity: config.opacity,
            right: 0,
          }}
          animate={{
            x: ['0%', '-40%', '-20%', '-50%', '0%'],
            y: ['20%', '50%', '10%', '40%', '20%'],
            scale: [1.1, 0.9, 1.2, 1, 1.1],
          }}
          transition={{
            duration: duration * 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Tertiary blob - Pink/Magenta */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '40%',
            height: '40%',
            background: 'radial-gradient(circle, hsl(320, 70%, 55%) 0%, transparent 70%)',
            filter: `blur(${config.blur}px)`,
            opacity: config.opacity * 0.7,
            bottom: 0,
          }}
          animate={{
            x: ['30%', '60%', '10%', '50%', '30%'],
            y: ['0%', '-30%', '-50%', '-20%', '0%'],
            scale: [0.9, 1.1, 1, 1.2, 0.9],
          }}
          transition={{
            duration: duration * 0.9,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Accent blob - Blue */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '35%',
            height: '35%',
            background: 'radial-gradient(circle, hsl(220, 70%, 55%) 0%, transparent 70%)',
            filter: `blur(${config.blur}px)`,
            opacity: config.opacity * 0.5,
            left: '50%',
            top: '50%',
          }}
          animate={{
            x: ['-50%', '-20%', '-70%', '-30%', '-50%'],
            y: ['-50%', '-20%', '-60%', '-80%', '-50%'],
            scale: [1, 1.3, 0.8, 1.1, 1],
          }}
          transition={{
            duration: duration * 1.1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Noise overlay for texture */}
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// Simpler animated gradient for smaller areas
export function GradientBlob({
  className,
  color = 'primary',
}: {
  className?: string;
  color?: 'primary' | 'secondary' | 'accent';
}) {
  const colors = {
    primary: 'hsl(262, 80%, 60%)',
    secondary: 'hsl(190, 80%, 50%)',
    accent: 'hsl(320, 70%, 55%)',
  };

  return (
    <motion.div
      className={cn('absolute rounded-full pointer-events-none', className)}
      style={{
        background: `radial-gradient(circle, ${colors[color]} 0%, transparent 70%)`,
        filter: 'blur(60px)',
        opacity: 0.4,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.4, 0.6, 0.4],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
