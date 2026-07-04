import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PLANS, type Plan } from '@/lib/plan'

export interface UpgradeCardProps {
  requiredPlan: Plan
  title: string
  blurb: string
}

/** Inline upsell shown where a feature is gated behind a higher plan. */
export function UpgradeCard({ requiredPlan, title, blurb }: UpgradeCardProps) {
  const plan = PLANS[requiredPlan]
  return (
    <Card className="border-kin/30 bg-kin/5">
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-md bg-kin/15 p-2 text-kin">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-washi">{title}</p>
              <Badge className="bg-kin text-sumi">{plan.name}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
          </div>
        </div>
        <Link
          href="/coaching"
          className="shrink-0 rounded-md bg-kin px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider text-sumi transition-colors hover:bg-kin/90"
        >
          Upgrade — {plan.price}
        </Link>
      </CardContent>
    </Card>
  )
}

export default UpgradeCard
