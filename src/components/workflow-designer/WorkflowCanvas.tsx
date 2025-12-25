'use client';

import { useCallback, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  ReactFlowProvider,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nanoid } from 'nanoid';

import { TriggerNode, ActionNode, LogicNode, AINode, WebhookNode } from './nodes';
import { createDefaultNodeData, getNodeDefinition } from '@/lib/workflow/nodeRegistry';
import type { WorkflowNodeType, WorkflowNode, WorkflowEdge, CanvasState } from '@/lib/workflow/types';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';

// Define node types for ReactFlow
const nodeTypes: NodeTypes = {
  // Triggers - Schedule
  'trigger:schedule_daily': TriggerNode,
  'trigger:schedule_weekly': TriggerNode,
  'trigger:schedule_monthly': TriggerNode,
  // Triggers - Leads
  'trigger:lead_created': TriggerNode,
  'trigger:lead_status_changed': TriggerNode,
  'trigger:lead_follow_up_due': TriggerNode,
  // Triggers - Projects
  'trigger:project_created': TriggerNode,
  'trigger:project_status_changed': TriggerNode,
  'trigger:project_milestone_reached': TriggerNode,
  // Triggers - Proposals
  'trigger:proposal_sent': TriggerNode,
  'trigger:proposal_viewed': TriggerNode,
  'trigger:proposal_accepted': TriggerNode,
  'trigger:proposal_declined': TriggerNode,
  // Triggers - Tasks
  'trigger:task_created': TriggerNode,
  'trigger:task_completed': TriggerNode,
  'trigger:task_overdue': TriggerNode,
  // Triggers - Companies
  'trigger:company_created': TriggerNode,
  // Actions
  'action:send_email': ActionNode,
  'action:update_crm': ActionNode,
  'action:create_task': ActionNode,
  'action:http_request': ActionNode,
  'action:send_sms': ActionNode,
  'action:slack_message': ActionNode,
  // Logic
  'logic:condition': LogicNode,
  'logic:delay': LogicNode,
  'logic:loop': LogicNode,
  'logic:parallel': LogicNode,
  // AI
  'ai:gpt_processing': AINode,
  'ai:sentiment_analysis': AINode,
  'ai:data_enrichment': AINode,
  'ai:text_classification': AINode,
  // Integrations
  'webhook:custom': WebhookNode,
};

interface WorkflowCanvasProps {
  initialNodes?: WorkflowNode[];
  initialEdges?: WorkflowEdge[];
  onNodesChange?: (nodes: WorkflowNode[]) => void;
  onEdgesChange?: (edges: WorkflowEdge[]) => void;
  onNodeSelect?: (node: WorkflowNode | null) => void;
  onNodeUpdate?: (nodeId: string, data: Record<string, unknown>) => void;
  onSave?: (canvasState: CanvasState) => void;
  readOnly?: boolean;
  className?: string;
}

export interface WorkflowCanvasRef {
  updateNode: (nodeId: string, data: Record<string, unknown>) => void;
  getNodes: () => WorkflowNode[];
  getEdges: () => WorkflowEdge[];
}

const WorkflowCanvasInner = forwardRef<WorkflowCanvasRef, WorkflowCanvasProps>(function WorkflowCanvasInner({
  initialNodes = [],
  initialEdges = [],
  onNodesChange: onNodesChangeCallback,
  onEdgesChange: onEdgesChangeCallback,
  onNodeSelect,
  onNodeUpdate,
  onSave,
  readOnly = false,
  className,
}, ref) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes as unknown as Node[]);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges as unknown as Edge[]);

  // Handle node changes
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChangeInternal(changes);
      // Callback with updated nodes
      if (onNodesChangeCallback) {
        // We'll call this after state updates
      }
    },
    [onNodesChangeInternal, onNodesChangeCallback]
  );

  // Handle edge changes
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChangeInternal(changes);
      if (onEdgesChangeCallback) {
        // We'll call this after state updates
      }
    },
    [onEdgesChangeInternal, onEdgesChangeCallback]
  );

  // Handle new connections
  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        id: `edge-${nanoid(6)}`,
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: 'default',
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Handle node selection
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodeSelect) {
        onNodeSelect(node as unknown as WorkflowNode);
      }
    },
    [onNodeSelect]
  );

  // Handle pane click (deselect)
  const handlePaneClick = useCallback(() => {
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  // Handle node update from config panel
  const handleNodeUpdate = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
        )
      );
      // Notify parent of update
      if (onNodeUpdate) {
        onNodeUpdate(nodeId, data);
      }
    },
    [setNodes, onNodeUpdate]
  );

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    updateNode: handleNodeUpdate,
    getNodes: () => nodes as unknown as WorkflowNode[],
    getEdges: () => edges as unknown as WorkflowEdge[],
  }), [handleNodeUpdate, nodes, edges]);

  // Handle drop from node library
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/workflow-node') as WorkflowNodeType;
      if (!nodeType || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

      // Calculate position relative to the canvas
      const position = {
        x: event.clientX - reactFlowBounds.left - 90, // Center the node
        y: event.clientY - reactFlowBounds.top - 30,
      };

      const nodeData = createDefaultNodeData(nodeType);
      const newNode: Node = {
        id: `node-${nanoid(6)}`,
        type: nodeType,
        position,
        data: nodeData as unknown as Record<string, unknown>,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Memoize minimap node color function
  const minimapNodeColor = useCallback((node: Node) => {
    const type = node.type as WorkflowNodeType;
    const def = getNodeDefinition(type);
    if (!def) return '#888';

    // Extract color class and convert to actual color
    const colorMap: Record<string, string> = {
      'bg-emerald-500': '#10b981',
      'bg-blue-500': '#3b82f6',
      'bg-amber-500': '#f59e0b',
      'bg-purple-500': '#a855f7',
      'bg-pink-500': '#ec4899',
    };

    return colorMap[def.color] || '#888';
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        ref={reactFlowWrapper}
        className={cn('h-full w-full', className)}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={readOnly ? undefined : onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          onDrop={readOnly ? undefined : onDrop}
          onDragOver={readOnly ? undefined : onDragOver}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[16, 16]}
          connectionLineStyle={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 },
          }}
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={16}
            size={1}
            color="hsl(var(--muted-foreground) / 0.2)"
          />
          <Controls
            showZoom
            showFitView
            showInteractive={false}
            className="!bg-card !border !border-border !shadow-md"
          />
          <MiniMap
            nodeColor={minimapNodeColor}
            maskColor="hsl(var(--background) / 0.8)"
            className="!bg-card !border !border-border !shadow-md"
            pannable
            zoomable
          />
        </ReactFlow>
      </div>
    </TooltipProvider>
  );
});

// Wrap with ReactFlowProvider
export const WorkflowCanvas = forwardRef<WorkflowCanvasRef, WorkflowCanvasProps>(
  function WorkflowCanvas(props, ref) {
    return (
      <ReactFlowProvider>
        <WorkflowCanvasInner ref={ref} {...props} />
      </ReactFlowProvider>
    );
  }
);
