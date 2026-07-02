import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

// NOTE: Placeholder testimonials. Swap in real client quotes/names/roles once
// consent is collected. Keep the same shape so they drop straight in.
type Testimonial = {
  name: string
  role: string
  quote: string
  rating: number
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Marcus R.',
    role: 'Former college athlete, 34',
    quote:
      'I came in with two bad shoulders and a decade of bad habits. A year later I am lifting more than I did in my twenties — and nothing hurts. The programming is surgical.',
    rating: 5,
  },
  {
    name: 'Priya S.',
    role: 'Endurance runner, 41',
    quote:
      'The recovery-first approach felt slow at first. Then I set three personal records in a season without a single injury. I finally trust my body again.',
    rating: 5,
  },
  {
    name: 'Devon K.',
    role: 'Semi-private member, 29',
    quote:
      'Small group, individual programming, real accountability. It is the first time training has felt like a craft instead of a chore.',
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="bg-sumi py-20 md:py-28">
      <div className="container">
        <div className="mb-14 max-w-2xl">
          <p className="tracked-caps mb-4 text-xs font-medium text-kin">
            The Bond
          </p>
          <h2 className="text-3xl font-black tracking-tight text-washi sm:text-4xl md:text-5xl">
            Athletes who stayed.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="flex flex-col border-border bg-card">
              <CardContent className="flex flex-1 flex-col p-8">
                <div className="mb-5 flex gap-1" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-kin text-kin" />
                  ))}
                </div>
                <blockquote className="flex-1 text-lg leading-relaxed text-washi/90">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-6 border-t border-border pt-5">
                  <p className="font-bold text-washi">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
