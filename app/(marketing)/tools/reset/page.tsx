import type { Metadata } from 'next'
import { LeadForm } from '@/components/marketing/LeadForm'

export const metadata: Metadata = {
  title: 'The 7-Day Durability Reset — free challenge',
  description:
    'A free 7-day email challenge. One small, high-leverage action a day across sleep, breathing, nutrition and movement to reset your durability.',
}

const DAYS = [
  { d: 'Day 1', t: 'Anchor your sleep', b: 'Set one fixed wake time — the single biggest recovery lever.' },
  { d: 'Day 2', t: 'Nasal-breathing baseline', b: 'Reset your breathing pattern to lower stress and improve output.' },
  { d: 'Day 3', t: 'Protein target', b: 'Dial the one nutrition number that drives everything else.' },
  { d: 'Day 4', t: 'Move to recover', b: 'The mobility routine that pays back the same day.' },
  { d: 'Day 5', t: 'Manage the load', b: 'How to read your readiness and adjust the day.' },
  { d: 'Day 6', t: 'Wind-down protocol', b: 'The evening routine that deepens sleep quality.' },
  { d: 'Day 7', t: 'Build your plan', b: 'Turn the week into a system — and a next step.' },
]

export default function ResetPage() {
  return (
    <div className="bg-sumi">
      <section className="grain relative overflow-hidden border-b border-border">
        <div className="glow-gold pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full blur-2xl" />
        <div className="container relative py-16 text-center md:py-20">
          <p className="text-xs uppercase tracking-widest text-kin">
            絆 · Free Challenge
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight text-washi sm:text-5xl md:text-6xl">
            The 7-Day{' '}
            <span className="text-gold-gradient">Durability Reset.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            One small, high-leverage action a day — across sleep, breathing,
            nutrition and movement. Seven days to feel the difference a
            recovery-first approach makes.
          </p>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-washi">
              Start the reset
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Free. One email a day for seven days.
            </p>
            <div className="mt-5">
              <LeadForm
                source="reset"
                cta="Start the 7-day reset"
                submittingLabel="Signing you up…"
                successTitle="You are in."
                successBody="Day 1 is on its way to your inbox. See you tomorrow for Day 2."
              />
            </div>
          </div>
        </div>

        <ol className="mx-auto mt-14 max-w-2xl space-y-3">
          {DAYS.map((day) => (
            <li
              key={day.d}
              className="flex gap-4 rounded-xl border border-border bg-card p-4"
            >
              <span className="shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wider text-kin">
                {day.d}
              </span>
              <div>
                <p className="font-medium text-washi">{day.t}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{day.b}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
