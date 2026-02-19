/**
 * Server-side Supabase client using service role key.
 * Used by API endpoints for writes (insert/update/delete).
 */

const SUPABASE_URL = import.meta.env.SUPABASE_URL as string;
const SERVICE_KEY = import.meta.env.SUPABASE_SERVICE_KEY as string;

function getBase(): string {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Supabase admin env not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY)");
  }
  return `${SUPABASE_URL}/rest/v1`;
}

function getHeaders(): Record<string, string> {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Supabase admin env not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY)");
  }
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

/**
 * Insert a row into a Supabase table.
 */
export async function supabaseInsert<T = unknown>(
  table: string,
  data: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${getBase()}/${table}`, {
    method: "POST",
    headers: { ...getHeaders(), Prefer: "return=representation" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase INSERT ${table}: ${res.status} — ${body}`);
  }

  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

/**
 * Upsert a row into a Supabase table (on conflict update).
 */
export async function supabaseUpsert<T = unknown>(
  table: string,
  data: Record<string, unknown>,
  onConflict = "id",
): Promise<T> {
  const res = await fetch(`${getBase()}/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      Prefer: `return=representation,resolution=merge-duplicates`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase UPSERT ${table}: ${res.status} — ${body}`);
  }

  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

/**
 * Update a row by primary key.
 */
export async function supabaseUpdate<T = unknown>(
  table: string,
  id: string,
  data: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${getBase()}/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase UPDATE ${table}: ${res.status} — ${body}`);
  }

  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

/**
 * Query (read) from a Supabase table using service role (can read all rows).
 */
export async function supabaseAdminQuery<T = unknown>(
  table: string,
  params: Record<string, string> = {},
): Promise<T[]> {
  const url = new URL(`${getBase()}/${table}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { headers: getHeaders() });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase QUERY ${table}: ${res.status} — ${body}`);
  }

  return res.json() as Promise<T[]>;
}

/**
 * Upload a file to Supabase Storage.
 */
export async function supabaseUploadFile(
  bucket: string,
  path: string,
  data: Blob,
  contentType: string,
): Promise<string> {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Supabase admin env not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY)");
  }
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
    {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: data,
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Storage upload ${bucket}/${path}: ${res.status} — ${body}`);
  }

  // Return public URL
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
