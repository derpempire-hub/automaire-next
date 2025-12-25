'use client';

import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import {
  GitBranch,
  Clock,
  Repeat,
  GitFork,
} from 'lucide-react';
import type { LogicType } from '@/lib/workflow/types';

const LOGIC_ICONS: Record<LogicType, React.ReactNode> = {
  condition: <GitBranch className="h-4 w-4" />,
  delay: <Clock className="h-4 w-4" />,
  loop: <Repeat className="h-4 w-4" />,
  parallel: <GitFork className="h-4 w-4" />,
};

function getLogicType(nodeType: string): LogicType {
  const parts = nodeType.split(':');
  return (parts[1] as LogicType) || 'condition';
}

function getHandles(logicType: LogicType): { inputs: number; outputs: number | 'conditional' } {
  if (logicType === 'condition') {
    return { inputs: 1, outputs: 'conditional' };
  }
  return { inputs: 1, outputs: 1 };
}

export const LogicNode = memo(function LogicNode(props: NodeProps) {
  const logicType = getLogicType(props.type as string);
  const icon = LOGIC_ICONS[logicType] || <GitBranch className="h-4 w-4" />;
  const handles = getHandles(logicType);

  return (
    <BaseNode
      {...props}
      icon={icon}
      color="bg-amber-500"
      handles={handles}
    />
  );
});
