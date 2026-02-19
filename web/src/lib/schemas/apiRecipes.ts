import { z } from "zod";

export const GenerateRecipeRequestSchema = z.object({
  user_request: z.string().min(1),
  life_stage: z.string().optional(),
  breed_size_class: z.string().optional(),
  weight_kg: z.number().optional(),
  bcs: z.number().optional(),
  neuter_status: z.string().optional(),
  activity_level: z.string().optional(),
  known_allergies: z.string().optional(),
  health_conditions: z.string().optional(),
  cook_method: z.enum(["stovetop", "slow_cooker", "instant_pot"]).optional(),
});

const RecipeInstructionSchema = z.object({
  step: z.number(),
  category: z.enum(["prep", "cooking", "assembly", "serving"]),
  instruction: z.string(),
  time_minutes: z.number().nullable(),
  equipment: z.string().nullable(),
});

const RecipeIngredientSchema = z.object({
  ingredient_id: z.string(),
  name: z.string(),
  base_g: z.number().nullable(),
  unit: z.enum(["g", "ml", "IU"]),
  display_quantity: z.string().optional(),
  prep: z.string(),
});

const RecipeTagsSchema = z.object({
  protein_type: z.string(),
  primary_carb: z.string(),
  primary_veggie: z.string(),
  cook_method: z.string(),
  prep_time_min: z.number(),
  tier: z.string(),
  target_life_stage: z.string(),
});

export const RecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  overview: z.string(),
  description: z.string().optional().default(""),
  tags: RecipeTagsSchema,
  ingredients: z.array(RecipeIngredientSchema),
  instructions: z.array(RecipeInstructionSchema),
  notes: z.array(z.string()).optional(),
  disclaimers: z.array(z.string()).optional(),
});

export const SaveRecipeRequestSchema = z.object({
  recipe: RecipeSchema,
  user_prompt: z.string().optional().default(""),
});

export const GenerateImageRequestSchema = z.object({
  recipe_id: z.string().min(1),
  name: z.string().min(1),
  protein: z.string().optional().default(""),
  carb: z.string().optional().default(""),
  veggie: z.string().optional().default(""),
  cook_method: z.string().optional().default("stovetop"),
  ingredient_names: z.array(z.string()).optional().default([]),
});

export type GenerateRecipeRequest = z.infer<typeof GenerateRecipeRequestSchema>;
export type SaveRecipeRequest = z.infer<typeof SaveRecipeRequestSchema>;
export type GenerateImageRequest = z.infer<typeof GenerateImageRequestSchema>;
