'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Kanban, TrendingUp, Users, Trophy, XCircle } from 'lucide-react';
import { AnimatedEmptyState } from '@/components/ui/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePipelineData, useMoveLead, type LeadWithCompany, type PipelineStatus } from '@/hooks/usePipeline';
import { PipelineKanban } from '@/components/pipeline';
import { LeadDetailDrawer, AddLeadDialog, EditLeadDialog } from '@/components/leads';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteLead } from '@/hooks/useLeads';
import type { Lead } from '@/lib/supabase/types';

export default function PipelinePage() {
  const router = useRouter();
  const { columns, metrics, isLoading } = usePipelineData();
  const moveLead = useMoveLead();
  const deleteLead = useDeleteLead();

  // State
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogStatus, setAddDialogStatus] = useState<PipelineStatus>('new');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCardClick = (lead: LeadWithCompany) => {
    setSelectedLeadId(lead.id);
  };

  const handleStatusChange = (leadId: string, status: PipelineStatus) => {
    moveLead.mutate({ id: leadId, status });
  };

  const handleAddLead = (status: PipelineStatus) => {
    setAddDialogStatus(status);
    setAddDialogOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setEditDialogOpen(true);
    setSelectedLeadId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteLead.mutateAsync(deleteId);
    setDeleteId(null);
    setSelectedLeadId(null);
  };

  const handleDeleteFromDrawer = (id: string) => {
    setDeleteId(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Pipeline</h1>
          <p className="text-muted-foreground">Visualize your sales pipeline stages.</p>
        </div>
        <div className="flex gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[400px] w-[280px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pipeline</h1>
          <p className="text-muted-foreground">Visualize your sales pipeline stages.</p>
        </div>
        <Button onClick={() => handleAddLead('new')}>
          Add Lead
        </Button>
      </div>

      {/* Metrics */}
      {metrics.total > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
              <p className="text-xs text-muted-foreground">{metrics.active} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Won</CardTitle>
              <Trophy className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{metrics.won}</div>
              <p className="text-xs text-muted-foreground">closed deals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lost</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.lost}</div>
              <p className="text-xs text-muted-foreground">lost deals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">win rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Kanban Board */}
      {metrics.total === 0 ? (
        <AnimatedEmptyState
          icon={Kanban}
          iconColor="hsl(262, 80%, 60%)"
          title="Your pipeline is empty"
          description="Visualize your sales process with a customizable pipeline. Drag and drop leads through your stages."
          actionLabel="Add Your First Lead"
          onAction={() => handleAddLead('new')}
        />
      ) : (
        <PipelineKanban
          columns={columns}
          onCardClick={handleCardClick}
          onStatusChange={handleStatusChange}
          onAddLead={handleAddLead}
          collapseWonLost={true}
        />
      )}

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        leadId={selectedLeadId}
        open={!!selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        onEdit={handleEdit}
        onDelete={handleDeleteFromDrawer}
      />

      {/* Add Lead Dialog */}
      <AddLeadDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      {/* Edit Lead Dialog */}
      <EditLeadDialog
        lead={editingLead}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingLead(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lead
              and remove it from the pipeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
