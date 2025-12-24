import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HoverAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: 'default' | 'destructive';
  shortcut?: string;
}

interface HoverActionsProps {
  actions: HoverAction[];
  visible?: boolean;
  className?: string;
  position?: 'right' | 'left' | 'center';
}

export function HoverActions({
  actions,
  visible = false,
  className,
  position = 'right',
}: HoverActionsProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: position === 'right' ? 8 : position === 'left' ? -8 : 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: position === 'right' ? 8 : position === 'left' ? -8 : 0 }}
          transition={{ duration: 0.1 }}
          className={cn(
            'flex items-center gap-0.5',
            position === 'right' && 'justify-end',
            position === 'left' && 'justify-start',
            position === 'center' && 'justify-center',
            className
          )}
        >
          {actions.map((action, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(e);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'p-1.5 rounded transition-colors',
                    action.variant === 'destructive'
                      ? 'hover:bg-destructive/10 text-muted-foreground hover:text-destructive'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <action.icon className="h-3 w-3" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <span>{action.label}</span>
                {action.shortcut && (
                  <span className="ml-2 text-muted-foreground">{action.shortcut}</span>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Row wrapper that shows actions on hover
interface HoverRowProps {
  children: React.ReactNode;
  actions: HoverAction[];
  className?: string;
  actionsClassName?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function HoverRow({
  children,
  actions,
  className,
  actionsClassName,
  onClick,
  isActive,
}: HoverRowProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        'relative cursor-pointer transition-colors',
        isActive ? 'bg-primary/5' : 'hover:bg-muted/30',
        className
      )}
      whileHover={{ x: 2 }}
    >
      {children}
      <div className={cn('absolute right-2 top-1/2 -translate-y-1/2', actionsClassName)}>
        <HoverActions actions={actions} visible={isHovered || isActive} />
      </div>
    </motion.div>
  );
}
