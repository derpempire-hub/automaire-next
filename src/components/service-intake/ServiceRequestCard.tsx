'use client';

import { formatDistanceToNow } from 'date-fns';
import { Globe, MessageSquare, Phone, MoreVertical, Trash2, Eye, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ServiceRequestStatusBadge } from './ServiceRequestStatusBadge';
import type { ServiceRequest, ServiceType } from '@/types/service-intake';
import { cn } from '@/lib/utils';

const SERVICE_ICONS: Record<ServiceType, React.ReactNode> = {
  website: <Globe className="h-5 w-5" />,
  chatbot: <MessageSquare className="h-5 w-5" />,
  voice_agent: <Phone className="h-5 w-5" />,
};

const SERVICE_COLORS: Record<ServiceType, string> = {
  website: 'bg-blue-500',
  chatbot: 'bg-purple-500',
  voice_agent: 'bg-green-500',
};

const SERVICE_LABELS: Record<ServiceType, string> = {
  website: 'Website',
  chatbot: 'Chatbot',
  voice_agent: 'Voice Agent',
};

interface ServiceRequestCardProps {
  request: ServiceRequest;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function ServiceRequestCard({
  request,
  onView,
  onEdit,
  onDelete,
  className,
}: ServiceRequestCardProps) {
  const canEdit = request.status === 'draft';
  const canDelete = request.status === 'draft';

  return (
    <Card
      className={cn(
        'group hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
      onClick={() => onView(request.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Service Icon */}
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg text-white flex-shrink-0',
              SERVICE_COLORS[request.service_type]
            )}
          >
            {SERVICE_ICONS[request.service_type]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium truncate">{request.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {SERVICE_LABELS[request.service_type]}
                  </span>
                  {request.business_name && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {request.business_name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <ServiceRequestStatusBadge status={request.status} />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(request.id);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>

                    {canEdit && onEdit && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(request.id);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}

                    {canDelete && onDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(request.id);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Timestamps */}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span>
                Created {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </span>
              {request.submitted_at && (
                <span>
                  Submitted {formatDistanceToNow(new Date(request.submitted_at), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Empty State Component
// ============================================

interface ServiceRequestsEmptyStateProps {
  onCreateNew: () => void;
}

export function ServiceRequestsEmptyState({
  onCreateNew,
}: ServiceRequestsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Globe className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">No service requests yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        Start a new project request to get your website, chatbot, or voice agent built.
      </p>
      <Button onClick={onCreateNew} className="mt-4">
        Create New Request
      </Button>
    </div>
  );
}
