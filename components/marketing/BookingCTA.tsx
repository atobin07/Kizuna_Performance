'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { track } from '@/lib/analytics'

export function BookingCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-aka to-sumi py-20 md:py-24">
      <span
        aria-hidden
        className="kanji pointer-events-none absolute -left-6 top-1/2 -translate-y-1/2 select-none text-[16rem] font-bold leading-none text-sumi/20 md:text-[24rem]"
      >
        絆
      </span>
      <div className="container relative z-10 flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black leading-tight tracking-tight text-washi sm:text-4xl md:text-5xl">
            Ready to build something that lasts?
          </h2>
          <p className="mt-4 text-lg text-washi/80">
            One conversation. No pressure. We will map your goals and tell you
            honestly whether we are the right fit.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="shrink-0"
          onClick={() => track('cta_click', { location: 'booking_band' })}
        >
          <Link href="/book">Book Discovery Call</Link>
        </Button>
      </div>
    </section>
  )
}
