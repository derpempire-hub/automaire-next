'use client';

import { Globe, Users, Briefcase, Calendar, FileText, Edit, Trash2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useCompanyWithLeads } from '@/hooks/useCompanies';
import type { Company, Lead } from '@/lib/supabase/types';

interface CompanyDetailDrawerProps {
  companyId: string | null;
  open: boolean;
  onClose: () => void;
  onEdit: (company: Company) => void;
  onDelete: (companyId: string) => void;
  onViewLead?: (leadId: string) => void;
}

export function CompanyDetailDrawer({
  companyId,
  open,
  onClose,
  onEdit,
  onDelete,
  onViewLead,
}: CompanyDetailDrawerProps) {
  const { data, isLoading } = useCompanyWithLeads(companyId);
  const company = data as (Company & { leads: Lead[] }) | null;

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
            <Separator />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          </div>
        ) : company ? (
          <>
            <SheetHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="text-xl">{company.name}</SheetTitle>
                  <SheetDescription>
                    {company.industry
                      ? company.industry.charAt(0).toUpperCase() + company.industry.slice(1).replace('_', ' ')
                      : 'No industry specified'}
                  </SheetDescription>
                </div>
                {company.leads && company.leads.length > 0 && (
                  <Badge variant="secondary">
                    {company.leads.length} lead{company.leads.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </SheetHeader>

            <div className="space-y-6">
              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onEdit(company)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(company.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Company Details
                </h3>

                {company.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                {company.industry && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{company.industry.replace('_', ' ')}</span>
                  </div>
                )}

                {company.size && (
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{company.size} employees</span>
                  </div>
                )}
              </div>

              {company.notes && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Notes
                    </h3>
                    <p className="text-sm whitespace-pre-wrap">{company.notes}</p>
                  </div>
                </>
              )}

              {/* Associated Leads */}
              {company.leads && company.leads.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Associated Leads ({company.leads.length})
                    </h3>
                    <div className="space-y-2">
                      {company.leads.map((lead) => (
                        <div
                          key={lead.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => onViewLead?.(lead.id)}
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {lead.first_name} {lead.last_name}
                            </p>
                            {lead.email && (
                              <p className="text-xs text-muted-foreground">{lead.email}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {lead.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
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
                    <span>{formatDate(company.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">Updated: </span>
                    <span>{formatDate(company.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Company not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
