# dogkit-scripts

Repo pipeline scripts packaged as an NPM package (for internal use).

## Commands

- `dogkit-generate-ingredients-db`
  - Reads the ingredient database markdown and writes `data/ingredients/ingredients.json`.
- `dogkit-load-recipes`
  - Upserts recipes + meal plan into Supabase.
- `dogkit-generate-recipe-images`
  - Generates recipe hero images via OpenRouter and uploads to Supabase Storage.

## Usage (in this repo)

From repo root:

- `node scripts/generate_ingredients_db.mjs`
- `node scripts/load_recipes_to_supabase.mjs`
- `node scripts/generate_recipe_images.mjs --dry-run`

## Publishing

This folder is structured like an NPM package. If you later want to publish it, set `private:false`, add a real `license`, and publish from `scripts/`.
