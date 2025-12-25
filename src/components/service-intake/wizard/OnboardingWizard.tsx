'use client';

import { useState, useCallback, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WizardProgress, WizardProgressCompact, WizardStep as WizardStepType } from './WizardProgress';
import { cn } from '@/lib/utils';

export interface OnboardingStep extends WizardStepType {
  component: ReactNode;
  validate?: () => boolean | Promise<boolean>;
  onEnter?: () => void | Promise<void>;
  onLeave?: () => void | Promise<void>;
}

interface OnboardingWizardProps {
  steps: OnboardingStep[];
  onComplete: () => void | Promise<void>;
  onStepChange?: (stepIndex: number) => void;
  initialStep?: number;
  allowSkipToReview?: boolean;
  isSubmitting?: boolean;
  title?: string;
  subtitle?: string;
}

export function OnboardingWizard({
  steps,
  onComplete,
  onStepChange,
  initialStep = 0,
  allowSkipToReview = false,
  isSubmitting = false,
  title,
  subtitle,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isValidating, setIsValidating] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([initialStep]));

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Notify parent of step changes
  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  // Call onEnter when step changes
  useEffect(() => {
    currentStepData?.onEnter?.();
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToStep = useCallback(
    async (stepIndex: number) => {
      if (stepIndex === currentStep) return;
      if (stepIndex < 0 || stepIndex >= steps.length) return;

      // Only allow going to visited steps or the next step
      if (stepIndex > currentStep && !visitedSteps.has(stepIndex)) {
        if (stepIndex !== currentStep + 1) return;
      }

      // Run validation if going forward
      if (stepIndex > currentStep && currentStepData?.validate) {
        setIsValidating(true);
        try {
          const isValid = await currentStepData.validate();
          if (!isValid) {
            setIsValidating(false);
            return;
          }
        } catch {
          setIsValidating(false);
          return;
        }
        setIsValidating(false);
      }

      // Call onLeave for current step
      await currentStepData?.onLeave?.();

      // Update direction for animation
      setDirection(stepIndex > currentStep ? 'forward' : 'backward');

      // Mark new step as visited
      setVisitedSteps((prev) => new Set([...prev, stepIndex]));

      // Change step
      setCurrentStep(stepIndex);
    },
    [currentStep, currentStepData, steps.length, visitedSteps]
  );

  const goNext = useCallback(async () => {
    if (isLastStep) {
      // Validate before completing
      if (currentStepData?.validate) {
        setIsValidating(true);
        try {
          const isValid = await currentStepData.validate();
          if (!isValid) {
            setIsValidating(false);
            return;
          }
        } catch {
          setIsValidating(false);
          return;
        }
        setIsValidating(false);
      }
      await onComplete();
    } else {
      await goToStep(currentStep + 1);
    }
  }, [currentStep, currentStepData, goToStep, isLastStep, onComplete]);

  const goBack = useCallback(async () => {
    if (!isFirstStep) {
      await goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep, isFirstStep]);

  const skipToReview = useCallback(async () => {
    if (!allowSkipToReview) return;
    const lastStepIndex = steps.length - 1;
    await goToStep(lastStepIndex);
  }, [allowSkipToReview, goToStep, steps.length]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          {title && (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
          )}

          {/* Progress - Desktop */}
          <div className="hidden md:block">
            <WizardProgress
              steps={steps}
              currentStep={currentStep}
              onStepClick={goToStep}
              allowNavigation={true}
            />
          </div>

          {/* Progress - Mobile */}
          <div className="md:hidden">
            <WizardProgressCompact steps={steps} currentStep={currentStep} />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="min-h-[400px]">
          {currentStepData?.component}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 border-t bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <Button
              variant="ghost"
              onClick={goBack}
              disabled={isFirstStep || isValidating || isSubmitting}
              className={cn(isFirstStep && 'invisible')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {/* Center actions */}
            <div className="flex items-center gap-2">
              {allowSkipToReview && !isLastStep && currentStep > 0 && (
                <Button
                  variant="link"
                  onClick={skipToReview}
                  disabled={isValidating || isSubmitting}
                  className="text-muted-foreground"
                >
                  Skip to review
                </Button>
              )}
            </div>

            {/* Next/Submit button */}
            <Button
              onClick={goNext}
              disabled={isValidating || isSubmitting}
            >
              {isValidating || isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isSubmitting ? 'Submitting...' : 'Validating...'}
                </>
              ) : isLastStep ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Submit
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </footer>

      {/* Spacer for fixed footer */}
      <div className="h-20" />
    </div>
  );
}

// Hook to manage wizard state externally
export function useWizardState(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const markStepComplete = useCallback((stepIndex: number) => {
    setCompletedSteps((prev) => new Set([...prev, stepIndex]));
  }, []);

  const isStepComplete = useCallback(
    (stepIndex: number) => completedSteps.has(stepIndex),
    [completedSteps]
  );

  const progress = (completedSteps.size / totalSteps) * 100;

  return {
    currentStep,
    setCurrentStep,
    completedSteps,
    markStepComplete,
    isStepComplete,
    progress,
    isComplete: completedSteps.size === totalSteps,
  };
}
