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
/** Self-serve app plan (distinct from 1:1 coaching `tier`). */
export type Plan = 'base' | 'track' | 'perform' | 'coached'

export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  role: UserRole
  tier: Tier | null
  plan: Plan
  stripe_customer_id: string | null
  avatar_url: string | null
  onboarded_at: string | null
  created_at: string
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type SleepLog = {
  id: string
  client_id: string | null
  log_date: string
  duration_min: number | null
  quality: number | null
  bedtime: string | null
  wake_time: string | null
  awakenings: number | null
  notes: string | null
  created_at: string
}

export type FoodLog = {
  id: string
  client_id: string | null
  log_date: string
  meal: MealType | null
  name: string
  quantity: string | null
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  logged_at: string
  created_at: string
}

export type NutritionTarget = {
  client_id: string
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  updated_at: string
}

export type IntegrationToken = {
  id: string
  client_id: string | null
  token: string
  label: string | null
  created_at: string
  last_used_at: string | null
}

export type ConnectionStatus = 'connected' | 'pending' | 'error' | 'revoked'

export type WearableConnection = {
  id: string
  client_id: string | null
  provider: string
  status: ConnectionStatus
  external_user_id: string | null
  access_token: string | null
  refresh_token: string | null
  scopes: string | null
  expires_at: string | null
  connected_at: string
  last_sync_at: string | null
}

export type WearableSampleType =
  | 'sleep'
  | 'hrv'
  | 'resting_hr'
  | 'steps'
  | 'active_energy'
  | 'workout'
  | 'weight'

export type WearableSample = {
  id: string
  client_id: string | null
  provider: string
  type: string
  value: number | null
  unit: string | null
  start_at: string | null
  end_at: string | null
  metadata: Json
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

export type StrengthConfig = {
  client_id: string
  start_date: string
  base_weights: Json
  updated_at: string
}

export type StrengthSession = {
  id: string
  client_id: string | null
  log_date: string
  day_key: string | null
  notes: string | null
  updated_at: string
}

export type StrengthEntry = {
  id: string
  client_id: string | null
  log_date: string
  exercise_key: string
  exercise_name: string | null
  category: string | null
  target_weight: number | null
  target_sets: number | null
  target_reps: string | null
  actual_weight: number | null
  actual_sets: number | null
  actual_reps: string | null
  completed: boolean
  updated_at: string
}

export type StrengthDeload = {
  id: string
  client_id: string | null
  lift: string
  effective_date: string
  baseline_week: number
  new_baseline: number
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      strength_config: TableDef<StrengthConfig>
      strength_sessions: TableDef<StrengthSession>
      strength_entries: TableDef<StrengthEntry>
      strength_deloads: TableDef<StrengthDeload>
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
      sleep_logs: TableDef<SleepLog>
      food_logs: TableDef<FoodLog>
      nutrition_targets: TableDef<NutritionTarget>
      integration_tokens: TableDef<IntegrationToken>
      wearable_connections: TableDef<WearableConnection>
      wearable_samples: TableDef<WearableSample>
    }
    // NOTE: use empty mapped types (no string index signature). A
    // `Record<string, never>` here would intersect with Tables in postgrest's
    // `Tables & Views` and collapse every row type to `never`.
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      user_role: UserRole
      tier: Tier
      plan: Plan
    }
    CompositeTypes: { [_ in never]: never }
  }
}
