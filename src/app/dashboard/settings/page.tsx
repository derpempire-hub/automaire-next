'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/useEntitlements';
import { User, Package, Flag, Users, Building2 } from 'lucide-react';
import { useWorkspace, canManageWorkspace, canManageMembers } from '@/hooks/useWorkspace';
import { WorkspaceSettingsTab } from '@/components/settings/WorkspaceSettingsTab';
import { MembersTab } from '@/components/settings/MembersTab';
import { ProfileTab } from '@/components/settings/ProfileTab';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { isSuperAdmin } = usePermissions();
  const { role } = useWorkspace();

  const canViewWorkspace = canManageWorkspace(role);
  const canViewMembers = canManageMembers(role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Manage your account, team, and workspace.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          {canViewMembers && (
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              Team Members
            </TabsTrigger>
          )}
          {canViewWorkspace && (
            <TabsTrigger value="workspace" className="gap-2">
              <Building2 className="h-4 w-4" />
              Workspace
            </TabsTrigger>
          )}
          {isSuperAdmin && (
            <>
              <TabsTrigger value="tiers" className="gap-2">
                <Package className="h-4 w-4" />
                Subscription Tiers
              </TabsTrigger>
              <TabsTrigger value="flags" className="gap-2">
                <Flag className="h-4 w-4" />
                Feature Flags
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        {canViewMembers && (
          <TabsContent value="members">
            <MembersTab />
          </TabsContent>
        )}

        {canViewWorkspace && (
          <TabsContent value="workspace">
            <WorkspaceSettingsTab />
          </TabsContent>
        )}

        {isSuperAdmin && (
          <>
            <TabsContent value="tiers">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Tiers</CardTitle>
                  <CardDescription>Manage subscription plans and pricing</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Subscription tier management coming soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flags">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Flags</CardTitle>
                  <CardDescription>Toggle features on and off</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Feature flag management coming soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
