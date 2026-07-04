import type { Metadata } from 'next'
import { MacroCalculator } from '@/components/marketing/MacroCalculator'

export const metadata: Metadata = {
  title: 'Macro Blueprint — See what your macros should be',
  description:
    'Free macro calculator. Get your personalized daily calories and protein/carb/fat targets in 60 seconds, then track against them with Kizuna.',
}

export default function MacrosToolPage() {
  return (
    <div className="bg-sumi">
      <section className="grain relative overflow-hidden border-b border-border">
        <div className="glow-gold pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full blur-2xl" />
        <div className="container relative py-16 text-center md:py-20">
          <p className="text-xs uppercase tracking-widest text-kin">
            絆 · Free Tool
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight text-washi sm:text-5xl md:text-6xl">
            See what your macros{' '}
            <span className="text-gold-gradient">should be.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            No signup. Enter your details and get a coach-grade nutrition
            blueprint — calories and macros dialed to your goal.
          </p>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <MacroCalculator />
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
          Estimates use the Mifflin-St Jeor equation. Individual needs vary —
          your Kizuna coach fine-tunes these from your real logged data.
        </p>
      </section>
    </div>
  )
}
