'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ServiceRequestStatus } from '@/types/service-intake';
import { STATUS_METADATA } from '@/types/service-intake';

interface ServiceRequestStatusBadgeProps {
  status: ServiceRequestStatus;
  className?: string;
}

export function ServiceRequestStatusBadge({
  status,
  className,
}: ServiceRequestStatusBadgeProps) {
  const metadata = STATUS_METADATA[status];

  return (
    <Badge
      variant="secondary"
      className={cn(
        metadata.bgColor,
        metadata.color,
        'font-medium',
        className
      )}
    >
      {metadata.label}
    </Badge>
  );
}
