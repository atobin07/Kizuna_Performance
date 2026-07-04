import type { Metadata } from 'next'
import Link from 'next/link'
import { Hero } from '@/components/marketing/Hero'
import { Methodology } from '@/components/marketing/Methodology'
import { StatsBand } from '@/components/marketing/StatsBand'
import { Marquee } from '@/components/marketing/Marquee'
import { Testimonials } from '@/components/marketing/Testimonials'
import { NewsletterSignup } from '@/components/marketing/NewsletterSignup'
import { BookingCTA } from '@/components/marketing/BookingCTA'
import { Reveal } from '@/components/marketing/Reveal'
import { LogoMark } from '@/components/marketing/Logo'
import { MacroCalculator } from '@/components/marketing/MacroCalculator'
import { IntegrationsShowcase } from '@/components/marketing/IntegrationsShowcase'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Elite movement. Built to last.',
  description:
    'Kizuna Performance — a coaching bond that goes beyond the gym. Recovery-first training, holistic health, and your data working for you. Built to last.',
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />

      {/* Connections lead the story — data is how the service is delivered */}
      <IntegrationsShowcase />

      <Methodology />
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

      {/* About preview */}
      <section className="grain relative overflow-hidden bg-card py-24 md:py-32">
        <div className="container grid items-center gap-14 md:grid-cols-2">
          <Reveal>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-kin">
              職人 · Shokunin
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-washi sm:text-5xl">
              Coaching as a craft.
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>
                Before Kizuna was a training room, it was a career in Japanese
                cuisine — years spent inside the discipline of the{' '}
                <span className="text-washi">shokunin</span> (職人), the artisan
                who devotes a lifetime to mastering one thing.
              </p>
              <p>
                Those principles — apprenticeship, repetition with attention,
                duty to the craft — now shape how I coach people. I invest in
                the whole person and the long journey: your training, your
                recovery, your health. The bond is the work. Nothing rushed,
                nothing wasted, built to last.
              </p>
            </div>
            <div className="mt-8">
              <Button asChild variant="outline">
                <Link href="/about">Read the full story</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal index={1} className="relative flex items-center justify-center">
            <div className="glow-gold pointer-events-none absolute h-96 w-96 rounded-full blur-2xl" />
            <LogoMark size={280} className="relative opacity-90" />
          </Reveal>
        </div>
      </section>

      <Testimonials />
      <NewsletterSignup />
      <BookingCTA />
    </>
  )
}
