/**
 * Assemble a complete prompt from the CFPO v2 template + user inputs.
 * Imports from @data alias (resolved by Vite at build time).
 */

import type { GenerateRecipeRequest } from "./types/recipe";
import promptTemplateJson from "@data/prompts/canine_recipe_generation_v2.json";
import ingredientDbJson from "@data/ingredients/ingredients.json";

interface PromptTemplate {
  system_prompt: string;
  user_prompt_template: string;
  metadata: {
    rag_ingredients: {
      partition: {
        primary_proteins: string[];
        secondary_ingredients: string[];
      };
    };
  };
}

interface Ingredient {
  id: string;
  name: string;
  category: string;
  tier: string;
  notes?: string;
  dimensions?: string[];
}

/**
 * Partition ingredients into protein vs secondary (for RAG injection).
 */
function loadIngredients(): {
  primary_proteins: string;
  secondary_ingredients: string;
} {
  const template = ingredientDbJson as unknown as { ingredients: Ingredient[] };
  const ingredients: Ingredient[] = template.ingredients;

  const proteinCategories = new Set([
    "muscle_meat",
    "organ_meat",
    "fish_seafood",
  ]);
  const secondaryCategories = new Set([
    "starchy_carbohydrates",
    "non_starchy_vegetables",
    "eggs_dairy",
    "fats_oils",
    "calcium_sources",
  ]);

  const proteins = ingredients
    .filter((i) => proteinCategories.has(i.category))
    .map((i) => `- ${i.id} (${i.name}, ${i.category}, ${i.tier})`)
    .join("\n");

  const secondary = ingredients
    .filter((i) => secondaryCategories.has(i.category))
    .map((i) => `- ${i.id} (${i.name}, ${i.category}, ${i.tier})`)
    .join("\n");

  return { primary_proteins: proteins, secondary_ingredients: secondary };
}

/**
 * Assemble the full system + user messages for OpenRouter.
 */
export async function assemblePrompt(req: GenerateRecipeRequest): Promise<{
  system: string;
  user: string;
}> {
  const template = promptTemplateJson as unknown as PromptTemplate;
  const ingredients = loadIngredients();

  // Fill user prompt template variables
  let userPrompt = template.user_prompt_template;

  const vars: Record<string, string> = {
    "{{user_request}}": req.user_request,
    "{{life_stage}}": req.life_stage ?? "adult",
    "{{breed_size_class}}": req.breed_size_class ?? "medium",
    "{{weight_kg}}": String(req.weight_kg ?? 20),
    "{{bcs}}": String(req.bcs ?? 5),
    "{{neuter_status}}": req.neuter_status ?? "neutered",
    "{{activity_level}}": req.activity_level ?? "moderate",
    "{{known_allergies}}": req.known_allergies ?? "none",
    "{{health_conditions}}": req.health_conditions ?? "none",
    "{{primary_proteins}}": ingredients.primary_proteins,
    "{{secondary_ingredients}}": ingredients.secondary_ingredients,
  };

  for (const [key, value] of Object.entries(vars)) {
    userPrompt = userPrompt.replaceAll(key, value);
  }

  return {
    system: template.system_prompt,
    user: userPrompt,
  };
}
