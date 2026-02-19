#!/usr/bin/env python3
"""Export existing recipes as CSV 'user prompts' for re-generation.

Each row captures the recipe identity and enough metadata to reconstruct
a user prompt for the CFPO v2 canine recipe generation pipeline.

Usage:
    python scripts/export_recipe_prompts.py
"""

import csv
import json
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
OUT = DATA / "recipes" / "recipe_prompts_export.csv"

def main():
    with open(DATA / "recipes" / "weekly_meal_plan.json") as f:
        plan = json.load(f)

    recipes = plan["recipes"]

    rows = []
    for r in recipes:
        tags = r.get("tags", {})
        protein = tags.get("protein_type", "")
        carb = tags.get("primary_carb", "")
        veggie = tags.get("primary_veggie", "")
        method = tags.get("cook_method", "stovetop")
        tier = tags.get("tier", "T1")
        prep_min = tags.get("prep_time_min", 30)
        life_stage = tags.get("target_life_stage", "adult")

        # Build a natural-language user request that would regenerate this recipe
        ingredients_summary = ", ".join(
            ing["name"] for ing in r.get("ingredients", [])
            if ing.get("ingredient_id", "").startswith(("muscle_meat_", "organ_meat_", "fish_seafood_"))
        )
        carb_name = next(
            (ing["name"] for ing in r.get("ingredients", [])
             if ing.get("ingredient_id", "").startswith("starchy_carbohydrates_")),
            carb.replace("_", " ")
        )
        veg_name = next(
            (ing["name"] for ing in r.get("ingredients", [])
             if ing.get("ingredient_id", "").startswith("non_starchy_vegetables_")),
            veggie.replace("_", " ")
        )

        user_prompt = (
            f"Create a {tier} {method} recipe using {ingredients_summary} "
            f"with {carb_name} and {veg_name}. "
            f"Target life stage: {life_stage}. Prep under {prep_min} minutes."
        )

        rows.append({
            "id": r["id"],
            "name": r["name"],
            "protein_type": protein,
            "primary_carb": carb,
            "primary_veggie": veggie,
            "cook_method": method,
            "tier": tier,
            "prep_time_min": prep_min,
            "target_life_stage": life_stage,
            "user_prompt": user_prompt,
            "overview": r.get("overview", ""),
            "ingredient_count": len(r.get("ingredients", [])),
            "instruction_count": len(r.get("instructions", [])),
            "image_url": r.get("image_url", ""),
        })

    with open(OUT, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print(f"Exported {len(rows)} recipe prompts → {OUT}")


if __name__ == "__main__":
    main()
