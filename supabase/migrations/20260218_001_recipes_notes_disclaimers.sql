-- Add notes + disclaimers to recipes so v2 generator output round-trips.

alter table public.recipes
  add column if not exists notes jsonb not null default '[]'::jsonb,
  add column if not exists disclaimers jsonb not null default '[]'::jsonb;
