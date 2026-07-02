'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { track } from '@/lib/analytics'

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-sumi">
      {/* Faint kanji background accent */}
      <span
        aria-hidden
        className="kanji pointer-events-none absolute -right-8 top-1/2 -translate-y-1/2 select-none text-[22rem] font-bold leading-none text-washi/[0.03] md:text-[34rem]"
      >
        絆
      </span>

      <div className="container relative z-10 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <p className="tracked-caps mb-6 text-xs font-medium text-kin">
            絆 · Elite Performance Coaching
          </p>

          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-washi sm:text-6xl md:text-7xl">
            Elite movement.
            <br />
            <span className="text-kin">Built to last.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Kizuna (絆) is the bond — the connection forged between people
            through shared commitment. We build that same durability into your
            body: precise, intelligent training that makes you stronger today
            and keeps you moving for decades.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              onClick={() =>
                track('cta_click', {
                  label: 'Book Discovery Call',
                  location: 'hero',
                })
              }
            >
              <Link href="/book">Book Discovery Call</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="#method">See the Method</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
