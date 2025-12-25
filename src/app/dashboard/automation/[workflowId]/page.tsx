'use client';

import { use } from 'react';
import { WorkflowDesigner } from '@/components/workflow-designer';

interface WorkflowEditorPageProps {
  params: Promise<{
    workflowId: string;
  }>;
}

export default function WorkflowEditorPage({ params }: WorkflowEditorPageProps) {
  const { workflowId } = use(params);

  return <WorkflowDesigner workflowId={workflowId} />;
}
