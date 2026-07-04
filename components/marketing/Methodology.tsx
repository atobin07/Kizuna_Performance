'use client'

import { motion } from 'framer-motion'

const PILLARS = [
  {
    num: '01',
    title: 'Movement Architecture',
    description:
      'We rebuild how you move from the joints outward — clean mechanics that turn every rep into a foundation instead of a liability.',
  },
  {
    num: '02',
    title: 'Sustainable Load',
    description:
      'Progress is engineered, not gambled. We load exactly enough to force adaptation and never so much that we borrow against your future.',
  },
  {
    num: '03',
    title: 'Recovery as Training',
    description:
      'Rest is a discipline, not a gap. Sleep, tissue work, and managed intensity are programmed with the same rigor as the barbell.',
  },
  {
    num: '04',
    title: 'Performance Longevity',
    description:
      'The goal is not a peak — it is a plateau you can hold for years. We train for the athlete you still want to be at sixty.',
  },
]

export function Methodology() {
  return (
    <section id="method" className="grain relative scroll-mt-20 overflow-hidden bg-sumi py-24 md:py-32">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-2xl"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-kin">
            絆 · The Method
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-washi sm:text-5xl md:text-6xl">
            Four pillars.
            <br />
            <span className="text-gold-gradient">One durable athlete.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Precision meets grit — with recovery coached as seriously as the
            barbell. Every program stands on the same four principles.
          </p>
        </motion.div>

        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden bg-sumi p-8 transition-colors duration-300 hover:bg-card md:p-10"
            >
              {/* Gold sweep on hover */}
              <span className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-ember to-kin opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="flex items-baseline gap-5">
                <span className="font-display text-4xl font-bold text-koke transition-colors duration-300 group-hover:text-kin">
                  {pillar.num}
                </span>
                <h3 className="font-display text-2xl font-bold tracking-tight text-washi">
                  {pillar.title}
                </h3>
              </div>
              <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
