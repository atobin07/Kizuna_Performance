'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Moon, Activity, ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PROVIDERS } from '@/lib/integrations'

// A few display-only names to fill out the wall alongside the live registry.
const EXTRA = [
  { name: 'Apple Watch', brand: '#F2EEE6' },
  { name: 'Polar', brand: '#D51B2B' },
  { name: 'Google Fit', brand: '#4285F4' },
  { name: 'Health Connect', brand: '#34A853' },
]

const CHIPS = [
  ...PROVIDERS.map((p) => ({ name: p.name, brand: p.brand })),
  ...EXTRA,
]

const METRICS = [
  {
    icon: Moon,
    name: 'Sleep Density',
    blurb: 'How restorative your sleep actually is — not just hours in bed.',
  },
  {
    icon: Activity,
    name: 'Readiness',
    blurb: 'A daily green light: train hard, or back off and recover.',
  },
  {
    icon: ShieldCheck,
    name: 'Durability Index',
    blurb: 'Your north-star score — how built-to-last you are this week.',
  },
]

function ChipRow({ reverse }: { reverse?: boolean }) {
  const items = [...CHIPS, ...CHIPS]
  return (
    <div className="mask-fade-r flex overflow-hidden">
      <div
        className="animate-marquee flex shrink-0 items-center gap-3 whitespace-nowrap pr-3"
        style={reverse ? { animationDirection: 'reverse' } : undefined}
      >
        {items.map((c, i) => (
          <span
            key={i}
            className="flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-washi"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: c.brand }}
            />
            {c.name}
          </span>
        ))}
      </div>
    </div>
  )
}

export function IntegrationsShowcase() {
  return (
    <section className="grain relative overflow-hidden bg-card py-24 md:py-32">
      <div className="glow-gold pointer-events-none absolute left-1/2 top-10 h-72 w-[40rem] -translate-x-1/2 rounded-full blur-3xl" />
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-kin">
            Beyond the gym
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-washi sm:text-5xl md:text-6xl">
            The bond doesn&apos;t end{' '}
            <span className="text-gold-gradient">at the gym door.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            The training and our bond are the work. Your data is how I stay in
            it — reading your sleep, recovery and strain so I&apos;m coaching you
            every day, not just on session days.
          </p>
          <p className="mt-4 text-xs uppercase tracking-widest text-koke">
            The coaching &amp; the bond are the product · the data is the service
          </p>
        </motion.div>

        {/* Device wall */}
        <div className="mt-14 space-y-3">
          <ChipRow />
          <ChipRow reverse />
        </div>

        {/* Flow → scores */}
        <div className="mx-auto mt-14 flex max-w-3xl items-center justify-center gap-4 text-muted-foreground">
          <span className="text-sm uppercase tracking-widest">Your devices</span>
          <ArrowRight className="h-4 w-4 text-kin" />
          <span className="kanji text-2xl text-kin">絆</span>
          <ArrowRight className="h-4 w-4 text-kin" />
          <span className="text-sm uppercase tracking-widest text-washi">
            Coached daily
          </span>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {METRICS.map((m, i) => {
            const Icon = m.icon
            return (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-xl border border-border bg-sumi p-6 transition-colors hover:border-kin/40"
              >
                <span className="inline-flex rounded-lg border border-kin/30 bg-kin/10 p-2.5 text-kin">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-washi">
                  {m.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {m.blurb}
                </p>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/login">Start free — connect your data</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/tools/macros">Try the macro tool</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default IntegrationsShowcase
