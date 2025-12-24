'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Zap, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { usePermissions } from '@/hooks/useEntitlements';
import Link from 'next/link';

export default function AutomationPage() {
  const { workflowBuilderEnabled, isInternalAdmin } = usePermissions();
  const hasAccess = workflowBuilderEnabled || isInternalAdmin;

  // Locked state for users without access
  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Workflow Designer
          </h1>
          <p className="text-muted-foreground">
            Design your automation logic — we handle the implementation
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
              <Lock className="h-10 w-10 text-muted-foreground" />
            </div>

            <h2 className="text-2xl font-semibold mb-3">Unlock Workflow Automation</h2>

            <p className="text-muted-foreground mb-6 max-w-md">
              Automate repetitive tasks, create smart workflows, and let AI handle the heavy lifting.
              Available on Pro plan and above.
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <Button size="lg" asChild className="gap-2">
                <Link href="/pricing">
                  <Sparkles className="h-4 w-4" />
                  Upgrade to Pro
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Request Demo</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl w-full">
              {[
                { icon: '⚡', label: 'Smart Triggers', desc: 'Start workflows automatically' },
                { icon: '🤖', label: 'AI Actions', desc: 'Let AI make decisions' },
                { icon: '📧', label: 'Notifications', desc: 'Email, SMS, in-app alerts' },
                { icon: '🔄', label: 'Integrations', desc: 'Connect your tools' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-center p-4 rounded-lg bg-muted/30 border border-dashed"
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Workflow Designer
          </h1>
          <p className="text-muted-foreground">
            Design your automation logic — we handle the implementation
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Design Workflow
        </Button>
      </div>

      <div className="border-2 border-dashed rounded-xl p-12 text-center bg-muted/20">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
          <Zap className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Design your first workflow</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          You design the workflow logic — our team implements and maintains the execution. Focus on
          what should happen, not how to build it.
        </p>
        <Button size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Start Designing
        </Button>

        <div className="mt-8 grid grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { icon: '⚡', label: 'Triggers', desc: 'When to start' },
            { icon: '🎯', label: 'Actions', desc: 'What to do' },
            { icon: '🤖', label: 'AI Steps', desc: 'Smart automation' },
            { icon: '🔧', label: 'Logic', desc: 'Conditions & delays' },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 rounded-lg bg-background border">
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted-foreground max-w-sm mx-auto">
          Advanced changes and custom integrations are handled by our team.
        </p>
      </div>
    </div>
  );
}
