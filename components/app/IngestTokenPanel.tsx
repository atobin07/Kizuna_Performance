'use client'

import { useState } from 'react'
import { Copy, Check, RefreshCw, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export interface IngestTokenPanelProps {
  initialToken: string | null
  endpoint: string
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div>
      <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center gap-2 rounded-md border border-border bg-sumi/60 p-2">
        <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-washi">
          {value}
        </code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
          className="shrink-0 rounded p-1.5 text-muted-foreground hover:text-kin"
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className="h-4 w-4 text-kin" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

export function IngestTokenPanel({ initialToken, endpoint }: IngestTokenPanelProps) {
  const { toast } = useToast()
  const [token, setToken] = useState<string | null>(initialToken)
  const [reveal, setReveal] = useState(false)
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch('/api/integrations/token', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      setToken(json.token)
      setReveal(true)
      toast({ title: 'Token ready', description: 'Paste it into the Shortcut.' })
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Could not generate token',
        description: e instanceof Error ? e.message : 'Try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const masked = token ? `${token.slice(0, 6)}${'•'.repeat(18)}` : ''

  return (
    <div className="space-y-4">
      <CopyRow label="Endpoint URL" value={endpoint} />

      <div>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Your ingest token
          </p>
          {token && (
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-kin"
            >
              {reveal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {reveal ? 'Hide' : 'Reveal'}
            </button>
          )}
        </div>

        {token ? (
          <CopyRow label="" value={reveal ? token : masked} />
        ) : (
          <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
            No token yet — generate one to connect.
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={generate} disabled={loading} variant={token ? 'outline' : 'default'}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {token ? 'Rotate token' : 'Generate token'}
        </Button>
        {token && (
          <p className="text-xs text-muted-foreground">
            Rotating invalidates the old token.
          </p>
        )}
      </div>
    </div>
  )
}

export default IngestTokenPanel
