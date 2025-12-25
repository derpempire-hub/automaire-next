'use client';

import { useCallback, useRef, useState } from 'react';
import { produce } from 'immer';
import type { WorkflowNode, WorkflowEdge } from '@/lib/workflow/types';

interface HistoryState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface HistoryEntry {
  state: HistoryState;
  timestamp: number;
  action?: string;
}

const MAX_HISTORY_SIZE = 50;

export function useWorkflowHistory(
  initialNodes: WorkflowNode[] = [],
  initialEdges: WorkflowEdge[] = []
) {
  // Current state
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(initialEdges);

  // History stacks
  const undoStack = useRef<HistoryEntry[]>([]);
  const redoStack = useRef<HistoryEntry[]>([]);

  // Track if we should skip recording (for undo/redo operations)
  const skipRecord = useRef(false);

  // Save current state to undo stack
  const saveToHistory = useCallback((action?: string) => {
    if (skipRecord.current) {
      skipRecord.current = false;
      return;
    }

    const entry: HistoryEntry = {
      state: { nodes, edges },
      timestamp: Date.now(),
      action,
    };

    undoStack.current = [...undoStack.current.slice(-MAX_HISTORY_SIZE + 1), entry];
    redoStack.current = []; // Clear redo stack on new action
  }, [nodes, edges]);

  // Update nodes with history tracking
  const updateNodes = useCallback(
    (updater: (nodes: WorkflowNode[]) => WorkflowNode[], action?: string) => {
      saveToHistory(action);
      setNodes((prev) => produce(prev, (draft) => {
        const result = updater(draft as WorkflowNode[]);
        return result;
      }));
    },
    [saveToHistory]
  );

  // Update edges with history tracking
  const updateEdges = useCallback(
    (updater: (edges: WorkflowEdge[]) => WorkflowEdge[], action?: string) => {
      saveToHistory(action);
      setEdges((prev) => produce(prev, (draft) => {
        const result = updater(draft as WorkflowEdge[]);
        return result;
      }));
    },
    [saveToHistory]
  );

  // Update both nodes and edges with history tracking
  const updateState = useCallback(
    (
      nodesUpdater: (nodes: WorkflowNode[]) => WorkflowNode[],
      edgesUpdater: (edges: WorkflowEdge[]) => WorkflowEdge[],
      action?: string
    ) => {
      saveToHistory(action);
      setNodes((prev) => produce(prev, (draft) => {
        const result = nodesUpdater(draft as WorkflowNode[]);
        return result;
      }));
      setEdges((prev) => produce(prev, (draft) => {
        const result = edgesUpdater(draft as WorkflowEdge[]);
        return result;
      }));
    },
    [saveToHistory]
  );

  // Undo last action
  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return false;

    const previousEntry = undoStack.current.pop()!;

    // Save current state to redo stack
    redoStack.current.push({
      state: { nodes, edges },
      timestamp: Date.now(),
    });

    // Skip recording for this update
    skipRecord.current = true;

    // Restore previous state
    setNodes(previousEntry.state.nodes);
    setEdges(previousEntry.state.edges);

    return true;
  }, [nodes, edges]);

  // Redo last undone action
  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return false;

    const nextEntry = redoStack.current.pop()!;

    // Save current state to undo stack
    undoStack.current.push({
      state: { nodes, edges },
      timestamp: Date.now(),
    });

    // Skip recording for this update
    skipRecord.current = true;

    // Restore next state
    setNodes(nextEntry.state.nodes);
    setEdges(nextEntry.state.edges);

    return true;
  }, [nodes, edges]);

  // Check if undo/redo is available
  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;

  // Get history info
  const getHistoryInfo = useCallback(() => ({
    undoCount: undoStack.current.length,
    redoCount: redoStack.current.length,
    lastAction: undoStack.current[undoStack.current.length - 1]?.action,
  }), []);

  // Clear history
  const clearHistory = useCallback(() => {
    undoStack.current = [];
    redoStack.current = [];
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    saveToHistory('reset');
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, saveToHistory]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    updateNodes,
    updateEdges,
    updateState,
    undo,
    redo,
    canUndo,
    canRedo,
    getHistoryInfo,
    clearHistory,
    reset,
  };
}
