'use client';

import { useAuth } from './useAuth';

export type AppRole =
  | 'super_admin'
  | 'admin'
  | 'client_owner'
  | 'client_member'
  | 'readonly'
  | 'user';

// Simplified permissions hook for Next.js migration
// Full implementation would include database queries for entitlements
export function usePermissions() {
  const { user, isAdmin } = useAuth();

  // For now, return default permissions
  // In production, these would be fetched from the database
  return {
    // Role checks
    role: isAdmin ? 'admin' as AppRole : 'user' as AppRole,
    isSuperAdmin: false,
    isInternalAdmin: isAdmin,
    isClientOwner: false,
    isReadOnly: false,
    isAdmin,

    // Feature entitlements - default to true for now
    workflowBuilderEnabled: true,
    aiAgentsEnabled: true,
    phoneBotEnabled: false,
    n8nTemplatesEnabled: true,

    // Permission entitlements
    canManageUsers: isAdmin,
    canApproveWorkflows: isAdmin,
    canViewAnalytics: true,
    canExportData: true,
    canManageBilling: isAdmin,

    // Limits (-1 = unlimited)
    maxWorkflows: -1,
    maxRunsPerMonth: -1,
    hasUnlimitedWorkflows: true,
    hasUnlimitedRuns: true,
  };
}
