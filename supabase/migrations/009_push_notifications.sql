-- Kizuna Performance — Web Push notifications.
-- Apply after 008_food_workout_meals.sql
--
-- Two tables:
--   push_subscriptions — one row per browser/device that opted in (the
--     PushSubscription endpoint + keys returned by the browser).
--   reminders — scheduled banners. `send_time` is LOCAL wall-clock time in the
--     client's timezone; `days` is an array of ISO weekdays (1=Mon … 7=Sun).
--     `last_sent_on` guards against duplicate sends within the cron window.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_client_idx
  on public.push_subscriptions (client_id);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('training', 'recovery', 'nutrition', 'log')),
  title text not null,
  body text not null,
  send_time text not null,                    -- 'HH:MM', 24h, local wall time
  timezone text not null default 'America/New_York',
  days smallint[] not null default '{1,2,3,4,5,6,7}',  -- ISO weekdays 1..7
  enabled boolean not null default true,
  last_sent_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reminders_client_idx on public.reminders (client_id);
create index if not exists reminders_due_idx on public.reminders (enabled, send_time);

-- RLS: each user manages only their own rows. The send endpoint uses the
-- service-role key and bypasses RLS.
alter table public.push_subscriptions enable row level security;
alter table public.reminders enable row level security;

create policy "own push subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);

create policy "own reminders"
  on public.reminders for all
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);
