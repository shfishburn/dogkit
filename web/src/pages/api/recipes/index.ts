/**
 * GET /api/recipes
 *
 * Returns all recipes from Supabase, ordered by creation date.
 */

import type { APIRoute } from "astro";
import { supabaseAdminQuery } from "../../../lib/supabaseAdmin";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const limitRaw = url.searchParams.get("limit") ?? "50";
    const limitParsed = Number.parseInt(limitRaw, 10);
    const limit = Number.isFinite(limitParsed)
      ? String(Math.min(Math.max(limitParsed, 1), 200))
      : "50";

    const protein = url.searchParams.get("protein");
    const id = url.searchParams.get("id");

    const params: Record<string, string> = {
      select: "*",
      order: "created_at.desc",
      limit,
    };

    // Allow filtering by id in PostgREST format (e.g., id=eq.<uuid_or_text>)
    if (id) {
      params["id"] = id;
    }

    if (protein && protein !== "all") {
      params["protein_type"] = `eq.${protein}`;
    }

    const recipes = await supabaseAdminQuery("recipes", params);

    return new Response(JSON.stringify(recipes), {
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
