'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { WorkflowCanvas, WorkflowCanvasRef } from './WorkflowCanvas';
import { NodeLibraryPanel } from './panels/NodeLibraryPanel';
import { NodeConfigPanel } from './panels/NodeConfigPanel';
import { SubmitWorkflowDialog } from './dialogs/SubmitWorkflowDialog';
import { useWorkflowShortcuts } from './hooks/useWorkflowShortcuts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  Check,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  useWorkflow,
  useUpdateWorkflow,
  useUpdateWorkflowCanvas,
  useSubmitWorkflow,
} from '@/hooks/useWorkflows';
import type { WorkflowNode, WorkflowEdge, CanvasState } from '@/lib/workflow/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface WorkflowDesignerProps {
  workflowId: string;
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  pending_review: { label: 'Pending Review', variant: 'default' },
  in_implementation: { label: 'In Progress', variant: 'default' },
  active: { label: 'Active', variant: 'default' },
  paused: { label: 'Paused', variant: 'outline' },
};

export function WorkflowDesigner({ workflowId }: WorkflowDesignerProps) {
  const router = useRouter();
  const { data: workflow, isLoading } = useWorkflow(workflowId);
  const updateWorkflow = useUpdateWorkflow();
  const updateCanvas = useUpdateWorkflowCanvas();
  const submitWorkflow = useSubmitWorkflow();

  const [name, setName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  // Auto-save timer
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] } | null>(null);
  const canvasRef = useRef<WorkflowCanvasRef>(null);

  // Initialize name when workflow loads
  useEffect(() => {
    if (workflow?.name) {
      setName(workflow.name);
    }
  }, [workflow?.name]);

  // Handle name save
  const handleNameSave = useCallback(() => {
    if (name.trim() && name !== workflow?.name) {
      updateWorkflow.mutate({ id: workflowId, name: name.trim() });
    }
    setIsEditingName(false);
  }, [name, workflow?.name, workflowId, updateWorkflow]);

  // Handle canvas changes with auto-save
  const handleCanvasChange = useCallback(
    (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
      setHasUnsavedChanges(true);
      pendingChangesRef.current = { nodes, edges };

      // Debounced auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        if (pendingChangesRef.current) {
          const canvasState: CanvasState = {
            nodes: pendingChangesRef.current.nodes,
            edges: pendingChangesRef.current.edges,
            viewport: { x: 0, y: 0, zoom: 1 }, // TODO: Get actual viewport
          };

          updateCanvas.mutate(
            { id: workflowId, canvas_state: canvasState },
            {
              onSuccess: () => {
                setLastSaved(new Date());
                setHasUnsavedChanges(false);
                pendingChangesRef.current = null;
              },
            }
          );
        }
      }, 2000); // 2 second debounce
    },
    [workflowId, updateCanvas]
  );

  // Handle node selection
  const handleNodeSelect = useCallback((node: WorkflowNode | null) => {
    setSelectedNode(node);
  }, []);

  // Handle node config update
  const handleNodeUpdate = useCallback((nodeId: string, data: Record<string, unknown>) => {
    if (canvasRef.current) {
      canvasRef.current.updateNode(nodeId, data);
      // Update selected node if it's the one being edited
      setSelectedNode((prev) =>
        prev?.id === nodeId
          ? { ...prev, data: { ...prev.data, ...data } } as WorkflowNode
          : prev
      );
      setHasUnsavedChanges(true);
    }
  }, []);

  // Handle closing config panel
  const handleCloseConfigPanel = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Force save
  const handleForceSave = useCallback(() => {
    if (pendingChangesRef.current) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      const canvasState: CanvasState = {
        nodes: pendingChangesRef.current.nodes,
        edges: pendingChangesRef.current.edges,
        viewport: { x: 0, y: 0, zoom: 1 },
      };

      updateCanvas.mutate(
        { id: workflowId, canvas_state: canvasState },
        {
          onSuccess: () => {
            setLastSaved(new Date());
            setHasUnsavedChanges(false);
            pendingChangesRef.current = null;
          },
        }
      );
    }
  }, [workflowId, updateCanvas]);

  // Navigate back
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      handleForceSave();
    }
    router.push('/dashboard/automation');
  }, [router, hasUnsavedChanges, handleForceSave]);

  // Setup keyboard shortcuts
  useWorkflowShortcuts({
    onSave: handleForceSave,
    onEscape: handleCloseConfigPanel,
    // TODO: Wire up undo/redo when history is implemented
    onUndo: undefined,
    onRedo: undefined,
  });

  // Handle workflow submission
  const handleSubmit = useCallback(
    async (notes: string, priority: string) => {
      // First, save any pending changes
      if (pendingChangesRef.current) {
        const canvasState: CanvasState = {
          nodes: pendingChangesRef.current.nodes,
          edges: pendingChangesRef.current.edges,
          viewport: { x: 0, y: 0, zoom: 1 },
        };
        await updateCanvas.mutateAsync({ id: workflowId, canvas_state: canvasState });
      }

      // Then submit for review
      await submitWorkflow.mutateAsync({
        workflowId,
        notes,
        priority: priority as 'low' | 'normal' | 'high' | 'urgent',
      });
    },
    [workflowId, updateCanvas, submitWorkflow]
  );

  // Get current nodes/edges for submit dialog
  const getCurrentNodes = useCallback(() => {
    if (canvasRef.current) {
      return canvasRef.current.getNodes();
    }
    return (workflow?.canvas_state?.nodes as WorkflowNode[]) || [];
  }, [workflow?.canvas_state?.nodes]);

  const getCurrentEdges = useCallback(() => {
    if (canvasRef.current) {
      return canvasRef.current.getEdges();
    }
    return (workflow?.canvas_state?.edges as WorkflowEdge[]) || [];
  }, [workflow?.canvas_state?.edges]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center">
        <p className="text-muted-foreground mb-4">Workflow not found</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/automation')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workflows
        </Button>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[workflow.status] || STATUS_LABELS.draft;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>

            {isEditingName ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave();
                  if (e.key === 'Escape') {
                    setName(workflow.name);
                    setIsEditingName(false);
                  }
                }}
                className="h-8 w-64 text-lg font-semibold"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-lg font-semibold hover:bg-muted px-2 py-1 rounded transition-colors"
              >
                {workflow.name}
              </button>
            )}

            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Save status */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mr-4">
              {updateCanvas.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : hasUnsavedChanges ? (
                <span>Unsaved changes</span>
              ) : lastSaved ? (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  <span>Saved</span>
                </>
              ) : null}
            </div>

            {/* Toolbar buttons */}
            <div className="flex items-center gap-1 border-r pr-3 mr-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled>
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Cmd+Z)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled>
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Cmd+Shift+Z)</TooltipContent>
              </Tooltip>
            </div>

            <Button variant="outline" size="sm" onClick={handleForceSave} disabled={!hasUnsavedChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>

            <Button
              size="sm"
              disabled={workflow.status !== 'draft'}
              onClick={() => setSubmitDialogOpen(true)}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit for Review
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Node Library */}
          <div className="w-72 flex-shrink-0 border-r">
            <NodeLibraryPanel className="h-full" />
          </div>

          {/* Canvas */}
          <div className="flex-1">
            <WorkflowCanvas
              ref={canvasRef}
              initialNodes={(workflow.canvas_state?.nodes as WorkflowNode[]) || []}
              initialEdges={(workflow.canvas_state?.edges as WorkflowEdge[]) || []}
              onNodeSelect={handleNodeSelect}
              className="h-full"
            />
          </div>

          {/* Config Panel */}
          {selectedNode && (
            <div className="w-80 flex-shrink-0">
              <NodeConfigPanel
                node={selectedNode}
                onClose={handleCloseConfigPanel}
                onUpdate={handleNodeUpdate}
                className="h-full"
              />
            </div>
          )}
        </div>

        {/* Submit Dialog */}
        <SubmitWorkflowDialog
          open={submitDialogOpen}
          onOpenChange={setSubmitDialogOpen}
          nodes={getCurrentNodes()}
          edges={getCurrentEdges()}
          workflowName={workflow.name}
          onSubmit={handleSubmit}
        />
      </div>
    </TooltipProvider>
  );
}
