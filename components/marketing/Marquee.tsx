const PHRASES = [
  'Marathons',
  'Lifting Competitions',
  'Adventure Races',
  'Longevity Fitness',
  'Recovery as Training',
  'Virginia Beach',
]

export function Marquee() {
  // Duplicate the sequence so the -50% translate loops seamlessly.
  const items = [...PHRASES, ...PHRASES]
  return (
    <div className="mask-fade-r relative flex overflow-hidden border-y border-border bg-card py-5">
      <div className="animate-marquee flex shrink-0 items-center gap-8 whitespace-nowrap pr-8">
        {items.map((phrase, i) => (
          <div key={i} className="flex items-center gap-8">
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {phrase}
            </span>
            <span className="kanji text-lg text-kin">絆</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Marquee
