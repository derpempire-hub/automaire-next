'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Globe, Zap, MessageSquare, Phone, Bot, Workflow, 
  ArrowRight, Check, Send, Mic, MicOff,
  BarChart3, Users, Mail, Clock, Info, ExternalLink, Play
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ServiceTab = 'web' | 'automation' | 'ai';

interface ProductDemoProps {
  className?: string;
  defaultTab?: ServiceTab;
}

const mockLeadsData = [
  { name: 'Sarah Chen', company: 'TechFlow Inc', score: 92, status: 'hot', lastActivity: '2m ago' },
  { name: 'Mike Johnson', company: 'Scale Labs', score: 78, status: 'warm', lastActivity: '15m ago' },
  { name: 'Emma Davis', company: 'Growth.io', score: 85, status: 'hot', lastActivity: '1h ago' },
  { name: 'Alex Kim', company: 'DataFirst', score: 64, status: 'warm', lastActivity: '3h ago' },
];

const mockWorkflowNodes = [
  { id: 1, type: 'trigger', label: 'New Lead', x: 0, y: 0, desc: 'Your trigger intent' },
  { id: 2, type: 'action', label: 'Enrich', x: 1, y: 0, desc: 'We implement lookup' },
  { id: 3, type: 'condition', label: '>70?', x: 2, y: 0, desc: 'Your scoring logic' },
  { id: 4, type: 'action', label: 'Email', x: 3, y: -0.5, desc: 'We configure delivery' },
  { id: 5, type: 'action', label: 'CRM', x: 3, y: 0.5, desc: 'We sync to HubSpot' },
];

const mockChatMessages = [
  { role: 'visitor', text: 'Need help with automation' },
  { role: 'ai', text: 'I can help! What processes?' },
  { role: 'visitor', text: 'Lead qualification' },
  { role: 'ai', text: 'Great. We automate scoring + CRM sync.' },
];

const tabDescriptions = {
  web: 'Real-time lead tracking dashboard',
  automation: 'Visual workflow designer — we handle execution',
  ai: 'Conversational AI + voice agents',
};

