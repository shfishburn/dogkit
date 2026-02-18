/**
 * Lightweight Supabase REST client for build-time data fetching.
 * Uses the PostgREST API directly via fetch() — no npm dependency.
 *
 * Env vars (from ../.env.local via Astro's envDir):
 *   SUPABASE_URL, SUPABASE_ANON_KEY
 */

const SUPABASE_URL = import.meta.env.SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("[supabase] SUPABASE_URL or SUPABASE_ANON_KEY not set — Supabase queries will fail.");
}

const BASE = `${SUPABASE_URL}/rest/v1`;

const HEADERS: Record<string, string> = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  Accept: "application/json",
};

/**
 * Query a Supabase table via PostgREST.
 * @param table  Table name
 * @param params PostgREST query params (select, order, limit, filters…)
 */
export async function supabaseQuery<T = unknown>(
  table: string,
  params: Record<string, string> = {},
): Promise<T[]> {
  const url = new URL(`${BASE}/${table}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { headers: HEADERS });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase ${table}: HTTP ${res.status} — ${body}`);
  }

  return res.json() as Promise<T[]>;
}
