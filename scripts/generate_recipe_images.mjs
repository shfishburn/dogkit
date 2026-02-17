#!/usr/bin/env node

/**
 * Generate hero images for all recipes using OpenRouter (GPT Image 1)
 * and upload them to Supabase Storage.
 *
 * Usage:
 *   node scripts/generate_recipe_images.mjs                # all recipes without images
 *   node scripts/generate_recipe_images.mjs --recipe beef_sweet_potato_spinach  # single recipe
 *   node scripts/generate_recipe_images.mjs --force        # regenerate all, even if image exists
 *   node scripts/generate_recipe_images.mjs --dry-run      # print prompts without calling API
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

// ── Paths ────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RECIPE_JSON = path.join(ROOT, "specs", "recipes", "weekly_meal_plan.json");
const SYSTEM_PROMPT = path.join(__dirname, "prompts", "recipe-image-system.txt");
const USER_TEMPLATE = path.join(__dirname, "prompts", "recipe-image-user.txt");

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

// ── Prompt builder ───────────────────────────────────────────
function buildUserPrompt(template, recipe) {
  const protein = recipe.tags?.protein_type ?? "";
  const carb = recipe.tags?.primary_carb ?? "";
  const veggie = recipe.tags?.primary_veggie ?? "";
  const cookMethod = recipe.tags?.cook_method ?? "stovetop";

  const ingredientList = recipe.ingredients
    .map((ing) => `- ${ing.name}`)
    .join("\n");

  return template
    .replace("{{name}}", recipe.name)
    .replace("{{protein}}", labelify(protein))
    .replace(/\{\{carb\}\}/g, labelify(carb))
    .replace(/\{\{veggie\}\}/g, labelify(veggie))
    .replace("{{cook_method}}", cookMethod)
    .replace("{{ingredient_list}}", ingredientList);
}

function labelify(s) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── OpenRouter image generation ──────────────────────────────
async function generateImage(systemPrompt, userPrompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  // OpenRouter serves image generation through chat/completions, not /images/generations
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://dogkit.vercel.app",
      "X-Title": "Dogology Recipe Images",
    },
    body: JSON.stringify({
      model: "openai/gpt-5-image",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${body}`);
  }

  const json = await res.json();
  const choice = json.choices?.[0];
  const content = choice?.message?.content;

  if (!content) {
    throw new Error("No content in response: " + JSON.stringify(json).slice(0, 500));
  }

  // Response may contain a mix of text and image parts, or inline base64 data URI
  // Case 1: content is an array of parts (OpenAI multimodal style)
  if (Array.isArray(content)) {
    const imagePart = content.find((p) => p.type === "image_url" || p.type === "image");
    if (imagePart) {
      const url = imagePart.image_url?.url ?? imagePart.url ?? imagePart.b64;
      if (url?.startsWith("data:")) {
        const b64 = url.split(",")[1];
        return Buffer.from(b64, "base64");
      }
      if (url) {
        const imgRes = await fetch(url);
        if (!imgRes.ok) throw new Error(`Failed to download image: ${imgRes.status}`);
        return Buffer.from(await imgRes.arrayBuffer());
      }
    }
  }

  // Case 2: content is a string containing a data URI
  if (typeof content === "string") {
    const dataUriMatch = content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
    if (dataUriMatch) {
      return Buffer.from(dataUriMatch[1], "base64");
    }
    // Case 3: content is a string URL to an image
    const urlMatch = content.match(/https?:\/\/\S+\.(?:png|jpg|jpeg|webp)\S*/i);
    if (urlMatch) {
      const imgRes = await fetch(urlMatch[0]);
      if (!imgRes.ok) throw new Error(`Failed to download image: ${imgRes.status}`);
      return Buffer.from(await imgRes.arrayBuffer());
    }
  }

  throw new Error("Could not extract image from response: " + JSON.stringify(json).slice(0, 500));
}

// ── Supabase upload ──────────────────────────────────────────
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY required");
  return createClient(url, key);
}

async function uploadToSupabase(supabase, recipeId, imageBuffer) {
  const bucket = process.env.SUPABASE_BUCKET || "recipe-images";
  const filePath = `${recipeId}.webp`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, imageBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

// ── CLI args ─────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { force: false, dryRun: false, recipeId: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--force") opts.force = true;
    else if (args[i] === "--dry-run") opts.dryRun = true;
    else if (args[i] === "--recipe" && args[i + 1]) opts.recipeId = args[++i];
  }
  return opts;
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  await loadEnv();
  const opts = parseArgs();

  // Load recipe data
  const plan = JSON.parse(await readFile(RECIPE_JSON, "utf-8"));
  const recipes = plan.recipes ?? [];

  // Load prompt templates
  const systemPrompt = (await readFile(SYSTEM_PROMPT, "utf-8")).trim();
  const userTemplate = (await readFile(USER_TEMPLATE, "utf-8")).trim();

  // Filter recipes
  let targets = recipes;
  if (opts.recipeId) {
    targets = recipes.filter((r) => r.id === opts.recipeId);
    if (targets.length === 0) {
      console.error(`Recipe "${opts.recipeId}" not found`);
      process.exit(1);
    }
  } else if (!opts.force) {
    targets = recipes.filter((r) => !r.image_url);
  }

  console.log(`Generating images for ${targets.length} recipe(s)...\n`);

  if (targets.length === 0) {
    console.log("All recipes already have images. Use --force to regenerate.");
    return;
  }

  // Init Supabase (skip for dry run)
  let supabase;
  if (!opts.dryRun) {
    supabase = getSupabaseClient();
  }

  let success = 0;
  let failed = 0;

  for (const recipe of targets) {
    const userPrompt = buildUserPrompt(userTemplate, recipe);

    console.log(`[${recipe.id}] ${recipe.name}`);

    if (opts.dryRun) {
      console.log("  System prompt:", systemPrompt.slice(0, 80) + "...");
      console.log("  User prompt:", userPrompt.slice(0, 120) + "...");
      console.log("");
      continue;
    }

    try {
      // Generate image
      console.log("  Generating image...");
      const imageBuffer = await generateImage(systemPrompt, userPrompt);
      console.log(`  Got ${(imageBuffer.length / 1024).toFixed(0)} KB image`);

      // Upload to Supabase
      console.log("  Uploading to Supabase...");
      const publicUrl = await uploadToSupabase(supabase, recipe.id, imageBuffer);
      console.log(`  Uploaded: ${publicUrl}`);

      // Update recipe in memory + Supabase table
      recipe.image_url = publicUrl;
      console.log("  Updating recipes table...");
      const { error: dbErr } = await supabase
        .from("recipes")
        .update({ image_url: publicUrl, image_generated_at: new Date().toISOString() })
        .eq("id", recipe.id);
      if (dbErr) console.warn(`  DB update warning: ${dbErr.message}`);
      success++;

      // Rate limit: pause between requests
      if (targets.indexOf(recipe) < targets.length - 1) {
        console.log("  Waiting 2s...");
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      failed++;
    }

    console.log("");
  }

  // Write updated JSON back
  if (!opts.dryRun && success > 0) {
    await writeFile(RECIPE_JSON, JSON.stringify(plan, null, 2) + "\n", "utf-8");
    console.log(`Updated ${RECIPE_JSON}`);
  }

  console.log(`\nDone: ${success} succeeded, ${failed} failed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
