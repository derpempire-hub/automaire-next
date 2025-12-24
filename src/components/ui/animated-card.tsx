'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './card';
import { ReactNode, forwardRef } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverScale?: number;
  hoverY?: number;
  glowOnHover?: boolean;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, onClick, hoverScale = 1.02, hoverY = -4, glowOnHover = false }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{
          scale: hoverScale,
          y: hoverY,
        }}
        whileTap={onClick ? { scale: 0.98 } : undefined}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
        onClick={onClick}
        className={cn(
          onClick && 'cursor-pointer',
          glowOnHover && 'hover:shadow-lg hover:shadow-primary/10',
          className
        )}
      >
        <Card className={cn(
          'transition-colors duration-200',
          onClick && 'hover:border-primary/50'
        )}>
          {children}
        </Card>
      </motion.div>
    );
  }
);
AnimatedCard.displayName = 'AnimatedCard';

// Stat Card with animated number
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, onClick, className }: StatCardProps) {
  return (
    <AnimatedCard onClick={onClick} className={className} glowOnHover>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-2xl font-bold"
        >
          {typeof value === 'number' ? (
            <AnimatedNumber value={value} />
          ) : (
            value
          )}
        </motion.div>
        <div className="flex items-center gap-2 mt-1">
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <span className={cn(
              'text-xs font-medium',
              trend.isPositive ? 'text-green-500' : 'text-red-500'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
      </CardContent>
    </AnimatedCard>
  );
}

// Animated number counter
function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={value}
    >
      {value.toLocaleString()}
    </motion.span>
  );
}

// Glass card variant
interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-white/10 bg-white/5 backdrop-blur-md',
      'shadow-xl shadow-black/5',
      className
    )}>
      {children}
    </div>
  );
}

// Gradient border card
export function GradientCard({ children, className }: GlassCardProps) {
  return (
    <div className={cn('relative rounded-xl p-[1px] bg-gradient-to-br from-primary/50 via-primary/20 to-transparent', className)}>
      <div className="rounded-xl bg-background p-4">
        {children}
      </div>
    </div>
  );
}

export { CardHeader, CardContent, CardTitle, CardDescription, CardFooter };
