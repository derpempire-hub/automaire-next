'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Proposal } from '@/lib/supabase/types';

const STATUS_CONFIG: Record<Proposal['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  draft: { label: 'Draft', variant: 'outline', className: 'border-slate-400 text-slate-600' },
  sent: { label: 'Sent', variant: 'secondary', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  viewed: { label: 'Viewed', variant: 'secondary', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  accepted: { label: 'Accepted', variant: 'default', className: 'bg-green-100 text-green-700 border-green-200' },
  declined: { label: 'Declined', variant: 'destructive', className: 'bg-red-100 text-red-700 border-red-200' },
};

interface ProposalStatusBadgeProps {
  status: Proposal['status'];
  className?: string;
}

export function ProposalStatusBadge({ status, className }: ProposalStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export const PROPOSAL_STATUS_OPTIONS: { value: Proposal['status']; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
];
