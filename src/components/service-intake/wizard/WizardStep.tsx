'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WizardStepProps {
  title: string;
  description?: string;
  children: ReactNode;
  isActive?: boolean;
  direction?: 'forward' | 'backward';
  className?: string;
}

export function WizardStep({
  title,
  description,
  children,
  isActive = true,
  direction = 'forward',
  className,
}: WizardStepProps) {
  const variants = {
    enter: (dir: string) => ({
      x: dir === 'forward' ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: string) => ({
      x: dir === 'forward' ? -50 : 50,
      opacity: 0,
    }),
  };

  if (!isActive) return null;

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={title}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: 'spring', stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
        className={cn('w-full', className)}
      >
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Simple wrapper without animation for static content
export function WizardStepStatic({
  title,
  description,
  children,
  className,
}: Omit<WizardStepProps, 'isActive' | 'direction'>) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
