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

  const usaDisplayUnitsAddendum = `

## USA Display Units (REQUIRED)

This is a USA app. You MUST include a human-friendly \`display_quantity\` field for EVERY ingredient.

- \`base_g\` + \`unit\` remain the ONLY nutrition-canonical values for the deterministic pipeline.
- \`display_quantity\` is display-only and must be derived from \`base_g\` + \`unit\`.
- Format: US customary first, metric in parentheses.
  - Solids: \`X oz (Y g)\`
  - Liquids: \`X fl oz (Y ml)\`
  - IU: \`X IU\`
- Rounding (round UP):
  - grams: round up to nearest 5 g
  - milliliters: round up to nearest 1 ml
  - oz/fl oz: round up to nearest 0.25

Hard rules:
- Do NOT use ranges (e.g., "6–8 oz"). Output a single value.
- Do NOT use "to taste".

Example ingredient object:
{ "ingredient_id": "muscle_meat_chicken_thigh_boneless", "name": "Chicken thigh, boneless", "base_g": 227, "unit": "g", "display_quantity": "8 oz (230 g)", "prep": "Raw weight, ..." }
`;

  const cookMethod = req.cook_method ?? "stovetop";
  const cookMethodAddendum = `

## Cooking Device (REQUIRED)

The user has selected a cooking device. You MUST:

1) Set \`tags.cook_method\` to EXACTLY: \`${cookMethod}\`
2) Write instructions that actually use that device and adjust \`time_minutes\` appropriately.

Device mapping:
- \`stovetop\` = pan/skillet + pot on stove
- \`slow_cooker\` = crockpot-style low/slow cooking (longer times)
- \`instant_pot\` = pressure cooker (shorter pressure times + include release guidance)
`;

  const outputQualityAddendum = `

## Output Quality (REQUIRED)

Instructions fields:
- If a step describes a timed action, \`time_minutes\` MUST be a number (not null).
- If \`category\` is \`cooking\`, \`equipment\` MUST be non-null.

Prep time consistency:
- \`tags.prep_time_min\` should be consistent with the selected cooking device and the sum of hands-on steps.

Seasoning ban:
- Do NOT mention salt, pepper, spice blends, seasoning, or "to taste" anywhere.

Cooling + storage:
- The FINAL instruction step MUST be category \`serving\` and include cooling guidance (*cool to touch*) plus safe storage (refrigerate/freeze) and reheating guidance.

Bone-in fish safety:
- If you include bone-in canned fish (e.g., sardines_with_bones or canned_salmon_with_bones), explicitly state that canned bones are soft AND to never add any other bones.
`;

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

  userPrompt += `\n\n## Cooking Device\n- cook_method: ${cookMethod}\n- device: ${cookMethod === "stovetop" ? "pan" : cookMethod === "slow_cooker" ? "slow cooker" : "pressure cooker"}\n`;

  return {
    system: template.system_prompt + usaDisplayUnitsAddendum + cookMethodAddendum + outputQualityAddendum,
    user: userPrompt,
  };
}
