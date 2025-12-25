'use client';

import { useState } from 'react';
import { PipelineColumn } from './PipelineColumn';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { PipelineColumn as PipelineColumnType, PipelineStatus, LeadWithCompany } from '@/hooks/usePipeline';

interface PipelineKanbanProps {
  columns: PipelineColumnType[];
  onCardClick: (lead: LeadWithCompany) => void;
  onStatusChange: (leadId: string, status: PipelineStatus) => void;
  onAddLead?: (status: PipelineStatus) => void;
  collapseWonLost?: boolean;
}

export function PipelineKanban({
  columns,
  onCardClick,
  onStatusChange,
  onAddLead,
  collapseWonLost = true,
}: PipelineKanbanProps) {
  const [expandedColumns, setExpandedColumns] = useState<Set<PipelineStatus>>(new Set());

  const toggleColumn = (status: PipelineStatus) => {
    setExpandedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const shouldCollapse = (status: PipelineStatus) => {
    if (!collapseWonLost) return false;
    if (status !== 'won' && status !== 'lost') return false;
    return !expandedColumns.has(status);
  };

  return (
    <ScrollArea className="w-full whitespace-nowrap pb-4">
      <div className="flex gap-4 pb-4" style={{ minHeight: '500px' }}>
        {columns.map((column) => {
          const isCollapsed = shouldCollapse(column.status);

          return (
            <div
              key={column.status}
              onClick={isCollapsed ? () => toggleColumn(column.status) : undefined}
              className={isCollapsed ? 'cursor-pointer' : ''}
            >
              <PipelineColumn
                column={column}
                onCardClick={onCardClick}
                onStatusChange={onStatusChange}
                onAddLead={onAddLead}
                isCollapsed={isCollapsed}
              />
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
