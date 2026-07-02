import { Card, CardContent } from '@/components/ui/card'

const PILLARS = [
  {
    num: '01',
    title: 'Movement Architecture',
    description:
      'We rebuild how you move from the joints outward — clean mechanics that turn every rep into a foundation instead of a liability.',
  },
  {
    num: '02',
    title: 'Sustainable Load',
    description:
      'Progress is engineered, not gambled. We load exactly enough to force adaptation and never so much that we borrow against your future.',
  },
  {
    num: '03',
    title: 'Recovery as Training',
    description:
      'Rest is a discipline, not a gap. Sleep, tissue work, and managed intensity are programmed with the same rigor as the barbell.',
  },
  {
    num: '04',
    title: 'Performance Longevity',
    description:
      'The goal is not a peak — it is a plateau you can hold for years. We train for the athlete you still want to be at sixty.',
  },
]

export function Methodology() {
  return (
    <section id="method" className="scroll-mt-16 bg-sumi py-20 md:py-28">
      <div className="container">
        <div className="mb-14 max-w-2xl">
          <p className="tracked-caps mb-4 text-xs font-medium text-kin">
            The Method
          </p>
          <h2 className="text-3xl font-black tracking-tight text-washi sm:text-4xl md:text-5xl">
            Four pillars. One durable athlete.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Precision meets grit. Every program we write stands on the same
            structural principles.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {PILLARS.map((pillar) => (
            <Card
              key={pillar.num}
              className="border-border bg-card transition-colors hover:border-kin/40"
            >
              <CardContent className="p-8">
                <span className="kanji font-mono text-2xl font-bold text-kin">
                  {pillar.num}
                </span>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-washi">
                  {pillar.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
