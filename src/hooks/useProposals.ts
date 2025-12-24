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
