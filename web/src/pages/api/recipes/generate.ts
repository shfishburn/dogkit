/**
 * POST /api/recipes/generate
 *
 * Streams a canine recipe from OpenRouter (anthropic/claude-sonnet-4.6).
 * Proxies the SSE stream so the API key stays server-side.
 */

import type { APIRoute } from "astro";
import { streamChatCompletion } from "../../../lib/openrouter";
import { assemblePrompt } from "../../../lib/promptAssembly";
import { GenerateRecipeRequestSchema } from "../../../lib/schemas/apiRecipes";
import { RECIPE_MODEL } from "../../../lib/constants";

export const prerender = false;

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

  const parsed = GenerateRecipeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid request body", issues: parsed.error.issues }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const { system, user } = await assemblePrompt(parsed.data);

    const stream = await streamChatCompletion(apiKey, {
      model: RECIPE_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
      max_tokens: 16384,
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
