#!/usr/bin/env node
/**
 * Populate the `ingredients` and `ingredient_aliases` tables in Supabase.
 *
 * Data sources:
 *   - data/ingredients/ingredients.json     → canonical ingredients
 *   - data/recipes/weekly_meal_plan.json    → raw recipe ingredient_ids (scanned for aliases)
 *
 * Call chain after population:
 *
 *   recipe.ingredients[].ingredient_id
 *     → ingredient_aliases.alias_id      (resolve to canonical)
 *     → ingredients.id                   (master record)
 *     → fdc_mappings.ingredient_id       (FDC assignment)
 *     → fdc_nutrients.*                  (nutrient profile)
 *
 * Usage:
 *   node populate_ingredients.mjs              # live upsert
 *   node populate_ingredients.mjs --dry-run    # preview only
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

// ── Load .env.local (no dotenv dependency) ────────────────
{
  const envPath = resolve(ROOT, ".env.local");
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[m[1]] ??= val;
  }
}

const DRY_RUN = process.argv.includes("--dry-run");
const MODE = DRY_RUN ? "DRY RUN" : "LIVE";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Load data ─────────────────────────────────────────────

const DATA_ROOT = resolve(ROOT, "data");

const ingDb = JSON.parse(readFileSync(resolve(DATA_ROOT, "ingredients", "ingredients.json"), "utf8"));
const recipesDb = JSON.parse(readFileSync(resolve(DATA_ROOT, "recipes", "weekly_meal_plan.json"), "utf8"));

const canonicalIngredients = ingDb.ingredients;
const canonicalIds = new Set(canonicalIngredients.map((i) => i.id));

// ── Scan recipe ingredient_ids ────────────────────────────

const recipeIngredientIds = new Set();
for (const recipe of recipesDb.recipes) {
  for (const ing of recipe.ingredients) {
    recipeIngredientIds.add(ing.ingredient_id);
  }
}

// ── Build alias map ───────────────────────────────────────
// Every canonical id maps to itself (self-alias).
// Orphan recipe ids get manual resolution here.

const MANUAL_ALIASES = {
  whole_egg: "eggs_dairy_whole_egg",
};

const aliases = new Map(); // alias_id → { canonical_id, source }

// Self-aliases for all canonical ingredients
for (const id of canonicalIds) {
  aliases.set(id, { canonical_id: id, source: "auto" });
}

// Manual aliases
for (const [alias, canonical] of Object.entries(MANUAL_ALIASES)) {
  if (!canonicalIds.has(canonical)) {
    console.warn(`⚠️  Manual alias "${alias}" → "${canonical}" — canonical not found!`);
    continue;
  }
  aliases.set(alias, { canonical_id: canonical, source: "manual" });
}

// Scan recipe IDs for any that aren't already aliased
const unresolved = [];
for (const rawId of recipeIngredientIds) {
  if (!aliases.has(rawId)) {
    unresolved.push(rawId);
  }
}

// ── Report ────────────────────────────────────────────────

console.log(`
${"=".repeat(67)}
  Ingredient Normalization  [${MODE}]
${"=".repeat(67)}
  Canonical ingredients:   ${canonicalIngredients.length}
  Recipe ingredient_ids:   ${recipeIngredientIds.size}
  Self-aliases:            ${canonicalIds.size}
  Manual aliases:          ${Object.keys(MANUAL_ALIASES).length}
  Total aliases:           ${aliases.size}
  Unresolved recipe IDs:   ${unresolved.length}
${"=".repeat(67)}
`);

if (unresolved.length) {
  console.warn("⚠️  Unresolved recipe ingredient_ids (need manual aliases):");
  for (const id of unresolved.sort()) {
    console.warn(`   - ${id}`);
  }
  console.warn("");
}

if (DRY_RUN) {
  console.log("Dry run — no changes written.\n");
  console.log("Aliases:");
  for (const [alias, { canonical_id, source }] of [...aliases.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const marker = alias !== canonical_id ? " ← REMAP" : "";
    console.log(`  ${alias} → ${canonical_id} [${source}]${marker}`);
  }
  process.exit(0);
}

// ── Upsert canonical ingredients ──────────────────────────

console.log("Upserting canonical ingredients...");

const ingRows = canonicalIngredients.map((i) => ({
  id: i.id,
  name: i.name,
  category: i.category,
  tier: i.tier,
  default_unit: i.default_unit ?? null,
  notes: i.notes ?? null,
  dimensions: i.dimensions ?? {},
}));

// Batch in chunks of 50
const BATCH = 50;
let ingOk = 0;
for (let i = 0; i < ingRows.length; i += BATCH) {
  const batch = ingRows.slice(i, i + BATCH);
  const { error } = await supabase
    .from("ingredients")
    .upsert(batch, { onConflict: "id" });
  if (error) {
    console.error(`  ❌ ingredients batch ${i}: ${error.message}`);
    process.exit(1);
  }
  ingOk += batch.length;
}
console.log(`  ✅ ${ingOk} canonical ingredients upserted`);

// ── Upsert aliases ────────────────────────────────────────

console.log("Upserting ingredient aliases...");

const aliasRows = [...aliases.entries()].map(([alias_id, { canonical_id, source }]) => ({
  alias_id,
  canonical_id,
  source,
}));

let aliasOk = 0;
for (let i = 0; i < aliasRows.length; i += BATCH) {
  const batch = aliasRows.slice(i, i + BATCH);
  const { error } = await supabase
    .from("ingredient_aliases")
    .upsert(batch, { onConflict: "alias_id" });
  if (error) {
    console.error(`  ❌ aliases batch ${i}: ${error.message}`);
    process.exit(1);
  }
  aliasOk += batch.length;
}
console.log(`  ✅ ${aliasOk} aliases upserted (${Object.keys(MANUAL_ALIASES).length} manual remaps)`);

// ── Summary ───────────────────────────────────────────────

console.log(`
${"=".repeat(67)}
  Done
  ✅ Ingredients: ${ingOk}
  ✅ Aliases:     ${aliasOk}
  ⚠️  Unresolved: ${unresolved.length}
${"=".repeat(67)}
`);
