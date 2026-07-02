import type { Metadata } from 'next'
import Link from 'next/link'
import { Methodology } from '@/components/marketing/Methodology'
import { Pricing } from '@/components/marketing/Pricing'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Coaching',
  description:
    'The two Kizuna coaching tiers, the four-pillar method behind them, and exactly how onboarding works — from movement screen to first program.',
}

const ONBOARDING = [
  {
    num: '01',
    title: 'Discovery call',
    description:
      'A real conversation about your goals, history, and timeline. We tell you honestly whether we are the right fit — no pressure, no pitch.',
  },
  {
    num: '02',
    title: 'Movement screen & assessment',
    description:
      'We map how you actually move, test key benchmarks, and identify the restrictions and asymmetries your program will be built around.',
  },
  {
    num: '03',
    title: 'Your first phase',
    description:
      'A fully individualized program with clear intent for every session. You know what you are doing and, just as importantly, why.',
  },
  {
    num: '04',
    title: 'Review & progression',
    description:
      'Regular check-ins and re-assessment. Load earns load; we progress you exactly as fast as your tissue can absorb — and no faster.',
  },
]

export default function CoachingPage() {
  return (
    <>
      {/* Intro */}
      <section className="border-b border-border bg-sumi py-24 md:py-28">
        <div className="container max-w-3xl">
          <p className="tracked-caps mb-5 text-xs font-medium text-kin">
            Coaching
          </p>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-washi sm:text-6xl">
            How we train athletes.
          </h1>
          <p className="mt-8 text-xl leading-relaxed text-muted-foreground">
            Two tiers, one method. Whether you work one-on-one or inside a small
            group, you get individualized programming built on the same
            structural principles — and a coach who treats your progress as a
            craft.
          </p>
        </div>
      </section>

      {/* Tiers */}
      <Pricing />

      {/* Method */}
      <Methodology />

      {/* Onboarding */}
      <section className="bg-card py-20 md:py-28">
        <div className="container">
          <div className="mb-14 max-w-2xl">
            <p className="tracked-caps mb-4 text-xs font-medium text-kin">
              Onboarding
            </p>
            <h2 className="text-3xl font-black tracking-tight text-washi sm:text-4xl md:text-5xl">
              From first call to first program.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              A deliberate path in. We earn responsibility for your training the
              same way an apprentice earns a station — one step at a time.
            </p>
          </div>

          <ol className="grid gap-5 sm:grid-cols-2">
            {ONBOARDING.map((step) => (
              <li
                key={step.num}
                className="rounded-lg border border-border bg-sumi p-8"
              >
                <span className="font-mono text-2xl font-bold text-kin">
                  {step.num}
                </span>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-washi">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-14">
            <Button asChild size="lg">
              <Link href="/book">Book Discovery Call</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
