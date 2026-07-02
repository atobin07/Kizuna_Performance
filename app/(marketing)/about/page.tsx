import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About',
  description:
    'From the discipline of the Japanese kitchen to the training room. The shokunin philosophy behind Kizuna Performance and what the bond (絆) really means.',
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
          職人
        </span>
        <div className="container relative z-10 max-w-3xl">
          <p className="tracked-caps mb-5 text-xs font-medium text-kin">
            Our Story
          </p>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-washi sm:text-6xl">
            The craft came first.
          </h1>
          <p className="mt-8 text-xl leading-relaxed text-muted-foreground">
            Kizuna Performance did not begin in a gym. It began in a kitchen —
            in the exacting, unforgiving world of Japanese cuisine, where
            mastery is measured in decades and nothing is left to chance.
          </p>
        </div>
      </section>

      <article className="bg-sumi py-20 md:py-28">
        <div className="container max-w-3xl space-y-16">
          {/* Section: shokunin */}
          <section>
            <p className="tracked-caps mb-4 text-xs font-medium text-kin">
              職人 · Shokunin
            </p>
            <h2 className="text-3xl font-black tracking-tight text-washi sm:text-4xl">
              What the kitchen taught
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
              <p>
                In Japan, the <span className="text-washi">shokunin</span> is the
                artisan who commits a lifetime to a single craft — and who feels
                a duty not merely to a customer, but to the work itself. The
                shokunin sharpens the same knife, breaks down the same fish, and
                refines the same cut thousands of times until the motion becomes
                invisible and the result becomes inevitable.
              </p>
              <p>
                Our founder spent years inside that discipline: an apprenticeship
                built on repetition, patience, and an absolute intolerance for
                cutting corners. You clean before you cut. You cut before you
                cook. Responsibility is earned slowly, and the fundamentals are
                never beneath you.
              </p>
            </div>
          </section>

          {/* Section: the pivot */}
          <section>
            <p className="tracked-caps mb-4 text-xs font-medium text-kin">
              The Turn
            </p>
            <h2 className="text-3xl font-black tracking-tight text-washi sm:text-4xl">
              From mastery of food to mastery of movement
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
              <p>
                The move from the kitchen to performance coaching was not a
                departure — it was the same philosophy pointed at a new medium.
                A body, like a craft, rewards attention and punishes shortcuts.
                The athletes who move well at sixty are not the ones who chased
                the most exotic programs; they are the ones who practiced the
                fundamentals with intent, year after year.
              </p>
              <p>
                So we coach the way a craft is taught. Load earns load. Range
                earns range. Every rep is either a foundation or a liability, and
                we refuse to build liabilities. Progress is engineered, never
                gambled.
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
                commitment and time. Mastery is never a solo act. It is
                transmitted, coach to athlete, the way a craft passes from one
                generation to the next.
              </p>
              <p>
                That is the relationship we build. Not a transaction measured in
                sessions, but a partnership measured in years — precise, honest,
                and built to last.
              </p>
            </div>
          </section>

          {/* Section: philosophy */}
          <section>
            <p className="tracked-caps mb-4 text-xs font-medium text-kin">
              The Philosophy
            </p>
            <h2 className="text-3xl font-black tracking-tight text-washi sm:text-4xl">
              Precision meets grit
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
              <p>
                We train hard — but hard is not the point. Intelligent is the
                point. We build movement from the joints outward, load exactly
                enough to force adaptation, and treat recovery as training rather
                than the gap between it. The aim is not a single peak you fall
                off of, but a high plateau you can hold for decades.
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
