-- Kizuna Performance — per-lift weekly increment is now user-configurable
-- (2.5 / 5 / 10 lb per lift). Stored alongside base weights on the config row.
-- Apply after 006_strength_deloads.sql

alter table strength_config
  add column if not exists increments jsonb not null default '{}'::jsonb;
