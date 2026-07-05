import type { Metadata } from 'next'
import { Hero } from '@/components/marketing/Hero'
import { Methodology } from '@/components/marketing/Methodology'
import { Disciplines } from '@/components/marketing/Disciplines'
import { Credentials } from '@/components/marketing/Credentials'
import { StatsBand } from '@/components/marketing/StatsBand'
import { Marquee } from '@/components/marketing/Marquee'
import { NewsletterSignup } from '@/components/marketing/NewsletterSignup'
import { BookingCTA } from '@/components/marketing/BookingCTA'
import { Reveal } from '@/components/marketing/Reveal'
import { MacroCalculator } from '@/components/marketing/MacroCalculator'
import { IntegrationsShowcase } from '@/components/marketing/IntegrationsShowcase'

export const metadata: Metadata = {
  title: 'Elite movement. Built to last.',
  description:
    'Kizuna Performance — data-driven coaching in Virginia Beach for marathons, lifting competitions, adventure races and longevity fitness. Recovery-first, whole-health, built to last.',
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />

      {/* Connections lead the story — data is how the service is delivered */}
      <IntegrationsShowcase />

      <Methodology />
      <Disciplines />
      <Credentials />
      <StatsBand />

      {/* Interactive hook — the lead magnet */}
      <section className="grain relative overflow-hidden bg-sumi py-24 md:py-32">
        <div className="container relative">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-kin">
              Try it now · no signup
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-washi sm:text-5xl">
              See what your macros{' '}
              <span className="text-gold-gradient">should be.</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Nutrition is where most plans quietly fail. Here&apos;s your
              starting blueprint — part of coaching your whole health, not just
              your workouts.
            </p>
          </Reveal>
          <Reveal index={1}>
            <MacroCalculator />
          </Reveal>
        </div>
      </section>

      <NewsletterSignup />
      <BookingCTA />
    </>
  )
}
