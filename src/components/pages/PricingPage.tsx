'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Minus, HelpCircle, ArrowRight, Sparkles as SparklesIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MeshGradient,
  GradientText,
  WordReveal,
  AnimatedBorder,
  GlowCard,
  MagneticButton,
  Spotlight,
  Sparkles,
} from '@/components/animations';

type PlanId = 'starter' | 'growth' | 'scale';

const plans = [
  { id: 'starter' as const, name: 'Starter', price: 2500, period: 'one-time', desc: 'MVP in 2 weeks' },
  { id: 'growth' as const, name: 'Growth', price: 1500, period: '/month', desc: 'Full automation stack', popular: true },
  { id: 'scale' as const, name: 'Scale', price: 4000, period: '/month', desc: 'Enterprise + support' },
];

const features = [
  {
    category: 'Websites',
    items: [
      { name: 'Custom landing page', starter: true, growth: true, scale: true },
      { name: 'CMS integration', starter: false, growth: true, scale: true, tip: 'Sanity, Contentful, or Strapi' },
      { name: 'E-commerce', starter: false, growth: false, scale: true },
      { name: 'Multi-language', starter: false, growth: false, scale: true },
    ]
  },
  {
    category: 'Automation',
    items: [
      { name: 'n8n workflows', starter: '3', growth: '10', scale: 'Unlimited' },
      { name: 'Webhook triggers', starter: true, growth: true, scale: true },
      { name: 'CRM sync', starter: false, growth: true, scale: true, tip: 'HubSpot, Salesforce, Pipedrive' },
      { name: 'Custom integrations', starter: false, growth: true, scale: true },
    ]
  },
  {
    category: 'AI Agents',
    items: [
      { name: 'Chat widget', starter: true, growth: true, scale: true },
      { name: 'Lead qualification', starter: false, growth: true, scale: true },
      { name: 'Voice agent', starter: false, growth: false, scale: true, tip: 'ElevenLabs-powered' },
      { name: 'Custom training', starter: false, growth: false, scale: true },
    ]
  },
  {
    category: 'Support',
    items: [
      { name: 'Email support', starter: true, growth: true, scale: true },
      { name: 'Slack channel', starter: false, growth: true, scale: true },
      { name: 'Priority response', starter: false, growth: false, scale: true, tip: '< 4 hour response' },
      { name: 'Dedicated manager', starter: false, growth: false, scale: true },
    ]
  },
];

