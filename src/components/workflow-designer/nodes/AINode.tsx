'use client';

import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import {
  Brain,
  Heart,
  Sparkles,
  Tags,
} from 'lucide-react';
import type { AIStepType } from '@/lib/workflow/types';

const AI_ICONS: Record<AIStepType, React.ReactNode> = {
  gpt_processing: <Brain className="h-4 w-4" />,
  sentiment_analysis: <Heart className="h-4 w-4" />,
  data_enrichment: <Sparkles className="h-4 w-4" />,
  text_classification: <Tags className="h-4 w-4" />,
};

function getAIType(nodeType: string): AIStepType {
  const parts = nodeType.split(':');
  return (parts[1] as AIStepType) || 'gpt_processing';
}

export const AINode = memo(function AINode(props: NodeProps) {
  const aiType = getAIType(props.type as string);
  const icon = AI_ICONS[aiType] || <Brain className="h-4 w-4" />;

  return (
    <BaseNode
      {...props}
      icon={icon}
      color="bg-purple-500"
      handles={{ inputs: 1, outputs: 1 }}
    />
  );
});
