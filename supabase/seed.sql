-- Kizuna Performance — seed data (development only)
-- NOTE: Insert auth.users via the Supabase dashboard or CLI first; the
-- handle_new_user trigger creates matching profile rows. This file then
-- enriches those profiles and adds sample training data.
--
-- Replace the UUIDs below with real auth.users ids from your project.

-- Example coach + client (upsert onto trigger-created profile rows)
insert into profiles (id, email, full_name, role, tier)
values
  ('00000000-0000-0000-0000-0000000000c0', 'coach@kizuna.fit', 'Head Coach', 'coach', null),
  ('00000000-0000-0000-0000-0000000000c1', 'client@kizuna.fit', 'Sample Client', 'client', 'private')
on conflict (id) do update
  set role = excluded.role, tier = excluded.tier, full_name = excluded.full_name;

-- Program
insert into programs (id, client_id, coach_id, name, phase, start_date)
values ('00000000-0000-0000-0000-0000000000p1',
        '00000000-0000-0000-0000-0000000000c1',
        '00000000-0000-0000-0000-0000000000c0',
        'Foundation — Phase 1', 1, current_date - 14)
on conflict (id) do nothing;

-- Workout
insert into workouts (id, program_id, scheduled_date, title, blocks, coach_notes)
values ('00000000-0000-0000-0000-0000000000w1',
        '00000000-0000-0000-0000-0000000000p1',
        current_date, 'Lower — Strength',
        '[
          {"type":"warmup","title":"Warmup","movements":[{"name":"Bike","reps":"5 min"},{"name":"Banded hips","reps":"2x10"}]},
          {"type":"strength","title":"Back Squat","time_domain":"E3MOM","movements":[{"name":"Back Squat","sets":5,"reps":3,"load":"80% 1RM"}]},
          {"type":"conditioning","title":"Metcon","time_domain":"12 min AMRAP","movements":[{"name":"Wall Balls","reps":15},{"name":"Row","reps":"200m"}]}
        ]'::jsonb,
        'Keep the squats crisp. Stop the metcon if form degrades.')
on conflict (id) do nothing;

-- Benchmarks
insert into benchmarks (client_id, movement, value, unit, recorded_at)
values
  ('00000000-0000-0000-0000-0000000000c1', 'Back Squat', 315, 'lb', current_date - 60),
  ('00000000-0000-0000-0000-0000000000c1', 'Back Squat', 335, 'lb', current_date - 20),
  ('00000000-0000-0000-0000-0000000000c1', 'Deadlift', 405, 'lb', current_date - 30),
  ('00000000-0000-0000-0000-0000000000c1', 'Fran', 210, 'sec', current_date - 10)
on conflict do nothing;

-- Journal entries (last few days)
insert into journal_entries (client_id, entry_date, sleep_hrs, energy, stress, body_weight)
values
  ('00000000-0000-0000-0000-0000000000c1', current_date - 1, 7.5, 8, 3, 182.0),
  ('00000000-0000-0000-0000-0000000000c1', current_date - 2, 6.5, 6, 5, 182.4)
on conflict (client_id, entry_date) do nothing;
