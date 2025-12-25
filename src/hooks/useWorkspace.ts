'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Workspace, WorkspaceMember, WorkspaceRole } from '@/lib/supabase/types';

// =============================================
// Types
// =============================================

export interface WorkspaceContextValue {
  workspace: Workspace | null;
  workspaces: Workspace[];
  role: WorkspaceRole | null;
  isLoading: boolean;
  switchWorkspace: (workspaceId: string) => void;
}

// =============================================
// Context
// =============================================

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

// =============================================
// Hook to access workspace context
// =============================================

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

// =============================================
// Fetch user's workspaces
// =============================================

export function useWorkspaces() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get all workspaces where user is a member
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          workspace_id,
          role,
          workspaces (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Extract workspaces from the joined data
      return (data || []).map((m: { workspaces: Workspace }) => m.workspaces);
    },
  });
}

// =============================================
// Fetch single workspace
// =============================================

export function useWorkspaceById(workspaceId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;

      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();

      if (error) throw error;
      return data as Workspace;
    },
    enabled: !!workspaceId,
  });
}

// =============================================
// Get user's role in workspace
// =============================================

export function useWorkspaceRole(workspaceId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['workspace-role', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data?.role as WorkspaceRole;
    },
    enabled: !!workspaceId,
  });
}

// =============================================
// Create workspace
// =============================================

export function useCreateWorkspace() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate slug from name
      const baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);

      // Create workspace
      const { data: workspace, error: wsError } = await supabase
        .from('workspaces')
        .insert({
          name,
          slug: `${baseSlug}-${Date.now()}`,
          owner_id: user.id,
        })
        .select()
        .single();

      if (wsError) throw wsError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'owner',
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      return workspace as Workspace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace created');
    },
    onError: () => {
      toast.error('Failed to create workspace');
    },
  });
}

// =============================================
// Update workspace
// =============================================

export function useUpdateWorkspace() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      logo_url,
    }: {
      id: string;
      name?: string;
      logo_url?: string | null;
    }) => {
      const updates: Partial<Workspace> = {};
      if (name !== undefined) updates.name = name;
      if (logo_url !== undefined) updates.logo_url = logo_url;

      const { error } = await supabase
        .from('workspaces')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', variables.id] });
      toast.success('Workspace updated');
    },
    onError: () => {
      toast.error('Failed to update workspace');
    },
  });
}

// =============================================
// Delete workspace
// =============================================

export function useDeleteWorkspace() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace deleted');
    },
    onError: () => {
      toast.error('Failed to delete workspace');
    },
  });
}

// =============================================
// Permission helpers
// =============================================

export function canWrite(role: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'member';
}

export function canDelete(role: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

export function canManageMembers(role: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

export function canManageWorkspace(role: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

export function isOwner(role: WorkspaceRole | null): boolean {
  return role === 'owner';
}
