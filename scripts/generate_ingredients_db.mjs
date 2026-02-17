#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const SOURCE_MD = path.join(REPO_ROOT, 'specs', 'ingredients', 'Canine Ingredient Database.md');
const DEST_JSON = path.join(REPO_ROOT, 'specs', 'ingredients', 'ingredients.json');

const AVAILABILITY_TIERS = {
  T1: 'any_grocery',
  T2: 'well_stocked_grocery_or_club',
  T3: 'pet_specialty_or_online',
};

const DIMENSIONS = {
  P: 'protein',
  F: 'fat',
  Ca: 'calcium',
  Ph: 'phosphorus',
  CaPh: 'calcium_phosphorus_ratio',
  Zn: 'zinc',
  Fe: 'iron',
  Cu: 'copper',
  Se: 'selenium',
  I: 'iodine',
  VA: 'vitamin_A',
  VD: 'vitamin_D',
  VE: 'vitamin_E',
  VK: 'vitamin_K',
  B: 'b_vitamins',
  Ch: 'choline',
  O3: 'omega_3_epa_dha',
  O6: 'omega_6_linoleic',
  Fib: 'fiber',
  Mn: 'manganese',
  K: 'potassium',
  Mg: 'magnesium',
  Na: 'sodium',
};

const SECTION_TO_CATEGORY = [
  { match: /^##\s+1\./, category: 'muscle_meat' },
  { match: /^##\s+2\./, category: 'organ_meat' },
  { match: /^##\s+3\./, category: 'fish_seafood' },
  { match: /^##\s+4\./, category: 'eggs_dairy' },
  { match: /^##\s+5\./, category: 'starchy_carbohydrates' },
  { match: /^##\s+6\./, category: 'non_starchy_vegetables' },
  { match: /^##\s+7\./, category: 'fats_oils' },
  { match: /^##\s+8\./, category: 'calcium_sources' },
  { match: /^###\s+9A\b/i, category: 'premix' },
  { match: /^###\s+9B\b/i, category: 'supplements' },
];

const CATEGORY_PRIORITY = {
  calcium_sources: 100,
  premix: 90,
  supplements: 80,
  fats_oils: 70,
  fish_seafood: 60,
  organ_meat: 50,
  muscle_meat: 40,
  eggs_dairy: 30,
  starchy_carbohydrates: 20,
  non_starchy_vegetables: 10,
  uncategorized: 0,
};

function slugToId(s) {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[%’'"“”]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

function inferDefaultUnit(headerLine) {
  const h = headerLine.toLowerCase();
  if (h.includes('per 100g') && h.includes('cooked')) return 'g_cooked';
  if (h.includes('per 100g') && h.includes('raw')) return 'g_raw';
  if (h.includes('per 100g')) return 'g';
  if (h.includes('per 15ml') || h.includes('tbsp') || h.includes('tsp')) return 'tbsp';
  return undefined;
}

function parseMarkdownTable(lines, startIndex) {
  const header = lines[startIndex];
  const separator = lines[startIndex + 1] ?? '';
  if (!header.startsWith('|') || !separator.includes('---')) return null;

  const headers = header
    .split('|')
    .slice(1, -1)
    .map((s) => s.trim());

  const tierIndex = headers.findIndex((h) => h.toLowerCase() === 'tier');
  const dimsIndex = headers.findIndex((h) => h.toLowerCase().includes('dimensions'));
  const nameIndex = 0;
  const notesIndex = headers.findIndex((h) =>
    /key nutrients|what it provides|calcium content/i.test(h)
  );

  if (tierIndex < 0 || dimsIndex < 0 || notesIndex < 0) return null;

  const rows = [];
  let i = startIndex + 2;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.startsWith('|')) break;

    const cols = line
      .split('|')
      .slice(1, -1)
      .map((s) => s.trim());

    if (cols.length >= headers.length) {
      rows.push({
        name: cols[nameIndex],
        tier: cols[tierIndex],
        notes: cols[notesIndex],
        dimsRaw: cols[dimsIndex],
      });
    }

    i += 1;
  }

  return { headerLine: header, rows, nextIndex: i };
}

function extractDimensionCodes(dimsRaw) {
  const out = {};
  const re = /\[([A-Za-z0-9]+)\]/g;
  let m;
  while ((m = re.exec(dimsRaw)) !== null) {
    out[m[1]] = 'primary';
  }
  return out;
}

function normalizeName(name) {
  return name.trim().toLowerCase();
}

function betterCategory(existing, next) {
  const a = CATEGORY_PRIORITY[existing] ?? 0;
  const b = CATEGORY_PRIORITY[next] ?? 0;
  return b > a;
}

function parseFdcIdTable(mdLines) {
  const map = new Map();
  const start = mdLines.findIndex((l) => l.trim() === '## 12. USDA FDC Integration Notes');
  if (start < 0) return map;

  // Find the table header within this section
  for (let i = start; i < mdLines.length; i++) {
    if (mdLines[i].startsWith('| Ingredient | FDC ID |')) {
      const table = parseMarkdownTable(mdLines, i);
      if (!table) return map;
      for (const row of table.rows) {
        const maybeId = Number(String(row.notes).replace(/[^0-9]/g, ''));
        if (Number.isFinite(maybeId) && maybeId > 0) {
          map.set(row.name, maybeId);
        }
      }
      return map;
    }
  }

  return map;
}

function attachFdcIds(ingredients, fdcMap) {
  const entries = Array.from(fdcMap.entries()).map(([name, id]) => ({
    nameNorm: normalizeName(name.replace(/\s*\(.*\)\s*/g, '')),
    id,
  }));

  for (const ing of ingredients) {
    const ingNorm = normalizeName(ing.name);
    const match = entries.find((e) => ingNorm.startsWith(e.nameNorm) || ingNorm.includes(e.nameNorm));
    if (match) ing.usda_fdc_id = match.id;
  }
}

async function main() {
  const md = await fs.readFile(SOURCE_MD, 'utf-8');
  const lines = md.split(/\r?\n/);

  const fdcMap = parseFdcIdTable(lines);

  let currentCategory = 'uncategorized';
  const byName = new Map();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const rule of SECTION_TO_CATEGORY) {
      if (rule.match.test(line)) {
        currentCategory = rule.category;
        break;
      }
    }

    const table = parseMarkdownTable(lines, i);
    if (!table) continue;

    const defaultUnit = inferDefaultUnit(table.headerLine);

    for (const row of table.rows) {
      if (!row.name) continue;

      const dims = extractDimensionCodes(row.dimsRaw ?? '');
      const normalized = normalizeName(row.name);

      const existing = byName.get(normalized);
      const nextCategory = currentCategory;

      const entry = {
        id: `${nextCategory}_${slugToId(row.name)}`,
        name: row.name,
        category: nextCategory,
        tier: row.tier,
        default_unit: defaultUnit,
        notes: row.notes,
        dimensions: dims,
      };

      if (!existing) {
        byName.set(normalized, entry);
        continue;
      }

      if (betterCategory(existing.category, nextCategory)) {
        byName.set(normalized, entry);
      }
    }

    i = table.nextIndex - 1;
  }

  const ingredients = Array.from(byName.values());
  attachFdcIds(ingredients, fdcMap);

  ingredients.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });

  const out = {
    metadata: {
      version: '1.0',
      currency: 'USD',
      availability_tiers: AVAILABILITY_TIERS,
      dimensions: DIMENSIONS,
      generatedFrom: 'specs/ingredients/Canine Ingredient Database.md',
    },
    ingredients,
  };

  await fs.writeFile(DEST_JSON, JSON.stringify(out, null, 2) + '\n', 'utf-8');
  process.stdout.write(`Wrote ${ingredients.length} ingredient(s) to ${path.relative(REPO_ROOT, DEST_JSON)}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
