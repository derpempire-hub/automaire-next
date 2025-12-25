'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

type NodeType = 'trigger' | 'action' | 'logic' | 'ai';

interface GlowingNodeProps {
  type: NodeType;
  label: string;
  icon?: LucideIcon;
  className?: string;
  isActive?: boolean;
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
}

const NODE_COLORS: Record<NodeType, { bg: string; glow: string; text: string; icon: string }> = {
  trigger: {
    bg: 'bg-emerald-500/10',
    glow: 'hsl(152, 80%, 45%)',
    text: 'text-emerald-400',
    icon: 'text-emerald-400',
  },
  action: {
    bg: 'bg-blue-500/10',
    glow: 'hsl(210, 80%, 55%)',
    text: 'text-blue-400',
    icon: 'text-blue-400',
  },
  logic: {
    bg: 'bg-amber-500/10',
    glow: 'hsl(38, 80%, 50%)',
    text: 'text-amber-400',
    icon: 'text-amber-400',
  },
  ai: {
    bg: 'bg-violet-500/10',
    glow: 'hsl(262, 80%, 60%)',
    text: 'text-violet-400',
    icon: 'text-violet-400',
  },
};

const NODE_SIZES = {
  sm: { width: 120, height: 48, iconSize: 14, textSize: 'text-xs' },
  md: { width: 160, height: 56, iconSize: 18, textSize: 'text-sm' },
  lg: { width: 200, height: 64, iconSize: 22, textSize: 'text-base' },
};

export function GlowingNode({
  type,
  label,
  icon: Icon,
  className,
  isActive = true,
  delay = 0,
  size = 'md',
}: GlowingNodeProps) {
  const colors = NODE_COLORS[type];
  const dimensions = NODE_SIZES[size];
  const isLogic = type === 'logic';

  return (
    <motion.div
      className={cn('relative', className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {/* Glow effect */}
      {isActive && (
        <motion.div
          className={cn(
            'absolute inset-0 blur-lg',
            isLogic ? 'rotate-45' : 'rounded-lg'
          )}
          style={{
            backgroundColor: colors.glow,
            opacity: 0.3,
          }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Node body */}
      <motion.div
        className={cn(
          'relative flex items-center gap-2 px-4 border border-white/10',
          colors.bg,
          isLogic ? 'rotate-45' : 'rounded-lg'
        )}
        style={{
          width: isLogic ? dimensions.height : dimensions.width,
          height: isLogic ? dimensions.height : dimensions.height,
          boxShadow: isActive ? `0 0 20px ${colors.glow}40` : 'none',
        }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Content (counter-rotate for logic nodes) */}
        <div
          className={cn(
            'flex items-center gap-2 w-full justify-center',
            isLogic && '-rotate-45'
          )}
        >
          {Icon && (
            <Icon
              className={cn(colors.icon)}
              style={{ width: dimensions.iconSize, height: dimensions.iconSize }}
            />
          )}
          <span
            className={cn(
              'font-medium whitespace-nowrap',
              colors.text,
              dimensions.textSize
            )}
          >
            {label}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Simpler floating animation wrapper
interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
}

export function FloatingElement({
  children,
  className,
  duration = 3,
  distance = 8,
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-distance / 2, distance / 2, -distance / 2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}
