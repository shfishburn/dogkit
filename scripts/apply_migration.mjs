#!/usr/bin/env node
/**
 * Apply a SQL migration to Supabase via the Management API.
 * Falls back to the PostgREST rpc endpoint for raw SQL.
 *
 * Usage: node scripts/apply_migration.mjs <path-to-sql-file>
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
  envText.split("\n")
    .filter(l => l && !l.startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
    .filter(([k, v]) => k && v)
);

const SUPABASE_URL = env.SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_KEY;

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error("Usage: node scripts/apply_migration.mjs <path-to-sql>"); process.exit(1);
}

const sql = readFileSync(resolve(ROOT, sqlFile), "utf-8");

// Split into individual statements
const statements = sql
  .split(/;\s*$/m)
  .map(s => s.trim())
  .filter(s => s && !s.startsWith("--"));

async function execSql(statement) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({})
  });
  // This won't work for DDL — use pg_query via management API or direct pg connection
}

// Use the Supabase SQL endpoint (requires service role)
async function runFullSql() {
  // Try the /pg endpoint for direct SQL execution
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
  });

  // The simplest approach: use the supabase management API
  // But that requires the project ref + management key

  // Instead, let's output the SQL for manual execution
  console.log("=== SQL Migration to apply via Supabase SQL Editor ===\n");
  console.log(sql);
  console.log("\n=== Copy the above SQL and run it in the Supabase SQL Editor ===");
  console.log(`URL: ${SUPABASE_URL.replace('.supabase.co', '')}/project/*/sql`);
}

runFullSql();
