'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Zap,
  Database,
  GitBranch,
  Mail,
  RefreshCw,
  Bot,
  Check,
  Clock,
} from 'lucide-react';
import { GlowingNode, FloatingElement } from '@/components/animations/GlowingNode';
import { FlowingLine } from '@/components/animations/FlowingParticles';

interface HeroWorkflowAnimationProps {
  className?: string;
  variant?: 'full' | 'compact' | 'minimal';
}

const WORKFLOW_STEPS = [
  {
    type: 'trigger' as const,
    label: 'New Lead',
    icon: Zap,
    color: 'hsl(152, 80%, 45%)',
    desc: 'Webhook trigger',
  },
  {
    type: 'action' as const,
    label: 'Enrich',
    icon: Database,
    color: 'hsl(210, 80%, 55%)',
    desc: 'Clearbit lookup',
  },
  {
    type: 'logic' as const,
    label: 'Score > 70?',
    icon: GitBranch,
    color: 'hsl(38, 80%, 50%)',
    desc: 'AI scoring',
  },
  {
    type: 'ai' as const,
    label: 'AI Agent',
    icon: Bot,
    color: 'hsl(262, 80%, 60%)',
    desc: 'GPT-4 analysis',
  },
  {
    type: 'action' as const,
    label: 'Send Email',
    icon: Mail,
    color: 'hsl(210, 80%, 55%)',
    desc: 'Personalized outreach',
  },
  {
    type: 'action' as const,
    label: 'Update CRM',
    icon: RefreshCw,
    color: 'hsl(210, 80%, 55%)',
    desc: 'HubSpot sync',
  },
];

const LOG_MESSAGES = [
  { step: 'trigger', msg: 'New lead: Sarah Chen', status: 'success' },
  { step: 'enrich', msg: 'Enriched: TechFlow Inc', status: 'success' },
  { step: 'score', msg: 'Lead score: 87/100', status: 'success' },
  { step: 'ai', msg: 'Analysis complete', status: 'success' },
  { step: 'email', msg: 'Email queued', status: 'success' },
  { step: 'crm', msg: 'CRM updated', status: 'success' },
];

export function HeroWorkflowAnimation({
  className,
  variant = 'full',
}: HeroWorkflowAnimationProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [logs, setLogs] = useState<typeof LOG_MESSAGES>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        const next = (prev + 1) % WORKFLOW_STEPS.length;
        if (next < LOG_MESSAGES.length) {
          setLogs((prevLogs) => {
            const newLogs = [...prevLogs, LOG_MESSAGES[next]];
            return newLogs.slice(-4); // Keep last 4 logs
          });
        }
        if (next === 0) {
          setLogs([]);
        }
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const steps = variant === 'minimal' ? WORKFLOW_STEPS.slice(0, 4) : WORKFLOW_STEPS;
  const nodeSize = variant === 'compact' ? 'sm' : 'md';

  return (
    <div className={cn('relative', className)}>
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-violet-500/5 via-transparent to-transparent" />

      {/* Main workflow diagram */}
      <div className="relative">
        {/* Nodes container */}
        <div className="flex items-center justify-center flex-wrap gap-2 md:gap-4 py-8 px-4">
          {steps.map((step, index) => (
            <div key={step.label} className="flex items-center">
              {/* Node with float animation */}
              <FloatingElement
                duration={3 + index * 0.3}
                distance={6}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <div
                    className={cn(
                      'relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300',
                      step.type === 'logic' && 'rotate-0', // Keep logic nodes normal
                      activeStep === index
                        ? 'border-white/20 shadow-lg'
                        : 'border-white/5'
                    )}
                    style={{
                      backgroundColor: activeStep === index ? `${step.color}20` : `${step.color}10`,
                      boxShadow: activeStep === index ? `0 0 30px ${step.color}30` : 'none',
                    }}
                  >
                    {/* Glow effect */}
                    {activeStep === index && (
                      <motion.div
                        className="absolute inset-0 rounded-lg blur-xl"
                        style={{ backgroundColor: step.color }}
                        animate={{
                          opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      />
                    )}

                    <step.icon
                      className="h-4 w-4 relative z-10"
                      style={{ color: step.color }}
                    />
                    <span
                      className="text-sm font-medium relative z-10"
                      style={{ color: activeStep === index ? step.color : `${step.color}cc` }}
                    >
                      {step.label}
                    </span>

                    {/* Step completion indicator */}
                    {activeStep > index && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center"
                      >
                        <Check className="h-2.5 w-2.5 text-white" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </FloatingElement>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="w-8 md:w-12 mx-1 h-0.5 relative hidden sm:block">
                  {/* Track */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: `${step.color}20` }}
                  />
                  {/* Animated dot */}
                  {activeStep === index && (
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: step.color,
                        boxShadow: `0 0 10px ${step.color}`,
                      }}
                      animate={{
                        left: ['0%', '100%'],
                      }}
                      transition={{
                        duration: 1,
                        ease: 'linear',
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Activity logs */}
        {variant === 'full' && (
          <div className="mt-4 max-w-md mx-auto px-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Live activity</span>
            </div>
            <div className="space-y-1">
              <AnimatePresence mode="popLayout">
                {logs.map((log, i) => (
                  <motion.div
                    key={`${log.step}-${i}`}
                    initial={{ opacity: 0, x: -10, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 10, height: 0 }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{log.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Stats bar */}
        {variant === 'full' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Active workflow
            </span>
            <span>1,247 leads processed today</span>
            <span>99.9% success rate</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
