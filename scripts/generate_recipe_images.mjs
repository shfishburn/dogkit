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
const RECIPE_JSON = path.join(ROOT, "data", "recipes", "weekly_meal_plan.json");
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
async function readOpenRouterJsonResponse(res) {
  const contentType = res.headers.get("content-type") ?? "";

  // Some OpenRouter responses are streamed as SSE even when stream=false.
  if (contentType.includes("text/event-stream")) {
    if (!res.body) throw new Error("OpenRouter SSE response missing body");

    const decoder = new TextDecoder();
    const reader = res.body.getReader();
    let buffer = "";
    let lastJson = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      // Normalize newlines so we can split on "\n\n" reliably.
      buffer = buffer.replace(/\r\n/g, "\n");

      // SSE events are separated by blank lines.
      while (true) {
        const idx = buffer.indexOf("\n\n");
        if (idx < 0) break;
        const eventBlock = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);

        const dataLines = eventBlock
          .split("\n")
          .filter((l) => l.startsWith("data:"))
          .map((l) => l.slice(5).trim());

        if (dataLines.length === 0) continue;
        const data = dataLines.join("\n");
        if (data === "[DONE]") return lastJson;

        try {
          const parsed = JSON.parse(data);
          lastJson = parsed;
        } catch {
          // Ignore malformed partial chunks; final chunks should be valid JSON.
        }
      }
    }

    // Parse any trailing chunk that didn't end with a blank line.
    if (buffer.trim().length > 0) {
      const dataLines = buffer
        .split("\n")
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trim());
      const data = dataLines.join("\n");
      if (data && data !== "[DONE]") {
        try {
          lastJson = JSON.parse(data);
        } catch {
          // ignore
        }
      }
    }

    return lastJson;
  }

  const rawBody = await res.text();
  if (process.env.DEBUG_OPENROUTER === "1") {
    console.log(`  OpenRouter body: ${(rawBody.length / 1024).toFixed(0)} KB`);
  }
  return JSON.parse(rawBody);
}

async function generateImage(systemPrompt, userPrompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  // 5 minute timeout — image generation can take 60-90s, plus large base64 transfer
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5 * 60 * 1000);

  try {
    // OpenRouter serves image generation through chat/completions
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "HTTP-Referer": "https://dogkit.vercel.app",
        "X-Title": "Dogology Recipe Images",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-image",
        stream: false,
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

    const json = await readOpenRouterJsonResponse(res);
    if (json?.error) {
      throw new Error(`OpenRouter error: ${JSON.stringify(json.error)}`);
    }

    const choice = json.choices?.[0];
    const message = choice?.message;

    // Primary path: gpt-5-image returns images in message.images[]
    if (message?.images?.length > 0) {
      const imgObj = message.images[0];
      const url = imgObj.image_url?.url ?? imgObj.url;
      if (url?.startsWith("data:")) {
        const comma = url.indexOf(",");
        if (comma < 0) throw new Error("Invalid data URI in image_url.url");
        const b64 = url.slice(comma + 1);
        return Buffer.from(b64, "base64");
      }
      if (url) {
        const imgRes = await fetch(url);
        if (!imgRes.ok) throw new Error(`Failed to download image: ${imgRes.status}`);
        return Buffer.from(await imgRes.arrayBuffer());
      }
    }

    // Fallback: content may contain image data
    const content = message?.content;
    if (typeof content === "string" && content.length > 0) {
      const dataUriMatch = content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
      if (dataUriMatch) {
        return Buffer.from(dataUriMatch[1], "base64");
      }
    }

    throw new Error("No image in response: " + JSON.stringify(json).slice(0, 500));
  } finally {
    clearTimeout(timeout);
  }
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
  const filePath = `${recipeId}.png`;

  console.log(`  Uploading ${(imageBuffer.length / 1024).toFixed(0)} KB to bucket "${bucket}" as "${filePath}"...`);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, imageBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);
  console.log(`  Upload OK: ${JSON.stringify(data)}`);

  const { data: urlData, error: urlErr } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  if (urlErr) throw new Error(`Supabase getPublicUrl failed: ${urlErr.message}`);

  return urlData.publicUrl;
}

// ── CLI args ─────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { force: false, dryRun: false, recipeId: null, concurrency: 1, delayMs: 2000 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--force") opts.force = true;
    else if (args[i] === "--dry-run") opts.dryRun = true;
    else if (args[i] === "--recipe" && args[i + 1]) opts.recipeId = args[++i];
    else if (args[i] === "--concurrency" && args[i + 1]) {
      const n = Number.parseInt(args[++i], 10);
      if (!Number.isFinite(n) || n < 1 || n > 5) {
        console.error("--concurrency must be an integer between 1 and 5");
        process.exit(1);
      }
      opts.concurrency = n;
    } else if (args[i] === "--delay-ms" && args[i + 1]) {
      const n = Number.parseInt(args[++i], 10);
      if (!Number.isFinite(n) || n < 0 || n > 60000) {
        console.error("--delay-ms must be an integer between 0 and 60000");
        process.exit(1);
      }
      opts.delayMs = n;
    }
  }
  return opts;
}

async function runPool(items, concurrency, worker) {
  const queue = items.slice();
  const runners = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      if (!item) return;
      await worker(item);
    }
  });
  await Promise.all(runners);
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

  console.log(
    `Generating images for ${targets.length} recipe(s) (concurrency=${opts.concurrency}, delayMs=${opts.delayMs})...\n`,
  );

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

  const startedAt = Date.now();
  let processed = 0;

  await runPool(targets, opts.concurrency, async (recipe) => {
    const userPrompt = buildUserPrompt(userTemplate, recipe);

    const n = ++processed;
    console.log(`[${n}/${targets.length}] [${recipe.id}] ${recipe.name}`);

    if (opts.dryRun) {
      console.log("  System prompt:", systemPrompt.slice(0, 80) + "...");
      console.log("  User prompt:", userPrompt.slice(0, 120) + "...");
      console.log("");
      return;
    }

    try {
      console.log("  Generating image...");
      const imageBuffer = await generateImage(systemPrompt, userPrompt);
      console.log(`  Got ${(imageBuffer.length / 1024).toFixed(0)} KB image`);

      console.log("  Uploading to Supabase...");
      const publicUrl = await uploadToSupabase(supabase, recipe.id, imageBuffer);
      console.log(`  Uploaded: ${publicUrl}`);

      recipe.image_url = publicUrl;
      console.log("  Updating recipes table...");
      const { error: dbErr } = await supabase
        .from("recipes")
        .update({ image_url: publicUrl, image_generated_at: new Date().toISOString() })
        .eq("id", recipe.id);
      if (dbErr) console.warn(`  DB update warning: ${dbErr.message}`);

      success++;
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      failed++;
    }

    if (opts.delayMs > 0) {
      await new Promise((r) => setTimeout(r, opts.delayMs));
    }

    const elapsedMin = ((Date.now() - startedAt) / 60000).toFixed(1);
    console.log(`  Progress: ${success} ok, ${failed} failed, ${n}/${targets.length} done (${elapsedMin}m)`);
    console.log("");
  });

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
