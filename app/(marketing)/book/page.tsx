import type { Metadata } from 'next'
import { ClipboardList, PhoneCall, Compass, Check } from 'lucide-react'
import { BookingForm } from '@/components/marketing/BookingForm'

export const metadata: Metadata = {
  title: 'Book a Discovery Call',
  description:
    'Book your free Kizuna Performance discovery call. Twenty minutes to map your goals and whether we are the right fit — no pressure, no pitch.',
}

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Tell us your goal',
    body: 'Fill out the short form. The more we know going in, the more useful your call will be.',
  },
  {
    icon: PhoneCall,
    title: 'We talk it through',
    body: 'A free, ~20-minute call. Your goals, your history, your timeline — and honest answers on how we would approach it.',
  },
  {
    icon: Compass,
    title: 'You leave with a direction',
    body: 'A clear read on where you stand and the first move to make — whether or not you end up training with us.',
  },
]

const WALKAWAY = [
  'An honest assessment of where your training stands',
  'The single biggest lever for your specific goal',
  'How data-driven, whole-health coaching would work for you',
  'Zero pressure — if we are not the right fit, we will tell you',
]

export default function BookPage() {
  return (
    <section className="bg-sumi py-20 md:py-28">
      <div className="container max-w-5xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="kanji text-3xl text-kin">絆</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-washi sm:text-5xl">
            Book your discovery call
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            A free, 20-minute call. We will map where you are, where you want to
            go, and whether Kizuna is the right fit — no pressure, no pitch.
          </p>
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-border bg-card px-5 py-2 text-xs font-medium uppercase tracking-widest text-kin">
            <span>Free</span>
            <span className="text-koke">·</span>
            <span>~20 minutes</span>
            <span className="text-koke">·</span>
            <span>Reply within 1 business day</span>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          {/* Left — value + reassurance */}
          <div className="space-y-12">
            <div>
              <p className="tracked-caps mb-6 text-xs font-medium text-kin">
                How the call works
              </p>
              <ol className="space-y-7">
                {STEPS.map((s, i) => {
                  const Icon = s.icon
                  return (
                    <li key={s.title} className="flex gap-4">
                      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-kin/30 bg-kin/10 text-kin">
                        <Icon className="h-5 w-5" />
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-kin text-[0.65rem] font-bold text-sumi">
                          {i + 1}
                        </span>
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-bold text-washi">
                          {s.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {s.body}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="tracked-caps mb-4 text-xs font-medium text-kin">
                What you will walk away with
              </p>
              <ul className="space-y-3">
                {WALKAWAY.map((w) => (
                  <li key={w} className="flex gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-kin" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — the form */}
          <div>
            <BookingForm />
          </div>
        </div>
      </div>
    </section>
  )
}
