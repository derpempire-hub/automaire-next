'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  WorkspaceContext,
  useWorkspaces,
  useWorkspaceById,
  useWorkspaceRole,
} from '@/hooks/useWorkspace';
import type { Workspace, WorkspaceRole } from '@/lib/supabase/types';

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  // Store selected workspace ID in localStorage
  const [storedWorkspaceId, setStoredWorkspaceId] = useLocalStorage<string | null>(
    'automaire_workspace_id',
    null
  );

  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(storedWorkspaceId);

  // Fetch all workspaces
  const { data: workspaces = [], isLoading: isLoadingWorkspaces } = useWorkspaces();

  // Fetch current workspace details
  const { data: workspace, isLoading: isLoadingWorkspace } = useWorkspaceById(currentWorkspaceId);

  // Fetch user's role in current workspace
  const { data: role, isLoading: isLoadingRole } = useWorkspaceRole(currentWorkspaceId);

  // Auto-select first workspace if none selected
  useEffect(() => {
    if (!isLoadingWorkspaces && workspaces.length > 0 && !currentWorkspaceId) {
      const firstWorkspace = workspaces[0];
      setCurrentWorkspaceId(firstWorkspace.id);
      setStoredWorkspaceId(firstWorkspace.id);
    }
  }, [workspaces, currentWorkspaceId, isLoadingWorkspaces, setStoredWorkspaceId]);

  // Validate stored workspace ID exists in user's workspaces
  useEffect(() => {
    if (!isLoadingWorkspaces && workspaces.length > 0 && currentWorkspaceId) {
      const workspaceExists = workspaces.some((ws) => ws.id === currentWorkspaceId);
      if (!workspaceExists) {
        // Stored workspace no longer accessible, switch to first available
        const firstWorkspace = workspaces[0];
        setCurrentWorkspaceId(firstWorkspace.id);
        setStoredWorkspaceId(firstWorkspace.id);
      }
    }
  }, [workspaces, currentWorkspaceId, isLoadingWorkspaces, setStoredWorkspaceId]);

  // Switch workspace handler
  const switchWorkspace = useCallback(
    (workspaceId: string) => {
      setCurrentWorkspaceId(workspaceId);
      setStoredWorkspaceId(workspaceId);
    },
    [setStoredWorkspaceId]
  );

  const isLoading = isLoadingWorkspaces || isLoadingWorkspace || isLoadingRole;

  const value = {
    workspace: workspace || null,
    workspaces,
    role: role || null,
    isLoading,
    switchWorkspace,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
