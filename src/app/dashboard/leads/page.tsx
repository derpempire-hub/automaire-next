'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Search, Filter, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useLeads, useUpdateLeadStatus, useDeleteLead } from '@/hooks/useLeads';
import { useCompanies } from '@/hooks/useCompanies';
import {
  AddLeadDialog,
  EditLeadDialog,
  LeadDetailDrawer,
  LeadsTable,
  LeadsEmptyState,
  LEAD_STATUSES,
  type LeadStatus,
} from '@/components/leads';
import type { Lead } from '@/lib/supabase/types';

function LeadsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

function LeadsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const selectedLeadId = searchParams.get('lead');
  const action = searchParams.get('action');

  // Local state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Data
  const { data: leads = [], isLoading } = useLeads();
  const { data: companies = [] } = useCompanies();
  const updateStatus = useUpdateLeadStatus();
  const deleteLead = useDeleteLead();

  // Open add dialog when navigating with ?action=add
  useEffect(() => {
    if (action === 'add') {
      setAddDialogOpen(true);
      // Remove the action param from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('action');
      router.replace(`/dashboard/leads${params.toString() ? `?${params}` : ''}`);
    }
  }, [action, searchParams, router]);

  // Get unique sources from leads
  const sources = useMemo(() => {
    const uniqueSources = new Set(leads.map((l) => l.source).filter(Boolean));
    return Array.from(uniqueSources) as string[];
  }, [leads]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(query);
        const matchesEmail = lead.email?.toLowerCase().includes(query);
        const matchesCompany = (lead as any).companies?.name?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesCompany) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;

      // Company filter
      if (companyFilter !== 'all' && lead.company_id !== companyFilter) return false;

      // Source filter
      if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;

      return true;
    });
  }, [leads, searchQuery, statusFilter, companyFilter, sourceFilter]);

  const hasFilters = searchQuery || statusFilter !== 'all' || companyFilter !== 'all' || sourceFilter !== 'all';
  const hasLeads = leads.length > 0;

  const handleSelectLead = (id: string) => {
    router.push(`/dashboard/leads?lead=${id}`);
  };

  const handleCloseDrawer = () => {
    router.push('/dashboard/leads');
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteLead.mutateAsync(deleteId);
    setDeleteId(null);
    if (selectedLeadId === deleteId) {
      handleCloseDrawer();
    }
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteLead.mutateAsync(id);
    }
    setSelectedIds([]);
    setBulkDeleteOpen(false);
  };

  const handleStatusChange = (id: string, status: LeadStatus) => {
    updateStatus.mutate({ id, status });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCompanyFilter('all');
    setSourceFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-muted-foreground">
            Manage your sales leads and prospects.
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Filters */}
      {hasLeads && (
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {LEAD_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Company Filter */}
          {companies.length > 0 && (
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Source Filter */}
          {sources.length > 0 && (
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source.replace('_', ' ').charAt(0).toUpperCase() + source.replace('_', ' ').slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Clear Filters */}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">
            {selectedIds.length} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setBulkDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds([])}
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !hasLeads ? (
        <LeadsEmptyState onAdd={() => setAddDialogOpen(true)} />
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No leads match your filters.</p>
          <Button variant="link" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <LeadsTable
          leads={filteredLeads as any}
          isLoading={isLoading}
          selectedId={selectedLeadId}
          onSelect={handleSelectLead}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteId(id)}
          onStatusChange={handleStatusChange}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      )}

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

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        leadId={selectedLeadId}
        open={!!selectedLeadId}
        onClose={handleCloseDrawer}
        onEdit={handleEdit}
        onDelete={(id) => setDeleteId(id)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lead
              and all associated data.
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} Leads?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected leads and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedIds.length} Leads
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<LeadsPageSkeleton />}>
      <LeadsPageContent />
    </Suspense>
  );
}
