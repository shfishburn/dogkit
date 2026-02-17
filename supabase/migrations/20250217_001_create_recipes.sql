-- ============================================================
-- Recipes table — single source of truth for all recipe data
-- Designed for idempotent upsert from JSON seed file
-- ============================================================

create table if not exists public.recipes (
  -- Primary key: stable recipe identifier (e.g. "beef_sweet_potato_spinach")
  id            text primary key,

  -- Display
  name          text not null,
  overview      text not null default '',

  -- Tags (structured, queryable)
  protein_type  text not null default '',
  primary_carb  text not null default '',
  primary_veggie text not null default '',
  cook_method   text not null default 'stovetop',
  prep_time_min integer not null default 30 check (prep_time_min > 0),
  tier          text not null default 'T1' check (tier in ('T1', 'T2')),
  dimensions_covered text[] not null default '{}',

  -- Full structured data (ingredients, instructions, nutrients)
  ingredients   jsonb not null default '[]',
  instructions  text[] not null default '{}',
  per_1000kcal  jsonb not null default '{}',

  -- Image
  image_url     text,
  image_generated_at timestamptz,

  -- Timestamps
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Index for common filter queries
create index if not exists idx_recipes_protein on public.recipes (protein_type);
create index if not exists idx_recipes_tier on public.recipes (tier);

-- Updated_at trigger (reusable across tables)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_recipes_updated_at on public.recipes;
create trigger trg_recipes_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security — recipes
-- ============================================================

alter table public.recipes enable row level security;

-- Idempotent policy: drop then create
drop policy if exists "Recipes are publicly readable" on public.recipes;
create policy "Recipes are publicly readable"
  on public.recipes for select
  using (true);

-- Only service_role can insert/update/delete (used by scripts)
-- No explicit policy needed — service_role bypasses RLS by default

-- ============================================================
-- Meal plan table — maps days to AM/PM recipe pairings
-- ============================================================

create table if not exists public.meal_plan_days (
  day           integer primary key,
  label         text not null,
  am_recipe_id  text not null references public.recipes(id),
  pm_recipe_id  text not null references public.recipes(id),

  -- Timestamps
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists trg_meal_plan_days_updated_at on public.meal_plan_days;
create trigger trg_meal_plan_days_updated_at
  before update on public.meal_plan_days
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security — meal plan
-- ============================================================

alter table public.meal_plan_days enable row level security;

drop policy if exists "Meal plan is publicly readable" on public.meal_plan_days;
create policy "Meal plan is publicly readable"
  on public.meal_plan_days for select
  using (true);

-- ============================================================
-- Storage bucket for recipe images
-- ============================================================

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

-- Idempotent storage policy
drop policy if exists "Recipe images are publicly accessible" on storage.objects;
create policy "Recipe images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

-- Allow service_role to upload (scripts)
-- service_role bypasses RLS, so no explicit insert policy needed
