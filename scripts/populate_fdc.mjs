#!/usr/bin/env node
/**
 * populate_fdc.mjs — Query USDA FDC API and populate fdc_mappings + fdc_nutrients
 *
 * Usage:
 *   node scripts/populate_fdc.mjs --dry-run     # show proposed mappings, no writes
 *   node scripts/populate_fdc.mjs               # actually populate Supabase
 *
 * Reads:  data/ingredients/ingredients.json
 * Writes: fdc_mappings, fdc_nutrients tables (via Supabase client)
 *
 * FDC rate limit: 1 000 req/hr.  This script does ≤ 2 calls per ingredient
 * (1 search + 1 detail fetch), so 76 ingredients ≈ 152 requests max.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── Load .env.local ─────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(ROOT, ".env.local");
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)/);
    if (m) {
      let val = m[2].trim();
      // strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[m[1]] ??= val;
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const FDC_API_KEY = process.env.FDC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !FDC_API_KEY) {
  console.error("Missing env vars. Need SUPABASE_URL, SUPABASE_SERVICE_KEY, FDC_API_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const DRY_RUN = process.argv.includes("--dry-run");

// ── Ingredient IDs that have no FDC equivalent ──────────────────
const SKIP_IDS = new Set([
  "calcium_sources_bone_meal",           // supplement, not a food
  "calcium_sources_calcium_carbonate",   // supplement
  "calcium_sources_dicalcium_phosphate", // supplement
  "calcium_sources_eggshell_powder",     // homemade supplement
  "eggs_dairy_eggshell_powder",          // duplicate supplement
  "supplements_fish_oil_13",             // branded product
  "supplements_taurine",                 // amino acid supplement
  "supplements_vitamin_d",              // isolated vitamin
  "supplements_vitamin_e",              // isolated vitamin
  "supplements_zinc_gluconate_picolinate", // mineral supplement
]);

// ── Custom FDC search terms ──────────────────────────────────────
// IMPORTANT: Always prefer RAW form. FDC nutrient values for raw
// ingredients are what we need — cooking losses are modeled separately.
const SEARCH_OVERRIDES = {
  "calcium_sources_canned_salmon_with_bones": "salmon pink canned solids with bone",
  "calcium_sources_sardines_with_bones": "sardines canned in oil with bones",
  "eggs_dairy_cottage_cheese": "cottage cheese lowfat 2%",
  "eggs_dairy_kefir": "kefir plain whole milk",
  "eggs_dairy_plain_yogurt": "yogurt plain whole milk",
  "eggs_dairy_whole_egg": "egg whole raw fresh",
  "fats_oils_fish_oil": "fish oil salmon",
  "fats_oils_ground_flaxseed": "seeds flaxseed",
  "fats_oils_hemp_hearts": "seeds hemp seed hulled",
  "fats_oils_safflower_oil": "oil safflower salad or cooking linoleic",
  "fats_oils_cod_liver_oil": "fish oil cod liver",
  "fish_seafood_cod_fresh": "fish cod atlantic raw",
  "fish_seafood_mackerel_canned": "fish mackerel jack canned drained",
  "fish_seafood_salmon_canned": "fish salmon pink canned solids with bone",
  "fish_seafood_salmon_fresh": "fish salmon atlantic raw",
  "fish_seafood_sardines_canned_in_water": "fish sardines canned in water drained",
  "fish_seafood_tilapia_fresh": "fish tilapia raw",
  "muscle_meat_beef_chuck_roast": "beef chuck roast raw",
  "muscle_meat_beef_heart": "beef variety meats heart raw",
  "muscle_meat_bison_ground": "game meat bison ground raw",
  "muscle_meat_chicken_breast_boneless": "chicken breast meat only raw",
  "muscle_meat_chicken_thigh_boneless": "chicken thigh meat only raw",
  "muscle_meat_ground_beef_85_lean": "beef ground 85% lean meat 15% fat raw",
  "muscle_meat_ground_beef_90_lean": "beef ground 90% lean meat 10% fat raw",
  "muscle_meat_ground_chicken": "chicken ground raw",
  "muscle_meat_ground_turkey_93_lean": "turkey ground 93% lean 7% fat raw",
  "muscle_meat_lamb_ground": "lamb ground raw",
  "muscle_meat_pork_loin": "pork fresh loin tenderloin raw",
  "muscle_meat_pork_shoulder_butt": "pork fresh shoulder raw",
  "muscle_meat_rabbit": "game meat rabbit raw",
  "muscle_meat_venison_ground": "game meat deer ground raw",
  "non_starchy_vegetables_bok_choy": "cabbage chinese pak choi raw",
  "non_starchy_vegetables_broccoli": "broccoli raw",
  "non_starchy_vegetables_brussels_sprouts": "brussels sprouts raw",
  "non_starchy_vegetables_carrots": "carrots raw",
  "non_starchy_vegetables_green_beans": "beans snap green raw",
  "non_starchy_vegetables_kale": "kale raw",
  "non_starchy_vegetables_peas": "peas green raw",
  "non_starchy_vegetables_spinach": "spinach raw",
  "non_starchy_vegetables_zucchini": "squash summer zucchini includes skin raw",
  "organ_meat_beef_kidney": "beef variety meats kidneys raw",
  "organ_meat_beef_liver": "beef variety meats liver raw",
  "organ_meat_chicken_gizzard": "chicken gizzard all classes raw",
  "organ_meat_chicken_liver": "chicken liver all classes raw",
  "organ_meat_lamb_liver": "lamb variety meats liver raw",
  "organ_meat_pork_liver": "pork fresh variety meats liver raw",
  "starchy_carbohydrates_barley": "barley pearled raw",
  "starchy_carbohydrates_brown_rice": "rice brown long grain raw",
  "starchy_carbohydrates_lentils": "lentils raw",
  "starchy_carbohydrates_oatmeal": "oats regular raw",
  "starchy_carbohydrates_pumpkin_puree": "pumpkin canned without salt",
  "starchy_carbohydrates_quinoa": "quinoa uncooked",
  "starchy_carbohydrates_sweet_potato": "sweet potato raw",
  "starchy_carbohydrates_white_potato": "potato white flesh raw",
  "starchy_carbohydrates_white_rice": "rice white long grain raw",
  "supplements_ground_ginger": "spices ginger ground",
  "supplements_iodized_salt": "salt table iodized",
  "supplements_kelp_powder_21_22": "seaweed kelp raw",
  "supplements_nutritional_yeast": "yeast extract spread",
  "supplements_psyllium_husk_powder": "psyllium seed husks",
};

// ── Human-curated FDC ID overrides ──────────────────────────────
// After the initial automated pass, a human can pin exact FDC IDs
// by placing them in data/ingredients/fdc_human_overrides.json:
//   { "ingredient_id": fdcId, ... }
// These override EVERYTHING — no search or scoring is performed.
let HUMAN_OVERRIDES = {};
try {
  const overridePath = resolve(ROOT, "data/ingredients/fdc_human_overrides.json");
  HUMAN_OVERRIDES = JSON.parse(readFileSync(overridePath, "utf8"));
  console.log(`Loaded ${Object.keys(HUMAN_OVERRIDES).length} human-curated overrides`);
} catch {
  // File doesn't exist yet — that's fine
}

// IDs where no FDC equivalent exists
const NO_FDC_MATCH = new Set([
  "fats_oils_hempseed_oil",                    // No hempseed oil in FDC
  "supplements_psyllium_husk_powder",          // No psyllium husk in FDC
]);

// ── FDC API helpers ──────────────────────────────────────────────

const FDC_BASE = "https://api.nal.usda.gov/fdc/v1";

/**
 * Search FDC for a query string.  Returns top 25 results from SR Legacy + Foundation.
 */
