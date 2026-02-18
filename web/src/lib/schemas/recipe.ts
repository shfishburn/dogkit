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
  dimensions_covered: z.array(z.string()),
});

export const Per1000kcalEstimateSchema = z.object({
  protein_g: z.number(),
  fat_g: z.number(),
  fiber_g: z.number(),
  calcium_mg: z.number(),
  phosphorus_mg: z.number(),
  ca_p_ratio: z.string(),
});

export const RecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  overview: z.string(),
  image_url: z.string().optional(),
  tags: RecipeTagsSchema,
  ingredients: z.array(RecipeIngredientSchema),
  instructions: z.array(z.string()),
  per_1000kcal_estimate: Per1000kcalEstimateSchema,
});

export type Recipe = z.infer<typeof RecipeSchema>;
export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;
export type RecipeTags = z.infer<typeof RecipeTagsSchema>;
export type Per1000kcalEstimate = z.infer<typeof Per1000kcalEstimateSchema>;
