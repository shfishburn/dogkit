#!/usr/bin/env node

/**
 * Load recipes from weekly_meal_plan.json into Supabase.
 * Fully idempotent — uses upsert on the stable recipe `id`.
 *
 * Usage:
 *   node scripts/load_recipes_to_supabase.mjs              # upsert all recipes + meal plan
 *   node scripts/load_recipes_to_supabase.mjs --dry-run    # print what would be upserted
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

// ── Paths ────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RECIPE_JSON = path.join(ROOT, "data", "recipes", "weekly_meal_plan.json");

// ── Env ──────────────────────────────────────────────────────
async function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  try {
    const raw = await readFile(envPath, "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local not found
  }
}

// ── Transform recipe JSON → table row ────────────────────────
function recipeToRow(recipe) {
  return {
    id: recipe.id,
    name: recipe.name,
    overview: recipe.overview ?? "",
    protein_type: recipe.tags?.protein_type ?? "",
    primary_carb: recipe.tags?.primary_carb ?? "",
    primary_veggie: recipe.tags?.primary_veggie ?? "",
    cook_method: recipe.tags?.cook_method ?? "stovetop",
    prep_time_min: recipe.tags?.prep_time_min ?? 30,
    tier: recipe.tags?.tier ?? "T1",
    dimensions_covered: recipe.tags?.dimensions_covered ?? [],
    ingredients: recipe.ingredients ?? [],
    instructions: recipe.instructions ?? [],
    per_1000kcal: recipe.per_1000kcal_estimate ?? {},
    image_url: recipe.image_url ?? null,
  };
}

// ── Transform meal plan day → table row ──────────────────────
function dayToRow(day) {
  return {
    day: day.day,
    label: day.label,
    am_recipe_id: day.am?.recipe_id,
    pm_recipe_id: day.pm?.recipe_id,
  };
}

// ── CLI args ─────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  return { dryRun: args.includes("--dry-run") };
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  await loadEnv();
  const opts = parseArgs();

  // Load JSON
  const plan = JSON.parse(await readFile(RECIPE_JSON, "utf-8"));
  const recipes = plan.recipes ?? [];
  const days = plan.weekly_plan?.days ?? [];

  console.log(`Loaded ${recipes.length} recipes and ${days.length} meal plan days from JSON\n`);

  // Transform
  const recipeRows = recipes.map(recipeToRow);
  const dayRows = days.map(dayToRow);

  if (opts.dryRun) {
    console.log("DRY RUN — would upsert:\n");
    console.log("Recipes:");
    for (const row of recipeRows) {
      console.log(`  ${row.id} — ${row.name} [${row.tier}] ${row.protein_type}`);
    }
    console.log(`\nMeal plan days: ${dayRows.length}`);
    for (const row of dayRows) {
      console.log(`  Day ${row.day}: AM=${row.am_recipe_id}, PM=${row.pm_recipe_id}`);
    }
    return;
  }

  // Init Supabase with service_role key (bypasses RLS)
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    console.error("SUPABASE_URL and SUPABASE_SERVICE_KEY required");
    process.exit(1);
  }
  const supabase = createClient(url, key);

  // Upsert recipes (batch of up to 50 for safety)
  console.log("Upserting recipes...");
  const BATCH = 50;
  let upserted = 0;
  for (let i = 0; i < recipeRows.length; i += BATCH) {
    const batch = recipeRows.slice(i, i + BATCH);
    const { error } = await supabase
      .from("recipes")
      .upsert(batch, { onConflict: "id", ignoreDuplicates: false });

    if (error) {
      console.error(`  Batch ${i}-${i + batch.length} failed:`, error.message);
      process.exit(1);
    }
    upserted += batch.length;
    console.log(`  ${upserted}/${recipeRows.length} recipes upserted`);
  }

  // Upsert meal plan days
  console.log("\nUpserting meal plan days...");
  const { error: dayError } = await supabase
    .from("meal_plan_days")
    .upsert(dayRows, { onConflict: "day", ignoreDuplicates: false });

  if (dayError) {
    console.error("  Meal plan upsert failed:", dayError.message);
    process.exit(1);
  }
  console.log(`  ${dayRows.length} days upserted`);

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
