'use client';

import { Users } from 'lucide-react';
import { AnimatedEmptyState } from '@/components/ui/empty-state';

interface LeadsEmptyStateProps {
  onAdd: () => void;
}

export function LeadsEmptyState({ onAdd }: LeadsEmptyStateProps) {
  return (
    <AnimatedEmptyState
      icon={Users}
      iconColor="hsl(152, 80%, 45%)"
      title="No leads yet"
      description="Start building your sales pipeline by adding your first lead. Track prospects and convert them into customers."
      actionLabel="Add Your First Lead"
      onAction={onAdd}
    />
  );
}
