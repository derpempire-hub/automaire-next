'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Lead } from '@/lib/supabase/types';

export type LeadStatus = Lead['status'];

const STATUS_CONFIG: Record<LeadStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  new: { label: 'New', variant: 'outline', className: 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
  contacted: { label: 'Contacted', variant: 'secondary', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' },
  qualified: { label: 'Qualified', variant: 'default', className: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' },
  proposal: { label: 'Proposal', variant: 'secondary', className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400' },
  won: { label: 'Won', variant: 'default', className: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' },
  lost: { label: 'Lost', variant: 'destructive', className: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' },
};

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export const LEAD_STATUSES: Array<{ value: LeadStatus; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];
