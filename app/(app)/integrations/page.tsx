import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  PROVIDERS,
  CATEGORY_LABELS,
  type IntegrationCategory,
} from '@/lib/integrations'
import { ProviderCard } from '@/components/app/ProviderCard'
import type { WearableConnection } from '@/lib/supabase/types'

export const metadata = { title: 'Integrations' }

const ORDER: IntegrationCategory[] = [
  'recovery',
  'activity',
  'nutrition',
  'body',
  'glucose',
  'aggregator',
]

export default async function IntegrationsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: connData } = await supabase
    .from('wearable_connections')
    .select('*')
    .eq('client_id', user.id)

  const connections = (connData ?? []) as WearableConnection[]
  const connected = new Set(
    connections.filter((c) => c.status === 'connected').map((c) => c.provider)
  )

  // Apple counts as connected once samples have landed.
  const { count: appleSamples } = await supabase
    .from('wearable_samples')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', user.id)
    .eq('provider', 'apple_health')
  if ((appleSamples ?? 0) > 0) connected.add('apple_health')

  const byCategory = ORDER.map((cat) => ({
    cat,
    providers: PROVIDERS.filter((p) => p.category === cat),
  })).filter((g) => g.providers.length > 0)

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Connect
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-washi">
          Integrations
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Sync your devices and apps so your sleep, recovery, activity and
          nutrition flow straight into your Durability Index — no manual logging.
        </p>
      </header>

      {byCategory.map((group) => (
        <section key={group.cat}>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-kin">
            {CATEGORY_LABELS[group.cat]}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.providers.map((p) => (
              <ProviderCard
                key={p.key}
                provider={p}
                connected={connected.has(p.key)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
