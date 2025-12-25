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
  ChevronDown,
  Play,
  Pause,
  CheckCircle,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { useProject, useUpdateProjectStatus } from '@/hooks/useProjects';
import { ProjectStatusBadge, PROJECT_STATUS_OPTIONS } from './ProjectStatusBadge';
import type { Project } from '@/lib/supabase/types';

interface ProjectDetailDrawerProps {
  projectId: string | null;
  open: boolean;
  onClose: () => void;
  onEdit: (project: Project) => void;
}

export function ProjectDetailDrawer({
  projectId,
  open,
  onClose,
  onEdit,
}: ProjectDetailDrawerProps) {
  const { data: project, isLoading } = useProject(projectId);
  const updateStatus = useUpdateProjectStatus();

  const handleStatusChange = (status: Project['status']) => {
    if (!projectId) return;
    updateStatus.mutate({ id: projectId, status });
  };

  // Workflow actions based on current status
  const getWorkflowActions = (status: Project['status']) => {
    switch (status) {
      case 'not_started':
        return [{ label: 'Start Project', status: 'in_progress' as const, icon: Play }];
      case 'in_progress':
        return [
          { label: 'Move to Review', status: 'review' as const, icon: RotateCcw },
          { label: 'Put on Hold', status: 'on_hold' as const, icon: Pause },
        ];
      case 'review':
        return [
          { label: 'Mark Completed', status: 'completed' as const, icon: CheckCircle },
          { label: 'Back to In Progress', status: 'in_progress' as const, icon: RotateCcw },
        ];
      case 'on_hold':
        return [{ label: 'Resume Project', status: 'in_progress' as const, icon: Play }];
      case 'completed':
        return [{ label: 'Reopen Project', status: 'in_progress' as const, icon: RotateCcw }];
      default:
        return [];
    }
  };

  // Calculate duration
  const getDuration = () => {
    if (!project?.start_date) return null;
    const start = new Date(project.start_date);
    const end = project.target_date ? new Date(project.target_date) : new Date();
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const isOverdue = () => {
    if (!project?.target_date || project.status === 'completed') return false;
    return new Date(project.target_date) < new Date();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !project ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Project not found</p>
          </div>
        ) : (
          <>
            <SheetHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <SheetTitle className="text-xl">{project.title}</SheetTitle>
                  <ProjectStatusBadge status={project.status} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(project)}>
                    Edit
                  </Button>
                  {getWorkflowActions(project.status).length > 0 && (
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
                        {getWorkflowActions(project.status).map((action) => (
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
              {/* Description */}
              {project.description && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="text-sm whitespace-pre-wrap">{project.description}</p>
                </div>
              )}

              {/* Company and Lead */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Company</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {(project as any).companies?.name || 'No company'}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Lead</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {(project as any).leads
                        ? `${(project as any).leads.first_name} ${(project as any).leads.last_name}`
                        : 'No lead'}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Timeline</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {project.start_date
                          ? new Date(project.start_date).toLocaleDateString()
                          : 'Not set'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Target Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className={isOverdue() ? 'text-red-500 font-medium' : ''}>
                        {project.target_date
                          ? new Date(project.target_date).toLocaleDateString()
                          : 'Not set'}
                      </span>
                      {isOverdue() && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {getDuration() !== null && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Duration: </span>
                      <span className="font-medium">{getDuration()} days</span>
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Created/Updated */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Created</p>
                  <p>{new Date(project.created_at).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Last Updated</p>
                  <p>{new Date(project.updated_at).toLocaleDateString()}</p>
                </div>
              </div>

              <Separator />

              {/* Status Change Dropdown */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Change Status</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <ProjectStatusBadge status={project.status} />
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {PROJECT_STATUS_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => handleStatusChange(option.value)}
                        disabled={option.value === project.status}
                      >
                        {option.label}
                        {option.value === project.status && (
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
