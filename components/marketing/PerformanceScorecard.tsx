'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { track } from '@/lib/analytics'
import {
  QUESTIONS,
  PILLAR_LABELS,
  scoreScorecard,
  type Pillar,
  type ScorecardResult,
} from '@/lib/scorecard'

type Phase = 'quiz' | 'email' | 'result'

const bandColor: Record<ScorecardResult['band'], string> = {
  forged: 'text-kin',
  strong: 'text-kin',
  building: 'text-ember',
  fragile: 'text-aka',
}
const bandStroke: Record<ScorecardResult['band'], string> = {
  forged: 'stroke-kin',
  strong: 'stroke-kin',
  building: 'stroke-ember',
  fragile: 'stroke-aka',
}

function ScoreRing({ result }: { result: ScorecardResult }) {
  const r = 54
  const circ = 2 * Math.PI * r
  return (
    <div className="relative h-40 w-40">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={r}
          className="fill-none stroke-white/10"
          strokeWidth="8"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          className={cn('fill-none', bandStroke[result.band])}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - result.score / 100) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-display text-5xl font-bold', bandColor[result.band])}>
          {result.score}
        </span>
        <span className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">
          Durability
        </span>
      </div>
    </div>
  )
}

export function PerformanceScorecard() {
  const [phase, setPhase] = React.useState<Phase>('quiz')
  const [step, setStep] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, number>>({})
  const [email, setEmail] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<ScorecardResult | null>(null)

  const q = QUESTIONS[step]
  const progress = ((step + (phase === 'quiz' ? 0 : 1)) / QUESTIONS.length) * 100

  const choose = (value: number) => {
    const next = { ...answers, [q.id]: value }
    setAnswers(next)
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      setPhase('email')
      track('scorecard_completed', {})
    }
  }

  const back = () => {
    if (phase === 'email') {
      setPhase('quiz')
      return
    }
    if (step > 0) setStep(step - 1)
  }

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    const scored = scoreScorecard(answers)
    if (!scored) {
      setError('Something went wrong scoring your answers.')
      return
    }
    setSubmitting(true)
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'scorecard' }),
      })
      track('lead_captured', { source: 'scorecard', score: scored.score })
      setResult(scored)
      setPhase('result')
    } catch {
      // Even if the capture call fails, still show their result — the value is
      // the whole point. The lead just isn't recorded.
      setResult(scored)
      setPhase('result')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      {phase !== 'result' && (
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            <span>
              {phase === 'quiz'
                ? `${PILLAR_LABELS[q.pillar]} · ${step + 1} of ${QUESTIONS.length}`
                : 'Last step'}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-ember to-kin"
              animate={{ width: `${Math.max(progress, 6)}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {/* QUIZ */}
          {phase === 'quiz' && (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-display text-2xl font-bold leading-snug text-washi">
                {q.prompt}
              </h3>
              <div className="mt-6 space-y-3">
                {q.options.map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => choose(o.value)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left text-washi transition-colors',
                      answers[q.id] === o.value
                        ? 'border-kin bg-kin/10'
                        : 'border-border bg-sumi hover:border-kin/40'
                    )}
                  >
                    <span>{o.label}</span>
                    {answers[q.id] === o.value && (
                      <Check className="h-5 w-5 shrink-0 text-kin" />
                    )}
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button
                  type="button"
                  onClick={back}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-washi"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              )}
            </motion.div>
          )}

          {/* EMAIL GATE */}
          {phase === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
            >
              <span className="kanji text-2xl text-kin">絆</span>
              <h3 className="mt-3 font-display text-2xl font-bold text-washi">
                Your Durability Score is ready.
              </h3>
              <p className="mt-2 text-muted-foreground">
                See your score, your four-pillar breakdown, and the single
                biggest lever to raise it. We will send a copy to your inbox.
              </p>
              <form onSubmit={submitEmail} className="mt-6 space-y-3" noValidate>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!error}
                />
                {error && <p className="text-sm text-aka">{error}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? 'Scoring…' : 'Reveal my score'}
                </Button>
              </form>
              <button
                type="button"
                onClick={back}
                className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-washi"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            </motion.div>
          )}

          {/* RESULT */}
          {phase === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex flex-col items-center text-center">
                <ScoreRing result={result} />
                <h3 className={cn('mt-5 font-display text-3xl font-bold', bandColor[result.band])}>
                  {result.headline}
                </h3>
              </div>

              <div className="mt-8 space-y-4">
                {(Object.keys(PILLAR_LABELS) as Pillar[]).map((p) => (
                  <div key={p}>
                    <div className="mb-1.5 flex items-baseline justify-between text-sm">
                      <span className="font-medium text-washi">
                        {PILLAR_LABELS[p]}
                        {p === result.weakest && (
                          <span className="ml-2 rounded-full bg-aka/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-aka">
                            Weakest
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {result.pillarScores[p]}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
                      <motion.div
                        className={cn(
                          'h-full rounded-full',
                          p === result.weakest ? 'bg-aka' : 'bg-kin'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${result.pillarScores[p]}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl border border-kin/25 bg-sumi/60 p-5">
                <p className="text-xs font-medium uppercase tracking-widest text-kin">
                  Your biggest lever · {PILLAR_LABELS[result.weakest]}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {result.insight}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="group w-full"
                  onClick={() => track('cta_click', { location: 'scorecard_result' })}
                >
                  <Link href="/book">
                    Raise your score — apply for a spot
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full">
                  <Link href="/login">Track it free</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PerformanceScorecard
