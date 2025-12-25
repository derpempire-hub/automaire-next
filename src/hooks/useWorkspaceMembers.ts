'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { WorkspaceMember, WorkspaceRole, Profile } from '@/lib/supabase/types';

// =============================================
// Fetch workspace members
// =============================================

export function useWorkspaceMembers(workspaceId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];

      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('workspace_id', workspaceId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((m: WorkspaceMember & { profile: Profile }) => ({
        ...m,
        profile: m.profile,
      })) as WorkspaceMember[];
    },
    enabled: !!workspaceId,
  });
}

// =============================================
// Update member role
// =============================================

export function useUpdateMemberRole() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: WorkspaceRole;
    }) => {
      // Prevent changing to owner role
      if (role === 'owner') {
        throw new Error('Cannot assign owner role directly');
      }

      const { error } = await supabase
        .from('workspace_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      toast.success('Role updated');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    },
  });
}

// =============================================
// Remove member from workspace
// =============================================

export function useRemoveMember() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      workspaceId,
    }: {
      memberId: string;
      workspaceId: string;
    }) => {
      // Get member details to check if they're the owner
      const { data: member, error: fetchError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('id', memberId)
        .single();

      if (fetchError) throw fetchError;

      if (member.role === 'owner') {
        throw new Error('Cannot remove workspace owner');
      }

      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      toast.success('Member removed');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to remove member');
    },
  });
}

// =============================================
// Leave workspace (for non-owners)
// =============================================

export function useLeaveWorkspace() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user is the owner
      const { data: member, error: fetchError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      if (member.role === 'owner') {
        throw new Error('Owners cannot leave their workspace. Transfer ownership or delete the workspace.');
      }

      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      toast.success('Left workspace');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to leave workspace');
    },
  });
}

// =============================================
// Transfer ownership
// =============================================

export function useTransferOwnership() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      newOwnerId,
    }: {
      workspaceId: string;
      newOwnerId: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify current user is the owner
      const { data: currentMember, error: fetchError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (currentMember.role !== 'owner') {
        throw new Error('Only owners can transfer ownership');
      }

      // Update workspace owner
      const { error: wsError } = await supabase
        .from('workspaces')
        .update({ owner_id: newOwnerId })
        .eq('id', workspaceId);

      if (wsError) throw wsError;

      // Update new owner's role
      const { error: newOwnerError } = await supabase
        .from('workspace_members')
        .update({ role: 'owner' })
        .eq('workspace_id', workspaceId)
        .eq('user_id', newOwnerId);

      if (newOwnerError) throw newOwnerError;

      // Demote current owner to admin
      const { error: demoteError } = await supabase
        .from('workspace_members')
        .update({ role: 'admin' })
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id);

      if (demoteError) throw demoteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-role'] });
      toast.success('Ownership transferred');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to transfer ownership');
    },
  });
}
