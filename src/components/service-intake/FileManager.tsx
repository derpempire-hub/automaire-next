'use client';

import { useState } from 'react';
import { FileUpload, FileList } from '@/components/ui/file-upload';
import {
  useServiceRequestFiles,
  useUploadFile,
  useUploadMultipleFiles,
  useDeleteFile,
  useGetFileUrl,
} from '@/hooks/useFileUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FileManagerProps {
  serviceRequestId: string;
  category?: string;
  title?: string;
  description?: string;
  accept?: string[];
  maxSize?: number;
  maxFiles?: number;
  showDelete?: boolean;
  className?: string;
}

export function FileManager({
  serviceRequestId,
  category,
  title = 'Files',
  description = 'Upload and manage your files',
  accept,
  maxSize,
  maxFiles = 10,
  showDelete = true,
  className,
}: FileManagerProps) {
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  // Fetch existing files
  const { data: files = [], isLoading } = useServiceRequestFiles(serviceRequestId);

  // Filter by category if provided
  const displayFiles = category
    ? files.filter((f) => f.category === category)
    : files;

  // Mutations
  const uploadFile = useUploadFile();
  const uploadMultiple = useUploadMultipleFiles();
  const deleteFile = useDeleteFile();
  const getFileUrl = useGetFileUrl();

  const handleFilesSelected = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 1) {
      await uploadFile.mutateAsync({
        file: selectedFiles[0],
        options: { serviceRequestId, category },
      });
    } else {
      await uploadMultiple.mutateAsync({
        files: selectedFiles,
        options: { serviceRequestId, category },
      });
    }
  };

  const handleDelete = async (fileId: string, filePath: string) => {
    setDeletingFileId(fileId);
    try {
      await deleteFile.mutateAsync({
        fileId,
        filePath,
        serviceRequestId,
      });
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleDownload = async (filePath: string) => {
    try {
      const url = await getFileUrl.mutateAsync(filePath);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to get download URL:', error);
    }
  };

  const isUploading = uploadFile.isPending || uploadMultiple.isPending;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept={accept}
          maxSize={maxSize}
          maxFiles={maxFiles}
          isUploading={isUploading}
          disabled={isUploading}
        />

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <FileList
            files={displayFiles}
            onDelete={showDelete ? handleDelete : undefined}
            onDownload={handleDownload}
            deletingFileId={deletingFileId}
            showDelete={showDelete}
            emptyMessage="No files uploaded yet"
          />
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Inline File Upload Field (for forms)
// ============================================

interface FileUploadFieldProps {
  serviceRequestId: string;
  category: string;
  label: string;
  description?: string;
  accept?: string[];
  maxSize?: number;
  maxFiles?: number;
  required?: boolean;
  className?: string;
}

export function FileUploadField({
  serviceRequestId,
  category,
  label,
  description,
  accept,
  maxSize,
  maxFiles = 5,
  required = false,
  className,
}: FileUploadFieldProps) {
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  const { data: allFiles = [], isLoading } = useServiceRequestFiles(serviceRequestId);
  const files = allFiles.filter((f) => f.category === category);

  const uploadFile = useUploadFile();
  const uploadMultiple = useUploadMultipleFiles();
  const deleteFile = useDeleteFile();
  const getFileUrl = useGetFileUrl();

  const handleFilesSelected = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 1) {
      await uploadFile.mutateAsync({
        file: selectedFiles[0],
        options: { serviceRequestId, category },
      });
    } else {
      await uploadMultiple.mutateAsync({
        files: selectedFiles,
        options: { serviceRequestId, category },
      });
    }
  };

  const handleDelete = async (fileId: string, filePath: string) => {
    setDeletingFileId(fileId);
    try {
      await deleteFile.mutateAsync({
        fileId,
        filePath,
        serviceRequestId,
      });
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleDownload = async (filePath: string) => {
    const url = await getFileUrl.mutateAsync(filePath);
    window.open(url, '_blank');
  };

  const isUploading = uploadFile.isPending || uploadMultiple.isPending;

  return (
    <div className={className}>
      <div className="mb-2">
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>

      <FileUpload
        onFilesSelected={handleFilesSelected}
        accept={accept}
        maxSize={maxSize}
        maxFiles={maxFiles}
        isUploading={isUploading}
        disabled={isUploading}
        label="Drop files here"
        description="or click to browse"
      />

      {isLoading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-14 w-full" />
        </div>
      ) : files.length > 0 ? (
        <div className="mt-3">
          <FileList
            files={files}
            onDelete={handleDelete}
            onDownload={handleDownload}
            deletingFileId={deletingFileId}
          />
        </div>
      ) : null}

      {required && files.length === 0 && !isLoading && (
        <p className="text-xs text-muted-foreground mt-2">
          Please upload at least one file
        </p>
      )}
    </div>
  );
}
