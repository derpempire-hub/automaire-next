'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  to?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export function Logo({ to = '/', className, size = 'md', showText = true }: LogoProps) {
  const sizeConfig = {
    sm: { height: 24, width: 120 },
    md: { height: 32, width: 160 },
    lg: { height: 40, width: 200 },
    xl: { height: 48, width: 240 },
  };

  const iconOnlySize = {
    sm: { height: 24, width: 24 },
    md: { height: 32, width: 32 },
    lg: { height: 40, width: 40 },
    xl: { height: 48, width: 48 },
  };

  const config = showText ? sizeConfig[size] : iconOnlySize[size];

  const content = (
    <Image
      src="/logo.png"
      alt="Automaire"
      width={config.width}
      height={config.height}
      className={cn('object-contain', className)}
      priority
    />
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
