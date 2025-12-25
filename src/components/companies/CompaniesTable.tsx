'use client';

import { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Globe,
  Users,
  Building2,
} from 'lucide-react';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { Company } from '@/lib/supabase/types';

type CompanyWithLeadCount = Company & { lead_count?: number };

type SortField = 'name' | 'industry' | 'size' | 'created_at';
type SortDirection = 'asc' | 'desc';

interface CompaniesTableProps {
  companies: CompanyWithLeadCount[];
  isLoading: boolean;
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function CompaniesTable({
  companies,
  isLoading,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  selectedIds = [],
  onSelectionChange,
}: CompaniesTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCompanies = useMemo(() => {
    return [...companies].sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'industry':
          compareValue = (a.industry || '').localeCompare(b.industry || '');
          break;
        case 'size':
          compareValue = (a.size || '').localeCompare(b.size || '');
          break;
        case 'created_at':
          compareValue =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });
  }, [companies, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const toggleSelectAll = () => {
    if (!onSelectionChange) return;
    if (selectedIds.length === companies.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(companies.map((c) => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {onSelectionChange && (
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    companies.length > 0 && selectedIds.length === companies.length
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
            )}
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 font-semibold"
                onClick={() => handleSort('name')}
              >
                Company
                <SortIcon field="name" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 font-semibold"
                onClick={() => handleSort('industry')}
              >
                Industry
                <SortIcon field="industry" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 font-semibold"
                onClick={() => handleSort('size')}
              >
                Size
                <SortIcon field="size" />
              </Button>
            </TableHead>
            <TableHead>Website</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 font-semibold"
                onClick={() => handleSort('created_at')}
              >
                Created
                <SortIcon field="created_at" />
              </Button>
            </TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCompanies.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={onSelectionChange ? 7 : 6}
                className="h-24 text-center text-muted-foreground"
              >
                No companies found.
              </TableCell>
            </TableRow>
          ) : (
            sortedCompanies.map((company) => (
              <TableRow
                key={company.id}
                className={`cursor-pointer hover:bg-muted/50 ${
                  selectedId === company.id ? 'bg-muted/50' : ''
                }`}
                onClick={() => onSelect(company.id)}
              >
                {onSelectionChange && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(company.id)}
                      onCheckedChange={() => toggleSelect(company.id)}
                      aria-label={`Select ${company.name}`}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{company.name}</span>
                    {company.lead_count !== undefined && company.lead_count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {company.lead_count} lead{company.lead_count !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="capitalize">
                  {company.industry?.replace('_', ' ') || '-'}
                </TableCell>
                <TableCell>
                  {company.size ? (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{company.size}</span>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Globe className="h-3 w-3" />
                      <span className="text-sm">Visit</span>
                    </a>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(company.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onSelect(company.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(company)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {company.website && (
                        <DropdownMenuItem asChild>
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            Visit Website
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(company.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
