/**
 * Shared types for the canine recipe generation pipeline.
 */

// ── Recipe tag structure ──
export interface RecipeTags {
  protein_type: string;
  primary_carb: string;
  primary_veggie: string;
  cook_method: string;
  prep_time_min: number;
  tier: string;
  target_life_stage: string;
}

// ── Structured instruction (v2) ──
export interface RecipeInstruction {
  step: number;
  category: "prep" | "cooking" | "assembly" | "serving";
  instruction: string;
  time_minutes: number | null;
  equipment: string | null;
}

// ── Ingredient entry ──
export interface RecipeIngredient {
  ingredient_id: string;
  name: string;
  base_g: number | null;
  unit: "g" | "ml" | "IU";
  /** Display-only, USA-first dual units, e.g. "8 oz (230 g)". */
  display_quantity?: string;
  prep: string;
}

// ── Full recipe (v2 CFPO output) ──
export interface Recipe {
  id: string;
  name: string;
  overview: string;
  description: string;
  tags: RecipeTags;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  notes?: string[];
  disclaimers?: string[];
}

// ── Database row (extends Recipe with DB metadata) ──
export interface RecipeRow extends Recipe {
  protein_type: string;
  primary_carb: string;
  primary_veggie: string;
  cook_method: string;
  prep_time_min: number;
  tier: string;
  target_life_stage: string;
  per_1000kcal: Record<string, number | string> | null;
  image_url: string | null;
  image_generated_at: string | null;
  user_prompt: string | null;
  generated_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Generation request ──
export interface GenerateRecipeRequest {
  user_request: string;
  life_stage?: string;
  breed_size_class?: string;
  weight_kg?: number;
  bcs?: number;
  neuter_status?: string;
  activity_level?: string;
  known_allergies?: string;
  health_conditions?: string;
  /** User-selected cooking device/method (USA app): stovetop (pan), slow_cooker, instant_pot (pressure cooker). */
  cook_method?: "stovetop" | "slow_cooker" | "instant_pot";
}

// ── Image generation request ──
export interface GenerateImageRequest {
  recipe_id: string;
  name: string;
  protein: string;
  carb: string;
  veggie: string;
  cook_method: string;
  ingredient_names: string[];
}
