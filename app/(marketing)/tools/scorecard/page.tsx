import type { Metadata } from 'next'
import { PerformanceScorecard } from '@/components/marketing/PerformanceScorecard'

export const metadata: Metadata = {
  title: 'Performance Scorecard — Get your Durability Score',
  description:
    'A free 60-second assessment. Rate your training, nutrition, sleep and recovery to get your Durability Score and the single biggest lever holding you back.',
}

export default function ScorecardPage() {
  return (
    <div className="bg-sumi">
      <section className="grain relative overflow-hidden border-b border-border">
        <div className="glow-gold pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full blur-2xl" />
        <div className="container relative py-16 text-center md:py-20">
          <p className="text-xs uppercase tracking-widest text-kin">
            絆 · Free Assessment
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight text-washi sm:text-5xl md:text-6xl">
            What&apos;s your{' '}
            <span className="text-gold-gradient">Durability Score?</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Eight quick questions. See how built-to-last you are across training,
            nutrition, sleep and recovery — and the one lever that will move you
            fastest.
          </p>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <PerformanceScorecard />
        <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
          The Durability Index is Kizuna&apos;s north-star metric. This is the
          self-rated version — your coach computes the real one from your logged
          training and wearable data.
        </p>
      </section>
    </div>
  )
}
