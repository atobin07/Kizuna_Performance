-- Kizuna Performance — strength progression tracker
-- Apply after 004_fix_handle_new_user.sql
--
-- Three tables:
--   strength_config   — one row per client: program start date + base weights
--   strength_sessions — one row per client per day: day-level notes
--   strength_entries  — one row per client per day per exercise: plan vs actual

-- ---------------------------------------------------------------------------
-- CONFIG — per-client base weights (jsonb) + program start date. Weekly
-- progression is computed in the app from start_date + fixed increments.
-- ---------------------------------------------------------------------------
create table if not exists strength_config (
  client_id uuid references profiles(id) on delete cascade primary key,
  start_date date not null default current_date,
  base_weights jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);
alter table strength_config enable row level security;
create policy "Clients manage own strength config" on strength_config
  for all using (auth.uid() = client_id);
create policy "Coaches read all strength config" on strength_config
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('coach', 'admin'))
  );

-- ---------------------------------------------------------------------------
-- SESSIONS — day-level record (notes, which split day it was).
-- ---------------------------------------------------------------------------
create table if not exists strength_sessions (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade,
  log_date date not null default current_date,
  day_key text,
  notes text,
  updated_at timestamptz default now(),
  unique (client_id, log_date)
);
alter table strength_sessions enable row level security;
create policy "Clients manage own strength sessions" on strength_sessions
  for all using (auth.uid() = client_id);
create policy "Coaches read all strength sessions" on strength_sessions
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('coach', 'admin'))
  );
create index if not exists idx_strength_sessions_client_date
  on strength_sessions (client_id, log_date);

-- ---------------------------------------------------------------------------
-- ENTRIES — the checklist rows: planned target vs what was actually done.
-- ---------------------------------------------------------------------------
create table if not exists strength_entries (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade,
  log_date date not null default current_date,
  exercise_key text not null,
  exercise_name text,
  category text,
  target_weight numeric(6,1),
  target_sets int,
  target_reps text,
  actual_weight numeric(6,1),
  actual_sets int,
  actual_reps text,
  completed boolean not null default false,
  updated_at timestamptz default now(),
  unique (client_id, log_date, exercise_key)
);
alter table strength_entries enable row level security;
create policy "Clients manage own strength entries" on strength_entries
  for all using (auth.uid() = client_id);
create policy "Coaches read all strength entries" on strength_entries
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('coach', 'admin'))
  );
create index if not exists idx_strength_entries_client_date
  on strength_entries (client_id, log_date);
create index if not exists idx_strength_entries_client_exercise
  on strength_entries (client_id, exercise_key, log_date);
