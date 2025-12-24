'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { AuroraBackground } from '@/components/landing/AuroraBackground';
import { ShineButton } from '@/components/landing/ShineButton';
import { ScrollFadeIn } from '@/components/landing/ScrollFadeIn';
import { ProductDemo } from '@/components/landing/ProductDemo';
import { AnimatedCounter } from '@/components/landing/AnimatedCounter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Logo } from '@/components/Logo';

export default function HomePage() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-background">
        {/* Compact Nav */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-sm"
        >
          <div className="container flex h-14 md:h-16 items-center justify-between overflow-visible">
            <Logo size="xl" />
            <div className="flex items-center gap-2 md:gap-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              <Link href="/services" className="hidden sm:block text-muted-foreground hover:text-foreground text-xs transition-colors">
                Services
              </Link>
              <Link href="/pricing" className="hidden sm:block text-muted-foreground hover:text-foreground text-xs transition-colors">
                Pricing
              </Link>
              <Link href="/auth" className="text-muted-foreground hover:text-foreground text-xs transition-colors">
                Login
              </Link>
              <Link href="/contact">
                <ShineButton size="default" className="h-7 md:h-8 px-2 md:px-3 text-xs">
                  Get started
                </ShineButton>
              </Link>
            </div>
          </div>
        </motion.nav>

        {/* Hero */}
        <section className="relative pt-20 pb-8">
          <AuroraBackground className="opacity-30" />

          <div className="container relative">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-center mb-6"
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border text-[11px] text-muted-foreground mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                5 founding slots available
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2 text-balance">
                Design workflows visually.
                <br />
                <span className="text-muted-foreground">We handle the execution.</span>
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                You map the logic — our team implements, deploys, and maintains your automations.
              </p>
            </motion.div>

            {/* Product Demo */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <ProductDemo />
            </motion.div>

            {/* Stats - Clean, minimal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-8 mt-6 text-center"
            >
              {[
                { value: 50, suffix: '%', label: 'Faster delivery' },
                { value: 2595, label: 'Runs per month' },
                { value: 99.9, suffix: '%', label: 'Uptime SLA' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-semibold tabular-nums">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 border-t border-border">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">How it works</h2>
              <Link href="/services" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                View services <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Clean 3-column layout */}
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Design', desc: 'Map your workflow visually', detail: 'Drag-and-drop intent capture' },
                { step: '02', title: 'Submit', desc: 'We review and implement', detail: 'Our team builds the execution' },
                { step: '03', title: 'Monitor', desc: 'Track runs and results', detail: 'Live logs and performance data' },
              ].map((item, i) => (
                <ScrollFadeIn key={item.step} delay={i * 0.05}>
                  <div className="group">
                    <div className="text-xs text-muted-foreground mb-2">{item.step}</div>
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{item.desc}</p>
                    <p className="text-xs text-muted-foreground/60">{item.detail}</p>
                  </div>
                </ScrollFadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Plans comparison */}
        <section className="py-12 border-t border-border bg-muted/30">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Compare plans</h2>
              <Link href="/pricing" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                Full comparison <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Clean table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">Feature</th>
                    <th className="p-3 text-center text-xs font-medium">Starter</th>
                    <th className="p-3 text-center text-xs font-medium bg-primary/5">Growth</th>
                    <th className="p-3 text-center text-xs font-medium">Scale</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Custom website', starter: '1 page', growth: 'Multi-page', scale: 'Unlimited' },
                    { feature: 'Workflow designs', starter: '3', growth: '10', scale: '∞' },
                    { feature: 'AI chat', starter: '✓', growth: '✓', scale: '✓' },
                    { feature: 'Voice agent', starter: '–', growth: '–', scale: '✓' },
                  ].map((row) => (
                    <tr key={row.feature} className="border-b border-border/50 last:border-0">
                      <td className="p-3 text-muted-foreground">{row.feature}</td>
                      <td className="p-3 text-center">{row.starter}</td>
                      <td className="p-3 text-center bg-primary/5">{row.growth}</td>
                      <td className="p-3 text-center">{row.scale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 border-t border-border">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-semibold mb-2">
                Ready to design your workflow?
              </h2>
              <p className="text-muted-foreground mb-6">
                You design the logic. We build, deploy, and maintain everything else.
              </p>
              <Link href="/contact">
                <ShineButton size="lg" showArrow>
                  Get started
                </ShineButton>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-6">
          <div className="container flex items-center justify-between text-sm">
            <Logo size="lg" to="/" />
            <div className="flex items-center gap-6 text-muted-foreground">
              <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              <span className="text-xs">© {new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
