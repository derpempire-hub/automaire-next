'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Minus, HelpCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShineButton } from '@/components/landing/ShineButton';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
          className="text-xs font-medium"
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
      >
        <Check className="h-3.5 w-3.5 text-primary" />
      </motion.div>
    ) : (
      <Minus className="h-3 w-3 text-muted-foreground/30" />
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background">
        {/* Nav */}
        <nav className="border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container flex h-12 items-center justify-between">
            <Logo size="xl" />
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/" className="text-muted-foreground hover:text-foreground text-xs">
                Home
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
          <div className="grid lg:grid-cols-[1fr_280px] gap-8">
            {/* Main Content - Comparison Table */}
            <div>
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-1">Pricing</h1>
                <p className="text-sm text-muted-foreground">Compare plans and features</p>
              </div>

              {/* Plan Headers */}
              <div className="sticky top-12 z-40 bg-background/95 backdrop-blur-sm border-b border-border/30 -mx-4 px-4 py-3">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Features
                  </div>
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={cn(
                        'text-left p-2 rounded-lg border transition-all',
                        selectedPlan === plan.id
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm font-semibold">{plan.name}</span>
                        {plan.popular && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-medium">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-bold">
                        ${plan.price.toLocaleString()}
                        <span className="text-xs font-normal text-muted-foreground">{plan.period}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature Table */}
              {isLoading ? (
                <PricingTableSkeleton />
              ) : (
              <div className="mt-4">
                {features.map((category) => (
                  <motion.div
                    key={category.category}
                    className="mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2 pl-2">
                      {category.category}
                    </div>
                    <div className="border border-border/30 rounded-lg overflow-hidden">
                      {category.items.map((feature, i) => (
                        <div
                          key={feature.name}
                          className={cn(
                            'grid grid-cols-4 gap-4 py-2 px-3 text-xs',
                            i !== category.items.length - 1 && 'border-b border-border/20'
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{feature.name}</span>
                            {feature.tip && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground/50" />
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">{feature.tip}</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <div className={cn(
                            'flex items-center justify-center',
                            selectedPlan === 'starter' && 'bg-primary/5 -my-2 py-2 rounded'
                          )}>
                            {renderValue(feature.starter, selectedPlan === 'starter')}
                          </div>
                          <div className={cn(
                            'flex items-center justify-center',
                            selectedPlan === 'growth' && 'bg-primary/5 -my-2 py-2 rounded'
                          )}>
                            {renderValue(feature.growth, selectedPlan === 'growth')}
                          </div>
                          <div className={cn(
                            'flex items-center justify-center',
                            selectedPlan === 'scale' && 'bg-primary/5 -my-2 py-2 rounded'
                          )}>
                            {renderValue(feature.scale, selectedPlan === 'scale')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              )}
            </div>
            {/* Sticky Summary Rail */}
            <div className="hidden lg:block">
              <div className="sticky top-20">
                <motion.div
                  key={selectedPlan}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-border/50 rounded-xl p-4 bg-card"
                >
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Selected Plan
                  </div>

                  {plans.filter(p => p.id === selectedPlan).map((plan) => (
                    <div key={plan.id}>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-bold">{plan.name}</h3>
                        {plan.popular && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-medium">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">{plan.desc}</p>

                      <div className="text-3xl font-bold mb-1">
                        ${plan.price.toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                      </div>

                      <div className="border-t border-border/30 my-4 pt-4">
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          Includes
                        </div>
                        <div className="space-y-1.5">
                          {features.flatMap(cat =>
                            cat.items.filter(f => {
                              const val = f[selectedPlan];
                              return val === true || typeof val === 'string';
                            }).slice(0, 2)
                          ).slice(0, 5).map((f) => (
                            <div key={f.name} className="flex items-center gap-2 text-xs">
                              <Check className="h-3 w-3 text-primary" />
                              <span>{f.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Link href="/contact" className="block">
                        <ShineButton size="lg" className="w-full h-10 text-sm">
                          Get started
                        </ShineButton>
                      </Link>

                      <p className="text-[10px] text-muted-foreground text-center mt-3">
                        No contracts · Cancel anytime
                      </p>
                    </div>
                  ))}
                </motion.div>

                {/* FAQ Link */}
                <div className="mt-4 p-3 border border-border/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium">Questions?</div>
                      <div className="text-[10px] text-muted-foreground">Book a call</div>
                    </div>
                    <Link href="/contact">
                      <ArrowRight className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
