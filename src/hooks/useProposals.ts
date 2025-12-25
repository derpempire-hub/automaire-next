'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Proposal } from '@/lib/supabase/types';
import { toast } from 'sonner';

export type { Proposal };

export function useProposals() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*, companies(name), leads(first_name, last_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Proposal & { companies: { name: string } | null })[];
    },
  });
}

export function useProposal(id: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['proposal', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('proposals')
        .select('*, companies(name), leads(first_name, last_name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Proposal & { companies: { name: string } | null; leads: { first_name: string; last_name: string } | null };
    },
    enabled: !!id,
  });
}

export function useCreateProposal() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposal: {
      title: string;
      company_id?: string;
      lead_id?: string;
      line_items?: Array<{ description: string; quantity: number; unit_price: number }>;
      notes?: string;
      valid_until?: string;
      discount_percent?: number;
    }) => {
      const lineItems = proposal.line_items || [];
      const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const discount = proposal.discount_percent || 0;
      const total = subtotal * (1 - discount / 100);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('proposals')
        .insert({
          title: proposal.title,
          company_id: proposal.company_id,
          lead_id: proposal.lead_id,
          line_items: lineItems,
          notes: proposal.notes,
          valid_until: proposal.valid_until,
          discount_percent: proposal.discount_percent,
          subtotal,
          total,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal created successfully');
    },
    onError: () => {
      toast.error('Failed to create proposal');
    },
  });
}

export function useUpdateProposal() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      company_id?: string | null;
      lead_id?: string | null;
      line_items?: Array<{ description: string; quantity: number; unit_price: number }>;
      notes?: string | null;
      valid_until?: string | null;
      discount_percent?: number;
      status?: Proposal['status'];
    }) => {
      const lineItems = updates.line_items;
      const discount = updates.discount_percent ?? 0;

      let updateData: any = { ...updates, updated_at: new Date().toISOString() };

      if (lineItems) {
        const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        const total = subtotal * (1 - discount / 100);
        updateData = { ...updateData, line_items: lineItems, subtotal, total };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('proposals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal'] });
      toast.success('Proposal updated successfully');
    },
    onError: () => {
      toast.error('Failed to update proposal');
    },
  });
}

export function useUpdateProposalStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Proposal['status'] }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('proposals')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal'] });
      toast.success('Proposal status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });
}

export function useDeleteProposal() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal'] });
      toast.success('Proposal deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete proposal');
    },
  });
}
