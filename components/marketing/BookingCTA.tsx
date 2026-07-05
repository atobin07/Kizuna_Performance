'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { track } from '@/lib/analytics'

export function BookingCTA() {
  return (
    <section className="relative overflow-hidden bg-sumi py-28 md:py-36">
      {/* Layered background */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-aka/25 via-sumi to-sumi"
      />
      <div
        aria-hidden
        className="glow-gold pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
      />
      <span
        aria-hidden
        className="kanji pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[26rem] font-bold leading-none text-washi/[0.03] md:text-[40rem]"
      >
        絆
      </span>

      <div className="container relative z-10 mx-auto max-w-3xl text-center">
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-kin">
          絆 · The bond starts here
        </p>
        <h2 className="font-display text-4xl font-black leading-[1.02] tracking-tight text-washi sm:text-5xl md:text-6xl">
          Let&apos;s build the athlete you&apos;ll still be{' '}
          <span className="text-gold-gradient">in twenty years.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          This is built on connection, so I only take a limited number of
          athletes at a time. Apply, and we&apos;ll talk it through — where you
          are, what your data can do, and whether we&apos;re the right fit to get
          you there.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="group shadow-[0_0_40px_-12px_rgba(231,178,76,0.6)]"
            onClick={() => track('cta_click', { location: 'booking_band' })}
          >
            <Link href="/book">
              Apply for a spot
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Start free — connect your data</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-washi/60">
          Limited roster · applications reviewed personally.
        </p>
      </div>
    </section>
  )
}
