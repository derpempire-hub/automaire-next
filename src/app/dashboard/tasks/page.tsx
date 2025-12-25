'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTasks, useUpdateTaskStatus, useDeleteTask } from '@/hooks/useTasks';
import { useLeads } from '@/hooks/useLeads';
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
import { Plus, CheckSquare, Clock, User, Search, Filter, X, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { AnimatedEmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { AddTaskDialog, EditTaskDialog } from '@/components/tasks';
import type { Task } from '@/lib/supabase/types';

function TasksPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

function TasksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');

  const { data: tasks = [], isLoading } = useTasks();
  const { data: leads = [] } = useLeads();
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  // State
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leadFilter, setLeadFilter] = useState<string>('all');

  // Open add dialog when navigating with ?action=add
  useEffect(() => {
    if (action === 'add') {
      setAddDialogOpen(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('action');
      router.replace(`/dashboard/tasks${params.toString() ? `?${params}` : ''}`);
    }
  }, [action, searchParams, router]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;

      // Lead filter
      if (leadFilter !== 'all' && task.lead_id !== leadFilter) return false;

      return true;
    });
  }, [tasks, searchQuery, statusFilter, leadFilter]);

  const pendingTasks = filteredTasks.filter((t) => t.status === 'pending');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');
  const cancelledTasks = filteredTasks.filter((t) => t.status === 'cancelled');

  const hasFilters = searchQuery || statusFilter !== 'all' || leadFilter !== 'all';
  const hasTasks = tasks.length > 0;

  const handleToggleTask = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    updateStatus.mutate({ id, status: newStatus as Task['status'] });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteTask.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setLeadFilter('all');
  };

  const formatDueDate = (date: string | null, time: string | null) => {
    if (!date) return null;
    const d = new Date(date);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (time) {
      return `${dateStr} at ${time}`;
    }
    return dateStr;
  };

  const isOverdue = (date: string | null, status: string) => {
    if (!date || status === 'completed' || status === 'cancelled') return false;
    return new Date(date) < new Date(new Date().toDateString());
  };

  const TaskCard = ({ task }: { task: Task & { leads?: { first_name: string; last_name: string } | null } }) => (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border bg-card group",
      task.status === 'completed' && "bg-muted/50",
      task.status === 'cancelled' && "bg-muted/30 opacity-60"
    )}>
      <Checkbox
        checked={task.status === 'completed'}
        disabled={task.status === 'cancelled'}
        onCheckedChange={() => handleToggleTask(task.id, task.status)}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium",
          task.status === 'completed' && "line-through text-muted-foreground",
          task.status === 'cancelled' && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>
        {task.description && task.status !== 'completed' && task.status !== 'cancelled' && (
          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {task.due_date && (
            <span
              className={cn(
                'flex items-center gap-1',
                isOverdue(task.due_date, task.status) && 'text-red-500'
              )}
            >
              <Clock className="h-3 w-3" />
              {formatDueDate(task.due_date, task.due_time)}
              {isOverdue(task.due_date, task.status) && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  Overdue
                </Badge>
              )}
            </span>
          )}
          {task.leads && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {task.leads.first_name} {task.leads.last_name}
            </span>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEdit(task)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteId(task.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-muted-foreground">Manage your to-dos and follow-ups.</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      {hasTasks && (
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Lead Filter */}
          {leads.length > 0 && (
            <Select value={leadFilter} onValueChange={setLeadFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leads</SelectItem>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.first_name} {lead.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

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
      ) : !hasTasks ? (
        <AnimatedEmptyState
          icon={CheckSquare}
          iconColor="hsl(38, 80%, 50%)"
          title="No tasks yet"
          description="Stay organized by creating tasks. Set due dates, priorities, and never miss a follow-up."
          actionLabel="Add Your First Task"
          onAction={() => setAddDialogOpen(true)}
        />
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks match your filters.</p>
          <Button variant="link" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingTasks.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Pending ({pendingTasks.length})
              </h2>
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Completed ({completedTasks.length})
              </h2>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {cancelledTasks.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Cancelled ({cancelledTasks.length})
              </h2>
              <div className="space-y-2">
                {cancelledTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={editingTask}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingTask(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
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

export default function TasksPage() {
  return (
    <Suspense fallback={<TasksPageSkeleton />}>
      <TasksPageContent />
    </Suspense>
  );
}
