'use client';

import { cn } from '@/lib/utils';

interface AuroraBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

// Simplified background - subtle grid only, no decorative gradients
export function AuroraBackground({ className, children }: AuroraBackgroundProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Subtle dot grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(hsl(var(--foreground) / 0.15) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
      {children}
    </div>
  );
}