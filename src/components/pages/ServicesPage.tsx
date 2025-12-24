'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Zap, MessageSquare, Phone, ArrowRight, Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductDemo } from '@/components/landing/ProductDemo';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  MeshGradient,
  GradientText,
  WordReveal,
  TiltCard,
  GlowCard,
  ShineCard,
  MagneticButton,
  Spotlight,
  Beam,
} from '@/components/animations';

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
      <div className="min-h-screen bg-background overflow-hidden">
        {/* Premium Background */}
        <MeshGradient intensity="subtle" speed="slow" className="fixed inset-0 z-0" />

        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border-b border-border/30 bg-background/60 backdrop-blur-xl sticky top-0 z-50"
        >
          <div className="container flex h-14 items-center justify-between">
            <Logo size="xl" />
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                Pricing
              </Link>
              <Link href="/contact">
                <MagneticButton className="h-9 px-4 text-sm bg-primary text-primary-foreground rounded-md font-medium">
                  Get started
                </MagneticButton>
              </Link>
            </div>
          </div>
        </motion.nav>

        <Spotlight className="container py-12 relative z-10" spotlightSize={500} spotlightColor="rgba(120, 80, 220, 0.06)">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <WordReveal delay={0.3}>Our Services</WordReveal>
            </h1>
            <p className="text-muted-foreground text-lg">
              Everything you need to <GradientText>automate and scale</GradientText>
            </p>
          </motion.div>

          {/* Split Layout: Narrative Left, Preview Right */}
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left: Narrative */}
            <div>
              {/* Service Tabs - Vertical with Glow */}
              <div className="space-y-2 mb-8">
                {services.map((service, i) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <ShineCard
                      className={cn(
                        'transition-all cursor-pointer',
                        activeService === service.id && 'ring-1 ring-primary/30'
                      )}
                      borderWidth={activeService === service.id ? 2 : 1}
                    >
                      <button
                        onClick={() => setActiveService(service.id)}
                        className={cn(
                          'w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all group'
                        )}
                      >
                        <motion.div
                          className={cn(
                            'h-10 w-10 rounded-xl flex items-center justify-center transition-all',
                            activeService === service.id
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                              : 'bg-muted'
                          )}
                          animate={{
                            scale: activeService === service.id ? 1.05 : 1,
                          }}
                        >
                          <service.icon className="h-5 w-5" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-semibold">{service.title}</div>
                          <div className="text-sm text-muted-foreground truncate">{service.tagline}</div>
                        </div>
                        <ChevronRight className={cn(
                          'h-5 w-5 text-muted-foreground transition-transform',
                          activeService === service.id && 'rotate-90 text-primary'
                        )} />
                      </button>
                    </ShineCard>
                  </motion.div>
                ))}
              </div>

              {/* Service Details */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeService}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlowCard className="p-6" glowColor="hsl(262, 80%, 60%)" glowSize={300}>
                    {/* Description */}
                    <div className="mb-6">
                      <p className="text-muted-foreground leading-relaxed">
                        {currentService.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="mb-6">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        What&apos;s included
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {currentService.features.map((feature, i) => (
                          <motion.div
                            key={feature}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary" />
                            </div>
                            <span>{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mb-6">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Typical timeline
                      </div>
                      <div className="relative">
                        {/* Animated beam along timeline */}
                        <Beam className="left-[7px] top-4" duration={3} />

                        {/* Timeline line */}
                        <div className="absolute left-[7px] top-4 bottom-4 w-px bg-border" />

                        <div className="space-y-4">
                          {currentService.timeline.map((phase, i) => (
                            <motion.div
                              key={phase.phase}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + i * 0.1 }}
                              className="flex items-start gap-4 relative"
                            >
                              <motion.div
                                className="h-4 w-4 rounded-full border-2 border-primary bg-background flex-shrink-0 mt-0.5"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ delay: i * 0.2, duration: 0.5 }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold">{phase.phase}</span>
                                  <span className="text-xs text-primary font-medium">{phase.duration}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{phase.desc}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
                      <div>
                        <div className="text-2xl font-bold">
                          <GradientText animate={false}>{currentService.price}</GradientText>
                        </div>
                        <div className="text-sm text-muted-foreground">No contracts required</div>
                      </div>
                      <Link href="/contact">
                        <MagneticButton className="h-10 px-5 text-sm bg-primary text-primary-foreground rounded-lg font-semibold inline-flex items-center gap-2">
                          Get a quote
                          <ArrowRight className="h-4 w-4" />
                        </MagneticButton>
                      </Link>
                    </div>
                  </GlowCard>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: Interactive Preview */}
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="sticky top-20"
              >
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Live preview
                </div>
                <TiltCard
                  tiltAmount={6}
                  glareEnable={true}
                  glareMaxOpacity={0.15}
                  scale={1.01}
                  className="rounded-xl border border-border/50 shadow-2xl shadow-primary/5"
                >
                  <ProductDemo defaultTab={currentService.demoTab} />
                </TiltCard>
              </motion.div>
            </div>
          </div>
        </Spotlight>

        {/* Footer */}
        <footer className="border-t border-border py-8 relative z-10 bg-background/80 backdrop-blur-sm mt-16">
          <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <Logo size="lg" to="/" />
            <div className="flex items-center gap-6 text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              <span className="text-xs">© {new Date().getFullYear()} Automaire</span>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
