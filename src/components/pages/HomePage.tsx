'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles as SparklesIcon } from 'lucide-react';
import { ShineButton } from '@/components/landing/ShineButton';
import { ProductDemo } from '@/components/landing/ProductDemo';
import { AnimatedCounter } from '@/components/landing/AnimatedCounter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Logo } from '@/components/Logo';
import {
  MeshGradient,
  GradientText,
  WordReveal,
  GlowCard,
  Spotlight,
  MagneticButton,
  Sparkles,
  PulseRing,
} from '@/components/animations';

export default function HomePage() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-background overflow-hidden">
        {/* Premium Mesh Gradient Background */}
        <MeshGradient intensity="subtle" speed="slow" className="fixed inset-0 z-0" />

        {/* Compact Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl"
        >
          <div className="container flex h-14 md:h-16 items-center justify-between overflow-visible">
            <Logo size="xl" />
            <div className="flex items-center gap-2 md:gap-4">
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
                <MagneticButton className="h-7 md:h-8 px-3 md:px-4 text-xs bg-primary text-primary-foreground rounded-md font-medium">
                  Get started
                </MagneticButton>
              </Link>
            </div>
          </div>
        </motion.nav>

        {/* Hero with Spotlight Effect */}
        <Spotlight className="relative pt-24 pb-12" spotlightSize={600} spotlightColor="rgba(120, 80, 220, 0.08)">
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center mb-8"
            >
              {/* Animated Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary mb-6"
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-green-500"
                />
                <span>5 founding slots available</span>
                <SparklesIcon className="h-3 w-3" />
              </motion.div>

              {/* Hero Title with Word Reveal */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                <WordReveal delay={0.5} staggerChildren={0.1}>
                  Design workflows visually.
                </WordReveal>
                <br />
                <span className="text-muted-foreground">
                  <WordReveal delay={0.8} staggerChildren={0.1}>
                    We handle the execution.
                  </WordReveal>
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="text-lg text-muted-foreground max-w-lg mx-auto"
              >
                You map the logic — our team implements, deploys, and maintains your{' '}
                <GradientText>automations</GradientText>.
              </motion.p>
            </motion.div>

            {/* Product Demo */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const }}
              className="max-w-4xl mx-auto"
            >
              <ProductDemo />
            </motion.div>

            {/* Stats with Glow Cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-6 md:gap-12 mt-10"
            >
              {[
                { value: 50, suffix: '%', label: 'Faster delivery' },
                { value: 2595, label: 'Runs per month' },
                { value: 99.9, suffix: '%', label: 'Uptime SLA' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold tabular-nums">
                    <GradientText animate={false}>
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </GradientText>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Spotlight>

        {/* How It Works with Glow Cards */}
        <section className="py-20 border-t border-border relative">
          <Sparkles count={15} color="hsl(262, 80%, 70%)" className="opacity-30" />
          <div className="container relative z-10">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold">
                <GradientText>How it works</GradientText>
              </h2>
              <Link href="/services" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors group">
                View services
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Design', desc: 'Map your workflow visually', detail: 'Drag-and-drop intent capture with our intuitive builder' },
                { step: '02', title: 'Submit', desc: 'We review and implement', detail: 'Our expert team builds the execution layer' },
                { step: '03', title: 'Monitor', desc: 'Track runs and results', detail: 'Live logs, analytics, and performance insights' },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                >
                  <GlowCard className="h-full p-6" glowColor="hsl(262, 80%, 60%)" glowSize={250}>
                    <div className="relative">
                      <div className="absolute -top-2 -left-2 opacity-20">
                        <PulseRing size={40} rings={2} color="hsl(262, 80%, 60%)" />
                      </div>
                      <div className="text-xs font-mono text-primary mb-3">{item.step}</div>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground mb-2">{item.desc}</p>
                      <p className="text-sm text-muted-foreground/60">{item.detail}</p>
                    </div>
                  </GlowCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans comparison with Animated Border */}
        <section className="py-20 border-t border-border bg-muted/20 relative">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold">Compare plans</h2>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors group">
                Full comparison
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-xl border border-border/50 bg-card shadow-lg overflow-visible"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="p-4 text-left text-xs font-medium text-muted-foreground">Feature</th>
                    <th className="p-4 text-center text-xs font-medium">Starter</th>
                    <th className="p-4 text-center text-xs font-medium bg-primary/10 relative">
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full whitespace-nowrap z-10">
                        Popular
                      </span>
                      Growth
                    </th>
                    <th className="p-4 text-center text-xs font-medium">Scale</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Custom website', starter: '1 page', growth: 'Multi-page', scale: 'Unlimited' },
                    { feature: 'Workflow designs', starter: '3', growth: '10', scale: '∞' },
                    { feature: 'AI chat', starter: '✓', growth: '✓', scale: '✓' },
                    { feature: 'Voice agent', starter: '–', growth: '–', scale: '✓' },
                    { feature: 'Priority support', starter: '–', growth: '✓', scale: '✓' },
                  ].map((row, i) => (
                    <motion.tr
                      key={row.feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4 text-muted-foreground font-medium">{row.feature}</td>
                      <td className="p-4 text-center">{row.starter}</td>
                      <td className="p-4 text-center bg-primary/5 font-medium">{row.growth}</td>
                      <td className="p-4 text-center">{row.scale}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </section>

        {/* CTA with Premium Effects */}
        <section className="py-24 border-t border-border relative overflow-hidden">
          <MeshGradient intensity="subtle" speed="slow" className="absolute inset-0 opacity-50" />
          <Sparkles count={25} color="hsl(262, 80%, 70%)" className="opacity-40" />

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to <GradientText>design your workflow</GradientText>?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                You design the logic. We build, deploy, and maintain everything else.
              </p>
              <Link href="/contact">
                <MagneticButton className="inline-flex items-center gap-2 h-12 px-8 text-base bg-primary text-primary-foreground rounded-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
                  Get started
                  <ArrowRight className="h-5 w-5" />
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
              <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
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
