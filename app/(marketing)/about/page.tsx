import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Credentials } from '@/components/marketing/Credentials'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Kizuna Performance is expert, data-driven coaching in Virginia Beach — training, nutrition, sleep and supplementation coached together for marathons, lifting, adventure racing and lifelong durability.',
}

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-sumi py-24 md:py-32">
        <span
          aria-hidden
          className="kanji pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 select-none text-[24rem] font-bold leading-none text-washi/[0.03]"
        >
          絆
        </span>
        <div className="container relative z-10 max-w-3xl">
          <p className="tracked-caps mb-5 text-xs font-medium text-kin">
            Who we are
          </p>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-washi sm:text-6xl">
            Expert coaching for the long game.
          </h1>
          <p className="mt-8 text-xl leading-relaxed text-muted-foreground">
            Kizuna Performance is data-driven, whole-health coaching out of
            Virginia Beach — for marathoners, lifters, adventure racers, and
            anyone training to move well for life.
          </p>
        </div>
      </section>

      <Credentials />

      <article className="bg-sumi py-20 md:py-28">
        <div className="container max-w-3xl space-y-16">
          {/* Section: what we do */}
          <section>
            <p className="tracked-caps mb-4 text-xs font-medium text-kin">
              What we do
            </p>
            <h2 className="text-3xl font-black tracking-tight text-washi sm:text-4xl">
              We&apos;re expert trainers — for the whole athlete
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
              <p>
                We coach the entire system, not just the hour you spend under the
                bar. The training matters — but so do the things that decide
                whether the training actually works: how you eat, how you sleep,
                how you recover, and what you put in your body.
              </p>
              <p>
                Whether you&apos;re chasing a marathon PR, a competition total, an
                adventure race, or simply a strong body that holds up for decades,
                we build the plan around all of it — and we hold ourselves to an
                expert standard on every piece.
              </p>
            </div>
          </section>

          {/* Section: whole-health / longevity */}
          <section>
            <p className="tracked-caps mb-4 text-xs font-medium text-kin">
              Beyond the gym
            </p>
            <h2 className="text-3xl font-black tracking-tight text-washi sm:text-4xl">
              Nutrition, sleep and supplements — the things that move the needle
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
              <p>
                Most programs stop at sets and reps. We don&apos;t. We understand
                nutrition and how to fuel the goal in front of you. We treat sleep
                as a training input — and we know how to improve it. And we give
                honest, evidence-based guidance on supplementation, cutting
                through the noise instead of adding to it.
              </p>
              <p>
                Longevity isn&apos;t one habit — it&apos;s all of them, coached
                together. That&apos;s the difference between a program that peaks
                and a life that stays strong.
              </p>
            </div>
          </section>

          {/* Section: data-driven */}
          <section>
            <p className="tracked-caps mb-4 text-xs font-medium text-kin">
              How we do it
            </p>
            <h2 className="text-3xl font-black tracking-tight text-washi sm:text-4xl">
              We coach through your data
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
              <p>
                We leverage the wearables and tools you already use. Your sleep,
                recovery, strain and readiness flow straight to us — so your
                program adapts to what your body is actually doing, not to a
                template written weeks ago.
              </p>
              <p>
                It means we know where you are and what you need before you walk
                in, so every minute we spend together goes to exactly the right
                work. Coaching that keeps up with your life, every day — not just
                on session days.
              </p>
            </div>
          </section>

          {/* Section: kizuna meaning */}
          <section>
            <p className="tracked-caps mb-4 text-xs font-medium text-kin">
              絆 · Kizuna
            </p>
            <h2 className="text-3xl font-black tracking-tight text-washi sm:text-4xl">
              The meaning of the bond
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
              <p>
                <span className="kanji text-washi">絆</span> — kizuna — is the
                bond between people: the connection forged through shared
                commitment and time. It&apos;s the reason the data matters and the
                reason the coaching works.
              </p>
              <p>
                That is the relationship we build. Not a transaction measured in
                sessions, but a partnership measured in years — and we stay in
                your corner for all of them.
              </p>
            </div>
          </section>

          {/* Section: philosophy */}
          <section>
            <p className="tracked-caps mb-4 text-xs font-medium text-kin">
              The standard
            </p>
            <h2 className="text-3xl font-black tracking-tight text-washi sm:text-4xl">
              Precision meets grit
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
              <p>
                We train hard — but hard is not the point. Intelligent is the
                point. We build movement from the joints outward, load exactly
                enough to force adaptation, and treat recovery as training rather
                than the gap between it. The aim is not a single peak you fall off
                of, but a high plateau you can hold for decades.
              </p>
              <p>
                Elite movement. Built to last. It is not a slogan — it is the
                standard we are held to, and the one we hold you to.
              </p>
            </div>
          </section>

          <div className="flex flex-col gap-4 border-t border-border pt-12 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/book">Book Discovery Call</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/coaching">See how we coach</Link>
            </Button>
          </div>
        </div>
      </article>
    </>
  )
}
