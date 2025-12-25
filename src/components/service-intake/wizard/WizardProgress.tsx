'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
}

interface WizardProgressProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  allowNavigation?: boolean;
}

export function WizardProgress({
  steps,
  currentStep,
  onStepClick,
  allowNavigation = false,
}: WizardProgressProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = allowNavigation && (isCompleted || isCurrent);

          return (
            <li
              key={step.id}
              className={cn(
                'relative flex-1',
                index !== steps.length - 1 && 'pr-8 sm:pr-20'
              )}
            >
              {/* Connector line */}
              {index !== steps.length - 1 && (
                <div
                  className="absolute top-4 left-0 -right-4 sm:-right-12 h-0.5 w-full"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      'h-full transition-colors duration-300',
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={cn(
                  'group relative flex flex-col items-center',
                  isClickable && 'cursor-pointer',
                  !isClickable && 'cursor-default'
                )}
              >
                {/* Step circle */}
                <span
                  className={cn(
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-background',
                    !isCompleted && !isCurrent && 'border-muted bg-background',
                    isClickable && 'group-hover:scale-110'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isCurrent ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </span>

                {/* Step label */}
                <span className="mt-2 flex flex-col items-center">
                  <span
                    className={cn(
                      'text-xs font-medium text-center',
                      isCurrent ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-xs text-muted-foreground text-center hidden sm:block">
                      {step.description}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Compact version for mobile
export function WizardProgressCompact({
  steps,
  currentStep,
}: {
  steps: WizardStep[];
  currentStep: number;
}) {
  const currentStepData = steps[currentStep];

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </p>
        <p className="font-medium">{currentStepData?.title}</p>
      </div>
      <div className="flex gap-1">
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1.5 w-6 rounded-full transition-colors',
              index < currentStep && 'bg-primary',
              index === currentStep && 'bg-primary/60',
              index > currentStep && 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
}
