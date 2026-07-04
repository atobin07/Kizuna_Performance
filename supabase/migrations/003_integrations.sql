-- Kizuna Performance — universal integration backbone
-- Every platform (Apple Health, Oura, Whoop, Strava, aggregators, scripts)
-- writes normalized samples through one ingestion path.

-- ---------------------------------------------------------------------------
-- INTEGRATION TOKENS — per-user secret for pushing data (Apple Shortcut, etc.)
-- ---------------------------------------------------------------------------
create table if not exists integration_tokens (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade,
  token text unique not null,
  label text,
  created_at timestamptz default now(),
  last_used_at timestamptz
);
alter table integration_tokens enable row level security;
create policy "Clients manage own tokens" on integration_tokens
  for all using (auth.uid() = client_id) with check (auth.uid() = client_id);
create index if not exists idx_integration_tokens_token on integration_tokens (token);

-- ---------------------------------------------------------------------------
-- WEARABLE CONNECTIONS — OAuth/device connection state per provider
-- ---------------------------------------------------------------------------
create table if not exists wearable_connections (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade,
  provider text not null,
  status text default 'connected' check (status in ('connected', 'pending', 'error', 'revoked')),
  external_user_id text,
  access_token text,
  refresh_token text,
  scopes text,
  expires_at timestamptz,
  connected_at timestamptz default now(),
  last_sync_at timestamptz,
  unique (client_id, provider)
);
alter table wearable_connections enable row level security;
create policy "Clients read own connections" on wearable_connections
  for select using (auth.uid() = client_id);
create policy "Clients delete own connections" on wearable_connections
  for delete using (auth.uid() = client_id);
-- Inserts/updates of tokens happen through the service role (OAuth callbacks).

-- ---------------------------------------------------------------------------
-- WEARABLE SAMPLES — normalized health samples from any source
-- ---------------------------------------------------------------------------
create table if not exists wearable_samples (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade,
  provider text not null,
  type text not null, -- sleep | hrv | resting_hr | steps | active_energy | workout | weight
  value numeric,
  unit text,
  start_at timestamptz,
  end_at timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  unique (client_id, provider, type, start_at)
);
alter table wearable_samples enable row level security;
create policy "Clients read own samples" on wearable_samples
  for select using (auth.uid() = client_id);
create policy "Coaches read all samples" on wearable_samples
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('coach', 'admin'))
  );
-- Inserts happen through the service role (ingestion endpoint).
create index if not exists idx_wearable_samples_client_type on wearable_samples (client_id, type, start_at);
