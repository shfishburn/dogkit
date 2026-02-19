import { z } from "zod";

export const RecipeIngredientSchema = z.object({
  ingredient_id: z.string(),
  name: z.string(),
  base_g: z.number().nullable(),
  unit: z.string(),
  prep: z.string().optional(),
});

export const RecipeTagsSchema = z.object({
  protein_type: z.string(),
  primary_carb: z.string(),
  primary_veggie: z.string(),
  cook_method: z.string(),
  prep_time_min: z.number(),
  tier: z.string(),
  // v2 tag field
  target_life_stage: z.string().optional(),

  // legacy (v1) — keep optional so older data still parses
  dimensions_covered: z.array(z.string()).optional(),
});

export const RecipeInstructionSchema = z.object({
  step: z.number(),
  category: z.enum(["prep", "cooking", "assembly", "serving"]),
  instruction: z.string(),
  time_minutes: z.number().nullable(),
  equipment: z.string().nullable(),
});

export const Per1000kcalEstimateSchema = z.object({
  protein_g: z.number(),
  fat_g: z.number(),
  fiber_g: z.number(),
  calcium_mg: z.number(),
  phosphorus_mg: z.number(),
  ca_p_ratio: z.string(),
});

export const Per1000kcalSchema = z.record(z.union([z.number(), z.string()]));

export const RecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  overview: z.string(),
  description: z.string().optional(),
  image_url: z.string().nullable().optional(),
  tags: RecipeTagsSchema,
  ingredients: z.array(RecipeIngredientSchema),

  // v2 structured steps, but allow v1 string steps to keep older JSON valid
  instructions: z.union([
    z.array(RecipeInstructionSchema),
    z.array(z.string()),
  ]),

  // v2 fields produced by the generator
  notes: z.array(z.string()).optional(),
  disclaimers: z.array(z.string()).optional(),

  // v1 estimate (legacy)
  per_1000kcal_estimate: Per1000kcalEstimateSchema.optional(),
  // v2 computed pipeline output (DB)
  per_1000kcal: Per1000kcalSchema.optional(),
});

export type RecipeSchemaType = z.infer<typeof RecipeSchema>;
export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;
export type RecipeTags = z.infer<typeof RecipeTagsSchema>;
export type Per1000kcalEstimate = z.infer<typeof Per1000kcalEstimateSchema>;
export type RecipeInstruction = z.infer<typeof RecipeInstructionSchema>;
