'use client';

import { useTasks, useUpdateTaskStatus } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare, Clock, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export default function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const updateStatus = useUpdateTaskStatus();
  const hasTasks = tasks.length > 0;

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const handleToggleTask = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    updateStatus.mutate({ id, status: newStatus as 'pending' | 'completed' | 'cancelled' });
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

  const isOverdue = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date(new Date().toDateString());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-muted-foreground">Manage your to-dos and follow-ups.</p>
        </div>
        {hasTasks && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !hasTasks ? (
        <div className="border-2 border-dashed rounded-xl p-12 text-center bg-muted/20">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Create tasks to track your to-dos and follow-ups.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Task
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
                  <div key={task.id} className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                    <Checkbox
                      checked={false}
                      onCheckedChange={() => handleToggleTask(task.id, task.status)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {task.due_date && (
                          <span
                            className={cn(
                              'flex items-center gap-1',
                              isOverdue(task.due_date) && 'text-red-500'
                            )}
                          >
                            <Clock className="h-3 w-3" />
                            {formatDueDate(task.due_date, task.due_time)}
                            {isOverdue(task.due_date) && (
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
                  </div>
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
                  <div key={task.id} className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50">
                    <Checkbox
                      checked={true}
                      onCheckedChange={() => handleToggleTask(task.id, task.status)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-through text-muted-foreground">{task.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
