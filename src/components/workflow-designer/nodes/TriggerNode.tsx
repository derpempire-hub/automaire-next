'use client';

import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import {
  UserPlus,
  UserCheck,
  Bell,
  Calendar,
  FolderPlus,
  FolderCheck,
  Flag,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  PlusSquare,
  CheckSquare,
  AlertTriangle,
  Building,
  Zap,
} from 'lucide-react';
import type { TriggerType } from '@/lib/workflow/types';

const TRIGGER_ICONS: Record<TriggerType, React.ReactNode> = {
  // Schedule
  schedule_daily: <Calendar className="h-4 w-4" />,
  schedule_weekly: <Calendar className="h-4 w-4" />,
  schedule_monthly: <Calendar className="h-4 w-4" />,
  // Leads
  lead_created: <UserPlus className="h-4 w-4" />,
  lead_status_changed: <UserCheck className="h-4 w-4" />,
  lead_follow_up_due: <Bell className="h-4 w-4" />,
  // Projects
  project_created: <FolderPlus className="h-4 w-4" />,
  project_status_changed: <FolderCheck className="h-4 w-4" />,
  project_milestone_reached: <Flag className="h-4 w-4" />,
  // Proposals
  proposal_sent: <Send className="h-4 w-4" />,
  proposal_viewed: <Eye className="h-4 w-4" />,
  proposal_accepted: <CheckCircle className="h-4 w-4" />,
  proposal_declined: <XCircle className="h-4 w-4" />,
  // Tasks
  task_created: <PlusSquare className="h-4 w-4" />,
  task_completed: <CheckSquare className="h-4 w-4" />,
  task_overdue: <AlertTriangle className="h-4 w-4" />,
  // Companies
  company_created: <Building className="h-4 w-4" />,
};

function getTriggerType(nodeType: string): TriggerType {
  const parts = nodeType.split(':');
  return (parts[1] as TriggerType) || 'lead_created';
}

export const TriggerNode = memo(function TriggerNode(props: NodeProps) {
  const triggerType = getTriggerType(props.type as string);
  const icon = TRIGGER_ICONS[triggerType] || <Zap className="h-4 w-4" />;

  return (
    <BaseNode
      {...props}
      icon={icon}
      color="bg-emerald-500"
      handles={{ inputs: 0, outputs: 1 }}
    />
  );
});
