-- ============================================================
-- Add FK: fdc_mappings.ingredient_id → ingredients.id
--
-- Prerequisite: ingredients table must be populated first.
-- Run populate_ingredients.mjs before applying this migration.
-- ============================================================

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'fdc_mappings_ingredient_id_fkey'
      and table_name = 'fdc_mappings'
  ) then
    alter table public.fdc_mappings
      add constraint fdc_mappings_ingredient_id_fkey
      foreign key (ingredient_id)
      references public.ingredients(id)
      on delete cascade;
  end if;
end $$;
