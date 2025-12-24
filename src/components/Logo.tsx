'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  to?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ to = '/', className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const content = (
    <span className={cn('font-semibold tracking-tight', sizeClasses[size], className)}>
      Automaire
    </span>
  );

  if (to) {
    return (
      <Link href={to} className="flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
