import type { Metadata } from 'next'
import Link from 'next/link'
import { Gauge, Calculator, BookOpen, CalendarCheck, ArrowUpRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Free Tools & Guides',
  description:
    'Free from Kizuna Performance: the Durability Scorecard, a coach-grade macro calculator, the Recovery-First Blueprint, and the 7-Day Durability Reset.',
}

const TOOLS = [
  {
    href: '/tools/scorecard',
    icon: Gauge,
    tag: 'Assessment',
    title: 'Performance Scorecard',
    body: 'Eight questions. Get your Durability Score across training, nutrition, sleep and recovery — and the one lever holding you back.',
    featured: true,
  },
  {
    href: '/tools/macros',
    icon: Calculator,
    tag: 'Calculator',
    title: 'Macro Blueprint',
    body: 'Your personalized daily calories and protein/carb/fat targets in 60 seconds. No signup.',
  },
  {
    href: '/tools/blueprint',
    icon: BookOpen,
    tag: 'Guide',
    title: 'The Recovery-First Blueprint',
    body: 'A free guide to training that lasts — programming recovery, sleep and nutrition alongside the work.',
  },
  {
    href: '/tools/reset',
    icon: CalendarCheck,
    tag: 'Challenge',
    title: 'The 7-Day Durability Reset',
    body: 'One high-leverage action a day for a week. Feel what a recovery-first approach does.',
  },
]

export default function ToolsHubPage() {
  return (
    <div className="bg-sumi">
      <section className="grain relative overflow-hidden border-b border-border">
        <div className="glow-gold pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full blur-2xl" />
        <div className="container relative py-16 text-center md:py-20">
          <p className="text-xs uppercase tracking-widest text-kin">
            絆 · Free from Kizuna
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight text-washi sm:text-5xl md:text-6xl">
            Start getting{' '}
            <span className="text-gold-gradient">better today.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Real coaching value, free — no account needed. Use these on your own,
            or let them show you exactly where a coach would take you next.
          </p>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <div className="grid gap-4 md:grid-cols-2">
          {TOOLS.map((t) => {
            const Icon = t.icon
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cnCard(t.featured)}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex rounded-lg border border-kin/30 bg-kin/10 p-3 text-kin">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="tracked-caps text-xs font-medium text-koke">
                    {t.tag}
                  </span>
                </div>
                <h2 className="mt-5 flex items-center gap-2 font-display text-2xl font-bold text-washi">
                  {t.title}
                  <ArrowUpRight className="h-5 w-5 text-kin transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {t.body}
                </p>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function cnCard(featured?: boolean) {
  return [
    'group block rounded-2xl border bg-card p-7 transition-colors',
    featured
      ? 'border-kin/40 md:col-span-2 hover:border-kin'
      : 'border-border hover:border-kin/40',
  ].join(' ')
}
