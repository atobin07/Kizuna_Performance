import type { Metadata } from 'next'
import { BookingForm } from '@/components/marketing/BookingForm'

export const metadata: Metadata = {
  title: 'Book a Discovery Call',
  description:
    'Book your Kizuna Performance discovery call. Tell us your goals and we will map whether we are the right fit — no pressure, no pitch.',
}

export default function BookPage() {
  return (
    <section className="bg-sumi py-20 md:py-28">
      <div className="container max-w-2xl">
        <div className="mb-10 text-center">
          <span className="kanji text-3xl text-kin">絆</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-washi sm:text-5xl">
            Book a Discovery Call
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            One conversation. We will talk through your goals and tell you
            honestly whether Kizuna is the right fit. Fill this out and we will
            reach out within one business day.
          </p>
        </div>

        <BookingForm />
      </div>
    </section>
  )
}
