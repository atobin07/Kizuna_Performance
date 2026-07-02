import type { Metadata } from 'next'
import Link from 'next/link'
import { Hero } from '@/components/marketing/Hero'
import { Methodology } from '@/components/marketing/Methodology'
import { Pricing } from '@/components/marketing/Pricing'
import { Testimonials } from '@/components/marketing/Testimonials'
import { NewsletterSignup } from '@/components/marketing/NewsletterSignup'
import { BookingCTA } from '@/components/marketing/BookingCTA'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Elite movement. Built to last.',
  description:
    'Kizuna Performance — precision coaching that makes you stronger today and keeps you moving for decades. Built on the discipline of a craft.',
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Methodology />
      <Pricing />

      {/* About preview */}
      <section className="bg-card py-20 md:py-28">
        <div className="container grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="tracked-caps mb-4 text-xs font-medium text-kin">
              職人 · Shokunin
            </p>
            <h2 className="text-3xl font-black tracking-tight text-washi sm:text-4xl">
              Coaching as a craft.
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>
                Before Kizuna was a training room, it was a career in Japanese
                cuisine — years spent inside the discipline of the{' '}
                <span className="text-washi">shokunin</span> (職人), the artisan
                who devotes a lifetime to mastering one thing.
              </p>
              <p>
                Those principles — apprenticeship, repetition with attention,
                duty to the craft itself — now shape how we build human
                performance. Nothing rushed. Nothing wasted. Everything built to
                last.
              </p>
            </div>
            <div className="mt-8">
              <Button asChild variant="outline">
                <Link href="/about">Read the full story</Link>
              </Button>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <span
              aria-hidden
              className="kanji select-none text-[16rem] font-bold leading-none text-kin/10 md:text-[20rem]"
            >
              絆
            </span>
          </div>
        </div>
      </section>

      <Testimonials />
      <NewsletterSignup />
      <BookingCTA />
    </>
  )
}
