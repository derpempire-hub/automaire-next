'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { WorkspaceInvitation, WorkspaceRole } from '@/lib/supabase/types';

// =============================================
// Fetch workspace invitations
// =============================================

export function useWorkspaceInvitations(workspaceId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['workspace-invitations', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];

      const { data, error } = await supabase
        .from('workspace_invitations')
        .select(`
          *,
          inviter:profiles!invited_by(*)
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WorkspaceInvitation[];
    },
    enabled: !!workspaceId,
  });
}

// =============================================
// Get invitation by token (for accepting)
// =============================================

export function useInvitationByToken(token: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['invitation', token],
    queryFn: async () => {
      if (!token) return null;

      const { data, error } = await supabase
        .from('workspace_invitations')
        .select(`
          *,
          workspace:workspaces(*),
          inviter:profiles!invited_by(*)
        `)
        .eq('token', token)
        .single();

      if (error) throw error;
      return data as WorkspaceInvitation;
    },
    enabled: !!token,
  });
}

// =============================================
// Send invitation
// =============================================

export function useSendInvitation() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      email,
      role,
    }: {
      workspaceId: string;
      email: string;
      role: Exclude<WorkspaceRole, 'owner'>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      // Check if there's already a pending invitation
      const { data: existingInvite } = await supabase
        .from('workspace_invitations')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('email', email.toLowerCase())
        .single();

      if (existingInvite) {
        throw new Error('An invitation has already been sent to this email');
      }

      // Generate token
      const token = crypto.randomUUID();

      // Create invitation (expires in 7 days)
      const { data, error } = await supabase
        .from('workspace_invitations')
        .insert({
          workspace_id: workspaceId,
          email: email.toLowerCase(),
          role,
          token,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // TODO: Send email with invitation link
      // For now, we'll just return the invitation
      // In production, you would use Supabase Edge Functions or an email service

      return data as WorkspaceInvitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations'] });
      toast.success('Invitation sent');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation');
    },
  });
}

// =============================================
// Accept invitation
// =============================================

export function useAcceptInvitation() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get invitation
      const { data: invitation, error: fetchError } = await supabase
        .from('workspace_invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (fetchError) throw new Error('Invitation not found');

      // Check if expired
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('This invitation has expired');
      }

      // Check if email matches
      if (invitation.email.toLowerCase() !== user.email?.toLowerCase()) {
        throw new Error('This invitation was sent to a different email address');
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', invitation.workspace_id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        // Already a member, just delete the invitation
        await supabase
          .from('workspace_invitations')
          .delete()
          .eq('id', invitation.id);

        return { workspaceId: invitation.workspace_id, alreadyMember: true };
      }

      // Add user as member
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: invitation.workspace_id,
          user_id: user.id,
          role: invitation.role,
          joined_at: new Date().toISOString(),
          invited_by: invitation.invited_by,
        });

      if (memberError) throw memberError;

      // Delete invitation
      await supabase
        .from('workspace_invitations')
        .delete()
        .eq('id', invitation.id);

      return { workspaceId: invitation.workspace_id, alreadyMember: false };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations'] });

      if (result.alreadyMember) {
        toast.info('You are already a member of this workspace');
      } else {
        toast.success('You have joined the workspace');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to accept invitation');
    },
  });
}

// =============================================
// Cancel invitation
// =============================================

export function useCancelInvitation() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('workspace_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations'] });
      toast.success('Invitation cancelled');
    },
    onError: () => {
      toast.error('Failed to cancel invitation');
    },
  });
}

// =============================================
// Resend invitation
// =============================================

export function useResendInvitation() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      // Update expiration date
      const { error } = await supabase
        .from('workspace_invitations')
        .update({
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', invitationId);

      if (error) throw error;

      // TODO: Resend email
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations'] });
      toast.success('Invitation resent');
    },
    onError: () => {
      toast.error('Failed to resend invitation');
    },
  });
}
