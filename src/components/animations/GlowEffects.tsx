'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

// Animated rotating border gradient
interface AnimatedBorderProps {
  children: React.ReactNode;
  className?: string;
  borderWidth?: number;
  duration?: number;
  gradientColors?: string[];
}

export function AnimatedBorder({
  children,
  className,
  borderWidth = 2,
  duration = 3,
  gradientColors = ['hsl(262, 80%, 60%)', 'hsl(190, 80%, 50%)', 'hsl(320, 70%, 55%)', 'hsl(262, 80%, 60%)'],
}: AnimatedBorderProps) {
  return (
    <div className={cn('relative rounded-xl', className)} style={{ padding: borderWidth }}>
      {/* Rotating gradient */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `conic-gradient(from 0deg, ${gradientColors.join(', ')})`,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Blur layer for glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-50 blur-md"
        style={{
          background: `conic-gradient(from 0deg, ${gradientColors.join(', ')})`,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Content container */}
      <div className="relative bg-background rounded-xl h-full">{children}</div>
    </div>
  );
}

// Spotlight effect that follows cursor
interface SpotlightProps {
  children: React.ReactNode;
  className?: string;
  spotlightSize?: number;
  spotlightColor?: string;
}

export function Spotlight({
  children,
  className,
  spotlightSize = 400,
  spotlightColor = 'rgba(120, 80, 220, 0.15)',
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const spotlightX = useSpring(mouseX, springConfig);
  const spotlightY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onMouseMove={handleMouseMove}
    >
      {/* Spotlight */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: spotlightSize,
          height: spotlightSize,
          x: spotlightX,
          y: spotlightY,
          translateX: '-50%',
          translateY: '-50%',
          background: `radial-gradient(circle, ${spotlightColor} 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// Glow on hover card
interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
}

export function GlowCard({
  children,
  className,
  glowColor = 'hsl(262, 80%, 60%)',
  glowSize = 200,
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/50',
        'bg-card transition-colors duration-300',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ borderColor: 'hsl(var(--primary) / 0.5)' }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: glowSize,
          height: glowSize,
          left: position.x,
          top: position.y,
          translateX: '-50%',
          translateY: '-50%',
          background: `radial-gradient(circle, ${glowColor}30 0%, transparent 70%)`,
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// Beam/line animation
interface BeamProps {
  className?: string;
  duration?: number;
  delay?: number;
}

export function Beam({
  className,
  duration = 2,
  delay = 0,
}: BeamProps) {
  return (
    <motion.div
      className={cn('absolute h-[2px] w-full', className)}
      style={{
        background: 'linear-gradient(90deg, transparent, hsl(262, 80%, 60%), transparent)',
      }}
      initial={{ x: '-100%', opacity: 0 }}
      animate={{
        x: ['- 100%', '100%'],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

// Sparkle/particle effect
interface SparkleProps {
  className?: string;
  count?: number;
  color?: string;
}

export function Sparkles({
  className,
  count = 20,
  color = 'hsl(262, 80%, 70%)',
}: SparkleProps) {
  const [sparkles, setSparkles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    setSparkles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 2,
      }))
    );
  }, [count]);

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute rounded-full"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
            backgroundColor: color,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Pulse ring effect
interface PulseRingProps {
  className?: string;
  color?: string;
  size?: number;
  rings?: number;
}

export function PulseRing({
  className,
  color = 'hsl(262, 80%, 60%)',
  size = 100,
  rings = 3,
}: PulseRingProps) {
  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      {Array.from({ length: rings }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: color }}
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{
            duration: 2,
            delay: i * 0.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
      {/* Center dot */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size * 0.2,
          height: size * 0.2,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
