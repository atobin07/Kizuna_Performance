'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  INCREMENTS,
  INCREMENT_OPTIONS,
  MAIN_LIFT_LABELS,
  DEFAULT_BASE_WEIGHTS,
  type MainLift,
} from '@/lib/strength'

export interface StrengthSetupProps {
  clientId: string
  startDate: string
  baseWeights: Record<MainLift, number>
  increments: Record<MainLift, number>
}

const LIFTS = Object.keys(INCREMENTS) as MainLift[]

export function StrengthSetup({
  clientId,
  startDate,
  baseWeights,
  increments,
}: StrengthSetupProps) {
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
  const [incs, setIncs] = React.useState<Record<MainLift, number>>(() => {
    const init = {} as Record<MainLift, number>
    for (const lift of LIFTS) {
      init[lift] = increments[lift] ?? INCREMENTS[lift]
    }
    return init
  })

  async function save() {
    setSaving(true)
    const supabase = createClient()

    const base_weights: Record<string, number> = {}
    const increments_out: Record<string, number> = {}
    for (const lift of LIFTS) {
      const n = Number(weights[lift])
      base_weights[lift] = Number.isNaN(n) ? DEFAULT_BASE_WEIGHTS[lift] : n
      increments_out[lift] = incs[lift] ?? INCREMENTS[lift]
    }

    const { error } = await supabase.from('strength_config').upsert(
      {
        client_id: clientId,
        start_date: start,
        base_weights,
        increments: increments_out,
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
        <Label className="mb-2 block">Starting weight &amp; weekly add per lift</Label>
        <div className="space-y-3">
          {LIFTS.map((lift) => (
            <div
              key={lift}
              className="rounded-lg border border-border bg-card p-4"
            >
              <p className="mb-3 font-medium text-washi">
                {MAIN_LIFT_LABELS[lift]}
              </p>
              <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
                <div>
                  <span className="mb-1.5 block text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                    Starting weight
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="2.5"
                      value={weights[lift]}
                      onChange={(e) =>
                        setWeights((w) => ({ ...w, [lift]: e.target.value }))
                      }
                      className="h-10 w-24"
                    />
                    <span className="text-sm text-muted-foreground">lb</span>
                  </div>
                </div>

                <div>
                  <span className="mb-1.5 block text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                    Weekly add (lb)
                  </span>
                  <div className="inline-flex overflow-hidden rounded-md border border-input">
                    {INCREMENT_OPTIONS.map((opt, i) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setIncs((s) => ({ ...s, [lift]: opt }))}
                        className={cn(
                          'h-10 min-w-[3rem] px-3 text-sm font-semibold transition-colors',
                          i > 0 && 'border-l border-input',
                          incs[lift] === opt
                            ? 'bg-kin text-sumi'
                            : 'text-muted-foreground hover:text-washi'
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
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
