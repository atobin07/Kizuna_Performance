import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { formatDate } from '@/lib/utils'
import type { Assessment } from '@/lib/supabase/types'
import { Video } from 'lucide-react'

export const dynamic = 'force-dynamic'

const TYPES = [
  { key: 'movement', label: 'Movement' },
  { key: 'benchmark', label: 'Benchmark' },
  { key: 'body_comp', label: 'Body Comp' },
] as const

function AssessmentItem({ a }: { a: Assessment }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-sm uppercase tracking-wider capitalize">
            {a.type?.replace('_', ' ') ?? 'Assessment'}
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDate(a.assessed_at)}
          </p>
        </div>
        {a.type && <Badge variant="outline">{a.type.replace('_', ' ')}</Badge>}
      </CardHeader>
      <CardContent className="space-y-3">
        {a.coach_notes && (
          <p className="whitespace-pre-wrap text-sm text-washi">
            {a.coach_notes}
          </p>
        )}
        {a.video_url && (
          <a
            href={a.video_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-kin hover:underline"
          >
            <Video className="h-4 w-4" /> Watch video
          </a>
        )}
      </CardContent>
    </Card>
  )
}

export default async function AssessmentsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rows } = await supabase
    .from('assessments')
    .select('*')
    .eq('client_id', user.id)
    .order('assessed_at', { ascending: false })

  const assessments = (rows ?? []) as Assessment[]

  if (assessments.length === 0) {
    return (
      <div className="space-y-8">
        <h1 className="tracked-caps text-2xl font-bold text-washi">
          Assessments
        </h1>
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No assessments yet. Your coach will add movement screens and testing
            results here.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="tracked-caps text-2xl font-bold text-washi">Assessments</h1>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {TYPES.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-4">
            {assessments.map((a) => (
              <AssessmentItem key={a.id} a={a} />
            ))}
          </div>
        </TabsContent>

        {TYPES.map((t) => {
          const items = assessments.filter((a) => a.type === t.key)
          return (
            <TabsContent key={t.key} value={t.key}>
              {items.length > 0 ? (
                <div className="grid gap-4">
                  {items.map((a) => (
                    <AssessmentItem key={a.id} a={a} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No {t.label.toLowerCase()} assessments yet.
                </p>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
