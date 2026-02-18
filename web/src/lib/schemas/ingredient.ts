import { z } from "zod";

export const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  tier: z.string(),
  default_unit: z.string().optional(),
  notes: z.string().optional(),
  dimensions: z.record(z.string(), z.string()).optional(),
});

export const IngredientMetadataSchema = z.object({
  version: z.string().optional(),
  currency: z.string().optional(),
  availability_tiers: z.record(z.string(), z.string()).optional(),
  dimensions: z.record(z.string(), z.string()).optional(),
  generatedFrom: z.string().optional(),
});

export const IngredientDbSchema = z.object({
  metadata: IngredientMetadataSchema.optional(),
  ingredients: z.array(IngredientSchema),
});

export type Ingredient = z.infer<typeof IngredientSchema>;
export type IngredientMetadata = z.infer<typeof IngredientMetadataSchema>;
export type IngredientDb = z.infer<typeof IngredientDbSchema>;
