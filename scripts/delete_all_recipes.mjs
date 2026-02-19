#!/usr/bin/env node
/**
 * Delete all existing recipes and images from Supabase.
 *
 * 1. Deletes all meal_plan_days (FK constraint)
 * 2. Deletes all recipes
 * 3. Lists and deletes all images from recipe-images bucket
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_KEY in ../.env.local
 *
 * Usage: node scripts/delete_all_recipes.mjs
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Load env
const envPath = resolve(ROOT, ".env.local");
const envText = readFileSync(envPath, "utf-8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split("=").map((s) => s.trim()))
    .filter(([k, v]) => k && v)
);

const SUPABASE_URL = env.SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local");
  process.exit(1);
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function query(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} — ${text}`);
  return text ? JSON.parse(text) : null;
}

async function main() {
  // 1. Delete meal plan days (FK dependency)
  console.log("Deleting meal_plan_days...");
  const days = await query("DELETE", "/rest/v1/meal_plan_days?day=gte.0");
  console.log(`  Deleted ${days?.length ?? 0} meal plan rows`);

  // 2. Delete all recipes
  console.log("Deleting recipes...");
  const recipes = await query("DELETE", "/rest/v1/recipes?id=neq.___none___");
  console.log(`  Deleted ${recipes?.length ?? 0} recipes`);

  // 3. List and delete images from storage bucket
  console.log("Cleaning recipe-images bucket...");
  const listRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/list/recipe-images`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ prefix: "", limit: 1000 }),
    }
  );

  if (listRes.ok) {
    const files = await listRes.json();
    if (files.length > 0) {
      const paths = files.map((f) => f.name);
      console.log(`  Found ${paths.length} images, deleting...`);
      const delRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/recipe-images`,
        {
          method: "DELETE",
          headers,
          body: JSON.stringify({ prefixes: paths }),
        }
      );
      if (delRes.ok) {
        console.log(`  Deleted ${paths.length} images`);
      } else {
        console.warn(`  Image delete failed: ${delRes.status}`);
      }
    } else {
      console.log("  No images found");
    }
  } else {
    console.warn(`  Could not list images: ${listRes.status}`);
  }

  console.log("\nDone. All recipes and images cleared.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