// Skeleton for pricing table
function PricingTableSkeleton() {
  return (
    <div className="space-y-6 mt-4">
      {[1, 2, 3, 4].map((section) => (
        <div key={section} className="space-y-2">
          <Skeleton className="h-3 w-20 mb-2" />
          <div className="border border-border/30 rounded-lg overflow-hidden">
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="grid grid-cols-4 gap-4 py-2 px-3 border-b border-border/20 last:border-0">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-4 mx-auto" />
                <Skeleton className="h-3 w-4 mx-auto" />
                <Skeleton className="h-3 w-4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('growth');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const renderValue = (value: boolean | string, isSelected: boolean) => {
    if (typeof value === 'string') {
      return (
        <motion.span
          className={cn("text-sm font-semibold", isSelected && "text-primary")}
          initial={false}
          animate={{ scale: isSelected ? 1.1 : 1 }}
          transition={{ duration: 0.15 }}
        >
          {value}
        </motion.span>
      );
    }
    return value ? (
      <motion.div
        initial={false}
        animate={{ scale: isSelected ? 1.2 : 1 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "h-5 w-5 rounded-full flex items-center justify-center",
          isSelected ? "bg-primary/20" : "bg-muted"
        )}
      >
        <Check className={cn("h-3 w-3", isSelected ? "text-primary" : "text-muted-foreground")} />
      </motion.div>
    ) : (
      <Minus className="h-3 w-3 text-muted-foreground/30" />
    );
  };

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
              <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                Home
              </Link>
              <Link href="/contact">
                <MagneticButton className="h-9 px-4 text-sm bg-primary text-primary-foreground rounded-md font-medium">
                  Get started
                </MagneticButton>
              </Link>
            </div>
          </div>
        </motion.nav>

        <Spotlight className="container py-12 relative z-10" spotlightSize={600} spotlightColor="rgba(120, 80, 220, 0.06)">
          <div className="grid lg:grid-cols-[1fr_320px] gap-10">
            {/* Main Content - Comparison Table */}
            <div>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8"
              >
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  <WordReveal delay={0.3}>Simple, transparent pricing</WordReveal>
                </h1>
                <p className="text-muted-foreground text-lg">
                  Choose the plan that <GradientText>fits your needs</GradientText>
                </p>
              </motion.div>

              {/* Plan Headers */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="sticky top-14 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30 -mx-4 px-4 py-4 mb-6"
              >
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-end">
                    Features
                  </div>
                  {plans.map((plan, i) => (
                    <motion.button
                      key={plan.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={cn(
                        'text-left p-3 rounded-xl border-2 transition-all relative overflow-hidden',
                        selectedPlan === plan.id
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                          : 'border-transparent hover:bg-muted/50 hover:border-border'
                      )}
                    >
                      {plan.popular && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute -top-1 -right-1 text-[9px] px-2 py-0.5 rounded-bl-lg rounded-tr-lg bg-primary text-primary-foreground font-semibold flex items-center gap-1"
                        >
                          <SparklesIcon className="h-2.5 w-2.5" />
                          Popular
                        </motion.span>
                      )}
                      <div className="text-sm font-semibold mb-1">{plan.name}</div>
                      <div className="text-2xl font-bold">
                        <GradientText animate={false}>
                          ${plan.price.toLocaleString()}
                        </GradientText>
                        <span className="text-xs font-normal text-muted-foreground">{plan.period}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Feature Table */}
              {isLoading ? (
                <PricingTableSkeleton />
              ) : (
                <div className="space-y-8">
                  {features.map((category, catIndex) => (
                    <motion.div
                      key={category.category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + catIndex * 0.1, duration: 0.4 }}
                    >
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 pl-2 flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        {category.category}
                      </div>
                      <GlowCard className="overflow-hidden" glowColor="hsl(262, 80%, 60%)" glowSize={200}>
                        <div className="rounded-xl border border-border/30 overflow-hidden">
                          {category.items.map((feature, i) => (
                            <motion.div
                              key={feature.name}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.7 + catIndex * 0.1 + i * 0.05 }}
                              className={cn(
                                'grid grid-cols-4 gap-4 py-3 px-4',
                                i !== category.items.length - 1 && 'border-b border-border/20'
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{feature.name}</span>
                                {feature.tip && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs max-w-[200px]">{feature.tip}</TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                              <div className={cn(
                                'flex items-center justify-center transition-all rounded-lg',
                                selectedPlan === 'starter' && 'bg-primary/5 -my-1 py-1'
                              )}>
                                {renderValue(feature.starter, selectedPlan === 'starter')}
                              </div>
                              <div className={cn(
                                'flex items-center justify-center transition-all rounded-lg',
                                selectedPlan === 'growth' && 'bg-primary/5 -my-1 py-1'
                              )}>
                                {renderValue(feature.growth, selectedPlan === 'growth')}
                              </div>
                              <div className={cn(
                                'flex items-center justify-center transition-all rounded-lg',
                                selectedPlan === 'scale' && 'bg-primary/5 -my-1 py-1'
                              )}>
                                {renderValue(feature.scale, selectedPlan === 'scale')}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </GlowCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky Summary Rail */}
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="sticky top-20"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedPlan}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AnimatedBorder
                      borderWidth={2}
                      duration={4}
                      gradientColors={['hsl(262, 80%, 60%)', 'hsl(190, 80%, 50%)', 'hsl(320, 70%, 55%)', 'hsl(262, 80%, 60%)']}
                    >
                      <div className="p-6">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                          Selected Plan
                        </div>

                        {plans.filter(p => p.id === selectedPlan).map((plan) => (
                          <div key={plan.id}>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-bold">{plan.name}</h3>
                              {plan.popular && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold flex items-center gap-1">
                                  <SparklesIcon className="h-2.5 w-2.5" />
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-5">{plan.desc}</p>

                            <div className="text-4xl font-bold mb-1">
                              <GradientText>
                                ${plan.price.toLocaleString()}
                              </GradientText>
                              <span className="text-base font-normal text-muted-foreground">{plan.period}</span>
                            </div>

                            <div className="border-t border-border/30 my-5 pt-5">
                              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                What&apos;s included
                              </div>
                              <div className="space-y-2">
                                {features.flatMap(cat =>
                                  cat.items.filter(f => {
                                    const val = f[selectedPlan];
                                    return val === true || typeof val === 'string';
                                  }).slice(0, 2)
                                ).slice(0, 6).map((f, i) => (
                                  <motion.div
                                    key={f.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                      <Check className="h-3 w-3 text-primary" />
                                    </div>
                                    <span>{f.name}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            <Link href="/contact" className="block">
                              <MagneticButton className="w-full h-11 text-sm bg-primary text-primary-foreground rounded-lg font-semibold inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                                Get started
                                <ArrowRight className="h-4 w-4" />
                              </MagneticButton>
                            </Link>

                            <p className="text-xs text-muted-foreground text-center mt-4">
                              No contracts · Cancel anytime
                            </p>
                          </div>
                        ))}
                      </div>
                    </AnimatedBorder>
                  </motion.div>
                </AnimatePresence>

                {/* FAQ Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-5"
                >
                  <GlowCard className="p-4" glowColor="hsl(262, 80%, 60%)" glowSize={150}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">Have questions?</div>
                        <div className="text-xs text-muted-foreground">Book a free call with our team</div>
                      </div>
                      <Link href="/contact">
                        <MagneticButton className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
                          <ArrowRight className="h-4 w-4" />
                        </MagneticButton>
                      </Link>
                    </div>
                  </GlowCard>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </Spotlight>

        {/* CTA Section */}
        <section className="py-20 border-t border-border relative overflow-hidden">
          <Sparkles count={20} color="hsl(262, 80%, 70%)" className="opacity-30" />
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Still not sure? <GradientText>Let&apos;s talk.</GradientText>
              </h2>
              <p className="text-muted-foreground mb-6">
                Book a free 15-minute call and we&apos;ll help you find the right plan.
              </p>
              <Link href="/contact">
                <MagneticButton className="h-11 px-6 text-base bg-primary text-primary-foreground rounded-lg font-semibold inline-flex items-center gap-2">
                  Schedule a call
                  <ArrowRight className="h-4 w-4" />
                </MagneticButton>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 relative z-10 bg-background/80 backdrop-blur-sm">
          <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <Logo size="lg" to="/" />
            <div className="flex items-center gap-6 text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              <span className="text-xs">© {new Date().getFullYear()} Automaire</span>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
