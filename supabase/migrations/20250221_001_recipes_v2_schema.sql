-- ============================================================
-- v2 schema migration — align recipes table with CFPO v2 output
-- ============================================================

-- 1. Add new columns
alter table public.recipes
  add column if not exists description text not null default '',
  add column if not exists target_life_stage text not null default 'adult';

-- 2. Convert instructions from text[] to jsonb
--    (structured instruction objects: step, category, instruction, time_minutes, equipment)
alter table public.recipes
  alter column instructions drop default;
alter table public.recipes
  alter column instructions type jsonb using to_jsonb(instructions);
alter table public.recipes
  alter column instructions set default '[]'::jsonb;

-- 3. Add user_prompt column to store the generation prompt
alter table public.recipes
  add column if not exists user_prompt text;

-- 4. Add model metadata
alter table public.recipes
  add column if not exists generated_by text;  -- e.g. "anthropic/claude-sonnet-4.6"

-- 5. Drop obsolete dimensions_covered (replaced by target_life_stage)
alter table public.recipes
  drop column if exists dimensions_covered;

-- 6. Index for life stage filtering
create index if not exists idx_recipes_life_stage on public.recipes (target_life_stage);