async function fdcSearch(query) {
  const url = new URL(`${FDC_BASE}/foods/search`);
  url.searchParams.set("api_key", FDC_API_KEY);
  url.searchParams.set("query", query);
  url.searchParams.set("dataType", "SR Legacy,Foundation");
  url.searchParams.set("pageSize", "25");

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`FDC search failed (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return data.foods || [];
}

/**
 * Fetch full food detail for a given fdcId.
 */
async function fdcDetail(fdcId) {
  const url = new URL(`${FDC_BASE}/food/${fdcId}`);
  url.searchParams.set("api_key", FDC_API_KEY);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`FDC detail failed for ${fdcId} (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

// ── Matching / scoring ───────────────────────────────────────────

/** Normalize a string for token comparison */
function normalize(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")   // strip punctuation
    .replace(/\s+/g, " ")
    .trim();
}

/** Tokenize into meaningful words, dropping noise */
const STOP_WORDS = new Set([
  "with", "and", "or", "the", "a", "an", "in", "of", "for", "to",
  "from", "by", "all", "classes", "only", "fresh", "new", "imported",
  "nfs", "ns", "as", "purchased", "refuse", "not", "further", "defined",
]);

function tokenize(s) {
  return normalize(s).split(" ").filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Identify the "must-have" tokens from a search query.
 * These are the primary food words — the result MUST contain them
 * or it's almost certainly wrong.
 *
 * Strategy: the first 1-2 non-cooking-method tokens are must-haves.
 */
const COOKING_WORDS = new Set([
  "cooked", "raw", "boiled", "roasted", "braised", "simmered", "steamed",
  "baked", "fried", "grilled", "dried", "canned", "frozen", "drained",
  "solids", "without", "skin", "bone", "bones", "dry", "heat", "salt",
  "enriched", "unenriched", "regular", "plain", "whole", "lowfat", "low",
  "fat", "lean", "light", "heavy", "hulled", "ground", "separable", "meat",
  "jack", "pink", "atlantic", "pacific", "farm", "raised", "wild", "caught",
  "pearled", "table", "high", "linoleic", "extra", "domesticated", "spice",
]);

function mustHaveTokens(query) {
  const tokens = tokenize(query);
  const important = tokens.filter((t) => !COOKING_WORDS.has(t));
  // Return at least the first important token, up to 2
  return important.slice(0, 2);
}

/**
 * Score a candidate FDC result against the search query.
 *
 * Scoring factors:
 *  1. Must-have token coverage   (hard gate — reject if missing primary food word)
 *  2. Raw preference              (strong bonus for "raw", hard penalty for "cooked")
 *  3. Query token overlap ratio   (0–1, how many query words appear in desc)
 *  4. Data type preference        (SR Legacy gets +0.1 bonus)
 *  5. Description brevity bonus   (shorter = more specific)
 *  6. Exact phrase bonus          (if query appears as substring in desc)
 */
function scoreResult(result, query) {
  const desc = result.description || "";
  const normDesc = normalize(desc);
  const descTokens = new Set(tokenize(desc));
  const queryTokens = tokenize(query);
  const mustHave = mustHaveTokens(query);

  // Gate: all must-have tokens must appear in description
  const mustHaveHits = mustHave.filter((t) => descTokens.has(t)).length;
  if (mustHave.length > 0 && mustHaveHits === 0) {
    return -1; // hard reject — wrong food entirely
  }

  // ── RAW vs COOKED ──────────────────────────────────────────
  // We MUST prefer raw ingredients. Cooked items get a hard penalty
  // unless the query explicitly asks for canned (which is a raw form).
  const COOKED_WORDS = /\b(cooked|roasted|braised|simmered|boiled|steamed|baked|fried|grilled|broiled|pan[- ]?broiled|pan[- ]?fried|stewed|poached)\b/i;
  const isCanned = /\bcanned\b/i.test(query);
  const descIsCooked = COOKED_WORDS.test(desc);
  const descIsRaw = /\braw\b/i.test(desc);

  let rawBonus = 0;
  if (!isCanned) {
    if (descIsCooked) rawBonus = -0.5;  // heavy penalty for cooked
    if (descIsRaw) rawBonus = 0.25;     // strong bonus for raw
  }

  // Partial must-have penalty
  const mustHaveRatio = mustHave.length > 0 ? mustHaveHits / mustHave.length : 1;

  // Query token overlap
  const queryHits = queryTokens.filter((t) => descTokens.has(t)).length;
  const overlapRatio = queryTokens.length > 0 ? queryHits / queryTokens.length : 0;

  // Data type bonus
  const dataTypeBonus = result.dataType === "SR Legacy" ? 0.1 : 0;

  // Brevity bonus (shorter descriptions are more specific, up to 0.05)
  const descLen = desc.length;
  const brevityBonus = Math.max(0, 0.05 * (1 - descLen / 200));

  // Exact phrase bonus — normalized query appears in normalized description
  const normQuery = normalize(query);
  const phraseBonus = normDesc.includes(normQuery) ? 0.3 : 0;

  const score =
    mustHaveRatio * 0.4 +
    overlapRatio * 0.3 +
    dataTypeBonus +
    brevityBonus +
    phraseBonus +
    rawBonus;

  return score;
}

/**
 * Pick the best FDC search result using multi-factor scoring.
 */
function pickBest(results, query) {
  if (!results.length) return null;

  let bestResult = null;
  let bestScore = -Infinity;

  for (const r of results) {
    const s = scoreResult(r, query);
    if (s > bestScore) {
      bestScore = s;
      bestResult = r;
    }
  }

  // If best score is still negative, nothing matched the primary food word
  if (bestScore < 0) return null;

  return bestResult;
}

// ── Nutrient extraction ──────────────────────────────────────────

/** Map of FDC nutrient number → our column name */
const NUTRIENT_MAP = {
  255: "water_g",
  203: "protein_g",
  204: "fat_g",
  205: "carbohydrate_g",
  291: "fiber_g",
  269: "sugars_g",
  207: "ash_g",
  301: "calcium_mg",
  305: "phosphorus_mg",
  303: "iron_mg",
  309: "zinc_mg",
  312: "copper_mg",
  315: "manganese_mg",
  317: "selenium_ug",
  304: "magnesium_mg",
  306: "potassium_mg",
  307: "sodium_mg",
  318: "vitamin_a_iu",
  320: "vitamin_a_rae_ug",
  328: "vitamin_d_ug",
  323: "vitamin_e_mg",
  430: "vitamin_k_ug",
  401: "vitamin_c_mg",
  404: "thiamin_mg",
  405: "riboflavin_mg",
  406: "niacin_mg",
  415: "vitamin_b6_mg",
  418: "vitamin_b12_ug",
  417: "folate_ug",
  421: "choline_mg",
  606: "saturated_fat_g",
  645: "monounsat_fat_g",
  646: "polyunsat_fat_g",
  601: "cholesterol_mg",
  629: "epa_g",
  621: "dha_g",
};

/**
 * Extract parsed nutrient columns from a full FDC food detail response.
 */
function extractNutrients(detail) {
  const dataType = detail.dataType || "";
  const nutrients = detail.foodNutrients || [];

  const row = {
    fdc_id: detail.fdcId,
    fdc_description: detail.description || "",
    data_type: dataType,
    raw_fdc_response: detail,
    atwater_protein: null,
    atwater_fat: null,
    atwater_carb: null,
    protein_factor: null,
    energy_kcal: null,
    energy_source: null,
  };

  // Initialize all nutrient columns to null
  for (const col of Object.values(NUTRIENT_MAP)) {
    row[col] = null;
  }

  // Parse nutrients
  for (const fn of nutrients) {
    const num = fn.nutrient?.number ? Number(fn.nutrient.number) : null;
    if (!num) continue;

    // Use median if available (Foundation), otherwise amount
    const value = fn.median ?? fn.amount ?? null;

    // Energy handling
    if (num === 208) {
      // SR Legacy energy
      if (!row.energy_kcal) {
        row.energy_kcal = value;
        row.energy_source = "208";
      }
    } else if (num === 957) {
      // Atwater General — use if we don't already have Specific
      if (row.energy_source !== "958") {
        row.energy_kcal = value;
        row.energy_source = "957";
      }
    } else if (num === 958) {
      // Atwater Specific — highest priority
      row.energy_kcal = value;
      row.energy_source = "958";
    }

    // Standard nutrient columns
    const col = NUTRIENT_MAP[num];
    if (col && value != null) {
      row[col] = value;
    }
  }

  // Atwater / conversion factors (Foundation)
  if (detail.nutrientConversionFactors?.length) {
    for (const factor of detail.nutrientConversionFactors) {
      if (factor.type === ".CalorieConversionFactor") {
        row.atwater_protein = factor.proteinValue ?? null;
        row.atwater_fat = factor.fatValue ?? null;
        row.atwater_carb = factor.carbohydrateValue ?? null;
      } else if (factor.type === ".ProteinConversionFactor") {
        row.protein_factor = factor.value ?? null;
      }
    }
  }

  return row;
}

// ── Supabase upsert helper ────────────────────────────────────────

async function upsertFdc(ingredientId, fdcId, fdcDescription, fdcDataType, nutrientRow) {
  const { error: mapErr } = await supabase
    .from("fdc_mappings")
    .upsert(
      {
        ingredient_id: ingredientId,
        fdc_id: fdcId,
        fdc_description: fdcDescription,
        data_type: fdcDataType,
      },
      { onConflict: "ingredient_id" }
    );

  if (mapErr) {
    throw new Error(`fdc_mappings upsert: ${mapErr.message}`);
  }

  const { error: nutErr } = await supabase
    .from("fdc_nutrients")
    .upsert(
      { ingredient_id: ingredientId, ...nutrientRow },
      { onConflict: "ingredient_id" }
    );

  if (nutErr) {
    throw new Error(`fdc_nutrients upsert: ${nutErr.message}`);
  }
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  const ingredientsPath = resolve(ROOT, "data/ingredients/ingredients.json");
  const data = JSON.parse(readFileSync(ingredientsPath, "utf8"));
  const ingredients = data.ingredients;

  const skipCount = SKIP_IDS.size + NO_FDC_MATCH.size;
  const humanCount = Object.keys(HUMAN_OVERRIDES).length;
  console.log(`\n${"=".repeat(70)}`);
  console.log(`FDC Population Script  ${DRY_RUN ? "[DRY RUN]" : "[LIVE]"}`);
  console.log(`${"=".repeat(70)}`);
  console.log(`Ingredients: ${ingredients.length}  |  Skipping: ${skipCount}  |  Human overrides: ${humanCount}  |  Processing: ${ingredients.length - skipCount}\n`);

  const toProcess = ingredients.filter((i) => !SKIP_IDS.has(i.id) && !NO_FDC_MATCH.has(i.id));
  const results = { ok: 0, humanCurated: 0, noMatch: 0, error: 0, skipped: skipCount };

  // Process in batches of 20
  const BATCH_SIZE = 20;
  for (let batchStart = 0; batchStart < toProcess.length; batchStart += BATCH_SIZE) {
    const batch = toProcess.slice(batchStart, batchStart + BATCH_SIZE);
    const batchNum = Math.floor(batchStart / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(toProcess.length / BATCH_SIZE);

    console.log(`── Batch ${batchNum}/${totalBatches} (${batch.length} items) ${"─".repeat(40)}\n`);

    for (const ingredient of batch) {
      const searchQuery = SEARCH_OVERRIDES[ingredient.id] || ingredient.name;
      process.stdout.write(`  [${ingredient.id}] `);

      try {
        let fdcId;
        let fdcDescription;
        let fdcDataType;

        // Human-curated override takes absolute priority
        if (HUMAN_OVERRIDES[ingredient.id]) {
          fdcId = HUMAN_OVERRIDES[ingredient.id];
          process.stdout.write(`👤 human #${fdcId} ... `);

          // Fetch detail to show/verify the description
          const detail = await fdcDetail(fdcId);
          fdcDescription = detail.description || "";
          fdcDataType = detail.dataType || "";
          console.log(`→ ${fdcDataType} "${fdcDescription}"`);
          results.humanCurated++;

          if (DRY_RUN) {
            results.ok++;
            await new Promise((r) => setTimeout(r, 100));
            continue;
          }

          // Extract and upsert below
          const nutrientRow = extractNutrients(detail);
          await upsertFdc(ingredient.id, fdcId, fdcDescription, fdcDataType, nutrientRow);
          results.ok++;
          await new Promise((r) => setTimeout(r, 100));
          continue;
        }

        // Search FDC
        process.stdout.write(`"${searchQuery}" ... `);
        const searchResults = await fdcSearch(searchQuery);
        const best = pickBest(searchResults, searchQuery);

        if (!best) {
          console.log(`❌ No match (${searchResults.length} candidates, none passed scoring)`);
          results.noMatch++;
          continue;
        }

        fdcId = best.fdcId;
        fdcDescription = best.description || "";
        fdcDataType = best.dataType || "";
        console.log(`→ ${fdcDataType} #${fdcId} "${fdcDescription}"`);

        if (DRY_RUN) {
          results.ok++;
          continue;
        }

        // Fetch detail
        const detail = await fdcDetail(fdcId);
        fdcDescription = detail.description || fdcDescription;
        fdcDataType = detail.dataType || fdcDataType;

        // Extract nutrients
        const nutrientRow = extractNutrients(detail);
        await upsertFdc(ingredient.id, fdcId, fdcDescription, fdcDataType, nutrientRow);
        results.ok++;
      } catch (err) {
        console.log(`💥 ${err.message}`);
        results.error++;
      }

      // Rate-limit courtesy: 100ms between requests
      await new Promise((r) => setTimeout(r, 100));
    }

    // Pause between batches (500ms)
    if (batchStart + BATCH_SIZE < toProcess.length) {
      console.log(`\n  ⏳ Batch complete, pausing...\n`);
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // ── Summary ──────────────────────────────────────────────
  console.log(`\n${"=".repeat(70)}`);
  console.log(`Done ${DRY_RUN ? "(DRY RUN)" : ""}`);
  console.log(`  ✅ Matched:  ${results.ok}  (${results.humanCurated} human-curated)`);
  console.log(`  ❌ No match: ${results.noMatch}`);
  console.log(`  💥 Errors:   ${results.error}`);
  console.log(`  ⏭  Skipped:  ${results.skipped}`);
  console.log(`${"=".repeat(70)}\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
