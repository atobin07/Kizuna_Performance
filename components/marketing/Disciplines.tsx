'use client'

import { motion } from 'framer-motion'
import { Footprints, Dumbbell, Mountain, Infinity as InfinityIcon } from 'lucide-react'

const DISCIPLINES = [
  {
    icon: Footprints,
    title: 'Marathons & Endurance',
    blurb:
      '26.2 and beyond. Pacing, fueling and durability built in so the miles hold up — and so does the body carrying them.',
  },
  {
    icon: Dumbbell,
    title: 'Lifting Competitions',
    blurb:
      'Powerlifting and Olympic meets. Peak strength on the platform without breaking yourself down to get there.',
  },
  {
    icon: Mountain,
    title: 'Adventure Races',
    blurb:
      'Spartans, ultras, obstacle and multi-sport. Trained for the terrain, the unknown, and the long day on your feet.',
  },
  {
    icon: InfinityIcon,
    title: 'Longevity Fitness',
    blurb:
      'The long game. Moving well, staying strong and staying durable for the decades that come after the medals.',
  },
]

export function Disciplines() {
  return (
    <section className="grain relative overflow-hidden bg-card py-24 md:py-32">
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-kin">
            Virginia Beach · Built for anything
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-washi sm:text-5xl md:text-6xl">
            One coach.{' '}
            <span className="text-gold-gradient">Every finish line.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Whatever you&apos;re chasing — a start line, a platform, a mountain,
            or just decades of moving well — I coach it out of my gym in Virginia
            Beach.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DISCIPLINES.map((d, i) => {
            const Icon = d.icon
            return (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group rounded-2xl border border-border bg-sumi p-7 transition-colors hover:border-kin/40"
              >
                <span className="inline-flex rounded-lg border border-kin/30 bg-kin/10 p-3 text-kin transition-transform duration-300 group-hover:-translate-y-0.5">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold text-washi">
                  {d.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {d.blurb}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Disciplines
