-- Kizuna Performance — initial schema
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  role text default 'client' check (role in ('client', 'coach', 'admin')),
  tier text check (tier in ('private', 'semi_private')),
  stripe_customer_id text,
  avatar_url text,
  onboarded_at timestamptz,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Coaches can read all profiles" on profiles for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('coach', 'admin'))
);

-- PROGRAMS
create table programs (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade,
  coach_id uuid references profiles(id),
  name text not null,
  phase int default 1,
  start_date date,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table programs enable row level security;
create policy "Clients see own programs" on programs for select using (auth.uid() = client_id);
create policy "Coaches manage all programs" on programs for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('coach', 'admin'))
);

-- WORKOUTS
create table workouts (
  id uuid default uuid_generate_v4() primary key,
  program_id uuid references programs(id) on delete cascade,
  scheduled_date date,
  title text not null,
  blocks jsonb not null default '[]',
  coach_notes text,
  completed_at timestamptz,
  created_at timestamptz default now()
);
alter table workouts enable row level security;
create policy "Clients see own workouts" on workouts for select using (
  exists (select 1 from programs where id = workouts.program_id and client_id = auth.uid())
);
create policy "Coaches manage all workouts" on workouts for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('coach', 'admin'))
);

-- WORKOUT RESULTS
create table workout_results (
  id uuid default uuid_generate_v4() primary key,
  workout_id uuid references workouts(id) on delete cascade,
  client_id uuid references profiles(id),
  result jsonb default '{}',
  rpe int check (rpe between 1 and 10),
  notes text,
  logged_at timestamptz default now()
);
alter table workout_results enable row level security;
create policy "Clients manage own results" on workout_results for all using (auth.uid() = client_id);
create policy "Coaches read all results" on workout_results for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('coach', 'admin'))
);

-- BENCHMARKS
create table benchmarks (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade,
  movement text not null,
  value numeric not null,
  unit text not null,
  notes text,
  recorded_at date default current_date,
  created_at timestamptz default now()
);
alter table benchmarks enable row level security;
create policy "Clients manage own benchmarks" on benchmarks for all using (auth.uid() = client_id);
create policy "Coaches read all benchmarks" on benchmarks for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('coach', 'admin'))
);

-- ASSESSMENTS
create table assessments (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade,
  type text check (type in ('movement', 'benchmark', 'body_comp')),
  data jsonb default '{}',
  coach_notes text,
  video_url text,
  assessed_at date default current_date,
  created_at timestamptz default now()
);
alter table assessments enable row level security;
create policy "Clients read own assessments" on assessments for select using (auth.uid() = client_id);
create policy "Coaches manage all assessments" on assessments for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('coach', 'admin'))
);

-- JOURNAL ENTRIES
create table journal_entries (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade,
  entry_date date default current_date,
  sleep_hrs numeric(3,1),
  energy int check (energy between 1 and 10),
  stress int check (stress between 1 and 10),
  body_weight numeric(5,1),
  notes text,
  created_at timestamptz default now(),
  unique(client_id, entry_date)
);
alter table journal_entries enable row level security;
create policy "Clients manage own journal" on journal_entries for all using (auth.uid() = client_id);
create policy "Coaches read all journals" on journal_entries for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('coach', 'admin'))
);

-- MESSAGES
create table messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references profiles(id),
  recipient_id uuid references profiles(id),
  body text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);
alter table messages enable row level security;
create policy "Users see own messages" on messages for select using (
  auth.uid() = sender_id or auth.uid() = recipient_id
);
create policy "Users send messages" on messages for insert with check (auth.uid() = sender_id);
create policy "Users mark own received read" on messages for update using (auth.uid() = recipient_id);

-- ANALYTICS: PAGE VIEWS
create table page_views (
  id uuid default uuid_generate_v4() primary key,
  session_id text,
  user_id uuid references profiles(id),
  path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  country text,
  device text,
  created_at timestamptz default now()
);
alter table page_views enable row level security;
create policy "Only service role inserts" on page_views for insert with check (false);
create policy "Coaches read analytics" on page_views for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('coach', 'admin'))
);

-- ANALYTICS: CUSTOM EVENTS
create table events (
  id uuid default uuid_generate_v4() primary key,
  session_id text,
  user_id uuid references profiles(id),
  event_name text not null,
  properties jsonb default '{}',
  created_at timestamptz default now()
);
alter table events enable row level security;
create policy "Only service role inserts events" on events for insert with check (false);
create policy "Coaches read events" on events for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('coach', 'admin'))
);

-- Helpful indexes
create index idx_workouts_program on workouts(program_id);
create index idx_workouts_scheduled on workouts(scheduled_date);
create index idx_workout_results_client on workout_results(client_id);
create index idx_benchmarks_client_movement on benchmarks(client_id, movement);
create index idx_journal_client_date on journal_entries(client_id, entry_date);
create index idx_messages_participants on messages(sender_id, recipient_id);
create index idx_events_name_created on events(event_name, created_at);
create index idx_page_views_created on page_views(created_at);

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
