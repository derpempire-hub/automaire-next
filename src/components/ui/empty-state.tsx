import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LucideIcon, Plus, Upload, ArrowRight, 
  Users, Building2, FolderKanban, CheckSquare, 
  FileText, Search, Activity, Sparkles, Zap, Kanban
} from 'lucide-react';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'default' | 'outline' | 'ghost';
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  purpose?: string;
  actions?: EmptyStateAction[];
  tips?: string[];
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  purpose,
  actions = [],
  tips = [],
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8 px-4' : 'py-16 px-6',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'rounded-xl bg-primary/10 flex items-center justify-center mb-4',
            compact ? 'h-10 w-10' : 'h-14 w-14'
          )}
        >
          <Icon
            className={cn(
              'text-primary',
              compact ? 'h-5 w-5' : 'h-7 w-7'
            )}
          />
        </div>
      )}

      <h3
        className={cn(
          'font-semibold text-foreground mb-2',
          compact ? 'text-sm' : 'text-lg'
        )}
      >
        {title}
      </h3>

      {purpose && (
        <p
          className={cn(
            'text-muted-foreground max-w-md mb-2',
            compact ? 'text-xs' : 'text-sm'
          )}
        >
          {purpose}
        </p>
      )}

      <p
        className={cn(
          'text-foreground/80 max-w-sm mb-6 font-medium',
          compact ? 'text-xs' : 'text-sm'
        )}
      >
        {description}
      </p>

      {actions.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          {actions.map((action, index) => {
            const ActionIcon = action.icon || (index === 0 ? Plus : ArrowRight);
            return (
              <Button
                key={action.label}
                variant={action.variant || (index === 0 ? 'default' : 'outline')}
                size={compact ? 'sm' : 'default'}
                onClick={action.onClick}
                className={cn(compact && 'h-8 text-xs')}
              >
                <ActionIcon className={cn(compact ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2')} />
                {action.label}
              </Button>
            );
          })}
        </div>
      )}

      {tips.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          {tips.map((tip) => (
            <span
              key={tip}
              className="text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-muted/50"
            >
              {tip}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Preset empty states for common scenarios
export function LeadsEmptyState({
  onAdd,
  onImport,
  compact = false,
}: {
  onAdd?: () => void;
  onImport?: () => void;
  compact?: boolean;
}) {
  const actions: EmptyStateAction[] = [];
  if (onAdd) {
    actions.push({ label: 'Add Your First Lead', onClick: onAdd, icon: Plus });
  }
  if (onImport) {
    actions.push({ label: 'Import from CSV', onClick: onImport, icon: Upload, variant: 'outline' });
  }

  return (
    <EmptyState
      icon={Users}
      title="Start Building Your Pipeline"
      purpose="Leads are potential customers you want to convert. Track their journey from first contact to closed deal."
      description="Add a lead to begin tracking conversations, schedule follow-ups, and move them through your sales process."
      actions={actions}
      tips={['Keyboard: ⌘N to quickly add', 'Leads auto-link to companies']}
      compact={compact}
    />
  );
}

export function CompaniesEmptyState({
  onAdd,
  compact = false,
}: {
  onAdd?: () => void;
  compact?: boolean;
}) {
  return (
    <EmptyState
      icon={Building2}
      title="Organize by Company"
      purpose="Companies group your leads and contacts by organization, helping you see the full picture of each business relationship."
      description="Add a company to start tracking all interactions with that organization in one place."
      actions={onAdd ? [{ label: 'Add Company', onClick: onAdd }] : []}
      tips={['Companies are auto-created with leads', 'Track multiple contacts per company']}
      compact={compact}
    />
  );
}

export function ProjectsEmptyState({
  onAdd,
  compact = false,
}: {
  onAdd?: () => void;
  compact?: boolean;
}) {
  return (
    <EmptyState
      icon={FolderKanban}
      title="Deliver Great Work"
      purpose="Projects track the work you do for clients after they say yes. Manage milestones, assets, and deliverables in one place."
      description="Create a project when a deal closes to start tracking deliverables and keeping clients happy."
      actions={onAdd ? [{ label: 'Create Project', onClick: onAdd }] : []}
      tips={['Link projects to proposals', 'Track milestones and deadlines']}
      compact={compact}
    />
  );
}

export function TasksEmptyState({
  onAdd,
  compact = false,
}: {
  onAdd?: () => void;
  compact?: boolean;
}) {
  return (
    <EmptyState
      icon={CheckSquare}
      title="Stay on Top of Follow-ups"
      purpose="Tasks are your to-do list for sales activities: calls to make, emails to send, and deadlines to meet."
      description="Create a task to remind yourself of the next action for any lead or project."
      actions={onAdd ? [{ label: 'Add Task', onClick: onAdd }] : []}
      tips={['Link tasks to leads', 'Set due dates for reminders']}
      compact={compact}
    />
  );
}

export function ProposalsEmptyState({
  onAdd,
  compact = false,
}: {
  onAdd?: () => void;
  compact?: boolean;
}) {
  return (
    <EmptyState
      icon={FileText}
      title="Close More Deals"
      purpose="Proposals are professional quotes you send to qualified leads. Track when they view, accept, or need follow-up."
      description="Create a proposal when a lead is ready to see pricing and scope."
      actions={onAdd ? [{ label: 'Create Proposal', onClick: onAdd }] : []}
      tips={['Shareable link for clients', 'Track views in real-time']}
      compact={compact}
    />
  );
}

export function PipelineEmptyState({
  onAddLead,
  compact = false,
}: {
  onAddLead?: () => void;
  compact?: boolean;
}) {
  return (
    <EmptyState
      icon={Kanban}
      title="Visualize Your Sales Flow"
      purpose="The pipeline shows where every lead stands in your sales process, from first contact to closed deal."
      description="Add leads to see them move through stages as you work deals forward."
      actions={onAddLead ? [{ label: 'Add Your First Lead', onClick: onAddLead }] : []}
      tips={['Drag leads between stages', 'Focus on moving deals forward']}
      compact={compact}
    />
  );
}

export function AutomationEmptyState({
  onSetup,
  compact = false,
}: {
  onSetup?: () => void;
  compact?: boolean;
}) {
  return (
    <EmptyState
      icon={Zap}
      title="Work Smarter, Not Harder"
      purpose="Automations run tasks automatically: send follow-up emails, update statuses, or trigger webhooks based on events."
      description="Set up your first automation to eliminate repetitive work."
      actions={onSetup ? [{ label: 'Create Automation', onClick: onSetup }] : []}
      tips={['Trigger on status changes', 'Connect to external tools']}
      compact={compact}
    />
  );
}

export function SearchEmptyState({
  query,
  onClear,
  compact = false,
}: {
  query: string;
  onClear?: () => void;
  compact?: boolean;
}) {
  return (
    <EmptyState
      icon={Search}
      title="No Matches Found"
      purpose={`We searched everywhere but couldn't find anything matching "${query}".`}
      description="Try a different search term, check for typos, or clear the filter to see all results."
      actions={onClear ? [{ label: 'Clear Search', onClick: onClear, variant: 'outline' }] : []}
      compact={compact}
    />
  );
}

export function ActivityEmptyState({ compact = false }: { compact?: boolean }) {
  return (
    <EmptyState
      icon={Activity}
      title="Activity Starts Here"
      purpose="This timeline shows all interactions: calls logged, emails sent, status changes, and notes added."
      description="Start working with leads to see your activity history build up."
      compact={compact}
    />
  );
}

// Welcome/Onboarding card for first-time users
interface WelcomeCardProps {
  userName?: string;
  steps?: { label: string; completed: boolean; onClick?: () => void }[];
  onDismiss?: () => void;
}

export function WelcomeCard({ userName, steps, onDismiss }: WelcomeCardProps) {
  const defaultSteps = steps || [
    { label: 'Add your first lead', completed: false },
    { label: 'Create a proposal', completed: false },
    { label: 'Win your first deal', completed: false },
  ];

  const completedCount = defaultSteps.filter(s => s.completed).length;
  const progress = (completedCount / defaultSteps.length) * 100;

  return (
    <div className="relative border border-border/50 rounded-lg p-6 bg-gradient-to-br from-primary/5 to-transparent">
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-xs"
        >
          Dismiss
        </button>
      )}
      
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold mb-1">
            Welcome{userName ? `, ${userName}` : ''}!
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by completing these quick steps to set up your workspace.
          </p>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Setup progress</span>
              <span className="font-medium">{completedCount}/{defaultSteps.length}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {defaultSteps.map((step, i) => (
              <button
                key={i}
                onClick={step.onClick}
                className={cn(
                  'flex items-center gap-2 text-sm w-full text-left py-1 transition-colors',
                  step.completed 
                    ? 'text-muted-foreground line-through' 
                    : 'text-foreground hover:text-primary',
                  step.onClick && 'cursor-pointer'
                )}
              >
                <div className={cn(
                  'h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0',
                  step.completed 
                    ? 'bg-primary border-primary' 
                    : 'border-border'
                )}>
                  {step.completed && (
                    <svg className="h-2.5 w-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {step.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
