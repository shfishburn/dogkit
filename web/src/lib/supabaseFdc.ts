/**
 * Build-time loaders for FDC data stored in Supabase.
 *
 * fdc_mappings  — ingredient → FDC food assignment
 * fdc_nutrients — parsed per-100 g nutrient columns + raw JSON
 */

import { supabaseQuery } from "./supabase";

/* ── Types ─────────────────────────────────────────────── */

export interface FdcMapping {
  ingredient_id: string;
  fdc_id: number;
  fdc_description: string;
  data_type: string;
  mapped_at: string;
  updated_at: string;
}

export interface FdcNutrient {
  ingredient_id: string;
  fdc_id: number;
  fdc_description: string;
  data_type: string;

  // Energy
  energy_kcal: number | null;
  energy_source: string | null;

  // Atwater
  atwater_protein: number | null;
  atwater_fat: number | null;
  atwater_carb: number | null;
  protein_factor: number | null;

  // Macros
  water_g: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carbohydrate_g: number | null;
  fiber_g: number | null;
  sugars_g: number | null;
  ash_g: number | null;

  // Minerals
  calcium_mg: number | null;
  phosphorus_mg: number | null;
  iron_mg: number | null;
  zinc_mg: number | null;
  copper_mg: number | null;
  manganese_mg: number | null;
  selenium_ug: number | null;
  magnesium_mg: number | null;
  potassium_mg: number | null;
  sodium_mg: number | null;

  // Vitamins
  vitamin_a_iu: number | null;
  vitamin_a_rae_ug: number | null;
  vitamin_d_ug: number | null;
  vitamin_e_mg: number | null;
  vitamin_k_ug: number | null;
  vitamin_c_mg: number | null;
  thiamin_mg: number | null;
  riboflavin_mg: number | null;
  niacin_mg: number | null;
  vitamin_b6_mg: number | null;
  vitamin_b12_ug: number | null;
  folate_ug: number | null;
  choline_mg: number | null;

  // Lipids
  saturated_fat_g: number | null;
  monounsat_fat_g: number | null;
  polyunsat_fat_g: number | null;
  cholesterol_mg: number | null;
  epa_g: number | null;
  dha_g: number | null;

  // Timestamps
  fetched_at: string;
  updated_at: string;
}

/** Combined mapping + nutrient row for display. */
export interface IngredientFdc {
  ingredient_id: string;
  name: string;
  category: string;
  tier: string;
  notes: string;
  fdc: FdcNutrient | null;
}

/* ── Select lists (exclude raw_fdc_response for listing pages) ── */

const NUTRIENT_SELECT = [
  "ingredient_id",
  "fdc_id",
  "fdc_description",
  "data_type",
  "energy_kcal",
  "energy_source",
  "atwater_protein",
  "atwater_fat",
  "atwater_carb",
  "protein_factor",
  "water_g",
  "protein_g",
  "fat_g",
  "carbohydrate_g",
  "fiber_g",
  "sugars_g",
  "ash_g",
  "calcium_mg",
  "phosphorus_mg",
  "iron_mg",
  "zinc_mg",
  "copper_mg",
  "manganese_mg",
  "selenium_ug",
  "magnesium_mg",
  "potassium_mg",
  "sodium_mg",
  "vitamin_a_iu",
  "vitamin_a_rae_ug",
  "vitamin_d_ug",
  "vitamin_e_mg",
  "vitamin_k_ug",
  "vitamin_c_mg",
  "thiamin_mg",
  "riboflavin_mg",
  "niacin_mg",
  "vitamin_b6_mg",
  "vitamin_b12_ug",
  "folate_ug",
  "choline_mg",
  "saturated_fat_g",
  "monounsat_fat_g",
  "polyunsat_fat_g",
  "cholesterol_mg",
  "epa_g",
  "dha_g",
  "fetched_at",
  "updated_at",
].join(",");

/* ── Loaders ───────────────────────────────────────────── */

/** All mappings (lightweight — no nutrient columns). */
export async function loadFdcMappings(): Promise<FdcMapping[]> {
  return supabaseQuery<FdcMapping>("fdc_mappings", {
    select: "ingredient_id,fdc_id,fdc_description,data_type,mapped_at,updated_at",
    order: "ingredient_id",
  });
}

/** All nutrient profiles (everything except raw_fdc_response). */
export async function loadFdcNutrients(): Promise<FdcNutrient[]> {
  return supabaseQuery<FdcNutrient>("fdc_nutrients", {
    select: NUTRIENT_SELECT,
    order: "ingredient_id",
  });
}

/** Single nutrient profile by ingredient_id. */
export async function loadFdcNutrientById(ingredientId: string): Promise<FdcNutrient | null> {
  const rows = await supabaseQuery<FdcNutrient>("fdc_nutrients", {
    select: NUTRIENT_SELECT,
    ingredient_id: `eq.${ingredientId}`,
    limit: "1",
  });
  return rows[0] ?? null;
}

/** Map of ingredient_id → FdcNutrient for fast lookup. */
export async function loadFdcNutrientMap(): Promise<Map<string, FdcNutrient>> {
  const rows = await loadFdcNutrients();
  return new Map(rows.map((r) => [r.ingredient_id, r]));
}
