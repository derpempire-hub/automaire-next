'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Zap, Database, GitBranch, Mail, RefreshCw, Bot } from 'lucide-react';
import { GlowingNode, FloatingElement } from './GlowingNode';
import { FlowingLine } from './FlowingParticles';

interface WorkflowDiagramProps {
  className?: string;
  variant?: 'hero' | 'compact' | 'minimal';
}

const WORKFLOW_STEPS = [
  { type: 'trigger' as const, label: 'New Lead', icon: Zap },
  { type: 'action' as const, label: 'Enrich Data', icon: Database },
  { type: 'logic' as const, label: '>70?', icon: GitBranch },
  { type: 'action' as const, label: 'Send Email', icon: Mail },
];

const WORKFLOW_STEPS_EXTENDED = [
  { type: 'trigger' as const, label: 'New Lead', icon: Zap },
  { type: 'action' as const, label: 'Enrich', icon: Database },
  { type: 'logic' as const, label: 'Score', icon: GitBranch },
  { type: 'ai' as const, label: 'AI Agent', icon: Bot },
  { type: 'action' as const, label: 'Email', icon: Mail },
  { type: 'action' as const, label: 'CRM', icon: RefreshCw },
];

export function WorkflowDiagram({ className, variant = 'hero' }: WorkflowDiagramProps) {
  const steps = variant === 'hero' ? WORKFLOW_STEPS_EXTENDED : WORKFLOW_STEPS;
  const nodeSize = variant === 'compact' ? 'sm' : variant === 'minimal' ? 'sm' : 'md';

  return (
    <div className={cn('relative', className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-violet-500/5 via-transparent to-transparent" />

      {/* Workflow container */}
      <div className="relative flex items-center justify-center gap-4 md:gap-6 py-8">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center">
            {/* Node */}
            <FloatingElement duration={3 + index * 0.5} distance={6}>
              <GlowingNode
                type={step.type}
                label={step.label}
                icon={step.icon}
                size={nodeSize}
                delay={index * 0.15}
              />
            </FloatingElement>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="w-8 md:w-12 mx-1 md:mx-2">
                <FlowingLine
                  direction="horizontal"
                  color={
                    step.type === 'logic'
                      ? 'hsl(38, 80%, 50%)'
                      : step.type === 'trigger'
                      ? 'hsl(152, 80%, 45%)'
                      : step.type === 'ai'
                      ? 'hsl(262, 80%, 60%)'
                      : 'hsl(210, 80%, 55%)'
                  }
                  duration={1.5 + Math.random() * 0.5}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Status indicators */}
      {variant === 'hero' && (
        <motion.div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
          <span className="text-muted-foreground/50">|</span>
          <span>1,234 runs today</span>
        </motion.div>
      )}
    </div>
  );
}

// Vertical workflow diagram for sidebars or narrow spaces
interface VerticalWorkflowDiagramProps {
  className?: string;
  steps?: Array<{
    type: 'trigger' | 'action' | 'logic' | 'ai';
    label: string;
  }>;
}

export function VerticalWorkflowDiagram({
  className,
  steps = WORKFLOW_STEPS,
}: VerticalWorkflowDiagramProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'trigger':
        return Zap;
      case 'logic':
        return GitBranch;
      case 'ai':
        return Bot;
      default:
        return RefreshCw;
    }
  };

  return (
    <div className={cn('relative flex flex-col items-center gap-2', className)}>
      {steps.map((step, index) => (
        <div key={step.label} className="flex flex-col items-center">
          <GlowingNode
            type={step.type}
            label={step.label}
            icon={getIcon(step.type)}
            size="sm"
            delay={index * 0.1}
          />

          {index < steps.length - 1 && (
            <div className="h-8 my-1">
              <FlowingLine
                direction="vertical"
                color="hsl(262, 80%, 60%)"
                duration={1.5}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Simple animated workflow icon for empty states
export function WorkflowIcon({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn('relative', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <svg
        viewBox="0 0 120 80"
        fill="none"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Nodes */}
        <motion.rect
          x="5"
          y="30"
          width="25"
          height="20"
          rx="4"
          fill="hsl(152, 80%, 45%)"
          fillOpacity="0.2"
          stroke="hsl(152, 80%, 45%)"
          strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        />
        <motion.rect
          x="45"
          y="30"
          width="25"
          height="20"
          rx="4"
          fill="hsl(210, 80%, 55%)"
          fillOpacity="0.2"
          stroke="hsl(210, 80%, 55%)"
          strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        />
        <motion.rect
          x="85"
          y="30"
          width="25"
          height="20"
          rx="4"
          fill="hsl(262, 80%, 60%)"
          fillOpacity="0.2"
          stroke="hsl(262, 80%, 60%)"
          strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        />

        {/* Connections */}
        <motion.path
          d="M30 40 L45 40"
          stroke="hsl(152, 80%, 45%)"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        />
        <motion.path
          d="M70 40 L85 40"
          stroke="hsl(210, 80%, 55%)"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />

        {/* Flowing dots */}
        <motion.circle
          r="3"
          fill="hsl(152, 80%, 45%)"
          animate={{
            cx: [30, 45],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <motion.animate
            attributeName="cy"
            values="40;40"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </motion.circle>
        <motion.circle
          r="3"
          fill="hsl(210, 80%, 55%)"
          animate={{
            cx: [70, 85],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: 0.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <motion.animate
            attributeName="cy"
            values="40;40"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </motion.circle>
      </svg>
    </motion.div>
  );
}