export function ProductDemo({ className, defaultTab = 'automation' }: ProductDemoProps) {
  const [activeTab, setActiveTab] = useState<ServiceTab>(defaultTab);
  const [chatIndex, setChatIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [activeNode, setActiveNode] = useState(0);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  useEffect(() => {
    if (activeTab === 'ai') {
      const timer = setInterval(() => {
        setChatIndex((prev) => {
          if (prev < mockChatMessages.length - 1) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 600);
            return prev + 1;
          }
          return 0;
        });
      }, 2500);
      return () => clearInterval(timer);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'automation') {
      const timer = setInterval(() => {
        setActiveNode((prev) => (prev + 1) % mockWorkflowNodes.length);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeTab]);

  const tabs = [
    { id: 'web' as const, label: 'Dashboard', icon: Globe, key: '1' },
    { id: 'automation' as const, label: 'Designer', icon: Workflow, key: '2' },
    { id: 'ai' as const, label: 'AI Agents', icon: Bot, key: '3' },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn('relative', className)}>
        {/* Segmented Control - Tighter */}
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex p-0.5 rounded-lg bg-muted/50 border border-border/50">
            {tabs.map((tab) => (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                      activeTab === tab.id
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary rounded-md"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <tab.icon className="h-3 w-3" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p>{tabDescriptions[tab.id]}</p>
                  <p className="text-muted-foreground mt-0.5">Press {tab.key} to switch</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          
          {/* Inline description */}
          <span className="hidden md:inline text-[10px] text-muted-foreground">
            {tabDescriptions[activeTab]}
          </span>
        </div>

        {/* Demo Window - Tighter */}
        <motion.div
          layout
          className="relative rounded-xl border border-border/50 bg-card overflow-hidden shadow-xl"
        >
          {/* Window Header - Clean, no decorative dots */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-muted-foreground">
                {activeTab === 'web' && 'Lead Dashboard'}
                {activeTab === 'automation' && 'Workflow Designer'}
                {activeTab === 'ai' && 'AI Agents'}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] text-muted-foreground font-mono bg-background/50 border border-border/30">
              app.automaire.dev
            </span>
          </div>

          {/* Content - Tighter padding */}
          <div className="min-h-[320px]">
            <AnimatePresence mode="wait">
              {/* Web - Dashboard */}
              {activeTab === 'web' && (
                <motion.div
                  key="web"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-3"
                >
                  {/* Section Label */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Overview</span>
                    <span className="text-[9px] text-muted-foreground">Last 24h</span>
                  </div>

                  {/* Stats Row - Compact */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[
                      { label: 'Leads', value: '1,247', icon: Users, change: '+12%', tip: 'Total qualified leads in pipeline' },
                      { label: 'Conv.', value: '24.8%', icon: BarChart3, change: '+3.2%', tip: 'Lead to customer conversion rate' },
                      { label: 'Response', value: '<2m', icon: Clock, change: '-45%', tip: 'Avg. first response time' },
                      { label: 'Sent', value: '3.8K', icon: Mail, change: '+28%', tip: 'Automated emails delivered' },
                    ].map((stat, i) => (
                      <Tooltip key={stat.label}>
                        <TooltipTrigger asChild>
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-2 rounded-lg bg-background/50 border border-border/20 cursor-default group"
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <stat.icon className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[9px] text-success font-medium">{stat.change}</span>
                            </div>
                            <div className="text-sm font-bold leading-none">{stat.value}</div>
                            <div className="text-[9px] text-muted-foreground mt-0.5">{stat.label}</div>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs max-w-[150px]">{stat.tip}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>

                  {/* Section Label */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Recent Leads</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">AI-scored leads from all sources</TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Data Table - Compact */}
                  <div className="rounded-lg border border-border/20 overflow-hidden text-[11px]">
                    <div className="grid grid-cols-5 gap-2 px-2 py-1 bg-muted/20 text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                      <span>Name</span>
                      <span>Company</span>
                      <span>Score</span>
                      <span>Status</span>
                      <span className="text-right">Activity</span>
                    </div>
                    {mockLeadsData.map((lead, i) => (
                      <motion.div
                        key={lead.name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        onMouseEnter={() => setHoveredRow(i)}
                        onMouseLeave={() => setHoveredRow(null)}
                        className="grid grid-cols-5 gap-2 px-2 py-1.5 border-t border-border/10 hover:bg-muted/10 transition-colors group"
                      >
                        <span className="font-medium truncate">{lead.name}</span>
                        <span className="text-muted-foreground truncate">{lead.company}</span>
                        <div className="flex items-center gap-1">
                          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${lead.score}%` }}
                              transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                              className="h-full bg-primary rounded-full"
                            />
                          </div>
                          <span className="text-[10px] w-5">{lead.score}</span>
                        </div>
                        <span className={cn(
                          'inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium w-fit',
                          lead.status === 'hot' 
                            ? 'bg-destructive/10 text-destructive' 
                            : 'bg-warning/10 text-warning'
                        )}>
                          {lead.status}
                        </span>
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-muted-foreground text-[9px]">{lead.lastActivity}</span>
                          {/* Hidden action on hover */}
                          <motion.button
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ 
                              opacity: hoveredRow === i ? 1 : 0,
                              width: hoveredRow === i ? 'auto' : 0
                            }}
                            className="p-0.5 rounded hover:bg-primary/10"
                          >
                            <ExternalLink className="h-2.5 w-2.5 text-primary" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Automation - Workflow */}
              {activeTab === 'automation' && (
                <motion.div
                  key="automation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-3"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">Lead Qualification</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-success/10 cursor-default">
                            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                            <span className="text-[9px] text-success font-medium">Live</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">Implemented by our team</TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-[9px] text-muted-foreground">You design • We execute</span>
                  </div>

                  {/* Workflow Canvas - Compact */}
                  <div className="relative h-[160px] bg-background/30 rounded-lg border border-border/20 overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full">
                      {mockWorkflowNodes.slice(0, -1).map((node, i) => {
                        const next = mockWorkflowNodes[i + 1];
                        if (!next) return null;
                        const x1 = 50 + node.x * 90;
                        const y1 = 80 + node.y * 50;
                        const x2 = 50 + next.x * 90;
                        const y2 = 80 + next.y * 50;
                        return (
                          <motion.line
                            key={`line-${i}`}
                            x1={x1 + 25}
                            y1={y1}
                            x2={x2 - 25}
                            y2={y2}
                            stroke="hsl(var(--border))"
                            strokeWidth={1.5}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                          />
                        );
                      })}
                      <motion.path
                        d="M 295 80 Q 320 80 320 55 L 345 55"
                        fill="none"
                        stroke="hsl(var(--border))"
                        strokeWidth={1.5}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.5, duration: 0.2 }}
                      />
                      <motion.path
                        d="M 295 80 Q 320 80 320 105 L 345 105"
                        fill="none"
                        stroke="hsl(var(--border))"
                        strokeWidth={1.5}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.5, duration: 0.2 }}
                      />
                    </svg>

                    {mockWorkflowNodes.map((node, i) => (
                      <Tooltip key={node.id}>
                        <TooltipTrigger asChild>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ 
                              opacity: 1, 
                              scale: activeNode === i ? 1.05 : 1,
                            }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                              'absolute flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-medium cursor-default transition-all',
                              activeNode === i 
                                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20' 
                                : 'bg-card border-border/30'
                            )}
                            style={{
                              left: 25 + node.x * 90,
                              top: 70 + node.y * 50,
                            }}
                          >
                            {node.type === 'trigger' && <Zap className="h-2.5 w-2.5" />}
                            {node.type === 'action' && <Play className="h-2.5 w-2.5" />}
                            {node.type === 'condition' && <span className="text-[8px]">?</span>}
                            {node.label}
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">{node.desc}</TooltipContent>
                      </Tooltip>
                    ))}

                    <motion.div
                      className="absolute h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/50"
                      animate={{
                        left: [50, 140, 230, 320, 320],
                        top: [80, 80, 80, 55, 105],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>

                  {/* Execution Log - Compact */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {['Scored: 87', 'Email sent', 'CRM synced'].map((log, i) => (
                        <motion.div
                          key={log}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                          className="flex items-center gap-1 text-[9px] text-muted-foreground"
                        >
                          <Check className="h-2.5 w-2.5 text-success" />
                          {log}
                        </motion.div>
                      ))}
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[9px] text-primary hover:underline">View logs →</button>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">Full execution history</TooltipContent>
                    </Tooltip>
                  </div>
                </motion.div>
              )}

              {/* AI - Chat + Voice */}
              {activeTab === 'ai' && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid md:grid-cols-2 divide-x divide-border/20"
                >
                  {/* Chat Panel */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">Chat</span>
                      </div>
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-success/10 text-success">Online</span>
                    </div>
                    
                    <div className="space-y-2 min-h-[180px]">
                      {mockChatMessages.slice(0, chatIndex + 1).map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            'max-w-[90%] px-2 py-1.5 rounded-lg text-[10px] leading-relaxed',
                            msg.role === 'visitor'
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
                          className="flex items-center gap-0.5 px-2 py-1.5 bg-muted rounded-lg w-12"
                        >
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="h-1 w-1 rounded-full bg-muted-foreground"
                              animate={{ y: [0, -3, 0] }}
                              transition={{ delay: i * 0.1, duration: 0.4, repeat: Infinity }}
                            />
                          ))}
                        </motion.div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 rounded-lg border border-border/30 bg-background/30">
                      <input 
                        type="text" 
                        placeholder="Type a message..." 
                        className="flex-1 bg-transparent text-[10px] outline-none placeholder:text-muted-foreground/50"
                        readOnly
                      />
                      <Send className="h-3 w-3 text-primary" />
                    </div>
                  </div>

                  {/* Voice Panel */}
                  <div className="p-3 flex flex-col items-center justify-center">
                    <div className="flex items-center justify-between w-full mb-4">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">Voice</span>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="text-xs max-w-[140px]">ElevenLabs-powered voice AI for calls</TooltipContent>
                      </Tooltip>
                    </div>

                    <motion.button
                      onClick={() => setVoiceActive(!voiceActive)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <motion.div
                        animate={voiceActive ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className={cn(
                          'h-14 w-14 rounded-full flex items-center justify-center transition-colors',
                          voiceActive ? 'bg-primary' : 'bg-muted'
                        )}
                      >
                        {voiceActive ? (
                          <Mic className="h-6 w-6 text-primary-foreground" />
                        ) : (
                          <MicOff className="h-6 w-6 text-muted-foreground" />
                        )}
                      </motion.div>
                      {voiceActive && (
                        <motion.div
                          className="absolute inset-0 rounded-full border border-primary"
                          animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </motion.button>

                    <p className="mt-3 text-[10px] font-medium">
                      {voiceActive ? 'Listening...' : 'Click to test'}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {voiceActive ? 'Try: "Book a demo"' : 'Voice agent demo'}
                    </p>

                    {voiceActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 flex items-center gap-0.5"
                      >
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-0.5 bg-primary rounded-full"
                            animate={{ height: [6, 18, 6] }}
                            transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.08 }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
