'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type {
  WorkflowDesign,
  WorkflowStatus,
  CanvasState,
  WorkflowSubmission,
} from '@/lib/workflow/types';

// Re-export types for convenience
export type { WorkflowDesign, WorkflowStatus };

// Default canvas state for new workflows
const DEFAULT_CANVAS_STATE: CanvasState = {
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
};

/**
 * Fetch all workflows for the current user
 */
export function useWorkflows() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('workflows')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as WorkflowDesign[];
    },
  });
}

/**
 * Fetch a single workflow by ID
 */
export function useWorkflow(id: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['workflow', id],
    queryFn: async () => {
      if (!id) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('workflows')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as WorkflowDesign;
    },
    enabled: !!id,
  });
}

/**
 * Create a new workflow
 */
export function useCreateWorkflow() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflow: {
      name?: string;
      description?: string;
      trigger_type?: string;
    }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('workflows')
        .insert({
          name: workflow.name || 'Untitled Workflow',
          description: workflow.description || null,
          status: 'draft',
          trigger_type: workflow.trigger_type || 'lead_created',
          trigger_config: {},
          steps: [],
          canvas_state: DEFAULT_CANVAS_STATE,
          outputs: [],
          validation_errors: [],
          run_count: 0,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data as WorkflowDesign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow created');
    },
    onError: () => {
      toast.error('Failed to create workflow');
    },
  });
}

/**
 * Update an existing workflow
 */
export function useUpdateWorkflow() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<WorkflowDesign> & { id: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('workflows')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow', variables.id] });
    },
    onError: () => {
      toast.error('Failed to save workflow');
    },
  });
}

/**
 * Update workflow canvas state (for auto-save)
 */
export function useUpdateWorkflowCanvas() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      canvas_state,
      steps,
    }: {
      id: string;
      canvas_state: CanvasState;
      steps?: WorkflowDesign['steps'];
    }) => {
      const updateData: Record<string, unknown> = {
        canvas_state,
        updated_at: new Date().toISOString(),
      };

      if (steps !== undefined) {
        updateData.steps = steps;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('workflows')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Silently update cache without showing toast for auto-save
      queryClient.invalidateQueries({ queryKey: ['workflow', variables.id] });
    },
    onError: () => {
      toast.error('Failed to save changes');
    },
  });
}

/**
 * Update workflow status
 */
export function useUpdateWorkflowStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: WorkflowStatus;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('workflows')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow'] });
      toast.success('Workflow status updated');
    },
    onError: () => {
      toast.error('Failed to update workflow status');
    },
  });
}

/**
 * Submit workflow for implementation
 */
export function useSubmitWorkflow() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submission: WorkflowSubmission) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('workflows')
        .update({
          status: 'pending_review',
          submission_notes: submission.notes,
          priority: submission.priority,
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', submission.workflowId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow', variables.workflowId] });
      toast.success('Workflow submitted for implementation!');
    },
    onError: () => {
      toast.error('Failed to submit workflow');
    },
  });
}

/**
 * Delete a workflow
 */
export function useDeleteWorkflow() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow deleted');
    },
    onError: () => {
      toast.error('Failed to delete workflow');
    },
  });
}

/**
 * Duplicate a workflow
 */
export function useDuplicateWorkflow() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First, fetch the original workflow
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: original, error: fetchError } = await (supabase as any)
        .from('workflows')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Create a copy with new name and reset status
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('workflows')
        .insert({
          name: `${original.name} (Copy)`,
          description: original.description,
          status: 'draft',
          trigger_type: original.trigger_type,
          trigger_config: original.trigger_config,
          steps: original.steps,
          canvas_state: original.canvas_state,
          outputs: original.outputs,
          validation_errors: [],
          run_count: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as WorkflowDesign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow duplicated');
    },
    onError: () => {
      toast.error('Failed to duplicate workflow');
    },
  });
}
