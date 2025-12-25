'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FlowingParticlesProps {
  className?: string;
  path: string;
  color?: string;
  particleCount?: number;
  duration?: number;
  size?: number;
  delay?: number;
}

export function FlowingParticles({
  className,
  path,
  color = 'hsl(262, 80%, 60%)',
  particleCount = 3,
  duration = 2,
  size = 6,
  delay = 0,
}: FlowingParticlesProps) {
  return (
    <svg className={cn('absolute inset-0 overflow-visible', className)}>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={path} fill="none" stroke="transparent" id="particle-path" />
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.circle
          key={i}
          r={size / 2}
          fill={color}
          filter="url(#glow)"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            offsetDistance: ['0%', '100%'],
          }}
          transition={{
            duration,
            delay: delay + (i * duration) / particleCount,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            offsetPath: `path('${path}')`,
          }}
        />
      ))}
    </svg>
  );
}

// Simplified version for straight lines
interface FlowingLineProps {
  className?: string;
  direction?: 'horizontal' | 'vertical';
  color?: string;
  duration?: number;
  reverse?: boolean;
}

export function FlowingLine({
  className,
  direction = 'horizontal',
  color = 'hsl(262, 80%, 60%)',
  duration = 2,
  reverse = false,
}: FlowingLineProps) {
  const isHorizontal = direction === 'horizontal';

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Track */}
      <div
        className={cn(
          'absolute',
          isHorizontal ? 'h-0.5 w-full top-1/2 -translate-y-1/2' : 'w-0.5 h-full left-1/2 -translate-x-1/2'
        )}
        style={{ backgroundColor: `${color}20` }}
      />

      {/* Flowing particle */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 8,
          height: 8,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
          ...(isHorizontal
            ? { top: '50%', translateY: '-50%' }
            : { left: '50%', translateX: '-50%' }),
        }}
        animate={
          isHorizontal
            ? { left: reverse ? ['100%', '-5%'] : ['-5%', '100%'] }
            : { top: reverse ? ['100%', '-5%'] : ['-5%', '100%'] }
        }
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
