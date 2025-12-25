'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  User,
  Calendar,
  FileText,
  ChevronDown,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useProposal, useUpdateProposalStatus } from '@/hooks/useProposals';
import { ProposalStatusBadge, PROPOSAL_STATUS_OPTIONS } from './ProposalStatusBadge';
import type { Proposal } from '@/lib/supabase/types';
import type { LineItem } from './LineItemsEditor';

interface ProposalDetailDrawerProps {
  proposalId: string | null;
  open: boolean;
  onClose: () => void;
  onEdit: (proposal: Proposal) => void;
}

export function ProposalDetailDrawer({
  proposalId,
  open,
  onClose,
  onEdit,
}: ProposalDetailDrawerProps) {
  const { data: proposal, isLoading } = useProposal(proposalId);
  const updateStatus = useUpdateProposalStatus();

  const formatCurrency = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const handleStatusChange = (status: Proposal['status']) => {
    if (!proposalId) return;
    updateStatus.mutate({ id: proposalId, status });
  };

  // Get line items from proposal
  const lineItems: LineItem[] = Array.isArray(proposal?.line_items)
    ? (proposal.line_items as LineItem[])
    : [];

  // Workflow actions based on current status
  const getWorkflowActions = (status: Proposal['status']) => {
    switch (status) {
      case 'draft':
        return [{ label: 'Send to Client', status: 'sent' as const, icon: Send }];
      case 'sent':
        return [{ label: 'Mark as Viewed', status: 'viewed' as const, icon: Eye }];
      case 'viewed':
        return [
          { label: 'Mark as Accepted', status: 'accepted' as const, icon: CheckCircle },
          { label: 'Mark as Declined', status: 'declined' as const, icon: XCircle },
        ];
      default:
        return [];
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !proposal ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Proposal not found</p>
          </div>
        ) : (
          <>
            <SheetHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <SheetTitle className="text-xl">{proposal.title}</SheetTitle>
                  <ProposalStatusBadge status={proposal.status} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(proposal)}>
                    Edit
                  </Button>
                  {getWorkflowActions(proposal.status).length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" disabled={updateStatus.isPending}>
                          {updateStatus.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              Actions
                              <ChevronDown className="h-4 w-4 ml-1" />
                            </>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {getWorkflowActions(proposal.status).map((action) => (
                          <DropdownMenuItem
                            key={action.status}
                            onClick={() => handleStatusChange(action.status)}
                          >
                            <action.icon className="h-4 w-4 mr-2" />
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </SheetHeader>

            <Separator className="my-6" />

            {/* Details Section */}
            <div className="space-y-6">
              {/* Company and Lead */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Company</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {(proposal as any).companies?.name || 'No company'}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Lead</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {(proposal as any).leads
                        ? `${(proposal as any).leads.first_name} ${(proposal as any).leads.last_name}`
                        : 'No lead'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Valid Until</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {proposal.valid_until
                        ? new Date(proposal.valid_until).toLocaleDateString()
                        : 'No expiry'}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Line Items */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Line Items
                </h3>
                {lineItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No line items</p>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-center w-20">Qty</TableHead>
                          <TableHead className="text-right w-28">Unit Price</TableHead>
                          <TableHead className="text-right w-28">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.unit_price)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.quantity * item.unit_price)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(proposal.subtotal)}</span>
                </div>
                {proposal.discount_percent > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({proposal.discount_percent}%)</span>
                    <span>-{formatCurrency(proposal.subtotal * proposal.discount_percent / 100)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(proposal.total)}</span>
                </div>
              </div>

              {/* Notes */}
              {proposal.notes && (
                <div className="space-y-2">
                  <h3 className="font-medium">Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {proposal.notes}
                  </p>
                </div>
              )}

              {/* Status Change Dropdown */}
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Change Status</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <ProposalStatusBadge status={proposal.status} />
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {PROPOSAL_STATUS_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => handleStatusChange(option.value)}
                        disabled={option.value === proposal.status}
                      >
                        {option.label}
                        {option.value === proposal.status && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            Current
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
