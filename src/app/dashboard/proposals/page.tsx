'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProposals, useDeleteProposal } from '@/hooks/useProposals';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Search,
  Filter,
  X,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { AnimatedEmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  ProposalStatusBadge,
  PROPOSAL_STATUS_OPTIONS,
  AddProposalDialog,
  EditProposalDialog,
  ProposalDetailDrawer,
} from '@/components/proposals';
import type { Proposal } from '@/lib/supabase/types';

type SortField = 'title' | 'total' | 'created_at' | 'valid_until';
type SortDirection = 'asc' | 'desc';

function ProposalsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

function ProposalsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const selectedProposalId = searchParams.get('proposal');

  const { data: proposals = [], isLoading } = useProposals();
  const deleteProposal = useDeleteProposal();

  // State
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Open add dialog when navigating with ?action=add
  useEffect(() => {
    if (action === 'add') {
      setAddDialogOpen(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('action');
      router.replace(`/dashboard/proposals${params.toString() ? `?${params}` : ''}`);
    }
  }, [action, searchParams, router]);

  // Filter and sort proposals
  const filteredProposals = useMemo(() => {
    let filtered = proposals.filter((proposal) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = proposal.title.toLowerCase().includes(query);
        const matchesCompany = (proposal as any).companies?.name?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCompany) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && proposal.status !== statusFilter) return false;

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'total':
          comparison = a.total - b.total;
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'valid_until':
          const aDate = a.valid_until ? new Date(a.valid_until).getTime() : 0;
          const bDate = b.valid_until ? new Date(b.valid_until).getTime() : 0;
          comparison = aDate - bDate;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [proposals, searchQuery, statusFilter, sortField, sortDirection]);

  const hasFilters = searchQuery || statusFilter !== 'all';
  const hasProposals = proposals.length > 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const handleSelectProposal = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('proposal', id);
    router.push(`/dashboard/proposals?${params}`);
  };

  const handleCloseDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('proposal');
    router.push(`/dashboard/proposals${params.toString() ? `?${params}` : ''}`);
  };

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setEditDialogOpen(true);
    handleCloseDrawer();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteProposal.mutateAsync(deleteId);
    setDeleteId(null);
    handleCloseDrawer();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const formatCurrency = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Proposals</h1>
          <p className="text-muted-foreground">Create and track client proposals.</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Proposal
        </Button>
      </div>

      {/* Filters */}
      {hasProposals && (
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search proposals..."
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
              {PROPOSAL_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
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

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !hasProposals ? (
        <AnimatedEmptyState
          icon={FileText}
          iconColor="hsl(340, 80%, 55%)"
          title="No proposals yet"
          description="Create professional proposals to win more deals. Track status and get notified when they're viewed."
          actionLabel="Create Your First Proposal"
          onAction={() => setAddDialogOpen(true)}
        />
      ) : filteredProposals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No proposals match your filters.</p>
          <Button variant="link" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('title')}
                  >
                    Proposal
                    <SortIcon field="title" />
                  </Button>
                </TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('total')}
                  >
                    Total
                    <SortIcon field="total" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('valid_until')}
                  >
                    Valid Until
                    <SortIcon field="valid_until" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('created_at')}
                  >
                    Created
                    <SortIcon field="created_at" />
                  </Button>
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProposals.map((proposal) => (
                <TableRow
                  key={proposal.id}
                  className={cn(
                    'cursor-pointer hover:bg-muted/50',
                    selectedProposalId === proposal.id && 'bg-muted/50'
                  )}
                  onClick={() => handleSelectProposal(proposal.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{proposal.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(proposal as any).companies?.name ? (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        {(proposal as any).companies.name}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <ProposalStatusBadge status={proposal.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-medium">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      {formatCurrency(proposal.total)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {proposal.valid_until ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(proposal.valid_until).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(proposal.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSelectProposal(proposal.id); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(proposal); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => { e.stopPropagation(); setDeleteId(proposal.id); }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Proposal Dialog */}
      <AddProposalDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      {/* Edit Proposal Dialog */}
      <EditProposalDialog
        proposal={editingProposal}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingProposal(null);
        }}
      />

      {/* Proposal Detail Drawer */}
      <ProposalDetailDrawer
        proposalId={selectedProposalId}
        open={!!selectedProposalId}
        onClose={handleCloseDrawer}
        onEdit={handleEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Proposal?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the proposal.
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

export default function ProposalsPage() {
  return (
    <Suspense fallback={<ProposalsPageSkeleton />}>
      <ProposalsPageContent />
    </Suspense>
  );
}
