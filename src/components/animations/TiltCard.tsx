'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  tiltAmount?: number;
  glareEnable?: boolean;
  glareMaxOpacity?: number;
  scale?: number;
  perspective?: number;
}

export function TiltCard({
  children,
  className,
  containerClassName,
  tiltAmount = 15,
  glareEnable = true,
  glareMaxOpacity = 0.3,
  scale = 1.02,
  perspective = 1000,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltAmount, -tiltAmount]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltAmount, tiltAmount]), springConfig);

  // Glare position
  const glareX = useTransform(x, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(y, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    x.set(mouseX / rect.width);
    y.set(mouseY / rect.height);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cn('relative', containerClassName)}
      style={{ perspective }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className={cn(
          'relative rounded-xl overflow-hidden',
          'transition-shadow duration-300',
          isHovered && 'shadow-2xl shadow-primary/20',
          className
        )}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{ scale: isHovered ? scale : 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Content */}
        <div className="relative z-10">{children}</div>

        {/* Glare effect */}
        {glareEnable && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,${glareMaxOpacity}) 0%, transparent 50%)`,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

// Floating card with parallax layers
interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  floatAmount?: number;
  layers?: number;
}

export function FloatingCard({
  children,
  className,
  floatAmount = 10,
  layers = 3,
}: FloatingCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0.5, y: 0.5 });
  };

  return (
    <motion.div
      ref={ref}
      className={cn('relative', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      {/* Shadow layers for depth */}
      {Array.from({ length: layers }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-xl bg-black/10 dark:bg-black/20"
          style={{
            filter: `blur(${(i + 1) * 4}px)`,
            zIndex: -i - 1,
          }}
          animate={{
            x: (mousePosition.x - 0.5) * floatAmount * (i + 1),
            y: (mousePosition.y - 0.5) * floatAmount * (i + 1),
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        />
      ))}

      {/* Main content */}
      <motion.div
        className="relative"
        animate={{
          rotateX: (mousePosition.y - 0.5) * -10,
          rotateY: (mousePosition.x - 0.5) * 10,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Card with animated shine/highlight border
interface ShineCardProps {
  children: React.ReactNode;
  className?: string;
  borderWidth?: number;
}

export function ShineCard({
  children,
  className,
  borderWidth = 1,
}: ShineCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={ref}
      className={cn('relative rounded-xl', className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ padding: borderWidth }}
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `radial-gradient(${isHovered ? 300 : 0}px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary)), transparent 40%)`,
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Inner content */}
      <div className="relative bg-background rounded-xl h-full">
        {children}
      </div>
    </div>
  );
}
