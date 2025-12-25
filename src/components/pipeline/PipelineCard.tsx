'use client';

import { Building2, Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LeadWithCompany, PipelineStatus } from '@/hooks/usePipeline';
import { LEAD_STATUSES } from '@/components/leads';

interface PipelineCardProps {
  lead: LeadWithCompany;
  onClick: () => void;
  onStatusChange: (status: PipelineStatus) => void;
}

export function PipelineCard({ lead, onClick, onStatusChange }: PipelineCardProps) {
  const daysInStage = Math.floor(
    (Date.now() - new Date(lead.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card
      className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {lead.first_name} {lead.last_name}
            </p>
            {lead.companies?.name && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Building2 className="h-3 w-3" />
                <span className="truncate">{lead.companies.name}</span>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LEAD_STATUSES.filter((s) => s.value !== lead.status).map((status) => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(status.value as PipelineStatus);
                  }}
                >
                  Move to {status.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {daysInStage === 0
                ? 'Today'
                : daysInStage === 1
                ? '1 day'
                : `${daysInStage} days`}
            </span>
          </div>
          {lead.email && (
            <span className="truncate max-w-[100px]">{lead.email}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
