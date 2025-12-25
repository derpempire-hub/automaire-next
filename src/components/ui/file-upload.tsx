'use client';

import * as React from 'react';
import { useCallback, useState } from 'react';
import { Upload, X, File, Image, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  formatFileSize,
  getFileTypeCategory,
  isValidFileType,
  isValidFileSize,
  DEFAULT_ALLOWED_TYPES,
  DEFAULT_MAX_FILE_SIZE,
} from '@/hooks/useFileUpload';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string[];
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  isUploading?: boolean;
  className?: string;
  label?: string;
  description?: string;
}

export function FileUpload({
  onFilesSelected,
  accept = DEFAULT_ALLOWED_TYPES,
  maxSize = DEFAULT_MAX_FILE_SIZE,
  maxFiles = 10,
  disabled = false,
  isUploading = false,
  className,
  label = 'Upload files',
  description = 'Drag and drop files here, or click to browse',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; errors: string[] } => {
      const validFiles: File[] = [];
      const fileErrors: string[] = [];

      for (const file of files) {
        if (!isValidFileType(file, accept)) {
          fileErrors.push(`${file.name}: Invalid file type`);
          continue;
        }
        if (!isValidFileSize(file, maxSize)) {
          fileErrors.push(`${file.name}: File too large (max ${formatFileSize(maxSize)})`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length > maxFiles) {
        fileErrors.push(`Maximum ${maxFiles} files allowed`);
        return { valid: validFiles.slice(0, maxFiles), errors: fileErrors };
      }

      return { valid: validFiles, errors: fileErrors };
    },
    [accept, maxSize, maxFiles]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const { valid, errors: fileErrors } = validateFiles(fileArray);

      setErrors(fileErrors);

      if (valid.length > 0) {
        onFilesSelected(valid);
      }
    },
    [validateFiles, onFilesSelected]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || isUploading) return;

      handleFiles(e.dataTransfer.files);
    },
    [disabled, isUploading, handleFiles]
  );

  const handleClick = useCallback(() => {
    if (disabled || isUploading) return;
    inputRef.current?.click();
  }, [disabled, isUploading]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input so the same file can be selected again
      e.target.value = '';
    },
    [handleFiles]
  );

  return (
    <div className={cn('space-y-2', className)}>
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          (disabled || isUploading) && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={accept.join(',')}
          onChange={handleInputChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {isUploading ? (
          <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
        ) : (
          <Upload className="h-10 w-10 text-muted-foreground" />
        )}

        <p className="mt-2 text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Max {formatFileSize(maxSize)} per file
          {maxFiles > 1 && ` • Up to ${maxFiles} files`}
        </p>
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-xs text-destructive">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// File Preview Component
// ============================================

interface FilePreviewProps {
  file: {
    id: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    file_path: string;
  };
  onDelete?: () => void;
  onDownload?: () => void;
  isDeleting?: boolean;
  showDelete?: boolean;
  className?: string;
}

export function FilePreview({
  file,
  onDelete,
  onDownload,
  isDeleting = false,
  showDelete = true,
  className,
}: FilePreviewProps) {
  const fileCategory = getFileTypeCategory(file.mime_type);

  const FileIcon = {
    image: Image,
    pdf: FileText,
    document: FileText,
    other: File,
  }[fileCategory];

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 bg-card',
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        <FileIcon className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.file_name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.file_size)}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {onDownload && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDownload}
            className="h-8 w-8"
          >
            <File className="h-4 w-4" />
          </Button>
        )}

        {showDelete && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={isDeleting}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================
// File List Component
// ============================================

interface FileListProps {
  files: Array<{
    id: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    file_path: string;
  }>;
  onDelete?: (fileId: string, filePath: string) => void;
  onDownload?: (filePath: string) => void;
  deletingFileId?: string | null;
  showDelete?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function FileList({
  files,
  onDelete,
  onDownload,
  deletingFileId,
  showDelete = true,
  emptyMessage = 'No files uploaded',
  className,
}: FileListProps) {
  if (files.length === 0) {
    return (
      <div className={cn('text-center py-6 text-sm text-muted-foreground', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {files.map((file) => (
        <FilePreview
          key={file.id}
          file={file}
          onDelete={onDelete ? () => onDelete(file.id, file.file_path) : undefined}
          onDownload={onDownload ? () => onDownload(file.file_path) : undefined}
          isDeleting={deletingFileId === file.id}
          showDelete={showDelete}
        />
      ))}
    </div>
  );
}
