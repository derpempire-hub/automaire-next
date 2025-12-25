'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateProposal } from '@/hooks/useProposals';
import { useCompanies } from '@/hooks/useCompanies';
import { useLeads } from '@/hooks/useLeads';
import { LineItemsEditor, LineItem } from './LineItemsEditor';

const proposalFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company_id: z.string().optional(),
  lead_id: z.string().optional(),
  notes: z.string().optional(),
  valid_until: z.string().optional(),
  discount_percent: z.number().min(0).max(100),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

interface AddProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCompanyId?: string;
  defaultLeadId?: string;
}

export function AddProposalDialog({
  open,
  onOpenChange,
  defaultCompanyId,
  defaultLeadId,
}: AddProposalDialogProps) {
  const createProposal = useCreateProposal();
  const { data: companies = [] } = useCompanies();
  const { data: leads = [] } = useLeads();
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      title: '',
      company_id: defaultCompanyId || '',
      lead_id: defaultLeadId || '',
      notes: '',
      valid_until: '',
      discount_percent: 0,
    },
  });

  const onSubmit = async (values: ProposalFormValues) => {
    try {
      await createProposal.mutateAsync({
        title: values.title,
        company_id: values.company_id || undefined,
        lead_id: values.lead_id || undefined,
        line_items: lineItems,
        notes: values.notes || undefined,
        valid_until: values.valid_until || undefined,
        discount_percent: values.discount_percent,
      });
      form.reset();
      setLineItems([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create proposal:', error);
    }
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const discount = form.watch('discount_percent') || 0;
  const total = subtotal * (1 - discount / 100);

  const formatCurrency = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Proposal</DialogTitle>
          <DialogDescription>
            Create a new proposal for a client.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Website Development Proposal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lead_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a lead" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leads.map((lead) => (
                          <SelectItem key={lead.id} value={lead.id}>
                            {lead.first_name} {lead.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <FormLabel>Line Items</FormLabel>
              <LineItemsEditor items={lineItems} onChange={setLineItems} />
            </div>

            {/* Discount and Total */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discount_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col justify-end">
                <div className="text-right space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Subtotal: {formatCurrency(subtotal)}
                  </p>
                  {discount > 0 && (
                    <p className="text-sm text-green-600">
                      Discount: -{formatCurrency(subtotal * discount / 100)}
                    </p>
                  )}
                  <p className="text-lg font-semibold">
                    Total: {formatCurrency(total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Valid Until and Notes */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valid_until"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional terms or notes..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createProposal.isPending}>
                {createProposal.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Create Proposal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
