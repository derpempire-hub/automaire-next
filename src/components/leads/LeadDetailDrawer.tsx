'use client';

import { Mail, Phone, Building2, Briefcase, Calendar, FileText, Tag, Edit, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { LeadStatusBadge } from './LeadStatusBadge';
import { useLead } from '@/hooks/useLeads';
import type { Lead } from '@/lib/supabase/types';

interface LeadDetailDrawerProps {
  leadId: string | null;
  open: boolean;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
}

export function LeadDetailDrawer({
  leadId,
  open,
  onClose,
  onEdit,
  onDelete,
}: LeadDetailDrawerProps) {
  const { data: lead, isLoading } = useLead(leadId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        {isLoading ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-20" />
            <Separator />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          </div>
        ) : lead ? (
          <>
            <SheetHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="text-xl">
                    {lead.first_name} {lead.last_name}
                  </SheetTitle>
                  <SheetDescription>
                    {lead.job_title || 'No job title'}
                  </SheetDescription>
                </div>
                <LeadStatusBadge status={lead.status} />
              </div>
            </SheetHeader>

            <div className="space-y-6">
              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onEdit(lead)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(lead.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Contact Information
                </h3>

                {lead.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {lead.email}
                    </a>
                  </div>
                )}

                {lead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {lead.phone}
                    </a>
                  </div>
                )}

                {lead.job_title && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.job_title}</span>
                  </div>
                )}

                {(lead as any).companies?.name && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{(lead as any).companies.name}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Source Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Source Information
                </h3>

                {lead.source && (
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{lead.source.replace('_', ' ')}</span>
                  </div>
                )}

                {lead.source_notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm text-muted-foreground">{lead.source_notes}</span>
                  </div>
                )}
              </div>

              {lead.notes && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Notes
                    </h3>
                    <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
                  </div>
                </>
              )}

              <Separator />

              {/* Timestamps */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Activity
                </h3>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">Created: </span>
                    <span>{formatDate(lead.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">Updated: </span>
                    <span>{formatDate(lead.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Lead not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
