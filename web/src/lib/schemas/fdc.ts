import { z } from "zod";

/* ── FDC mapping: ingredient_id → FDC food ────────────── */

export const FdcMappingEntrySchema = z.object({
  ingredient_id: z.string(),
  fdc_id: z.number(),
  fdc_description: z.string(),
  data_type: z.string(),
});

export const FdcMappingDbSchema = z.object({
  version: z.string().optional(),
  updated_at: z.string().optional(),
  mappings: z.array(FdcMappingEntrySchema),
});

/* ── Per-100 g nutrient profile ───────────────────────── */

export const NutrientPer100gSchema = z.object({
  energy_kcal: z.number().nullable(),
  water_g: z.number().nullable(),
  protein_g: z.number().nullable(),
  fat_g: z.number().nullable(),
  fiber_g: z.number().nullable(),
  sugars_g: z.number().nullable(),
  calcium_mg: z.number().nullable(),
  phosphorus_mg: z.number().nullable(),
  iron_mg: z.number().nullable(),
  zinc_mg: z.number().nullable(),
  copper_mg: z.number().nullable(),
  selenium_ug: z.number().nullable(),
  magnesium_mg: z.number().nullable(),
  potassium_mg: z.number().nullable(),
  sodium_mg: z.number().nullable(),
  manganese_mg: z.number().nullable(),
  vitamin_a_rae_ug: z.number().nullable(),
  vitamin_d_ug: z.number().nullable(),
  vitamin_e_mg: z.number().nullable(),
  vitamin_k_ug: z.number().nullable(),
  choline_mg: z.number().nullable(),
});

export const NutrientProfileSchema = z.object({
  ingredient_id: z.string(),
  fdc_id: z.number(),
  fdc_description: z.string(),
  per_100g: NutrientPer100gSchema,
});

export const NutrientDbSchema = z.object({
  version: z.string().optional(),
  fetched_at: z.string().optional(),
  profiles: z.array(NutrientProfileSchema),
});

/* ── Inferred types ───────────────────────────────────── */

export type FdcMappingEntry = z.infer<typeof FdcMappingEntrySchema>;
export type FdcMappingDb = z.infer<typeof FdcMappingDbSchema>;
export type NutrientPer100g = z.infer<typeof NutrientPer100gSchema>;
export type NutrientProfile = z.infer<typeof NutrientProfileSchema>;
export type NutrientDb = z.infer<typeof NutrientDbSchema>;
