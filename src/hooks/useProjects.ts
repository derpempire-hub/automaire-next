'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Project } from '@/lib/supabase/types';
import { toast } from 'sonner';

export type { Project };

export function useProjects() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, companies(name), leads(first_name, last_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Project & { companies: { name: string } | null })[];
    },
  });
}

export function useCreateProject() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: {
      title: string;
      description?: string;
      company_id?: string;
      lead_id?: string;
      start_date?: string;
      target_date?: string;
      status?: Project['status'];
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('projects')
        .insert(project)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
    },
    onError: () => {
      toast.error('Failed to create project');
    },
  });
}
