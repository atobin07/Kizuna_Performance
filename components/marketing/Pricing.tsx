'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { track } from '@/lib/analytics'

type Tier = {
  id: string
  name: string
  price: string
  cadence: string
  description: string
  features: string[]
  featured?: boolean
}

const TIERS: Tier[] = [
  {
    id: 'private',
    name: '1-on-1 Private',
    price: '$750–$1,000',
    cadence: '/ month',
    description: 'Total ownership of your training by one dedicated coach.',
    features: [
      'Fully individualized programming, updated weekly',
      'Private in-person or remote sessions built around your schedule',
      'Movement screen and quarterly performance re-assessment',
      'Direct-line messaging with your coach between sessions',
      'Custom recovery, sleep, and nutrition framework',
      'Video technique review on every key lift',
      'Priority scheduling and travel programming',
    ],
    featured: true,
  },
  {
    id: 'semi-private',
    name: 'Semi-Private Group',
    price: '$500–$600',
    cadence: '/ month',
    description: 'Individual programming, sharpened by a small training room.',
    features: [
      'Individualized programming inside a capped 4-athlete group',
      'Three coached sessions per week',
      'Movement screen and phased progression plan',
      'Shared accountability with serious training partners',
      'Monthly check-in and benchmark testing',
      'Recovery and load-management guidance',
    ],
  },
]

export function Pricing() {
  return (
    <section className="bg-sumi py-20 md:py-28">
      <div className="container">
        <div className="mb-14 max-w-2xl">
          <p className="tracked-caps mb-4 text-xs font-medium text-kin">
            Coaching
          </p>
          <h2 className="text-3xl font-black tracking-tight text-washi sm:text-4xl md:text-5xl">
            Two ways to train with us.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Both built on the same method. Choose the level of attention that
            fits your goals.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {TIERS.map((tier) => (
            <Card
              key={tier.id}
              className={cn(
                'relative flex flex-col border-border bg-card',
                tier.featured && 'border-kin/60 shadow-[0_0_40px_-12px] shadow-kin/20'
              )}
            >
              {tier.featured && (
                <Badge className="absolute -top-3 left-8 bg-kin text-sumi">
                  Most Personal
                </Badge>
              )}
              <CardHeader className="p-8 pb-4">
                <CardTitle className="tracked-caps text-sm font-bold text-kin">
                  {tier.name}
                </CardTitle>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tight text-washi">
                    {tier.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {tier.cadence}
                  </span>
                </div>
                <CardDescription className="mt-3 text-base">
                  {tier.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-8 pt-4">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-kin" />
                      <span className="text-sm leading-relaxed text-washi/90">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Button
                  asChild
                  className="w-full"
                  variant={tier.featured ? 'default' : 'outline'}
                  onClick={() =>
                    track('pricing_cta_click', { tier: tier.id })
                  }
                >
                  <Link href="/book">Apply for a spot</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
