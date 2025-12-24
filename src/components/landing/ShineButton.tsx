'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface ShineButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  showArrow?: boolean;
  size?: 'default' | 'lg';
}

export function ShineButton({ 
  children, 
  className, 
  onClick,
  showArrow = false,
  size = 'default'
}: ShineButtonProps) {
  const sizeClasses = {
    default: 'h-9 px-4 text-sm',
    lg: 'h-10 px-5 text-sm',
  };

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-lg font-medium text-primary-foreground',
        'bg-primary hover:bg-primary/90',
        'transition-colors duration-150',
        sizeClasses[size],
        className
      )}
    >
      <span className="relative z-10 flex items-center gap-1.5">
        {children}
        {showArrow && (
          <ArrowRight className="h-3.5 w-3.5" />
        )}
      </span>
    </motion.button>
  );
}