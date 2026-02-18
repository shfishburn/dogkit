/**
 * Recipe-level nutrient calculation from FDC per-100g profiles.
 *
 * Formula: nutrient_total += (ingredient_grams / 100) * nutrient_per_100g
 */

import type { FdcNutrient } from "./supabaseFdc";
import type { NistConversions } from "./schemas/conversions";

/* ── Summable nutrient keys (matches FdcNutrient field names) ── */

export const SUMMABLE_NUTRIENT_KEYS = [
  "energy_kcal",
  "water_g",
  "protein_g",
  "fat_g",
  "carbohydrate_g",
  "fiber_g",
  "sugars_g",
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
  "vitamin_a_rae_ug",
  "vitamin_d_ug",
  "vitamin_e_mg",
  "vitamin_k_ug",
  "vitamin_c_mg",
  "choline_mg",
  "thiamin_mg",
  "riboflavin_mg",
  "niacin_mg",
  "vitamin_b6_mg",
  "vitamin_b12_ug",
  "folate_ug",
  "epa_g",
  "dha_g",
  "saturated_fat_g",
  "monounsat_fat_g",
  "polyunsat_fat_g",
  "cholesterol_mg",
] as const;

export type NutrientKey = (typeof SUMMABLE_NUTRIENT_KEYS)[number];
export type RecipeNutrientTotals = Record<NutrientKey, number>;

/* ── Unit conversion ─────────────────────────────────── */

interface IngredientLike {
  ingredient_id: string;
  base_g: number | null;
  unit: string;
}

function toGrams(
  ingredient: IngredientLike,
  conversions: NistConversions,
): number | null {
  if (ingredient.base_g == null) return null;

  switch (ingredient.unit) {
    case "g":
      return ingredient.base_g;
    case "ml": {
      const density =
        conversions.densities[ingredient.ingredient_id]?.density_g_per_ml ??
        conversions.densities["_default_liquid"]?.density_g_per_ml ??
        1.0;
      return ingredient.base_g * density;
    }
    default:
      // IU and other non-weight units — skip
      return null;
  }
}

/* ── Core calculation ────────────────────────────────── */

export function computeRecipeNutrients(
  ingredients: IngredientLike[],
  fdcMap: Map<string, FdcNutrient>,
  conversions: NistConversions,
): RecipeNutrientTotals {
  const totals = Object.fromEntries(
    SUMMABLE_NUTRIENT_KEYS.map((k) => [k, 0]),
  ) as RecipeNutrientTotals;

  for (const ing of ingredients) {
    const grams = toGrams(ing, conversions);
    if (grams == null || grams === 0) continue;

    const fdc = fdcMap.get(ing.ingredient_id);
    if (!fdc) continue;

    const factor = grams / 100;
    for (const key of SUMMABLE_NUTRIENT_KEYS) {
      const val = fdc[key];
      if (val != null) {
        totals[key] += val * factor;
      }
    }
  }

  return totals;
}

/* ── Display configuration ───────────────────────────── */

export interface NutrientDisplayRow {
  key: NutrientKey;
  label: string;
  unit: string;
  decimals: number;
}

export interface NutrientDisplaySection {
  title: string;
  rows: NutrientDisplayRow[];
}

export const NUTRIENT_DISPLAY_SECTIONS: NutrientDisplaySection[] = [
  {
    title: "Macronutrients",
    rows: [
      { key: "energy_kcal", label: "Energy", unit: "kcal", decimals: 0 },
      { key: "protein_g", label: "Protein", unit: "g", decimals: 1 },
      { key: "fat_g", label: "Total Fat", unit: "g", decimals: 1 },
      { key: "carbohydrate_g", label: "Carbohydrate", unit: "g", decimals: 1 },
      { key: "fiber_g", label: "Fiber", unit: "g", decimals: 1 },
      { key: "sugars_g", label: "Sugars", unit: "g", decimals: 1 },
    ],
  },
  {
    title: "Minerals",
    rows: [
      { key: "calcium_mg", label: "Calcium (Ca)", unit: "mg", decimals: 1 },
      { key: "phosphorus_mg", label: "Phosphorus (P)", unit: "mg", decimals: 1 },
      { key: "iron_mg", label: "Iron (Fe)", unit: "mg", decimals: 1 },
      { key: "zinc_mg", label: "Zinc (Zn)", unit: "mg", decimals: 1 },
      { key: "copper_mg", label: "Copper (Cu)", unit: "mg", decimals: 2 },
      { key: "manganese_mg", label: "Manganese (Mn)", unit: "mg", decimals: 2 },
      { key: "selenium_ug", label: "Selenium (Se)", unit: "µg", decimals: 1 },
      { key: "magnesium_mg", label: "Magnesium (Mg)", unit: "mg", decimals: 1 },
      { key: "potassium_mg", label: "Potassium (K)", unit: "mg", decimals: 1 },
      { key: "sodium_mg", label: "Sodium (Na)", unit: "mg", decimals: 1 },
    ],
  },
  {
    title: "Vitamins",
    rows: [
      { key: "vitamin_a_rae_ug", label: "Vitamin A (RAE)", unit: "µg", decimals: 1 },
      { key: "vitamin_d_ug", label: "Vitamin D", unit: "µg", decimals: 1 },
      { key: "vitamin_e_mg", label: "Vitamin E", unit: "mg", decimals: 1 },
      { key: "vitamin_k_ug", label: "Vitamin K", unit: "µg", decimals: 1 },
      { key: "vitamin_c_mg", label: "Vitamin C", unit: "mg", decimals: 1 },
      { key: "choline_mg", label: "Choline", unit: "mg", decimals: 1 },
      { key: "thiamin_mg", label: "Thiamin (B1)", unit: "mg", decimals: 3 },
      { key: "riboflavin_mg", label: "Riboflavin (B2)", unit: "mg", decimals: 3 },
      { key: "niacin_mg", label: "Niacin (B3)", unit: "mg", decimals: 1 },
      { key: "vitamin_b6_mg", label: "Vitamin B6", unit: "mg", decimals: 3 },
      { key: "vitamin_b12_ug", label: "Vitamin B12", unit: "µg", decimals: 2 },
      { key: "folate_ug", label: "Folate", unit: "µg", decimals: 1 },
    ],
  },
  {
    title: "Lipid Profile",
    rows: [
      { key: "saturated_fat_g", label: "Saturated Fat", unit: "g", decimals: 1 },
      { key: "monounsat_fat_g", label: "Monounsaturated Fat", unit: "g", decimals: 1 },
      { key: "polyunsat_fat_g", label: "Polyunsaturated Fat", unit: "g", decimals: 1 },
      { key: "cholesterol_mg", label: "Cholesterol", unit: "mg", decimals: 1 },
      { key: "epa_g", label: "EPA (20:5 n-3)", unit: "g", decimals: 3 },
      { key: "dha_g", label: "DHA (22:6 n-3)", unit: "g", decimals: 3 },
    ],
  },
];

/* ── Formatting helpers ──────────────────────────────── */

export function fmtNutrient(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

export function caPRatio(totals: RecipeNutrientTotals): string | null {
  if (totals.calcium_mg > 0 && totals.phosphorus_mg > 0) {
    return `${(totals.calcium_mg / totals.phosphorus_mg).toFixed(2)}:1`;
  }
  return null;
}
