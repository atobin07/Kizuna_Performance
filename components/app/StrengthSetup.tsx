'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import {
  INCREMENTS,
  MAIN_LIFT_LABELS,
  DEFAULT_BASE_WEIGHTS,
  type MainLift,
} from '@/lib/strength'

export interface StrengthSetupProps {
  clientId: string
  startDate: string
  baseWeights: Record<MainLift, number>
}

const LIFTS = Object.keys(INCREMENTS) as MainLift[]

export function StrengthSetup({ clientId, startDate, baseWeights }: StrengthSetupProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = React.useState(false)
  const [start, setStart] = React.useState(startDate)
  const [weights, setWeights] = React.useState<Record<MainLift, string>>(() => {
    const init = {} as Record<MainLift, string>
    for (const lift of LIFTS) {
      init[lift] = String(baseWeights[lift] ?? DEFAULT_BASE_WEIGHTS[lift])
    }
    return init
  })

  async function save() {
    setSaving(true)
    const supabase = createClient()

    const base_weights: Record<string, number> = {}
    for (const lift of LIFTS) {
      const n = Number(weights[lift])
      base_weights[lift] = Number.isNaN(n) ? DEFAULT_BASE_WEIGHTS[lift] : n
    }

    const { error } = await supabase.from('strength_config').upsert(
      {
        client_id: clientId,
        start_date: start,
        base_weights,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'client_id' }
    )

    setSaving(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Could not save program',
        description: error.message,
      })
      return
    }

    toast({
      title: 'Program saved',
      description: 'Your weekly targets will progress from here.',
    })
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="strength-start">Program start date</Label>
        <Input
          id="strength-start"
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="max-w-[12rem]"
        />
        <p className="text-xs text-muted-foreground">
          Targets increase every week from this date.
        </p>
      </div>

      <div>
        <Label className="mb-2 block">Starting weights (lb)</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {LIFTS.map((lift) => (
            <div key={lift} className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2">
              <div>
                <p className="text-sm font-medium text-washi">
                  {MAIN_LIFT_LABELS[lift]}
                </p>
                <p className="text-[0.65rem] uppercase tracking-wider text-kin">
                  +{INCREMENTS[lift]} lb / week
                </p>
              </div>
              <Input
                type="number"
                inputMode="decimal"
                step="2.5"
                value={weights[lift]}
                onChange={(e) =>
                  setWeights((w) => ({ ...w, [lift]: e.target.value }))
                }
                className="h-9 w-24"
              />
            </div>
          ))}
        </div>
      </div>

      <Button onClick={save} disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save program
      </Button>
    </div>
  )
}

export default StrengthSetup
