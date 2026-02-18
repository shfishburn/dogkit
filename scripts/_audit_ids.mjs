import { readFileSync } from "fs";
const recipes = JSON.parse(readFileSync("data/recipes/weekly_meal_plan.json","utf8"));
const ingDb = JSON.parse(readFileSync("data/ingredients/ingredients.json","utf8"));

const rawIds = new Set();
for (const r of recipes.recipes) for (const i of r.ingredients) rawIds.add(i.ingredient_id);

const dbIds = new Set(ingDb.ingredients.map(i => i.id));

const orphans = [...rawIds].filter(id => !dbIds.has(id)).sort();
const used = [...rawIds].filter(id => dbIds.has(id)).sort();
const unused = [...dbIds].filter(id => !rawIds.has(id)).sort();

console.log("Raw recipe ingredient_ids:", rawIds.size);
console.log("Canonical DB ingredient ids:", dbIds.size);
console.log("Direct matches:", used.length);
console.log("Orphan raw IDs (no canonical match):", orphans.length, orphans);
console.log("Unused canonical (no recipe uses):", unused.length);
