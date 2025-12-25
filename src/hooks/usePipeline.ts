'use client';

import { useMemo } from 'react';
import { useLeads, useUpdateLeadStatus } from './useLeads';
import type { Lead } from '@/lib/supabase/types';

export type LeadWithCompany = Lead & { companies: { name: string } | null };
export type PipelineStatus = Lead['status'];

export interface PipelineColumn {
  status: PipelineStatus;
  label: string;
  leads: LeadWithCompany[];
  count: number;
}

export function usePipelineData() {
  const { data: leads = [], isLoading, error } = useLeads();

  const columns = useMemo<PipelineColumn[]>(() => {
    const statusOrder: PipelineStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
    const statusLabels: Record<PipelineStatus, string> = {
      new: 'New',
      contacted: 'Contacted',
      qualified: 'Qualified',
      proposal: 'Proposal',
      won: 'Won',
      lost: 'Lost',
    };

    return statusOrder.map((status) => {
      const statusLeads = leads.filter((lead) => lead.status === status) as LeadWithCompany[];
      return {
        status,
        label: statusLabels[status],
        leads: statusLeads,
        count: statusLeads.length,
      };
    });
  }, [leads]);

  const metrics = useMemo(() => {
    const total = leads.length;
    const won = leads.filter((l) => l.status === 'won').length;
    const lost = leads.filter((l) => l.status === 'lost').length;
    const active = total - won - lost;
    const conversionRate = total > 0 ? Math.round((won / total) * 100) : 0;

    return { total, won, lost, active, conversionRate };
  }, [leads]);

  return { columns, metrics, isLoading, error };
}

export function useMoveLead() {
  return useUpdateLeadStatus();
}
