'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogoMark } from '@/components/marketing/Logo'
import { track } from '@/lib/analytics'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const mx = useMotionValue(50)
  const my = useMotionValue(30)
  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${mx}% ${my}%, rgba(231,178,76,0.14), transparent 70%)`

  function onMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mx.set(((e.clientX - rect.left) / rect.width) * 100)
    my.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      className="grain relative flex min-h-[calc(100vh-4.5rem)] items-center overflow-hidden bg-sumi"
    >
      {/* Cursor-follow spotlight */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: spotlight }}
      />
      {/* Ambient gold glow */}
      <div
        aria-hidden
        className="glow-gold pointer-events-none absolute -right-40 top-0 z-0 h-[42rem] w-[42rem] rounded-full blur-2xl"
      />
      {/* Giant faint kanji */}
      <span
        aria-hidden
        className="kanji pointer-events-none absolute -right-10 top-1/2 z-0 -translate-y-1/2 select-none text-[24rem] font-bold leading-none text-washi/[0.025] md:text-[38rem]"
      >
        絆
      </span>

      <div className="container relative z-10 py-24 md:py-28">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl">
          <motion.div variants={item} className="mb-8 flex items-center gap-4">
            <LogoMark size={44} animate />
            <span className="tracked-caps text-xs font-medium text-kin">
              絆 · The bond between coach & athlete
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-5xl font-bold leading-[0.98] tracking-tight text-washi sm:text-7xl md:text-8xl"
          >
            Elite movement.
            <br />
            <span className="text-gold-gradient">Built to last.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            Kizuna (絆) is the bond. From my gym in Virginia Beach, I don&apos;t
            just write your program — I stay in your corner every day, in and
            out of the gym. Marathons, the platform, adventure races or just
            training for a long, strong life — recovery-first and invested in
            your whole health.
          </motion.p>

          <motion.div variants={item} className="mt-11 flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group shadow-[0_0_40px_-12px_rgba(231,178,76,0.6)]"
              onClick={() =>
                track('cta_click', { label: 'Book Discovery Call', location: 'hero' })
              }
            >
              <Link href="/book">
                Book Discovery Call
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#method">See the Method</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1 text-muted-foreground"
        >
          <span className="text-[0.6rem] uppercase tracking-[0.3em]">Scroll</span>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  )
}
