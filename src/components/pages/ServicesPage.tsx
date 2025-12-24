'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Zap, MessageSquare, Phone, ArrowRight, Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShineButton } from '@/components/landing/ShineButton';
import { ProductDemo } from '@/components/landing/ProductDemo';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TooltipProvider } from '@/components/ui/tooltip';

type ServiceId = 'websites' | 'automation' | 'chatbots' | 'voice';

const services = [
  {
    id: 'websites' as const,
    icon: Globe,
    title: 'Custom Websites',
    tagline: 'Fast, conversion-optimized sites',
    description: 'We build high-performance websites designed to convert. Every site is custom-designed to match your brand and optimized for speed, SEO, and lead capture.',
    features: [
      'Custom design from scratch',
      'Mobile-first responsive layout',
      'SEO optimization included',
      'CMS for easy content updates',
      'Analytics dashboard',
    ],
    timeline: [
      { phase: 'Discovery', duration: '2 days', desc: 'Requirements & wireframes' },
      { phase: 'Design', duration: '5 days', desc: 'Visual design & feedback' },
      { phase: 'Build', duration: '5 days', desc: 'Development & testing' },
      { phase: 'Launch', duration: '2 days', desc: 'Deploy & monitor' },
    ],
    price: 'From $2,500',
    demoTab: 'web' as const,
  },
  {
    id: 'automation' as const,
    icon: Zap,
    title: 'AI Automation',
    tagline: 'You design, we execute',
    description: 'Design your workflow logic visually — we implement, deploy, and maintain the production automation. From lead routing to data sync, you map the intent and we handle the execution.',
    features: [
      'Visual workflow designer',
      'CRM & tool integrations',
      'Conditional logic & branching',
      'Error handling & alerts',
      'Execution monitoring',
    ],
    timeline: [
      { phase: 'Design', duration: '1 day', desc: 'You map your workflow' },
      { phase: 'Review', duration: '1 day', desc: 'We validate the logic' },
      { phase: 'Build', duration: '3 days', desc: 'We implement in production' },
      { phase: 'Deploy', duration: '1 day', desc: 'Go live & training' },
    ],
    price: 'From $1,500/mo',
    demoTab: 'automation' as const,
  },
  {
    id: 'chatbots' as const,
    icon: MessageSquare,
    title: 'AI Chatbots',
    tagline: '24/7 lead qualification',
    description: 'Intelligent chat agents trained on your business. They qualify leads, answer questions, and book meetings while you sleep.',
    features: [
      'Custom AI training',
      'Lead qualification flows',
      'Calendar booking integration',
      'CRM data sync',
      'Conversation analytics',
    ],
    timeline: [
      { phase: 'Training', duration: '2 days', desc: 'Feed docs & FAQs' },
      { phase: 'Flows', duration: '2 days', desc: 'Qualification logic' },
      { phase: 'Testing', duration: '1 day', desc: 'QA conversations' },
      { phase: 'Deploy', duration: '1 day', desc: 'Widget installation' },
    ],
    price: 'Included in Growth',
    demoTab: 'ai' as const,
  },
  {
    id: 'voice' as const,
    icon: Phone,
    title: 'Voice Agents',
    tagline: 'Human-grade AI calls',
    description: 'ElevenLabs-powered voice AI that handles inbound and outbound calls. Perfect for appointment reminders, follow-ups, and initial outreach.',
    features: [
      'Natural voice synthesis',
      'Inbound call handling',
      'Outbound campaigns',
      'Call transcription',
      'CRM logging',
    ],
    timeline: [
      { phase: 'Script', duration: '2 days', desc: 'Call flow design' },
      { phase: 'Voice', duration: '1 day', desc: 'Voice clone setup' },
      { phase: 'Integration', duration: '2 days', desc: 'Phone system setup' },
      { phase: 'Launch', duration: '1 day', desc: 'Go live & monitor' },
    ],
    price: 'Scale plan only',
    demoTab: 'ai' as const,
  },
];

export default function ServicesPage() {
  const [activeService, setActiveService] = useState<ServiceId>('automation');
  const currentService = services.find(s => s.id === activeService)!;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background">
        {/* Nav */}
        <nav className="border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container flex h-12 items-center justify-between">
            <Logo size="xl" />
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground text-xs">
                Pricing
              </Link>
              <Link href="/contact">
                <ShineButton size="default" className="h-8 px-3 text-xs">
                  Get started
                </ShineButton>
              </Link>
            </div>
          </div>
        </nav>

        <div className="container py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">Services</h1>
            <p className="text-sm text-muted-foreground">What we build for you</p>
          </div>

          {/* Split Layout: Narrative Left, Preview Right */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Narrative */}
            <div>
              {/* Service Tabs - Vertical */}
              <div className="space-y-1 mb-6">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setActiveService(service.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all group',
                      activeService === service.id
                        ? 'bg-primary/5 border border-primary/30'
                        : 'hover:bg-muted/50 border border-transparent'
                    )}
                  >
                    <div className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center transition-colors',
                      activeService === service.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}>
                      <service.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{service.title}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{service.tagline}</div>
                    </div>
                    <ChevronRight className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform',
                      activeService === service.id && 'rotate-90 text-primary'
                    )} />
                  </button>
                ))}
              </div>

              {/* Service Details */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeService}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Description */}
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentService.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="mb-6">
                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      What&apos;s included
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {currentService.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-xs">
                          <Check className="h-3 w-3 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mb-6">
                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Typical timeline
                    </div>
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

                      <div className="space-y-3">
                        {currentService.timeline.map((phase) => (
                          <div key={phase.phase} className="flex items-start gap-3 relative">
                            <div className="h-4 w-4 rounded-full border-2 border-primary bg-background flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium">{phase.phase}</span>
                                <span className="text-[10px] text-muted-foreground">{phase.duration}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">{phase.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-muted/20">
                    <div>
                      <div className="text-lg font-bold">{currentService.price}</div>
                      <div className="text-[10px] text-muted-foreground">No contracts</div>
                    </div>
                    <Link href="/contact">
                      <ShineButton size="default" className="h-9 text-xs">
                        Get a quote <ArrowRight className="h-3 w-3 ml-1" />
                      </ShineButton>
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: Interactive Preview */}
            <div className="hidden lg:block">
              <div className="sticky top-20">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Live preview
                </div>
                <ProductDemo defaultTab={currentService.demoTab} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
