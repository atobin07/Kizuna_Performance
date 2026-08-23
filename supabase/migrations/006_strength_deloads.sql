-- Kizuna Performance — per-lift deload events (autoregulation on failure).
-- When a lift is failed, we record a deload: from its effective date forward,
-- the lift's baseline drops ~20% and linear progression resumes from there.
-- Apply after 005_strength.sql

create table if not exists strength_deloads (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade,
  lift text not null,                 -- squat | deadlift | ohp | bench | hang_clean
  effective_date date not null default current_date,
  baseline_week int not null default 0,   -- weeksElapsed(start, effective_date)
  new_baseline numeric(6,1) not null,      -- the reduced working weight (lb)
  created_at timestamptz default now()
);
alter table strength_deloads enable row level security;
create policy "Clients manage own strength deloads" on strength_deloads
  for all using (auth.uid() = client_id);
create policy "Coaches read all strength deloads" on strength_deloads
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('coach', 'admin'))
  );
create index if not exists idx_strength_deloads_client_lift
  on strength_deloads (client_id, lift, effective_date);
