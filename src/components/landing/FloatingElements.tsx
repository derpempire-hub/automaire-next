'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Zap,
  Globe,
  Bot,
  Mail,
  Database,
  Code2,
  MessageSquare,
  Phone,
  GitBranch,
  Sparkles,
  Workflow,
  Brain,
} from 'lucide-react';

interface FloatingElementsProps {
  className?: string;
}

const FLOATING_ICONS = [
  { icon: Zap, color: 'hsl(262, 80%, 60%)', x: '10%', y: '20%', delay: 0 },
  { icon: Globe, color: 'hsl(210, 80%, 55%)', x: '85%', y: '15%', delay: 0.5 },
  { icon: Bot, color: 'hsl(152, 80%, 45%)', x: '5%', y: '70%', delay: 1 },
  { icon: Mail, color: 'hsl(38, 80%, 50%)', x: '90%', y: '60%', delay: 1.5 },
  { icon: Database, color: 'hsl(340, 80%, 55%)', x: '15%', y: '45%', delay: 0.3 },
  { icon: Code2, color: 'hsl(180, 60%, 45%)', x: '80%', y: '35%', delay: 0.8 },
  { icon: MessageSquare, color: 'hsl(152, 80%, 45%)', x: '25%', y: '80%', delay: 1.2 },
  { icon: Phone, color: 'hsl(262, 80%, 60%)', x: '75%', y: '75%', delay: 0.6 },
  { icon: GitBranch, color: 'hsl(38, 80%, 50%)', x: '40%', y: '10%', delay: 0.9 },
  { icon: Brain, color: 'hsl(262, 80%, 60%)', x: '60%', y: '85%', delay: 1.4 },
];

export function FloatingElements({ className }: FloatingElementsProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {FLOATING_ICONS.map((item, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: item.delay, duration: 0.5 }}
        >
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div
              className="relative h-10 w-10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10"
              style={{
                backgroundColor: `${item.color}15`,
                boxShadow: `0 0 30px ${item.color}30`,
              }}
            >
              <item.icon
                className="h-5 w-5"
                style={{ color: item.color }}
              />

              {/* Subtle pulse */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{ backgroundColor: item.color }}
                animate={{ opacity: [0, 0.1, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: item.delay,
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      ))}

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(262, 80%, 60%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(262, 80%, 60%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(262, 80%, 60%)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Animated path connecting some elements */}
        <motion.path
          d="M 100 200 Q 300 100 500 200 T 900 200"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        />
      </svg>
    </div>
  );
}

// Animated grid background
export function GridBackground({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(262, 80%, 60%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(262, 80%, 60%) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Animated glow spots */}
      <motion.div
        className="absolute h-[500px] w-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(262, 80%, 60%) 0%, transparent 70%)',
          opacity: 0.05,
          left: '20%',
          top: '10%',
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div
        className="absolute h-[400px] w-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(210, 80%, 55%) 0%, transparent 70%)',
          opacity: 0.05,
          right: '10%',
          bottom: '20%',
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div
        className="absolute h-[300px] w-[300px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(152, 80%, 45%) 0%, transparent 70%)',
          opacity: 0.04,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

// Particle field for extra visual interest
export function ParticleField({ className }: { className?: string }) {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
