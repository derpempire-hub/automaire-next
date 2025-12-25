'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Zap,
  Lock,
  Sparkles,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { AnimatedWorkflowEmptyState } from '@/components/ui/empty-state';
import { usePermissions } from '@/hooks/useEntitlements';
import { useWorkflows, useCreateWorkflow, useDeleteWorkflow, useDuplicateWorkflow } from '@/hooks/useWorkflows';
import { formatDistanceToNow } from 'date-fns';

const STATUS_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  pending_review: { label: 'Pending Review', variant: 'default' },
  in_implementation: { label: 'In Progress', variant: 'default' },
  active: { label: 'Active', variant: 'default' },
  paused: { label: 'Paused', variant: 'outline' },
};

export default function AutomationPage() {
  const router = useRouter();
  const { workflowBuilderEnabled, isInternalAdmin } = usePermissions();
  const hasAccess = workflowBuilderEnabled || isInternalAdmin;

  const { data: workflows = [], isLoading } = useWorkflows();
  const createWorkflow = useCreateWorkflow();
  const deleteWorkflow = useDeleteWorkflow();
  const duplicateWorkflow = useDuplicateWorkflow();

  const handleCreateWorkflow = async () => {
    try {
      const workflow = await createWorkflow.mutateAsync({ name: 'Untitled Workflow' });
      router.push(`/dashboard/automation/${workflow.id}`);
    } catch {
      // Error handled by mutation
    }
  };

  const handleDeleteWorkflow = (id: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflow.mutate(id);
    }
  };

  const handleDuplicateWorkflow = async (id: string) => {
    try {
      const workflow = await duplicateWorkflow.mutateAsync(id);
      router.push(`/dashboard/automation/${workflow.id}`);
    } catch {
      // Error handled by mutation
    }
  };

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

  // Loading state
  if (isLoading) {
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
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>

        <div className="border rounded-lg">
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (workflows.length === 0) {
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
          <Button onClick={handleCreateWorkflow} disabled={createWorkflow.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>

        <AnimatedWorkflowEmptyState onAdd={handleCreateWorkflow} />
      </div>
    );
  }

  // Workflows list
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
        <Button onClick={handleCreateWorkflow} disabled={createWorkflow.isPending}>
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.map((workflow) => {
              const status = STATUS_BADGES[workflow.status] || STATUS_BADGES.draft;
              return (
                <TableRow key={workflow.id} className="group">
                  <TableCell>
                    <Link
                      href={`/dashboard/automation/${workflow.id}`}
                      className="font-medium hover:underline flex items-center gap-2"
                    >
                      {workflow.name}
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                    </Link>
                    {workflow.description && (
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {workflow.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(workflow.updated_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/automation/${workflow.id}`}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateWorkflow(workflow.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
