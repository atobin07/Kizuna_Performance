import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, Watch } from 'lucide-react'
import { IngestTokenPanel } from '@/components/app/IngestTokenPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { IntegrationToken } from '@/lib/supabase/types'

export const metadata = { title: 'Connect Apple Health' }

// The Shortcut, action by action (built in the iOS Shortcuts app).
const RECIPE = [
  'Text → paste your Endpoint URL. (name this variable "URL")',
  'Text → paste your Ingest Token. (name it "Token")',
  'Find Health Samples → Sleep Analysis, sort Start Time, limit last night → Calculate Statistics: Sum of Duration (minutes). Set variable "sleep_min".',
  'Find Health Samples → Heart Rate Variability, today → Calculate Average. Set "hrv_ms".',
  'Find Health Samples → Resting Heart Rate, today → Latest value. Set "resting_hr".',
  'Find Health Samples → Steps, today → Sum. Set "steps".',
  'Current Date → Format Date → "yyyy-MM-dd". Set "date".',
  'Dictionary → keys: date, sleep_min, hrv_ms, resting_hr, steps (map each to its variable).',
  'Get Contents of URL → the "URL" variable · Method POST · Header Authorization = "Bearer " + Token · Request Body = JSON = the Dictionary.',
]

const AUTOMATION = [
  'Shortcuts → Automation tab → + → Time of Day → 8:00 AM, Daily.',
  'Action: Run Shortcut → "Kizuna Sync".',
  'Turn OFF "Ask Before Running" so it syncs silently every morning.',
]

export default async function AppleConnectPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tokenRow } = await supabase
    .from('integration_tokens')
    .select('*')
    .eq('client_id', user.id)
    .maybeSingle()
  const token = (tokenRow as IntegrationToken | null)?.token ?? null

  const site =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kizunaperformanceproject.vercel.app'
  const endpoint = `${site}/api/integrations/health`

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/integrations"
          className="mb-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-kin"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All integrations
        </Link>
        <div className="flex items-center gap-3">
          <span className="rounded-lg border border-border bg-card p-2.5 text-washi">
            <Watch className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-washi">
              Connect Apple Health
            </h1>
            <p className="text-sm text-muted-foreground">
              Sync Apple Watch sleep, HRV & activity — no App Store needed.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base uppercase tracking-wider">
            1 · Your credentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <IngestTokenPanel initialToken={token} endpoint={endpoint} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base uppercase tracking-wider">
            2 · Build the “Kizuna Sync” Shortcut
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            In the iOS <span className="text-washi">Shortcuts</span> app, create
            a new shortcut and add these actions in order:
          </p>
          <ol className="space-y-3">
            {RECIPE.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-kin/40 font-mono text-xs text-kin">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <div className="rounded-lg border border-dashed border-border bg-sumi/60 p-4">
            <p className="mb-2 text-xs uppercase tracking-wider text-kin">
              The JSON it sends
            </p>
            <pre className="overflow-x-auto text-xs text-muted-foreground">
{`{
  "date": "2026-07-02",
  "sleep_min": 465,
  "hrv_ms": 62,
  "resting_hr": 54,
  "steps": 8200
}`}
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">
              Every field is optional — send whatever your Watch has. Sleep
              feeds your Sleep Density; HRV & resting HR sharpen Readiness.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base uppercase tracking-wider">
            3 · Automate it (daily, hands-free)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {AUTOMATION.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-kin/40 font-mono text-xs text-kin">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
