'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { ServiceRequestFile } from '@/types/service-intake';

// Re-export type for convenience
export type { ServiceRequestFile };

interface UploadOptions {
  serviceRequestId: string;
  category?: string;
  onProgress?: (progress: number) => void;
}

/**
 * Get all files for a service request
 */
export function useServiceRequestFiles(serviceRequestId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['service-request-files', serviceRequestId],
    queryFn: async () => {
      if (!serviceRequestId) return [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('service_request_files')
        .select('*')
        .eq('service_request_id', serviceRequestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ServiceRequestFile[];
    },
    enabled: !!serviceRequestId,
  });
}

/**
 * Get files by category
 */
export function useServiceRequestFilesByCategory(
  serviceRequestId: string | null,
  category: string
) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['service-request-files', serviceRequestId, category],
    queryFn: async () => {
      if (!serviceRequestId) return [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('service_request_files')
        .select('*')
        .eq('service_request_id', serviceRequestId)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ServiceRequestFile[];
    },
    enabled: !!serviceRequestId,
  });
}

/**
 * Upload a file to a service request
 */
export function useUploadFile() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      options,
    }: {
      file: File;
      options: UploadOptions;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate unique file path: user_id/request_id/timestamp-randomstring.ext
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${options.serviceRequestId}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('service-request-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Create database record
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: dbError } = await (supabase as any)
        .from('service_request_files')
        .insert({
          service_request_id: options.serviceRequestId,
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          category: options.category || null,
        })
        .select()
        .single();

      if (dbError) {
        // Cleanup uploaded file if database insert fails
        await supabase.storage.from('service-request-files').remove([filePath]);
        console.error('Database error:', dbError);
        throw dbError;
      }

      return data as ServiceRequestFile;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['service-request-files', variables.options.serviceRequestId],
      });
      toast.success('File uploaded');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    },
  });
}

/**
 * Upload multiple files at once
 */
export function useUploadMultipleFiles() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      files,
      options,
    }: {
      files: File[];
      options: UploadOptions;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const uploadedFiles: ServiceRequestFile[] = [];
      const errors: Error[] = [];

      for (const file of files) {
        try {
          // Generate unique file path
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${user.id}/${options.serviceRequestId}/${fileName}`;

          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('service-request-files')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) throw uploadError;

          // Create database record
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error: dbError } = await (supabase as any)
            .from('service_request_files')
            .insert({
              service_request_id: options.serviceRequestId,
              user_id: user.id,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              mime_type: file.type,
              category: options.category || null,
            })
            .select()
            .single();

          if (dbError) {
            await supabase.storage.from('service-request-files').remove([filePath]);
            throw dbError;
          }

          uploadedFiles.push(data as ServiceRequestFile);
        } catch (error) {
          errors.push(error as Error);
        }
      }

      if (errors.length > 0 && uploadedFiles.length === 0) {
        throw new Error('All uploads failed');
      }

      return { uploadedFiles, errors };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['service-request-files', variables.options.serviceRequestId],
      });
      if (result.errors.length > 0) {
        toast.warning(`${result.uploadedFiles.length} files uploaded, ${result.errors.length} failed`);
      } else {
        toast.success(`${result.uploadedFiles.length} files uploaded`);
      }
    },
    onError: () => {
      toast.error('Failed to upload files');
    },
  });
}

/**
 * Delete a file
 */
export function useDeleteFile() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fileId,
      filePath,
      serviceRequestId,
    }: {
      fileId: string;
      filePath: string;
      serviceRequestId: string;
    }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('service-request-files')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue to delete database record even if storage fails
      }

      // Delete from database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any)
        .from('service_request_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['service-request-files', variables.serviceRequestId],
      });
      toast.success('File deleted');
    },
    onError: () => {
      toast.error('Failed to delete file');
    },
  });
}

/**
 * Get a signed URL for downloading a file
 */
export function useGetFileUrl() {
  const supabase = createClient();

  return useMutation({
    mutationFn: async (filePath: string) => {
      const { data, error } = await supabase.storage
        .from('service-request-files')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    },
    onError: () => {
      toast.error('Failed to get file URL');
    },
  });
}

/**
 * Get a public URL for a file (if bucket is public)
 */
export function getPublicFileUrl(filePath: string) {
  const supabase = createClient();
  const { data } = supabase.storage
    .from('service-request-files')
    .getPublicUrl(filePath);
  return data.publicUrl;
}

// ============================================
// Utility functions
// ============================================

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file type category
 */
export function getFileTypeCategory(mimeType: string): 'image' | 'document' | 'pdf' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'text/plain'
  ) {
    return 'document';
  }
  return 'other';
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      // Handle wildcards like 'image/*'
      const category = type.replace('/*', '');
      return file.type.startsWith(category + '/');
    }
    return file.type === type;
  });
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes;
}

// Default allowed file types
export const DEFAULT_ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

// Default max file size (50MB)
export const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024;
