import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { Tier } from '@/lib/supabase/types'

export interface ClientCardProps {
  client: {
    id: string
    full_name: string | null
    email?: string | null
    tier: Tier | null
    lastActive?: string | null
    phase?: number | null
    completionRate?: number | null
  }
}

const TIER_LABEL: Record<Tier, string> = {
  private: 'Private',
  semi_private: 'Semi-Private',
}

/** Server-safe client summary card linking into the coach portal. */
export function ClientCard({ client }: ClientCardProps) {
  const name = client.full_name?.trim() || 'Unnamed'
  const completion =
    typeof client.completionRate === 'number'
      ? Math.max(0, Math.min(100, Math.round(client.completionRate)))
      : null

  return (
    <Link href={`/coach/clients/${client.id}`} className="group block">
      <Card className="h-full border-border transition-colors group-hover:border-kin">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-washi">{name}</p>
              {client.email && (
                <p className="truncate text-xs text-muted-foreground">
                  {client.email}
                </p>
              )}
            </div>
            {client.tier && (
              <Badge variant="outline" className="shrink-0">
                {TIER_LABEL[client.tier]}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="tracked-caps">
              Phase {client.phase ?? '—'}
            </span>
            <span>
              {client.lastActive
                ? `Active ${formatDate(client.lastActive)}`
                : 'No activity'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-wider text-muted-foreground">
                Weekly completion
              </span>
              <span className="font-semibold text-washi">
                {completion === null ? '—' : `${completion}%`}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-kin transition-all"
                style={{ width: `${completion ?? 0}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default ClientCard
