/**
 * POST /api/recipes/save
 *
 * Saves a generated recipe to Supabase.
 * Flattens the LLM JSON output into the recipes table schema.
 */

import type { APIRoute } from "astro";
import { supabaseUpsert } from "../../../lib/supabaseAdmin";
import { SaveRecipeRequestSchema } from "../../../lib/schemas/apiRecipes";
import { RECIPE_MODEL } from "../../../lib/constants";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = SaveRecipeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid request body", issues: parsed.error.issues }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { recipe, user_prompt } = parsed.data;

  try {
    // Flatten tags + recipe into DB row format
    const row = {
      id: recipe.id,
      name: recipe.name,
      overview: recipe.overview ?? "",
      description: recipe.description ?? "",
      protein_type: recipe.tags?.protein_type ?? "",
      primary_carb: recipe.tags?.primary_carb ?? "",
      primary_veggie: recipe.tags?.primary_veggie ?? "",
      cook_method: recipe.tags?.cook_method ?? "stovetop",
      prep_time_min: recipe.tags?.prep_time_min ?? 30,
      tier: recipe.tags?.tier ?? "T1",
      target_life_stage: recipe.tags?.target_life_stage ?? "adult",
      ingredients: recipe.ingredients ?? [],
      instructions: recipe.instructions ?? [],
      notes: recipe.notes ?? [],
      disclaimers: recipe.disclaimers ?? [],
      per_1000kcal: {}, // pipeline-computed, empty on save
      user_prompt: user_prompt ?? null,
      generated_by: RECIPE_MODEL,
    };

    const saved = await supabaseUpsert("recipes", row);

    return new Response(JSON.stringify({ ok: true, recipe: saved }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
