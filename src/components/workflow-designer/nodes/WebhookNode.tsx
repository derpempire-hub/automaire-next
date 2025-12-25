'use client';

import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { Webhook } from 'lucide-react';

export const WebhookNode = memo(function WebhookNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<Webhook className="h-4 w-4" />}
      color="bg-pink-500"
      handles={{ inputs: 1, outputs: 1 }}
    />
  );
});
