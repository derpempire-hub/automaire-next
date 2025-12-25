'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/supabase/types';

const STATUS_CONFIG: Record<Project['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  not_started: { label: 'Not Started', variant: 'outline', className: 'border-slate-400 text-slate-600' },
  in_progress: { label: 'In Progress', variant: 'default', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  review: { label: 'Review', variant: 'secondary', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  completed: { label: 'Completed', variant: 'default', className: 'bg-green-100 text-green-700 border-green-200' },
  on_hold: { label: 'On Hold', variant: 'destructive', className: 'bg-amber-100 text-amber-700 border-amber-200' },
};

interface ProjectStatusBadgeProps {
  status: Project['status'];
  className?: string;
}

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export const PROJECT_STATUS_OPTIONS: { value: Project['status']; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
];
