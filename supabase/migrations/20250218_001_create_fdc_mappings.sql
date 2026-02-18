-- ============================================================
-- FDC data — USDA FoodData Central mappings and nutrient profiles
--
-- Two tables:
--   fdc_mappings  — ingredient_id ↔ FDC food assignment
--   fdc_nutrients — raw API response + parsed per-100 g nutrients
--
-- Schema differences between FDC data types (verified against live API):
--
--   SR Legacy (nutrient 208 "Energy", kcal direct)
--     • foodNutrients[].amount          — single reported value
--     • foodNutrients[].dataPoints      — sample count
--     • nutrientConversionFactors       — [] (empty)
--     • No median / min / max / nutrientAnalysisDetails
--
--   Foundation (nutrients 957 "Energy (Atwater General)" + 958 "…Specific")
--     • foodNutrients[].amount          — mean across samples
--     • foodNutrients[].median / min / max / dataPoints
--     • foodNutrients[].nutrientAnalysisDetails[] — per-sample lab data
--     • nutrientConversionFactors[]     — Atwater factors:
--         .CalorieConversionFactor  { proteinValue, fatValue, carbohydrateValue }
--         .ProteinConversionFactor { value }
--
-- The raw_fdc_response column stores the full /v1/food/{fdcId} JSON
-- so the parsed columns can be re-derived when extraction logic changes.
--
-- Idempotent: all DDL uses IF NOT EXISTS / DROP IF EXISTS.
-- Relies on public.set_updated_at() from migration 001.
-- ============================================================

-- ── FDC Mappings ─────────────────────────────────────────────

create table if not exists public.fdc_mappings (
  ingredient_id     text primary key,

  fdc_id            integer not null,
  fdc_description   text not null default '',
  data_type         text not null default ''
                    check (data_type in (
                      'SR Legacy', 'Foundation',
                      'Survey (FNDDS)', 'Branded', ''
                    )),

  mapped_at         timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_fdc_mappings_fdc_id
  on public.fdc_mappings (fdc_id);

drop trigger if exists trg_fdc_mappings_updated_at on public.fdc_mappings;
create trigger trg_fdc_mappings_updated_at
  before update on public.fdc_mappings
  for each row execute function public.set_updated_at();

-- ── FDC Nutrients ────────────────────────────────────────────

create table if not exists public.fdc_nutrients (
  ingredient_id     text primary key
                    references public.fdc_mappings(ingredient_id)
                    on delete cascade,

  fdc_id            integer not null,
  fdc_description   text not null default '',
  data_type         text not null default ''
                    check (data_type in (
                      'SR Legacy', 'Foundation',
                      'Survey (FNDDS)', 'Branded', ''
                    )),

  -- ── Raw API payload (single source of truth) ──────────────
  raw_fdc_response  jsonb not null default '{}',

  -- ── Atwater / conversion factors (Foundation only) ────────
  -- Stored explicitly so energy can be recalculated from macros
  -- without re-parsing the full JSONB blob.
  atwater_protein   numeric,          -- kcal per g protein  (e.g. 4.27)
  atwater_fat       numeric,          -- kcal per g fat      (e.g. 9.02)
  atwater_carb      numeric,          -- kcal per g carb     (e.g. 3.87)
  protein_factor    numeric,          -- N-to-protein factor (e.g. 6.25)

  -- ── Energy ────────────────────────────────────────────────
  -- SR Legacy:   nutrient 208 "Energy" (kcal)
  -- Foundation:  nutrient 957 "Energy (Atwater General Factors)" (kcal)
  --              nutrient 958 "Energy (Atwater Specific Factors)" (kcal)
  -- We store the best-available kcal value, plus provenance.
  energy_kcal       numeric,
  energy_source     text,             -- '208' | '957' | '958'

  -- ── Parsed per-100 g values (derived from raw_fdc_response) ─
  water_g           numeric,          -- 255  Water
  protein_g         numeric,          -- 203  Protein
  fat_g             numeric,          -- 204  Total lipid (fat)
  carbohydrate_g    numeric,          -- 205  Carbohydrate, by difference
  fiber_g           numeric,          -- 291  Fiber, total dietary
  sugars_g          numeric,          -- 269  Total Sugars
  ash_g             numeric,          -- 207  Ash
  calcium_mg        numeric,          -- 301  Calcium, Ca
  phosphorus_mg     numeric,          -- 305  Phosphorus, P
  iron_mg           numeric,          -- 303  Iron, Fe
  zinc_mg           numeric,          -- 309  Zinc, Zn
  copper_mg         numeric,          -- 312  Copper, Cu
  manganese_mg      numeric,          -- 315  Manganese, Mn
  selenium_ug       numeric,          -- 317  Selenium, Se
  magnesium_mg      numeric,          -- 304  Magnesium, Mg
  potassium_mg      numeric,          -- 306  Potassium, K
  sodium_mg         numeric,          -- 307  Sodium, Na
  vitamin_a_iu      numeric,          -- 318  Vitamin A, IU
  vitamin_a_rae_ug  numeric,          -- 320  Vitamin A, RAE
  vitamin_d_ug      numeric,          -- 328  Vitamin D (D2 + D3)
  vitamin_e_mg      numeric,          -- 323  Vitamin E (alpha-tocopherol)
  vitamin_k_ug      numeric,          -- 430  Vitamin K (phylloquinone)
  vitamin_c_mg      numeric,          -- 401  Vitamin C
  thiamin_mg        numeric,          -- 404  Thiamin
  riboflavin_mg     numeric,          -- 405  Riboflavin
  niacin_mg         numeric,          -- 406  Niacin
  vitamin_b6_mg     numeric,          -- 415  Vitamin B-6
  vitamin_b12_ug    numeric,          -- 418  Vitamin B-12
  folate_ug         numeric,          -- 417  Folate, total
  choline_mg        numeric,          -- 421  Choline, total
  saturated_fat_g   numeric,          -- 606  Fatty acids, total saturated
  monounsat_fat_g   numeric,          -- 645  Fatty acids, total monounsaturated
  polyunsat_fat_g   numeric,          -- 646  Fatty acids, total polyunsaturated
  cholesterol_mg    numeric,          -- 601  Cholesterol
  epa_g             numeric,          -- 629  20:5 n-3 (EPA)
  dha_g             numeric,          -- 621  22:6 n-3 (DHA)

  -- ── Timestamps ────────────────────────────────────────────
  fetched_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on column public.fdc_nutrients.raw_fdc_response is
  'Complete JSON from GET /v1/food/{fdcId}. Foundation and SR Legacy schemas differ — see migration header.';
comment on column public.fdc_nutrients.energy_source is
  'FDC nutrient number used: 208 (SR Legacy Energy), 957 (Atwater General), or 958 (Atwater Specific).';

drop trigger if exists trg_fdc_nutrients_updated_at on public.fdc_nutrients;
create trigger trg_fdc_nutrients_updated_at
  before update on public.fdc_nutrients
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.fdc_mappings enable row level security;
alter table public.fdc_nutrients enable row level security;

drop policy if exists "FDC mappings are publicly readable" on public.fdc_mappings;
create policy "FDC mappings are publicly readable"
  on public.fdc_mappings for select
  using (true);

drop policy if exists "FDC nutrients are publicly readable" on public.fdc_nutrients;
create policy "FDC nutrients are publicly readable"
  on public.fdc_nutrients for select
  using (true);
