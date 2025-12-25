'use client';

import { memo, ReactNode } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { AlertCircle, Settings } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BaseNodeProps extends NodeProps {
  icon: ReactNode;
  color: string;
  handles: {
    inputs: number;
    outputs: number | 'conditional';
  };
  children?: ReactNode;
}

export const BaseNode = memo(function BaseNode({
  data,
  selected,
  icon,
  color,
  handles,
  children,
}: BaseNodeProps) {
  const nodeData = data as {
    label: string;
    description?: string;
    isConfigured: boolean;
    hasErrors: boolean;
    errors?: string[];
  };

  const hasErrors = nodeData.hasErrors;
  const isConfigured = nodeData.isConfigured;

  return (
    <div
      className={cn(
        'relative px-4 py-3 rounded-lg border-2 bg-card shadow-md min-w-[180px] max-w-[220px] transition-all',
        selected ? 'border-primary ring-2 ring-primary/20' : 'border-border',
        hasErrors && 'border-destructive',
        !isConfigured && 'border-dashed border-muted-foreground/50'
      )}
    >
      {/* Input Handle */}
      {handles.inputs > 0 && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-primary !border-2 !border-background !w-3 !h-3 !-top-1.5"
        />
      )}

      {/* Node Content */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'p-2 rounded-md flex items-center justify-center text-white',
            color
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{nodeData.label}</p>
          {nodeData.description && (
            <p className="text-xs text-muted-foreground truncate">
              {nodeData.description}
            </p>
          )}
        </div>
        {hasErrors ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <ul className="text-xs space-y-1">
                {nodeData.errors?.map((error, i) => (
                  <li key={i}>{error}</li>
                )) || <li>Configuration required</li>}
              </ul>
            </TooltipContent>
          </Tooltip>
        ) : !isConfigured ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Settings className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="right">
              Click to configure
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      {children}

      {/* Output Handles */}
      {handles.outputs === 'conditional' ? (
        <>
          {/* True branch */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            style={{ left: '30%' }}
            className="!bg-emerald-500 !border-2 !border-background !w-3 !h-3 !-bottom-1.5"
          />
          {/* False branch */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            style={{ left: '70%' }}
            className="!bg-red-500 !border-2 !border-background !w-3 !h-3 !-bottom-1.5"
          />
          {/* Labels */}
          <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-4 text-[10px] text-muted-foreground pointer-events-none">
            <span className="text-emerald-600 dark:text-emerald-400">Yes</span>
            <span className="text-red-600 dark:text-red-400">No</span>
          </div>
        </>
      ) : handles.outputs > 0 ? (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-primary !border-2 !border-background !w-3 !h-3 !-bottom-1.5"
        />
      ) : null}

      {/* Configuration indicator badge */}
      {!isConfigured && !hasErrors && (
        <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500 text-white shadow-sm">
          Configure
        </div>
      )}
    </div>
  );
});
