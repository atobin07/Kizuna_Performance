// Hand-authored Database types mirroring supabase/migrations/001_initial_schema.sql.
// Regenerate with: supabase gen types typescript --project-id <id> > lib/supabase/types.ts
//
// NOTE: these are `type` aliases (not interfaces) so the row shapes satisfy
// Supabase's `Record<string, unknown>` table constraint.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'client' | 'coach' | 'admin'
export type Tier = 'private' | 'semi_private'

export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  role: UserRole
  tier: Tier | null
  stripe_customer_id: string | null
  avatar_url: string | null
  onboarded_at: string | null
  created_at: string
}

export type Program = {
  id: string
  client_id: string | null
  coach_id: string | null
  name: string
  phase: number
  start_date: string | null
  is_active: boolean
  created_at: string
}

export type WorkoutMovement = {
  name: string
  sets?: number | string
  reps?: number | string
  load?: string
  notes?: string
}

export type WorkoutBlock = {
  type: 'warmup' | 'strength' | 'conditioning' | string
  title?: string
  time_domain?: string
  notes?: string
  movements: WorkoutMovement[]
}

export type Workout = {
  id: string
  program_id: string | null
  scheduled_date: string | null
  title: string
  blocks: WorkoutBlock[]
  coach_notes: string | null
  completed_at: string | null
  created_at: string
}

export type WorkoutResult = {
  id: string
  workout_id: string | null
  client_id: string | null
  result: Json
  rpe: number | null
  notes: string | null
  logged_at: string
}

export type Benchmark = {
  id: string
  client_id: string | null
  movement: string
  value: number
  unit: string
  notes: string | null
  recorded_at: string
  created_at: string
}

export type Assessment = {
  id: string
  client_id: string | null
  type: 'movement' | 'benchmark' | 'body_comp' | null
  data: Json
  coach_notes: string | null
  video_url: string | null
  assessed_at: string
  created_at: string
}

export type JournalEntry = {
  id: string
  client_id: string | null
  entry_date: string
  sleep_hrs: number | null
  energy: number | null
  stress: number | null
  body_weight: number | null
  notes: string | null
  created_at: string
}

export type Message = {
  id: string
  sender_id: string | null
  recipient_id: string | null
  body: string
  read_at: string | null
  created_at: string
}

export type PageView = {
  id: string
  session_id: string | null
  user_id: string | null
  path: string | null
  referrer: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  country: string | null
  device: string | null
  created_at: string
}

export type AnalyticsEvent = {
  id: string
  session_id: string | null
  user_id: string | null
  event_name: string
  properties: Json
  created_at: string
}

type TableDef<T> = {
  Row: T
  Insert: Partial<T>
  Update: Partial<T>
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile>
      programs: TableDef<Program>
      workouts: TableDef<Workout>
      workout_results: TableDef<WorkoutResult>
      benchmarks: TableDef<Benchmark>
      assessments: TableDef<Assessment>
      journal_entries: TableDef<JournalEntry>
      messages: TableDef<Message>
      page_views: TableDef<PageView>
      events: TableDef<AnalyticsEvent>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      tier: Tier
    }
    CompositeTypes: Record<string, never>
  }
}
