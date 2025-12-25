'use client';

import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onEscape?: () => void;
  onSelectAll?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDuplicate?: () => void;
}

export function useWorkflowShortcuts(handlers: ShortcutHandlers) {
  const {
    onSave,
    onUndo,
    onRedo,
    onDelete,
    onEscape,
    onSelectAll,
    onCopy,
    onPaste,
    onDuplicate,
  } = handlers;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if user is typing in an input
      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Meta key (Cmd on Mac, Ctrl on Windows/Linux)
      const isMeta = event.metaKey || event.ctrlKey;

      // Save: Cmd+S
      if (isMeta && event.key === 's') {
        event.preventDefault();
        onSave?.();
        return;
      }

      // Undo: Cmd+Z
      if (isMeta && !event.shiftKey && event.key === 'z') {
        event.preventDefault();
        onUndo?.();
        return;
      }

      // Redo: Cmd+Shift+Z or Cmd+Y
      if ((isMeta && event.shiftKey && event.key === 'z') || (isMeta && event.key === 'y')) {
        event.preventDefault();
        onRedo?.();
        return;
      }

      // Skip other shortcuts if in input
      if (isInputFocused) return;

      // Delete: Backspace or Delete
      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        onDelete?.();
        return;
      }

      // Escape: Deselect all
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape?.();
        return;
      }

      // Select all: Cmd+A
      if (isMeta && event.key === 'a') {
        event.preventDefault();
        onSelectAll?.();
        return;
      }

      // Copy: Cmd+C
      if (isMeta && event.key === 'c') {
        event.preventDefault();
        onCopy?.();
        return;
      }

      // Paste: Cmd+V
      if (isMeta && event.key === 'v') {
        event.preventDefault();
        onPaste?.();
        return;
      }

      // Duplicate: Cmd+D
      if (isMeta && event.key === 'd') {
        event.preventDefault();
        onDuplicate?.();
        return;
      }
    },
    [onSave, onUndo, onRedo, onDelete, onEscape, onSelectAll, onCopy, onPaste, onDuplicate]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
