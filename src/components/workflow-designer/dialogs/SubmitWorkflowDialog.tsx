'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Loader2,
  Send,
  Zap,
  GitBranch,
  Bot,
  PlayCircle,
} from 'lucide-react';
import { validateWorkflow, getWorkflowStats, type ValidationResult } from '@/lib/workflow/validation';
import type { WorkflowNode, WorkflowEdge } from '@/lib/workflow/types';

interface SubmitWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  workflowName: string;
  onSubmit: (notes: string, priority: string) => Promise<void>;
}

export function SubmitWorkflowDialog({
  open,
  onOpenChange,
  nodes,
  edges,
  workflowName,
  onSubmit,
}: SubmitWorkflowDialogProps) {
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate workflow
  const validation: ValidationResult = useMemo(
    () => validateWorkflow(nodes, edges),
    [nodes, edges]
  );

  // Get workflow stats
  const stats = useMemo(() => getWorkflowStats(nodes, edges), [nodes, edges]);

  const handleSubmit = async () => {
    if (!validation.isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(notes, priority);
      onOpenChange(false);
      setNotes('');
      setPriority('normal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Submit Workflow for Review
          </DialogTitle>
          <DialogDescription>
            Submit &ldquo;{workflowName}&rdquo; to the Automaire team for implementation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Validation Summary */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Validation Status</span>
              {validation.isValid ? (
                <Badge variant="default" className="gap-1">
                  <Check className="h-3 w-3" />
                  Ready to Submit
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validation.errors.length} Error{validation.errors.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded bg-background">
                <PlayCircle className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                <p className="text-lg font-semibold">{stats.triggers}</p>
                <p className="text-[10px] text-muted-foreground">Triggers</p>
              </div>
              <div className="p-2 rounded bg-background">
                <Zap className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                <p className="text-lg font-semibold">{stats.actions}</p>
                <p className="text-[10px] text-muted-foreground">Actions</p>
              </div>
              <div className="p-2 rounded bg-background">
                <GitBranch className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                <p className="text-lg font-semibold">{stats.logic}</p>
                <p className="text-[10px] text-muted-foreground">Logic</p>
              </div>
              <div className="p-2 rounded bg-background">
                <Bot className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                <p className="text-lg font-semibold">{stats.ai}</p>
                <p className="text-[10px] text-muted-foreground">AI Steps</p>
              </div>
            </div>

            {/* Errors & Warnings */}
            {(validation.errors.length > 0 || validation.warnings.length > 0) && (
              <>
                <Separator />
                <ScrollArea className="max-h-32">
                  <div className="space-y-2">
                    {validation.errors.map((error, i) => (
                      <div
                        key={`error-${i}`}
                        className="flex items-start gap-2 text-sm text-destructive"
                      >
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{error.message}</span>
                      </div>
                    ))}
                    {validation.warnings.map((warning, i) => (
                      <div
                        key={`warning-${i}`}
                        className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-500"
                      >
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{warning.message}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - No rush</SelectItem>
                <SelectItem value="normal">Normal - Standard turnaround</SelectItem>
                <SelectItem value="high">High - Expedited review</SelectItem>
                <SelectItem value="urgent">Urgent - ASAP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Implementation Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any specific requirements, context, or instructions for the implementation team..."
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Include any details that would help with implementation, such as business logic,
              external integrations, or timing requirements.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!validation.isValid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit for Review
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
