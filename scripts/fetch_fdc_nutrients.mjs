#!/usr/bin/env node

/**
 * Fetch per-100 g nutrient profiles from USDA FoodData Central
 * for all ingredients in fdc_mapping.json.
 *
 * Usage:
 *   node scripts/fetch_fdc_nutrients.mjs            # fetch all mapped ingredients
 *   node scripts/fetch_fdc_nutrients.mjs --dry-run   # preview without API calls
 *
 * Requires FDC_API_KEY in .env.local
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ── Paths ────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MAPPING_PATH = path.join(ROOT, "data", "ingredients", "fdc_mapping.json");
const OUTPUT_PATH = path.join(ROOT, "data", "ingredients", "nutrients.json");

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
    // .env.local not found, rely on process.env
  }
}

// ── FDC nutrient ID → output field ──────────────────────────
const NUTRIENT_MAP = {
  208: "energy_kcal",
  255: "water_g",
  203: "protein_g",
  204: "fat_g",
  291: "fiber_g",
  269: "sugars_g",
  301: "calcium_mg",
  305: "phosphorus_mg",
  303: "iron_mg",
  309: "zinc_mg",
  312: "copper_mg",
  317: "selenium_ug",
  304: "magnesium_mg",
  306: "potassium_mg",
  307: "sodium_mg",
  315: "manganese_mg",
  320: "vitamin_a_rae_ug",
  328: "vitamin_d_ug",
  323: "vitamin_e_mg",
  430: "vitamin_k_ug",
  421: "choline_mg",
};

const ALL_FIELDS = Object.values(NUTRIENT_MAP);

// ── API helpers ─────────────────────────────────────────────

const FDC_BASE = "https://api.nal.usda.gov/fdc/v1";
const BATCH_SIZE = 20;
const DELAY_MS = 2000;

async function fetchBatch(fdcIds, apiKey) {
  const res = await fetch(`${FDC_BASE}/foods?api_key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fdcIds,
      nutrients: Object.keys(NUTRIENT_MAP).map(Number),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FDC API ${res.status}: ${text}`);
  }
  return res.json();
}

function extractProfile(fdcFood) {
  const per100g = {};
  for (const field of ALL_FIELDS) {
    per100g[field] = null;
  }

  for (const fn of fdcFood.foodNutrients ?? []) {
    const nutrientId = fn.nutrient?.id ?? fn.nutrientId ?? fn.number;
    const field = NUTRIENT_MAP[nutrientId];
    if (field) {
      per100g[field] = fn.amount ?? null;
    }
  }

  return per100g;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  await loadEnv();

  const apiKey = process.env.FDC_API_KEY;
  if (!apiKey) {
    console.error("Error: Set FDC_API_KEY in .env.local");
    process.exit(1);
  }

  const isDryRun = process.argv.includes("--dry-run");

  let mapping;
  try {
    const raw = await readFile(MAPPING_PATH, "utf-8");
    mapping = JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${MAPPING_PATH}: ${err.message}`);
    process.exit(1);
  }

  const entries = mapping.mappings ?? [];
  if (!entries.length) {
    console.log("No mappings found. Use /admin/ingredients to create mappings first.");
    return;
  }

  console.log(`Found ${entries.length} mapped ingredient(s).`);

  if (isDryRun) {
    console.log("\nDry run — would fetch these FDC IDs:\n");
    for (const m of entries) {
      console.log(`  ${m.ingredient_id} → FDC ${m.fdc_id} (${m.fdc_description})`);
    }
    return;
  }

  // Split into batches
  const batches = [];
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    batches.push(entries.slice(i, i + BATCH_SIZE));
  }

  console.log(`Fetching in ${batches.length} batch(es) of up to ${BATCH_SIZE}...\n`);

  const profiles = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const fdcIds = batch.map((m) => m.fdc_id);

    console.log(`Batch ${i + 1}/${batches.length}: FDC IDs [${fdcIds.join(", ")}]`);

    const foods = await fetchBatch(fdcIds, apiKey);

    // Build lookup
    const foodById = new Map(foods.map((f) => [f.fdcId, f]));

    for (const m of batch) {
      const food = foodById.get(m.fdc_id);
      if (!food) {
        console.warn(`  WARNING: No data for FDC ${m.fdc_id} (${m.ingredient_id})`);
        continue;
      }

      const per100g = extractProfile(food);
      profiles.push({
        ingredient_id: m.ingredient_id,
        fdc_id: m.fdc_id,
        fdc_description: food.description ?? m.fdc_description,
        per_100g: per100g,
      });

      const kcal = per100g.energy_kcal ?? "?";
      const protein = per100g.protein_g ?? "?";
      console.log(`  ✓ ${m.ingredient_id}: ${kcal} kcal, ${protein}g protein`);
    }

    // Delay between batches
    if (i < batches.length - 1) {
      console.log(`  (waiting ${DELAY_MS}ms...)`);
      await sleep(DELAY_MS);
    }
  }

  const output = {
    version: "1.0",
    fetched_at: new Date().toISOString(),
    profiles,
  };

  await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n", "utf-8");
  console.log(
    `\nWrote ${profiles.length} nutrient profile(s) to ${path.relative(ROOT, OUTPUT_PATH)}`,
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
