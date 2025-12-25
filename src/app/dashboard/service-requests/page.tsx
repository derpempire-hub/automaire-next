'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Globe, MessageSquare, Phone, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Card, CardContent } from '@/components/ui/card';
import {
  ServiceRequestCard,
  ServiceRequestsEmptyState,
} from '@/components/service-intake/ServiceRequestCard';
import {
  useServiceRequests,
  useCreateServiceRequest,
  useDeleteServiceRequest,
} from '@/hooks/useServiceRequests';
import type { ServiceType, ServiceRequestStatus } from '@/types/service-intake';

const SERVICE_OPTIONS: Array<{
  type: ServiceType;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    type: 'website',
    label: 'Custom Website',
    description: 'High-performance website custom-designed for your brand',
    icon: <Globe className="h-5 w-5" />,
  },
  {
    type: 'chatbot',
    label: 'AI Chatbot',
    description: 'Intelligent chat agent trained on your business data',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    type: 'voice_agent',
    label: 'Voice Agent',
    description: 'Human-grade AI for handling inbound/outbound calls',
    icon: <Phone className="h-5 w-5" />,
  },
];

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'in_review', label: 'In Review' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending_info', label: 'Pending Info' },
  { value: 'completed', label: 'Completed' },
];

export default function ServiceRequestsPage() {
  const router = useRouter();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: requests = [], isLoading } = useServiceRequests();
  const createRequest = useCreateServiceRequest();
  const deleteRequest = useDeleteServiceRequest();

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    if (statusFilter !== 'all' && request.status !== statusFilter) return false;
    if (typeFilter !== 'all' && request.service_type !== typeFilter) return false;
    return true;
  });

  const handleCreateNew = async (serviceType: ServiceType) => {
    setShowNewDialog(false);
    try {
      const newRequest = await createRequest.mutateAsync({
        service_type: serviceType,
      });
      router.push(`/dashboard/service-requests/${newRequest.id}`);
    } catch (error) {
      console.error('Failed to create request:', error);
    }
  };

  const handleView = (id: string) => {
    router.push(`/dashboard/service-requests/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/service-requests/${id}?edit=true`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteRequest.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Service Requests</h1>
          <p className="text-muted-foreground">
            Manage your project requests and submissions.
          </p>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="chatbot">Chatbot</SelectItem>
            <SelectItem value="voice_agent">Voice Agent</SelectItem>
          </SelectContent>
        </Select>

        {(statusFilter !== 'all' || typeFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('all');
              setTypeFilter('all');
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        requests.length === 0 ? (
          <ServiceRequestsEmptyState onCreateNew={() => setShowNewDialog(true)} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No requests match your filters.
            </p>
            <Button
              variant="link"
              onClick={() => {
                setStatusFilter('all');
                setTypeFilter('all');
              }}
            >
              Clear filters
            </Button>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <ServiceRequestCard
              key={request.id}
              request={request}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* New Request Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Service Request</DialogTitle>
            <DialogDescription>
              Choose the type of service you need.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {SERVICE_OPTIONS.map((service) => (
              <button
                key={service.type}
                onClick={() => handleCreateNew(service.type)}
                disabled={createRequest.isPending}
                className="flex items-start gap-4 w-full p-4 rounded-lg border hover:bg-accent text-left transition-colors disabled:opacity-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {service.icon}
                </div>
                <div>
                  <h3 className="font-medium">{service.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              draft request and all associated files.
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
