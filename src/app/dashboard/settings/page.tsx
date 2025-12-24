'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/useEntitlements';
import { User, Package, Flag } from 'lucide-react';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { isSuperAdmin } = usePermissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
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

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline" onClick={signOut}>
                Sign out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

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
