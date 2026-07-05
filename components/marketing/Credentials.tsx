'use client'

import { motion } from 'framer-motion'
import { BadgeCheck } from 'lucide-react'

const GROUPS = [
  {
    label: 'Movement & Strength',
    certs: [
      'Powerlifting',
      'Gymnastics Strength',
      'Romanov Method Running (Pose Method)',
      'Mobility & Joint Health',
    ],
  },
  {
    label: 'Recovery, Fuel & Mind',
    certs: ['Nutrition', 'Sleep', 'Breathwork', 'Meditation'],
  },
]

// Methodologies we independently study and apply. Framed as influences only —
// no affiliation, endorsement, or partnership is claimed (see disclaimer).
const INFLUENCES = [
  { name: 'Kelly Starrett', method: 'Supple Leopard · mobility' },
  { name: 'The Oxygen Advantage', method: 'functional breathing' },
  { name: 'Burgener Strength', method: 'Olympic lifting' },
]

export function Credentials() {
  return (
    <section className="grain relative overflow-hidden bg-sumi py-24 md:py-32">
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-kin">
            Certified across the whole system
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-washi sm:text-5xl md:text-6xl">
            Expertise behind{' '}
            <span className="text-gold-gradient">every rep.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Your program is never guesswork. It&apos;s built on formal
            certification in how you move, lift, run, recover, breathe, sleep and
            eat — the whole system, not one slice of it.
          </p>
        </motion.div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-4 md:grid-cols-2">
          {GROUPS.map((group, gi) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: gi * 0.1 }}
              className="rounded-2xl border border-border bg-card p-7"
            >
              <p className="tracked-caps mb-5 text-xs font-medium text-kin">
                {group.label}
              </p>
              <ul className="space-y-3.5">
                {group.certs.map((cert) => (
                  <li
                    key={cert}
                    className="flex items-center gap-3 text-washi"
                  >
                    <BadgeCheck className="h-5 w-5 shrink-0 text-kin" />
                    <span className="font-medium">{cert}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Students of the field — influences we study, not affiliations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-16 max-w-4xl text-center"
        >
          <p className="tracked-caps mb-3 text-xs font-medium text-kin">
            Students of the field
          </p>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            We never stop learning. Our approach also draws on the published
            methods of coaches and programs we study and apply, including:
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {INFLUENCES.map((inf) => (
              <span
                key={inf.name}
                className="rounded-full border border-border bg-card px-4 py-2.5 text-sm"
              >
                <span className="font-medium text-washi">{inf.name}</span>
                <span className="text-koke"> — {inf.method}</span>
              </span>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-xs leading-relaxed text-koke">
            We independently study and apply these published methods. Kizuna
            Performance is not affiliated with, sponsored by, certified by, or
            endorsed by these coaches, authors, or organizations. All names and
            programs are the property of their respective owners.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default Credentials
