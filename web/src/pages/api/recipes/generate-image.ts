/**
 * POST /api/recipes/generate-image
 *
 * Generates a recipe hero image via OpenRouter (google/gemini-3-pro-image-preview)
 * and uploads it to Supabase Storage. Updates the recipe row with the image URL.
 *
 * This is designed to be called async — it doesn't block the recipe display.
 */

import type { APIRoute } from "astro";
import { chatCompletionRaw } from "../../../lib/openrouter";
import { supabaseUpdate, supabaseUploadFile } from "../../../lib/supabaseAdmin";
import { GenerateImageRequestSchema } from "../../../lib/schemas/apiRecipes";
import { IMAGE_MODEL } from "../../../lib/constants";
import imageSystemPrompt from "../../../lib/assets/prompts/canine_recipe_image_system_v1.txt?raw";
import imageUserTemplate from "../../../lib/assets/prompts/canine_recipe_image_user_v1.txt?raw";

export const prerender = false;

function loadImagePrompts(): { system: string; userTemplate: string } {
  return { system: imageSystemPrompt, userTemplate: imageUserTemplate };
}

type ExtractedImage =
  | { kind: "inline"; mimeType: string; base64: string }
  | { kind: "url"; url: string };

function findFirstImage(value: unknown): ExtractedImage | null {
  if (typeof value === "string") {
    const base64Match = value.match(
      /data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)/,
    );
    if (base64Match) {
      const format = base64Match[1];
      const base64 = base64Match[2];
      const mimeType = format === "jpeg" ? "image/jpeg" : `image/${format}`;
      return { kind: "inline", mimeType, base64 };
    }

    const urlMatch = value.match(/https?:\/\/[^\s"']+\.(png|jpg|jpeg|webp)/i);
    if (urlMatch) return { kind: "url", url: urlMatch[0] };
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findFirstImage(item);
      if (found) return found;
    }
    return null;
  }

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;

    // Gemini-style inline_data
    const inline = obj.inline_data;
    if (inline && typeof inline === "object") {
      const i = inline as Record<string, unknown>;
      const mimeType = typeof i.mime_type === "string" ? i.mime_type : null;
      const data = typeof i.data === "string" ? i.data : null;
      if (mimeType && data) return { kind: "inline", mimeType, base64: data };
    }

    // OpenAI/OpenRouter-style part: { type: 'image_url', image_url: { url: ... } }
    if (obj.type === "image_url" && obj.image_url && typeof obj.image_url === "object") {
      const url = (obj.image_url as Record<string, unknown>).url;
      if (typeof url === "string") {
        const found = findFirstImage(url);
        if (found) return found;
      }
    }

    // Traverse child fields
    for (const v of Object.values(obj)) {
      const found = findFirstImage(v);
      if (found) return found;
    }
  }

  return null;
}

function extFromMime(mimeType: string): { ext: string; contentType: string } {
  const normalized = mimeType.toLowerCase();
  if (normalized === "image/jpeg" || normalized === "image/jpg") {
    return { ext: "jpg", contentType: "image/jpeg" };
  }
  if (normalized === "image/png") return { ext: "png", contentType: "image/png" };
  if (normalized === "image/webp") return { ext: "webp", contentType: "image/webp" };
  return { ext: "png", contentType: "image/png" };
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OpenRouter API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = GenerateImageRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid request body", issues: parsed.error.issues }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const { system, userTemplate } = loadImagePrompts();

    const body = parsed.data;

    const ingredientNames = body.ingredient_names;
    const ingredientList = ingredientNames
      .map((n) => `- ${n}`)
      .join("\n");

    const userPrompt = userTemplate
      .replaceAll("{{name}}", body.name)
      .replaceAll("{{protein}}", body.protein)
      .replaceAll("{{carb}}", body.carb)
      .replaceAll("{{veggie}}", body.veggie)
      .replaceAll("{{cook_method}}", body.cook_method)
      .replaceAll("{{ingredient_list}}", ingredientList);

    // Generate image via OpenRouter (raw JSON so we can parse structured outputs)
    const completion = await chatCompletionRaw(apiKey, {
      model: IMAGE_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    });

    // Extract first image from structured parts (Gemini inline_data, image_url parts, etc)
    const image = findFirstImage(completion);
    let imageUrl: string | null = null;

    if (image?.kind === "inline") {
      const { ext, contentType } = extFromMime(image.mimeType);
      const buffer = Buffer.from(image.base64, "base64");
      const blob = new Blob([buffer], { type: contentType });
      imageUrl = await supabaseUploadFile(
        "recipe-images",
        `${body.recipe_id}.${ext}`,
        blob,
        contentType,
      );
    } else if (image?.kind === "url") {
      const imgRes = await fetch(image.url);
      if (imgRes.ok) {
        const blob = await imgRes.blob();
        const contentType = blob.type || imgRes.headers.get("content-type") || "image/png";
        const { ext, contentType: normalizedType } = extFromMime(contentType);
        imageUrl = await supabaseUploadFile(
          "recipe-images",
          `${body.recipe_id}.${ext}`,
          blob,
          normalizedType,
        );
      }
    }

    if (imageUrl) {
      // Update the recipe row
      await supabaseUpdate("recipes", body.recipe_id, {
        image_url: imageUrl,
        image_generated_at: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ ok: true, image_url: imageUrl }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        ok: false,
        error: "Could not extract image from model response",
        raw_response: JSON.stringify(completion).slice(0, 500),
      }),
      { status: 422, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
