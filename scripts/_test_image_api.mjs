#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Load env
const envRaw = await readFile(path.join(ROOT, ".env.local"), "utf-8");
for (const line of envRaw.split("\n")) {
  const eq = line.indexOf("=");
  if (eq > 0 && !line.startsWith("#")) {
    const k = line.slice(0, eq).trim();
    const v = line.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://dogkit.vercel.app",
  },
  body: JSON.stringify({
    model: "openai/gpt-5-image",
    stream: false,
    messages: [{ role: "user", content: "Draw a small red circle on a white background" }],
  }),
});

const json = await res.json();

// Summarize without dumping huge base64
function summarize(obj, depth = 0) {
  if (depth > 6) return "...";
  if (Array.isArray(obj)) return obj.map((x) => summarize(x, depth + 1));
  if (typeof obj === "object" && obj !== null) {
    const r = {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string" && v.length > 300) {
        r[k] = `<${v.length} chars> ${v.slice(0, 120)}...`;
      } else {
        r[k] = summarize(v, depth + 1);
      }
    }
    return r;
  }
  return obj;
}

console.log(JSON.stringify(summarize(json), null, 2));
