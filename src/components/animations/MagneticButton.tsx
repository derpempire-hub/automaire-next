'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

// Simple button with subtle hover glow - no magnetic movement
export function MagneticButton({
  children,
  className,
  onClick,
  disabled = false,
}: MagneticButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={cn(
        'relative inline-flex items-center justify-center',
        'px-6 py-3 rounded-lg font-medium',
        'bg-primary text-primary-foreground',
        'transition-all duration-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Subtle glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-primary/50 blur-xl -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.4 : 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

// Magnetic wrapper for any element - with very subtle effect
interface MagneticWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function MagneticWrapper({
  children,
  className,
}: MagneticWrapperProps) {
  return (
    <motion.div
      className={cn('inline-block', className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}
