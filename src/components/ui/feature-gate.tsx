import { ReactNode } from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FeatureGateProps {
  /** Whether the feature is enabled for this user */
  isEnabled: boolean;
  /** How to handle the locked state: hide completely, disable with tooltip, or show locked UI */
  behavior?: 'hide' | 'disable' | 'show';
  /** The feature name for display purposes */
  featureName?: string;
  /** Why the feature is locked */
  reason?: string;
  /** What tier/plan unlocks this feature */
  requiredTier?: string;
  /** Show upgrade CTA */
  showUpgrade?: boolean;
  /** Custom upgrade action */
  onUpgrade?: () => void;
  /** Show request access option */
  showRequestAccess?: boolean;
  /** Custom request access action */
  onRequestAccess?: () => void;
  /** The content to render when enabled */
  children: ReactNode;
  /** Optional className for the wrapper */
  className?: string;
  /** For inline elements (buttons, links) - shows tooltip on hover */
  inline?: boolean;
}

export function FeatureGate({
  isEnabled,
  behavior = 'hide',
  featureName = 'This feature',
  reason,
  requiredTier,
  showUpgrade = true,
  onUpgrade,
  showRequestAccess = false,
  onRequestAccess,
  children,
  className,
  inline = false,
}: FeatureGateProps) {
  // If enabled, just render children
  if (isEnabled) {
    return <>{children}</>;
  }

  // Hide behavior - render nothing
  if (behavior === 'hide') {
    return null;
  }

  // Disable behavior - show disabled content with tooltip
  if (behavior === 'disable') {
    const disabledContent = (
      <div 
        className={cn(
          "opacity-50 pointer-events-none select-none",
          className
        )}
        aria-disabled="true"
      >
        {children}
      </div>
    );

    if (inline) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block cursor-not-allowed">
              {disabledContent}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="flex items-center gap-2">
              <Lock className="h-3 w-3 text-muted-foreground" />
              <span>
                {reason || `${featureName} requires ${requiredTier || 'an upgrade'}`}
              </span>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-not-allowed">
            {disabledContent}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="flex items-center gap-2">
            <Lock className="h-3 w-3 text-muted-foreground" />
            <span>
              {reason || `${featureName} requires ${requiredTier || 'an upgrade'}`}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Show behavior - render locked state UI
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-8 px-6 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        
        <h3 className="font-semibold text-lg mb-2">
          {featureName}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 max-w-sm">
          {reason || (
            requiredTier 
              ? `This feature is available on the ${requiredTier} plan and above.`
              : 'This feature is not available on your current plan.'
          )}
        </p>

        <div className="flex flex-wrap gap-2 justify-center">
          {showUpgrade && (
            <Button 
              onClick={onUpgrade || (() => window.location.href = '/pricing')}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Upgrade Plan
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          
          {showRequestAccess && (
            <Button 
              variant="outline"
              onClick={onRequestAccess || (() => window.location.href = '/contact')}
            >
              Request Access
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Simplified component for page-level access denied
interface AccessDeniedProps {
  title?: string;
  description?: string;
  showUpgrade?: boolean;
  showRequestAccess?: boolean;
  showHome?: boolean;
}

export function AccessDenied({
  title = "Access Restricted",
  description = "You don't have permission to access this page.",
  showUpgrade = true,
  showRequestAccess = false,
  showHome = true,
}: AccessDeniedProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-6">{description}</p>
        
        <div className="flex flex-wrap gap-3 justify-center">
          {showUpgrade && (
            <Button 
              onClick={() => window.location.href = '/pricing'}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              View Plans
            </Button>
          )}
          
          {showRequestAccess && (
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/contact'}
            >
              Request Access
            </Button>
          )}
          
          {showHome && (
            <Button 
              variant="ghost"
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// For use in sidebar/nav items
interface NavFeatureGateProps {
  isEnabled: boolean;
  behavior?: 'hide' | 'disable';
  featureName?: string;
  requiredTier?: string;
  children: ReactNode;
}

export function NavFeatureGate({
  isEnabled,
  behavior = 'hide',
  featureName,
  requiredTier,
  children,
}: NavFeatureGateProps) {
  if (isEnabled) {
    return <>{children}</>;
  }

  if (behavior === 'hide') {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-block cursor-not-allowed">
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
        </span>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <div className="flex items-center gap-2">
          <Lock className="h-3 w-3" />
          <span>
            {featureName 
              ? `${featureName} requires ${requiredTier || 'an upgrade'}`
              : `Requires ${requiredTier || 'an upgrade'}`
            }
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
