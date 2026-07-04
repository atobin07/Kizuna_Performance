'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, animate } from 'framer-motion'

interface Stat {
  value: number
  suffix?: string
  prefix?: string
  label: string
}

const STATS: Stat[] = [
  { value: 15, suffix: '+', label: 'Years in the craft' },
  { value: 98, suffix: '%', label: 'Client retention' },
  { value: 40, suffix: 'k', prefix: '', label: 'Coached sessions' },
  { value: 1, prefix: '', label: 'Athlete at a time' },
]

function Counter({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, stat.value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, stat.value])

  return (
    <span ref={ref} className="font-display text-5xl font-bold text-washi md:text-6xl">
      {stat.prefix}
      {display}
      {stat.suffix}
    </span>
  )
}

export function StatsBand() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-sumi">
      <div className="container grid grid-cols-2 gap-y-10 py-16 md:grid-cols-4 md:py-20">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col items-center text-center"
          >
            <Counter stat={stat} />
            <span className="mt-3 max-w-[10rem] text-xs uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default StatsBand
