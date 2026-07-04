import Link from 'next/link'
import { Check, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  STATUS_LABELS,
  isOAuthConfigured,
  type Provider,
} from '@/lib/integrations'

export interface ProviderCardProps {
  provider: Provider
  connected?: boolean
}

export function ProviderCard({ provider, connected }: ProviderCardProps) {
  const configured = provider.auth === 'oauth' ? isOAuthConfigured(provider) : true

  // Where does the action go?
  let href: string | null = null
  if (provider.auth === 'apple_health') href = '/integrations/apple'
  else if (provider.auth === 'oauth' && (provider.status !== 'soon' || configured))
    href = `/api/integrations/${provider.key}/authorize`

  const actionable = Boolean(href) && (provider.status !== 'soon' || configured)
  const label = connected
    ? 'Connected'
    : provider.status === 'soon' && !configured
      ? 'Coming soon'
      : STATUS_LABELS[provider.status]

  const inner = (
    <Card
      className={cn(
        'h-full transition-colors',
        actionable ? 'hover:border-kin/40' : 'opacity-70'
      )}
    >
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className="h-8 w-8 rounded-full border border-border"
              style={{ backgroundColor: provider.brand + '22', borderColor: provider.brand + '55' }}
            />
            <div>
              <p className="font-semibold text-washi">{provider.name}</p>
              {connected && (
                <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-kin">
                  <Check className="h-3 w-3" /> Connected
                </span>
              )}
            </div>
          </div>
          {provider.status === 'beta' && !connected && (
            <Badge variant="muted">Beta</Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground">{provider.blurb}</p>

        <div className="flex flex-wrap gap-1.5">
          {provider.dataTypes.map((d) => (
            <span
              key={d}
              className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
            >
              {d}
            </span>
          ))}
        </div>

        <div
          className={cn(
            'mt-auto flex items-center justify-between pt-2 text-xs font-semibold uppercase tracking-wider',
            actionable ? 'text-kin' : 'text-muted-foreground'
          )}
        >
          {label}
          {actionable && <ChevronRight className="h-4 w-4" />}
        </div>
      </CardContent>
    </Card>
  )

  if (href && actionable) {
    const external = href.startsWith('/api/')
    return external ? (
      <a href={href} className="block h-full">
        {inner}
      </a>
    ) : (
      <Link href={href} className="block h-full">
        {inner}
      </Link>
    )
  }
  return inner
}

export default ProviderCard
