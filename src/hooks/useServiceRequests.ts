'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type {
  ServiceRequest,
  ServiceRequestStatus,
  ServiceType,
} from '@/types/service-intake';

// Re-export types for convenience
export type { ServiceRequest, ServiceRequestStatus, ServiceType };

/**
 * Fetch all service requests for the current user
 */
export function useServiceRequests() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['service-requests'],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('service_requests')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as ServiceRequest[];
    },
  });
}

/**
 * Fetch service requests filtered by status
 */
export function useServiceRequestsByStatus(status: ServiceRequestStatus | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['service-requests', 'status', status],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from('service_requests')
        .select('*')
        .order('updated_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ServiceRequest[];
    },
  });
}

/**
 * Fetch service requests filtered by service type
 */
export function useServiceRequestsByType(serviceType: ServiceType | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['service-requests', 'type', serviceType],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from('service_requests')
        .select('*')
        .order('updated_at', { ascending: false });

      if (serviceType) {
        query = query.eq('service_type', serviceType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ServiceRequest[];
    },
  });
}

/**
 * Fetch a single service request by ID
 */
export function useServiceRequest(id: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['service-request', id],
    queryFn: async () => {
      if (!id) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('service_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ServiceRequest;
    },
    enabled: !!id,
  });
}

/**
 * Create a new service request
 */
export function useCreateServiceRequest() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: {
      service_type: ServiceType;
      title?: string;
      source?: 'onboarding' | 'dashboard';
      business_name?: string;
      industry?: string;
      target_audience?: string;
    }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('service_requests')
        .insert({
          user_id: user.id,
          service_type: request.service_type,
          title: request.title || `New ${request.service_type} project`,
          status: 'draft',
          source: request.source || 'dashboard',
          business_name: request.business_name || null,
          industry: request.industry || null,
          target_audience: request.target_audience || null,
          intake_data: {},
          onboarding_completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data as ServiceRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success('Request created');
    },
    onError: () => {
      toast.error('Failed to create request');
    },
  });
}

/**
 * Update an existing service request
 */
export function useUpdateServiceRequest() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<ServiceRequest> & { id: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('service_requests')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      queryClient.invalidateQueries({ queryKey: ['service-request', variables.id] });
    },
    onError: () => {
      toast.error('Failed to save changes');
    },
  });
}

/**
 * Update service request intake data (for form auto-save)
 */
export function useUpdateServiceRequestIntake() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      intake_data,
      business_name,
      industry,
      target_audience,
    }: {
      id: string;
      intake_data: Record<string, unknown>;
      business_name?: string;
      industry?: string;
      target_audience?: string;
    }) => {
      const updateData: Record<string, unknown> = {
        intake_data,
        updated_at: new Date().toISOString(),
      };

      if (business_name !== undefined) updateData.business_name = business_name;
      if (industry !== undefined) updateData.industry = industry;
      if (target_audience !== undefined) updateData.target_audience = target_audience;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('service_requests')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Silently update cache without toast for auto-save
      queryClient.invalidateQueries({ queryKey: ['service-request', variables.id] });
    },
    onError: () => {
      toast.error('Failed to save changes');
    },
  });
}

/**
 * Submit a service request for review
 */
export function useSubmitServiceRequest() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      additional_notes,
    }: {
      id: string;
      additional_notes?: string;
    }) => {
      const updateData: Record<string, unknown> = {
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (additional_notes) {
        updateData.additional_notes = additional_notes;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('service_requests')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      queryClient.invalidateQueries({ queryKey: ['service-request', variables.id] });
      toast.success('Request submitted successfully!');
    },
    onError: () => {
      toast.error('Failed to submit request');
    },
  });
}

/**
 * Update service request status (admin only)
 */
export function useUpdateServiceRequestStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: ServiceRequestStatus;
    }) => {
      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('service_requests')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      queryClient.invalidateQueries({ queryKey: ['service-request'] });
      toast.success('Status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });
}

/**
 * Delete a service request (only drafts)
 */
export function useDeleteServiceRequest() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('service_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success('Request deleted');
    },
    onError: () => {
      toast.error('Failed to delete request');
    },
  });
}

/**
 * Mark onboarding as completed
 */
export function useCompleteOnboarding() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('service_requests')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      queryClient.invalidateQueries({ queryKey: ['service-request', id] });
    },
    onError: () => {
      toast.error('Failed to complete onboarding');
    },
  });
}
