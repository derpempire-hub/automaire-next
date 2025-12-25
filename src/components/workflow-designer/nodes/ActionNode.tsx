'use client';

import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import {
  Mail,
  Database,
  CheckSquare,
  Globe,
  MessageSquare,
  Hash,
} from 'lucide-react';
import type { ActionType } from '@/lib/workflow/types';

const ACTION_ICONS: Record<ActionType, React.ReactNode> = {
  send_email: <Mail className="h-4 w-4" />,
  update_crm: <Database className="h-4 w-4" />,
  create_task: <CheckSquare className="h-4 w-4" />,
  http_request: <Globe className="h-4 w-4" />,
  send_sms: <MessageSquare className="h-4 w-4" />,
  slack_message: <Hash className="h-4 w-4" />,
};

function getActionType(nodeType: string): ActionType {
  const parts = nodeType.split(':');
  return (parts[1] as ActionType) || 'send_email';
}

export const ActionNode = memo(function ActionNode(props: NodeProps) {
  const actionType = getActionType(props.type as string);
  const icon = ACTION_ICONS[actionType] || <Globe className="h-4 w-4" />;

  return (
    <BaseNode
      {...props}
      icon={icon}
      color="bg-blue-500"
      handles={{ inputs: 1, outputs: 1 }}
    />
  );
});
