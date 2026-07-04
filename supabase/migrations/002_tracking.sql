-- Kizuna Performance — tracker/journal expansion: plans, sleep + food logging
-- Apply after 001_initial_schema.sql

-- ---------------------------------------------------------------------------
-- PLANS: self-serve tier on the profile (separate from 1:1 coaching `tier`).
-- base (free) < track < perform < coached
-- ---------------------------------------------------------------------------
alter table profiles
  add column if not exists plan text not null default 'base'
  check (plan in ('base', 'track', 'perform', 'coached'));

-- Backfill any pre-existing rows.
update profiles set plan = 'base' where plan is null;

-- ---------------------------------------------------------------------------
-- SLEEP LOGS — one per client per day (richer than the daily journal).
-- ---------------------------------------------------------------------------
create table if not exists sleep_logs (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade,
  log_date date not null default current_date,
  duration_min int check (duration_min between 0 and 1440),
  quality int check (quality between 1 and 10),
  bedtime text,          -- HH:MM (local), optional
  wake_time text,        -- HH:MM (local), optional
  awakenings int default 0 check (awakenings >= 0),
  notes text,
  created_at timestamptz default now(),
  unique (client_id, log_date)
);
alter table sleep_logs enable row level security;
create policy "Clients manage own sleep" on sleep_logs
  for all using (auth.uid() = client_id);
create policy "Coaches read all sleep" on sleep_logs
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('coach', 'admin'))
  );
create index if not exists idx_sleep_logs_client_date on sleep_logs (client_id, log_date);

-- ---------------------------------------------------------------------------
-- FOOD LOGS — many per client per day (one row per food item / entry).
-- ---------------------------------------------------------------------------
create table if not exists food_logs (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade,
  log_date date not null default current_date,
  meal text check (meal in ('breakfast', 'lunch', 'dinner', 'snack')),
  name text not null,
  quantity text,                 -- free text, e.g. "1 cup", "200g"
  calories numeric(7,1),
  protein_g numeric(6,1),
  carbs_g numeric(6,1),
  fat_g numeric(6,1),
  logged_at timestamptz default now(),
  created_at timestamptz default now()
);
alter table food_logs enable row level security;
create policy "Clients manage own food" on food_logs
  for all using (auth.uid() = client_id);
create policy "Coaches read all food" on food_logs
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('coach', 'admin'))
  );
create index if not exists idx_food_logs_client_date on food_logs (client_id, log_date);

-- ---------------------------------------------------------------------------
-- NUTRITION TARGETS — optional daily macro goals (Track+ feature).
-- ---------------------------------------------------------------------------
create table if not exists nutrition_targets (
  client_id uuid references profiles(id) on delete cascade primary key,
  calories numeric(7,1),
  protein_g numeric(6,1),
  carbs_g numeric(6,1),
  fat_g numeric(6,1),
  updated_at timestamptz default now()
);
alter table nutrition_targets enable row level security;
create policy "Clients manage own targets" on nutrition_targets
  for all using (auth.uid() = client_id);
create policy "Coaches read all targets" on nutrition_targets
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('coach', 'admin'))
  );
