'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Globe,
  Zap,
  Bot,
  ArrowRight,
  Check,
  Code2,
  Palette,
  Smartphone,
  Database,
  GitBranch,
  Mail,
  MessageSquare,
  Phone,
  Mic,
  Send,
  Sparkles,
} from 'lucide-react';

interface HeroServiceShowcaseProps {
  className?: string;
}

const SERVICES = [
  {
    id: 'websites',
    title: 'Custom Websites',
    subtitle: 'Beautiful, fast, conversion-focused',
    icon: Globe,
    color: 'hsl(210, 80%, 55%)',
    features: ['Responsive Design', 'SEO Optimized', 'Fast Loading'],
  },
  {
    id: 'automation',
    title: 'AI Automation',
    subtitle: 'Workflows that work while you sleep',
    icon: Zap,
    color: 'hsl(262, 80%, 60%)',
    features: ['Lead Scoring', 'Email Sequences', 'CRM Sync'],
  },
  {
    id: 'agents',
    title: 'AI Agents',
    subtitle: 'Conversational AI that converts',
    icon: Bot,
    color: 'hsl(152, 80%, 45%)',
    features: ['24/7 Chat Support', 'Voice Agents', 'Lead Qualification'],
  },
];

export function HeroServiceShowcase({ className }: HeroServiceShowcaseProps) {
  const [activeService, setActiveService] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveService((prev) => (prev + 1) % SERVICES.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleServiceClick = (index: number) => {
    setActiveService(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const service = SERVICES[activeService];

  return (
    <div className={cn('relative', className)}>
      {/* Main Container */}
      <div className="relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* Background Glow */}
        <motion.div
          key={service.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${service.color}15 0%, transparent 60%)`,
          }}
        />

        {/* Service Tabs */}
        <div className="relative flex items-center justify-center gap-2 p-4 border-b border-border/30">
          {SERVICES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => handleServiceClick(i)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeService === i
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {activeService === i && (
                <motion.div
                  layoutId="activeServiceTab"
                  className="absolute inset-0 rounded-lg border"
                  style={{
                    backgroundColor: `${s.color}15`,
                    borderColor: `${s.color}40`,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <s.icon
                className="relative z-10 h-4 w-4"
                style={{ color: activeService === i ? s.color : undefined }}
              />
              <span className="relative z-10 hidden sm:inline">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="relative p-6 min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeService === 0 && <WebsiteDemo key="websites" />}
            {activeService === 1 && <AutomationDemo key="automation" />}
            {activeService === 2 && <AgentsDemo key="agents" />}
          </AnimatePresence>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-border/30">
          <motion.div
            key={`progress-${activeService}`}
            className="h-full"
            style={{ backgroundColor: service.color }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 8, ease: 'linear' }}
          />
        </div>
      </div>
    </div>
  );
}

// Website Demo - Shows a live website building animation
function WebsiteDemo() {
  const [buildStep, setBuildStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBuildStep((prev) => (prev + 1) % 4);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { icon: Palette, label: 'Design', desc: 'Custom UI/UX' },
    { icon: Code2, label: 'Develop', desc: 'Clean code' },
    { icon: Smartphone, label: 'Responsive', desc: 'All devices' },
    { icon: Sparkles, label: 'Launch', desc: 'Go live!' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid md:grid-cols-2 gap-8"
    >
      {/* Left - Build Steps */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Custom Websites</h3>
          <p className="text-muted-foreground text-sm">
            Beautiful, fast websites that convert visitors into customers.
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-all',
                buildStep === i
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'border-border/30'
              )}
            >
              <div
                className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center transition-colors',
                  buildStep === i ? 'bg-blue-500 text-white' : 'bg-muted'
                )}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
              {buildStep > i && (
                <Check className="h-4 w-4 text-green-500 ml-auto" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right - Website Preview */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-border/50 bg-background overflow-hidden shadow-2xl"
        >
          {/* Browser Chrome */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30 bg-muted/30">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 px-3 py-1 rounded bg-background text-[10px] text-muted-foreground">
              yourcompany.com
            </div>
          </div>

          {/* Website Content */}
          <div className="p-4 space-y-3">
            {/* Header skeleton */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: buildStep >= 0 ? 1 : 0.3 }}
              className="flex items-center justify-between"
            >
              <div className="h-6 w-24 rounded bg-primary/20" />
              <div className="flex gap-2">
                <div className="h-4 w-12 rounded bg-muted" />
                <div className="h-4 w-12 rounded bg-muted" />
                <div className="h-6 w-16 rounded bg-primary" />
              </div>
            </motion.div>

            {/* Hero skeleton */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: buildStep >= 1 ? 1 : 0.3 }}
              className="py-8 space-y-3"
            >
              <div className="h-8 w-3/4 rounded bg-foreground/10 mx-auto" />
              <div className="h-4 w-1/2 rounded bg-muted mx-auto" />
              <div className="h-10 w-32 rounded bg-primary/30 mx-auto mt-4" />
            </motion.div>

            {/* Cards skeleton */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: buildStep >= 2 ? 1 : 0.3 }}
              className="grid grid-cols-3 gap-2"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg bg-muted/50 border border-border/30"
                />
              ))}
            </motion.div>
          </div>

          {/* Launch Effect */}
          {buildStep === 3 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <span className="text-lg font-semibold">Live!</span>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// Automation Demo - Shows workflow automation
function AutomationDemo() {
  const [activeNode, setActiveNode] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const nodes = [
    { id: 'trigger', label: 'New Lead', icon: Zap, color: 'hsl(152, 80%, 45%)' },
    { id: 'enrich', label: 'Enrich', icon: Database, color: 'hsl(210, 80%, 55%)' },
    { id: 'score', label: 'Score', icon: GitBranch, color: 'hsl(38, 80%, 50%)' },
    { id: 'email', label: 'Email', icon: Mail, color: 'hsl(262, 80%, 60%)' },
  ];

  const logMessages = [
    '→ New lead: Sarah Chen (TechFlow Inc)',
    '✓ Enriched: 15 data points added',
    '✓ Score: 87/100 (Hot Lead)',
    '✓ Email sent: Welcome sequence #1',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => {
        const next = (prev + 1) % nodes.length;
        if (next < logMessages.length) {
          setLogs((prevLogs) => [...prevLogs.slice(-3), logMessages[next]]);
        }
        if (next === 0) {
          setLogs([logMessages[0]]);
        }
        return next;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">AI Automation</h3>
        <p className="text-muted-foreground text-sm">
          Workflows that run 24/7. You design the logic, we handle execution.
        </p>
      </div>

      {/* Workflow Visualization */}
      <div className="relative py-8">
        <div className="flex items-center justify-center gap-4 md:gap-8">
          {nodes.map((node, i) => (
            <div key={node.id} className="flex items-center">
              {/* Node */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {/* Glow */}
                {activeNode === i && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1.2 }}
                    className="absolute inset-0 blur-xl rounded-xl"
                    style={{ backgroundColor: node.color }}
                  />
                )}

                {/* Node Content */}
                <motion.div
                  animate={{
                    scale: activeNode === i ? 1.1 : 1,
                    y: activeNode === i ? -4 : 0,
                  }}
                  className={cn(
                    'relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl border transition-all',
                    activeNode === i
                      ? 'bg-card shadow-lg'
                      : 'bg-card/50 border-border/30'
                  )}
                  style={{
                    borderColor: activeNode === i ? node.color : undefined,
                  }}
                >
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${node.color}20`,
                      color: node.color,
                    }}
                  >
                    <node.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">{node.label}</span>

                  {/* Completion indicator */}
                  {activeNode > i && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>

              {/* Connector */}
              {i < nodes.length - 1 && (
                <div className="relative w-8 md:w-16 h-0.5 mx-2">
                  <div className="absolute inset-0 bg-border/30 rounded-full" />
                  {activeNode === i && (
                    <motion.div
                      className="absolute h-2 w-2 rounded-full top-1/2 -translate-y-1/2"
                      style={{
                        backgroundColor: node.color,
                        boxShadow: `0 0 10px ${node.color}`,
                      }}
                      animate={{ left: ['0%', '100%'] }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Live Activity</span>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 font-mono text-xs space-y-1 min-h-[80px]">
          <AnimatePresence mode="popLayout">
            {logs.map((log, i) => (
              <motion.div
                key={`${log}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-muted-foreground"
              >
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// Agents Demo - Shows chat and voice AI
function AgentsDemo() {
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'ai'; text: string }[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);

  const conversation = [
    { role: 'user' as const, text: 'Hi, I need help with automation' },
    {
      role: 'ai' as const,
      text: "I can help! What processes are you looking to automate?",
    },
    { role: 'user' as const, text: 'Lead qualification and follow-ups' },
    {
      role: 'ai' as const,
      text: 'We can set up AI scoring + automated email sequences.',
    },
  ];

  useEffect(() => {
    let index = 0;
    setChatMessages([conversation[0]]);

    const interval = setInterval(() => {
      index++;
      if (index < conversation.length) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setChatMessages((prev) => [...prev, conversation[index]]);
        }, 800);
      } else {
        index = 0;
        setChatMessages([conversation[0]]);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const voiceInterval = setInterval(() => {
      setVoiceActive((prev) => !prev);
    }, 3000);
    return () => clearInterval(voiceInterval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid md:grid-cols-2 gap-6"
    >
      {/* Chat Agent */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Chat Agent</h4>
            <p className="text-xs text-muted-foreground">24/7 AI support</p>
          </div>
          <div className="ml-auto px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px]">
            Online
          </div>
        </div>

        {/* Chat Window */}
        <div className="rounded-lg border border-border/50 bg-background overflow-hidden">
          <div className="p-4 space-y-3 min-h-[200px]">
            {chatMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'max-w-[85%] px-3 py-2 rounded-lg text-sm',
                  msg.role === 'user'
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {msg.text}
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-1 px-3 py-2 bg-muted rounded-lg w-fit"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      delay: i * 0.1,
                      duration: 0.5,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2 border-t border-border/30">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm outline-none"
              readOnly
            />
            <Send className="h-4 w-4 text-primary" />
          </div>
        </div>
      </div>

      {/* Voice Agent */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Phone className="h-4 w-4 text-violet-500" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Voice Agent</h4>
            <p className="text-xs text-muted-foreground">
              AI-powered phone calls
            </p>
          </div>
        </div>

        {/* Voice Interface */}
        <div className="rounded-lg border border-border/50 bg-background p-6 flex flex-col items-center justify-center min-h-[200px]">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative mb-4"
          >
            <motion.div
              animate={voiceActive ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={cn(
                'h-20 w-20 rounded-full flex items-center justify-center transition-colors',
                voiceActive ? 'bg-violet-500' : 'bg-muted'
              )}
            >
              <Mic
                className={cn(
                  'h-8 w-8',
                  voiceActive ? 'text-white' : 'text-muted-foreground'
                )}
              />
            </motion.div>

            {voiceActive && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-violet-500"
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-violet-500"
                  animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                  transition={{ duration: 1.5, delay: 0.3, repeat: Infinity }}
                />
              </>
            )}
          </motion.button>

          <p className="font-medium text-sm">
            {voiceActive ? 'Speaking with AI...' : 'Voice Agent Ready'}
          </p>
          <p className="text-xs text-muted-foreground">
            {voiceActive ? '"How can I help you today?"' : 'Click to simulate'}
          </p>

          {/* Voice Waveform */}
          {voiceActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-0.5 mt-4"
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-violet-500 rounded-full"
                  animate={{ height: [8, 24, 8] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
