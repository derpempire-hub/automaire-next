'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Search, Filter, X, Trash2 } from 'lucide-react';
import { AnimatedEmptyState } from '@/components/ui/empty-state';
import { Building2 } from 'lucide-react';
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
import { useCompanies, useDeleteCompany } from '@/hooks/useCompanies';
import {
  AddCompanyDialog,
  EditCompanyDialog,
  CompanyDetailDrawer,
  CompaniesTable,
  INDUSTRY_OPTIONS,
  SIZE_OPTIONS,
} from '@/components/companies';
import type { Company } from '@/lib/supabase/types';

function CompaniesPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

function CompaniesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const selectedCompanyId = searchParams.get('company');
  const action = searchParams.get('action');

  // Local state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');

  // Data
  const { data: companies = [], isLoading } = useCompanies();
  const deleteCompany = useDeleteCompany();

  // Open add dialog when navigating with ?action=add
  useEffect(() => {
    if (action === 'add') {
      setAddDialogOpen(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('action');
      router.replace(`/dashboard/companies${params.toString() ? `?${params}` : ''}`);
    }
  }, [action, searchParams, router]);

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = company.name.toLowerCase().includes(query);
        const matchesWebsite = company.website?.toLowerCase().includes(query);
        if (!matchesName && !matchesWebsite) return false;
      }

      // Industry filter
      if (industryFilter !== 'all' && company.industry !== industryFilter) return false;

      // Size filter
      if (sizeFilter !== 'all' && company.size !== sizeFilter) return false;

      return true;
    });
  }, [companies, searchQuery, industryFilter, sizeFilter]);

  const hasFilters = searchQuery || industryFilter !== 'all' || sizeFilter !== 'all';
  const hasCompanies = companies.length > 0;

  const handleSelectCompany = (id: string) => {
    router.push(`/dashboard/companies?company=${id}`);
  };

  const handleCloseDrawer = () => {
    router.push('/dashboard/companies');
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteCompany.mutateAsync(deleteId);
    setDeleteId(null);
    if (selectedCompanyId === deleteId) {
      handleCloseDrawer();
    }
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteCompany.mutateAsync(id);
    }
    setSelectedIds([]);
    setBulkDeleteOpen(false);
  };

  const handleViewLead = (leadId: string) => {
    router.push(`/dashboard/leads?lead=${leadId}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setIndustryFilter('all');
    setSizeFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Companies</h1>
          <p className="text-muted-foreground">
            Track organizations and their details.
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Filters */}
      {hasCompanies && (
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or website..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Industry Filter */}
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {INDUSTRY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Size Filter */}
          <Select value={sizeFilter} onValueChange={setSizeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sizes</SelectItem>
              {SIZE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
      ) : !hasCompanies ? (
        <AnimatedEmptyState
          icon={Building2}
          iconColor="hsl(210, 80%, 55%)"
          title="No companies yet"
          description="Add companies to organize your leads and track business relationships at the organization level."
          actionLabel="Add Your First Company"
          onAction={() => setAddDialogOpen(true)}
        />
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No companies match your filters.</p>
          <Button variant="link" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <CompaniesTable
          companies={filteredCompanies}
          isLoading={isLoading}
          selectedId={selectedCompanyId}
          onSelect={handleSelectCompany}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteId(id)}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      )}

      {/* Add Company Dialog */}
      <AddCompanyDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      {/* Edit Company Dialog */}
      <EditCompanyDialog
        company={editingCompany}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingCompany(null);
        }}
      />

      {/* Company Detail Drawer */}
      <CompanyDetailDrawer
        companyId={selectedCompanyId}
        open={!!selectedCompanyId}
        onClose={handleCloseDrawer}
        onEdit={handleEdit}
        onDelete={(id) => setDeleteId(id)}
        onViewLead={handleViewLead}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the company.
              Note: Associated leads will not be deleted but will no longer be linked to this company.
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
            <AlertDialogTitle>Delete {selectedIds.length} Companies?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected companies. Associated leads will not be deleted but will no longer be linked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedIds.length} Companies
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={<CompaniesPageSkeleton />}>
      <CompaniesPageContent />
    </Suspense>
  );
}
