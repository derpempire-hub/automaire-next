'use client';

import { Plus, Sparkles, MessageCircle, UserCheck, FileText, Trophy, XCircle, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PipelineCard } from './PipelineCard';
import type { PipelineColumn as PipelineColumnType, PipelineStatus, LeadWithCompany } from '@/hooks/usePipeline';

const STATUS_CONFIG: Record<PipelineStatus, { icon: LucideIcon; color: string; bgColor: string }> = {
  new: { icon: Sparkles, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  contacted: { icon: MessageCircle, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  qualified: { icon: UserCheck, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  proposal: { icon: FileText, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  won: { icon: Trophy, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  lost: { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
};

interface PipelineColumnProps {
  column: PipelineColumnType;
  onCardClick: (lead: LeadWithCompany) => void;
  onStatusChange: (leadId: string, status: PipelineStatus) => void;
  onAddLead?: (status: PipelineStatus) => void;
  isCollapsed?: boolean;
}

export function PipelineColumn({
  column,
  onCardClick,
  onStatusChange,
  onAddLead,
  isCollapsed = false,
}: PipelineColumnProps) {
  const config = STATUS_CONFIG[column.status];
  const Icon = config.icon;

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg min-w-[80px]">
        <div className={cn('h-8 w-8 rounded-full flex items-center justify-center mb-2', config.bgColor)}>
          <Icon className={cn('h-4 w-4', config.color)} />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{column.label}</span>
        <Badge variant="secondary" className="mt-1">
          {column.count}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-muted/30 rounded-lg min-w-[280px] max-w-[320px]">
      {/* Column Header */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('h-6 w-6 rounded-full flex items-center justify-center', config.bgColor)}>
              <Icon className={cn('h-3.5 w-3.5', config.color)} />
            </div>
            <span className="font-medium text-sm">{column.label}</span>
            <Badge variant="secondary" className="text-xs">
              {column.count}
            </Badge>
          </div>
          {onAddLead && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onAddLead(column.status)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {column.leads.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No leads
            </div>
          ) : (
            column.leads.map((lead) => (
              <PipelineCard
                key={lead.id}
                lead={lead}
                onClick={() => onCardClick(lead)}
                onStatusChange={(status) => onStatusChange(lead.id, status)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
