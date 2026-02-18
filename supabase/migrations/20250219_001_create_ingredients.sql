-- ============================================================
-- Canonical ingredients + alias resolution layer
--
-- Normalized model:
--
--   ┌──────────────────┐       ┌──────────────────────┐
--   │ ingredient_aliases│──────▶│  ingredients          │
--   │ (raw → canonical) │  FK   │  (canonical master)   │
--   └──────────────────┘       └──────────┬───────────┘
--                                         │ PK = id
--                              ┌──────────┴───────────┐
--                              │  fdc_mappings         │
--                              │  (canonical → FDC)    │
--                              └──────────┬───────────┘
--                                         │
--                              ┌──────────┴───────────┐
--                              │  fdc_nutrients        │
--                              │  (parsed + raw JSON)  │
--                              └──────────────────────┘
--
-- Call chain for recipe nutrient lookup:
--
--   recipe.ingredients[].ingredient_id
--     → ingredient_aliases.alias_id  (if alias exists)
--     → ingredients.id               (canonical)
--     → fdc_mappings.ingredient_id   (FDC assignment)
--     → fdc_nutrients.*              (nutrient profile)
--
-- Four layers:
--   Raw Ingredient   = recipe ingredient_id + name + prep
--   Canonical Ingredient = ingredients.id (master record)
--   Canonical FDC    = fdc_nutrients parsed columns
--   Raw FDC          = fdc_nutrients.raw_fdc_response
--
-- Idempotent: all DDL uses IF NOT EXISTS / DROP IF EXISTS.
-- ============================================================

-- ── Canonical Ingredients ────────────────────────────────

create table if not exists public.ingredients (
  id              text primary key,           -- e.g. 'muscle_meat_ground_beef_90_lean'
  name            text not null,              -- e.g. 'Ground beef, 90% lean'
  category        text not null default '',   -- e.g. 'muscle_meat'
  tier            text not null default 'T1', -- T1/T2/T3
  default_unit    text,                       -- e.g. 'g', 'ml'
  notes           text,                       -- freeform notes
  dimensions      jsonb not null default '{}', -- nutrient dimension tags

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_ingredients_updated_at on public.ingredients;
create trigger trg_ingredients_updated_at
  before update on public.ingredients
  for each row execute function public.set_updated_at();

-- ── Ingredient Aliases ───────────────────────────────────
-- Maps raw recipe ingredient_ids to canonical ingredient ids.
-- If a recipe uses 'whole_egg', this table resolves it to
-- 'eggs_dairy_whole_egg'.
--
-- Convention: every canonical id is ALSO an alias to itself
-- (self-referential row), so lookup is always:
--   SELECT canonical_id FROM ingredient_aliases WHERE alias_id = ?

create table if not exists public.ingredient_aliases (
  alias_id        text primary key,           -- raw id (from recipe or elsewhere)
  canonical_id    text not null               -- resolved canonical ingredient id
                  references public.ingredients(id)
                  on delete cascade,
  source          text not null default 'auto', -- 'auto' | 'manual' | 'recipe_scan'

  created_at      timestamptz not null default now()
);

create index if not exists idx_ingredient_aliases_canonical
  on public.ingredient_aliases (canonical_id);

-- ── FK from fdc_mappings → ingredients (deferred) ────────
-- The FK below requires ingredients to be populated FIRST.
-- Run populate_ingredients.mjs, then apply migration 003 to add the FK.
-- See: 20250218_003_add_fdc_fk.sql

-- ── RLS ──────────────────────────────────────────────────

alter table public.ingredients enable row level security;
alter table public.ingredient_aliases enable row level security;

drop policy if exists "Ingredients are publicly readable" on public.ingredients;
create policy "Ingredients are publicly readable"
  on public.ingredients for select
  using (true);

drop policy if exists "Aliases are publicly readable" on public.ingredient_aliases;
create policy "Aliases are publicly readable"
  on public.ingredient_aliases for select
  using (true);
