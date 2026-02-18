import { z } from "zod";
import { RecipeSchema } from "./recipe";

export const SizeScalingEntrySchema = z.object({
  label: z.string(),
  weight_kg: z.number(),
  approx_mer_kcal: z.number(),
  factor: z.number(),
});

export const SizeScalingSchema = z.object({
  description: z.string(),
  small: SizeScalingEntrySchema,
  medium: SizeScalingEntrySchema,
  large: SizeScalingEntrySchema,
});

export const MealPlanMetadataSchema = z.object({
  version: z.string(),
  title: z.string(),
  description: z.string(),
  source: z.string(),
  target_profile: z.string(),
  notes: z.array(z.string()),
  size_scaling: SizeScalingSchema,
});

export const DayPlanSchema = z.object({
  day: z.number(),
  label: z.string(),
  am: z.object({ recipe_id: z.string() }),
  pm: z.object({ recipe_id: z.string() }),
});

export const WeeklyPlanSchema = z.object({
  description: z.string(),
  days: z.array(DayPlanSchema),
});

export const WeeklyMealPlanSchema = z.object({
  metadata: MealPlanMetadataSchema,
  recipes: z.array(RecipeSchema),
  weekly_plan: WeeklyPlanSchema,
});

export type SizeScalingEntry = z.infer<typeof SizeScalingEntrySchema>;
export type SizeScaling = z.infer<typeof SizeScalingSchema>;
export type MealPlanMetadata = z.infer<typeof MealPlanMetadataSchema>;
export type DayPlan = z.infer<typeof DayPlanSchema>;
export type WeeklyPlan = z.infer<typeof WeeklyPlanSchema>;
export type WeeklyMealPlan = z.infer<typeof WeeklyMealPlanSchema>;
