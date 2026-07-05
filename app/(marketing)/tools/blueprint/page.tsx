import type { Metadata } from 'next'
import { Check } from 'lucide-react'
import { LeadForm } from '@/components/marketing/LeadForm'

export const metadata: Metadata = {
  title: 'The Recovery-First Blueprint — free guide',
  description:
    'A free guide to training that lasts: how to program recovery, sleep and nutrition alongside the work so you build durability instead of burning out.',
}

const INSIDE = [
  'The recovery-first framework — why rest is programmed, not left to chance',
  'A simple weekly template that balances load and recovery',
  'Sleep, nutrition and breathing levers that multiply your training',
  'The signals that tell you to push — and the ones that say back off',
]

export default function BlueprintPage() {
  return (
    <div className="bg-sumi">
      <section className="grain relative overflow-hidden border-b border-border">
        <div className="glow-gold pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full blur-2xl" />
        <div className="container relative py-16 text-center md:py-20">
          <p className="text-xs uppercase tracking-widest text-kin">
            絆 · Free Guide
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight text-washi sm:text-5xl md:text-6xl">
            The Recovery-First{' '}
            <span className="text-gold-gradient">Blueprint.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            How to train hard for years, not weeks — programming recovery, sleep
            and nutrition alongside the work so you build durability instead of
            burning out.
          </p>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="tracked-caps mb-5 text-xs font-medium text-kin">
              What&apos;s inside
            </p>
            <ul className="space-y-4">
              {INSIDE.map((item) => (
                <li key={item} className="flex gap-3 text-muted-foreground">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-kin" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-washi">
              Send me the blueprint
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Free. Straight to your inbox.
            </p>
            <div className="mt-5">
              <LeadForm
                source="blueprint"
                cta="Get the free blueprint"
                submittingLabel="Sending…"
                successTitle="Check your inbox."
                successBody="Your Recovery-First Blueprint is on its way. If it is not there in a few minutes, check your spam folder."
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
