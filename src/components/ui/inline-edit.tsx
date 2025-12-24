import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => Promise<void> | void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  showIcon?: boolean;
}

export function InlineEdit({
  value,
  onSave,
  className,
  inputClassName,
  placeholder = 'Click to edit',
  disabled = false,
  showIcon = false,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = useCallback(async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  }, [editValue, value, onSave]);

  const handleCancel = useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  if (disabled) {
    return (
      <span className={cn('text-sm', className)}>
        {value || placeholder}
      </span>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isEditing ? (
        <motion.div
          key="editing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="flex items-center gap-1"
        >
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            disabled={isSaving}
            className={cn(
              'h-7 text-xs py-1 px-2',
              inputClassName
            )}
            placeholder={placeholder}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={isSaving}
            className="p-1 hover:bg-primary/10 rounded text-primary"
            title="Save (Enter)"
          >
            <Check className="h-3 w-3" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCancel}
            className="p-1 hover:bg-muted rounded text-muted-foreground"
            title="Cancel (Esc)"
          >
            <X className="h-3 w-3" />
          </motion.button>
        </motion.div>
      ) : (
        <motion.button
          key="display"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          onClick={() => setIsEditing(true)}
          className={cn(
            'group flex items-center gap-1.5 text-left hover:bg-muted/50 rounded px-1.5 py-0.5 -mx-1.5 -my-0.5 transition-colors',
            className
          )}
        >
          <span className={cn(!value && 'text-muted-foreground')}>
            {value || placeholder}
          </span>
          {showIcon && (
            <Pencil className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// Inline Edit for Select/Status fields
interface InlineSelectProps {
  value: string;
  options: { value: string; label: string; className?: string }[];
  onSave: (value: string) => Promise<void> | void;
  className?: string;
  disabled?: boolean;
}

export function InlineSelect({
  value,
  options,
  onSave,
  className,
  disabled = false,
}: InlineSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption = options.find(o => o.value === value);

  const handleSelect = async (newValue: string) => {
    if (newValue === value) {
      setIsOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(newValue);
    } finally {
      setIsSaving(false);
      setIsOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (disabled) {
    return (
      <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', currentOption?.className, className)}>
        {currentOption?.label || value}
      </span>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSaving}
        className={cn(
          'text-[10px] px-1.5 py-0.5 rounded font-medium capitalize cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all',
          currentOption?.className,
          className
        )}
        whileTap={{ scale: 0.98 }}
      >
        {currentOption?.label || value}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden min-w-[100px]"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 text-[10px] text-left hover:bg-muted/50 transition-colors',
                  option.value === value && 'bg-muted/30'
                )}
              >
                <span className={cn('px-1.5 py-0.5 rounded font-medium', option.className)}>
                  {option.label}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
