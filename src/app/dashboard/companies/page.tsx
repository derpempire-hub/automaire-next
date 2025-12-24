'use client';

import { useCompanies } from '@/hooks/useCompanies';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Globe, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function CompaniesPage() {
  const { data: companies = [], isLoading } = useCompanies();
  const hasCompanies = companies.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Companies</h1>
          <p className="text-muted-foreground">Track organizations and their details.</p>
        </div>
        {hasCompanies && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !hasCompanies ? (
        <div className="border-2 border-dashed rounded-xl p-12 text-center bg-muted/20">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No companies yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Add companies to organize your leads and track business relationships.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Company
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{company.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{company.industry || '-'}</TableCell>
                  <TableCell>
                    {company.size ? (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {company.size}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Globe className="h-3 w-3" />
                        Visit
                      </a>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(company.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
