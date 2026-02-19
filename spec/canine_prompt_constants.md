# Canine Recipe Prompt — Constants & Enums

> Enumerates every domain-specific constant the canine recipe generation prompt
> needs. This is the **dog counterpart** to the human `recipe_generation_v9`
> prompt constants (dietary_info, culinary_role, instruction_categories, etc.).
>
> **Format**: Each section names the constant, lists its values, and cites the
> source file or specification.

---

## 1. Life Stage

```yaml
life_stage:
  enum:
    - puppy_early
    - puppy_late
    - adult
    - senior
  rules:
    puppy_early: "< 4 months (all breed sizes)"
    puppy_late:  "4–10 mo (toy/small) | 4–12 mo (medium) | 4–15 mo (large) | 4–18 mo (giant)"
    adult:       "maturity onset through breed-size-adjusted cutoff"
    senior:      "≥ 12 yr (toy/small) | ≥ 10 yr (medium) | ≥ 8 yr (large) | ≥ 6 yr (giant)"
  source: "packages/app/canine_meal_plan_pipeline_spec_v1.md — Stage 2"
```

---

## 2. Breed / Size Class

```yaml
breed_size_class:
  enum:
    - toy
    - small
    - medium
    - large
    - giant
    - mixed_unknown
  source: "Pipeline spec — Stage 1"
```

---

## 3. Activity Level

```yaml
activity_level:
  enum:
    - sedentary     # < 30 min exercise/day, mostly indoor
    - moderate      # 30–60 min walks/play per day
    - active        # 1–3 hr vigorous exercise per day
    - working       # 3+ hr sustained physical work
  source: "Pipeline spec — Stage 1, Stage 4b"
```

---

## 4. Neuter Status

```yaml
neuter_status:
  enum:
    - intact
    - neutered
  source: "Pipeline spec — Stage 1"
```

---

## 5. Reproductive Status

```yaml
reproductive_status:
  enum:
    - none
    - pregnant_early
    - pregnant_late
    - lactating
  source: "Pipeline spec — Stage 1 (optional input)"
```

---

## 6. Body Condition Score (BCS)

```yaml
body_condition_score:
  type: integer
  range: 1–9
  scale: "Laflamme 9-point scale"
  interpretation:
    1–2:   "Emaciated — flag vet referral, do NOT generate plan"
    3:     "Underweight"
    4–5:   "Ideal"
    6–7:   "Overweight"
    8–9:   "Obese — flag vet referral + generate plan targeting IBW"
  source: "Pipeline spec — Stage 3"
```

---

## 7. Weight Goal

```yaml
weight_goal:
  enum:
    - maintain   # BCS 4–5
    - lose       # BCS 6–9
    - gain       # BCS 1–3
  factors:
    overweight_bcs_6_7:  0.90   # 10% deficit
    obese_bcs_8_9:       0.80   # 20% deficit
    underweight_bcs_1_3: 1.10   # 10% surplus
    ideal_bcs_4_5:       1.00
  source: "Pipeline spec — Stage 4b"
```

---

## 8. Known Allergies (User Input)

```yaml
known_allergies:
  enum:
    - beef
    - chicken
    - dairy
    - wheat
    - egg
    - lamb
    - soy
    - pork
    - fish
    - corn
  note: "Multi-select. Triggers soft-block on all derived ingredients."
  source: "Pipeline spec — Stage 1, Stage 7"
```

---

## 9. Health Conditions (User Input)

```yaml
health_conditions:
  enum:
    - none
    - kidney_disease      # restrict protein to 40 g/1000 kcal + vet referral
    - diabetes
    - pancreatitis        # restrict fat
    - joint_issues        # increase EPA+DHA
  source: "Pipeline spec — Stage 1"
```

---

## 10. Ingredient Categories

```yaml
ingredient_categories:
  enum:
    - calcium_sources
    - eggs_dairy
    - fats_oils
    - fish_seafood
    - muscle_meat
    - non_starchy_vegetables
    - organ_meat
    - starchy_carbohydrates
    - supplements
  id_convention: "{category}_{specific_name}"
  examples:
    - muscle_meat_ground_beef_90_lean
    - organ_meat_beef_liver
    - starchy_carbohydrates_sweet_potato
    - fats_oils_fish_oil
    - calcium_sources_eggshell_powder
    - supplements_vitamin_e
  source: "data/ingredients/ingredients.json"
```

### Human comparison

| Human (recipe_generation_v9)           | Dog                              |
|----------------------------------------|----------------------------------|
| Dairy & Eggs                           | eggs_dairy                       |
| Meat, Poultry & Fish                   | muscle_meat + organ_meat + fish_seafood |
| Grains & Bakery                        | starchy_carbohydrates            |
| Fruits & Vegetables                    | non_starchy_vegetables           |
| Fats & Oils                            | fats_oils                        |
| Condiments & Sauces                    | *(not applicable — dogs)*        |
| Herbs, Spices & Seasonings             | *(not applicable — dogs)*        |
| Snacks & Sweets                        | *(not applicable — dogs)*        |
| Prepared & Processed Foods             | *(not applicable — dogs)*        |
| Beverages                              | *(not applicable — dogs)*        |
| Other/Unknown                          | *(not used)*                     |
| *(n/a)*                                | calcium_sources                  |
| *(n/a)*                                | supplements                      |

---

## 11. Availability Tiers

```yaml
availability_tiers:
  T1: "any_grocery"
  T2: "well_stocked_grocery_or_club"
  T3: "pet_specialty_or_online"
  source: "data/ingredients/ingredients.json"
```

---

## 12. Recipe Tier Classification

```yaml
recipe_tier:
  enum:
    - T1   # Common proteins — chicken, beef, turkey, pork, common fish
    - T2   # Novel/specialty — bison, venison, rabbit, lamb, duck
  source: "data/recipes/weekly_meal_plan.json"
```

---

## 13. Protein Types

```yaml
protein_type:
  enum:
    - beef
    - bison
    - chicken
    - fish
    - lamb
    - pork
    - rabbit
    - turkey
    - venison
  source: "data/recipes/weekly_meal_plan.json (34 recipes)"
```

---

## 14. Primary Carbohydrates

```yaml
primary_carb:
  enum:
    - barley
    - brown_rice
    - lentils
    - oatmeal
    - pumpkin
    - quinoa
    - sweet_potato
    - white_potato
    - white_rice
  source: "data/recipes/weekly_meal_plan.json"
```

---

## 15. Primary Vegetables

```yaml
primary_veggie:
  enum:
    - bok_choy
    - broccoli
    - brussels_sprouts
    - carrots
    - carrots_and_broccoli
    - carrots_and_peas
    - green_beans
    - kale
    - peas
    - spinach
    - zucchini
    - zucchini_and_peas
  source: "data/recipes/weekly_meal_plan.json"
```

---

## 16. Cook Method

```yaml
cook_method:
  enum:
    - stovetop
    - oven
    - slow_cooker
    - instant_pot
  note: "Currently all 34 recipes use 'stovetop'. Other methods are defined in the schema for future use."
  source: "data/recipes/weekly_meal_plan.json + spec/canine_recipe_generation_v1.json"
```

---

## 17. Ingredient Units

```yaml
ingredient_units:
  enum:
    - g     # grams (weight)
    - ml    # milliliters (volume, for oils)
    - IU    # international units (for vitamin E)
  rule: "ALWAYS weight (g) or volume (ml) — NEVER count units, cups, or tablespoons"
  source: "data/recipes/weekly_meal_plan.json"
```

---

## 18. Nutrient Dimension Codes

```yaml
nutrient_dimensions:
  B:    b_vitamins
  Ca:   calcium
  CaPh: calcium_phosphorus_ratio
  Ch:   choline
  Cu:   copper
  F:    fat
  Fe:   iron
  Fib:  fiber
  I:    iodine
  K:    potassium
  Mg:   magnesium
  Mn:   manganese
  Na:   sodium
  O3:   omega_3_epa_dha
  O6:   omega_6_linoleic
  P:    protein
  Ph:   phosphorus
  Se:   selenium
  VA:   vitamin_A
  VD:   vitamin_D
  VE:   vitamin_E
  VK:   vitamin_K
  Zn:   zinc
  count: 23
  source: "data/ingredients/ingredients.json metadata.dimensions"
```

---

## 19. Macronutrient Targets (per 1000 kcal ME)

```yaml
macro_targets:
  protein_g:
    puppy_early: "≥ 62.5"
    puppy_late:  "≥ 50.0"
    adult:       "≥ 45.0"
    senior:      "≥ 62.5"
    kidney_disease: "≤ 40.0 + vet referral"
  fat_g:
    puppy_early: "≥ 21.3"
    puppy_late:  "≥ 21.3"
    adult:       "≥ 13.8"
    senior:      "≥ 13.8"
  fiber_g:
    adult:  "10–20"
    senior: "10–20"
  carbs: "not required (dogs have no carbohydrate requirement)"
  source: "Pipeline spec — Stage 5; NRC 2006"
```

---

## 20. Micronutrient Targets (per 1000 kcal ME, NRC 2006 RA)

```yaml
micro_targets:
  calcium_g:       { adult: 1.00,  puppy: 2.50,  max: 4.50 }
  phosphorus_g:    { adult: 0.75,  puppy: 2.25,  max: 3.50 }
  ca_p_ratio:      { adult: "1:1–2:1", puppy: "1:1–1.6:1" }
  sodium_g:        { adult: 0.20,  puppy: 0.55,  max: 3.75 }
  potassium_g:     { adult: 1.00,  puppy: 1.10 }
  iron_mg:         { adult: 7.50,  puppy: 22.0 }
  zinc_mg:         { adult: 15.0,  puppy: 25.0 }
  copper_mg:       { adult: 1.50,  puppy: 2.75 }
  manganese_mg:    { adult: 1.20,  puppy: 1.40 }
  selenium_mcg:    { adult: 87.5,  puppy: 87.5 }
  iodine_mcg:      { adult: 220,   puppy: 220,   max: 2750 }
  vitamin_a_RE:    { adult: 379,   puppy: 379,   max: 16000 }
  vitamin_d_mcg:   { adult: 3.40,  puppy: 3.40,  max: 20.0 }
  vitamin_e_mg:    { adult: 7.50,  puppy: 7.50,  senior: 12.0 }
  thiamin_mg:      { adult: 0.56,  puppy: 0.56 }
  riboflavin_mg:   { adult: 1.30,  puppy: 1.30 }
  niacin_mg:       { adult: 4.25,  puppy: 4.25 }
  pyridoxine_mg:   { adult: 0.375, puppy: 0.375 }
  folic_acid_mg:   { adult: 0.068, puppy: 0.068 }
  b12_mcg:         { adult: 8.75,  puppy: 8.75 }
  choline_mg:      { adult: 425,   puppy: 425 }
  epa_dha_g:       { senior: "1.0–3.0" }
  source: "Pipeline spec — Stage 6; NRC 2006 RA"
```

### Large/giant breed puppy overrides

```yaml
large_giant_puppy_overrides:
  calcium_g:  "CAP at 2.5 (do NOT exceed)"
  ca_p_ratio: "strictly 1:1–1.5:1"
  source: "Mack et al. 2019"
```

---

## 21. Forbidden Ingredients — HARD BLOCK

```yaml
forbidden_hard_block:
  - onion
  - garlic
  - chives
  - leeks
  - grapes
  - raisins
  - currants
  - chocolate
  - cocoa
  - caffeine
  - xylitol
  - erythritol
  - macadamia_nuts
  - alcohol
  - avocado_skin_pit_leaves
  - cooked_bones
  note: "These NEVER appear in any recipe, any quantity."
  source: "Pipeline spec — Stage 7"
```

---

## 22. Warning-Tier Ingredients

```yaml
warning_tier:
  - raw_eggs          # Salmonella risk
  - raw_fish          # Thiaminase in some species
  - liver_high_qty    # Cap at ≤ 5% of total recipe weight (vitamin A toxicity)
  source: "Pipeline spec — Stage 7"
```

---

## 23. Recipe Structure Composition Rules

```yaml
recipe_composition:
  muscle_meat:
    weight_pct: "40–60%"
    role: "Primary protein source"
  organ_meat:
    weight_pct: "≤ 5%"
    role: "Vitamin A, copper, B-vitamins, choline"
  starchy_carbohydrate:
    weight_pct: "20–30%"
    role: "Energy source, fiber"
  non_starchy_vegetable:
    weight_pct: "10–20%"
    role: "Micronutrient density"
  fat_source:
    note: "Fish oil for omega-3 EPA+DHA (skip if protein is oily fish)"
  calcium_source:
    note: "Eggshell powder ~3 g/1000 kcal, or bone-in canned fish"
  vitamin_e:
    note: "Always paired with fish oil; 1 IU per lb body weight"
  constraint: "No single ingredient > 50% of recipe by weight"
  source: "Pipeline spec — Stage 8 + canine_recipe_generation_v1"
```

---

## 24. MER Calculation Factors

```yaml
mer_factors:
  formula: "MER = RER × life_stage × neuter × activity × weight_goal"
  rer: "70 × IBW^0.75 (kcal/day)"

  life_stage_factor:
    puppy_early:    3.0
    puppy_late:     2.0
    adult:          1.6
    senior:         1.4
    pregnant_early: 1.6
    pregnant_late:  2.0
    lactating:      "3.0–6.0 (scales with litter size)"

  neuter_factor:
    intact:   1.0
    neutered: 0.90

  activity_factor:
    sedentary: 0.85
    moderate:  1.00
    active:    1.15
    working:   1.50

  weight_goal_factor:
    bcs_6_7: 0.90
    bcs_8_9: 0.80
    bcs_1_3: 1.10
    bcs_4_5: 1.00

  source: "Pipeline spec — Stage 4b; NRC 2006"
```

---

## 25. Size Scaling Reference

```yaml
size_scaling:
  small:
    weight_kg: 10
    approx_mer_kcal: 570
    factor: 0.57
  medium:
    weight_kg: 20
    approx_mer_kcal: 950
    factor: 0.95
  large:
    weight_kg: 35
    approx_mer_kcal: 1450
    factor: 1.45
  note: "All base_g amounts are per 1000 kcal. Multiply by factor for daily totals."
  source: "data/recipes/weekly_meal_plan.json metadata.size_scaling"
```

---

## 26. per_1000kcal_estimate Fields

```yaml
per_1000kcal_estimate:
  fields:
    - protein_g
    - fat_g
    - fiber_g
    - calcium_mg
    - phosphorus_mg
    - ca_p_ratio        # STRING, e.g. "1.3:1"
  source: "data/recipes/weekly_meal_plan.json"
```

---

## 27. Disclaimers (Required on Every Output)

```yaml
disclaimers:
  always_display:
    - "This recipe is formulated to meet NRC 2006 Recommended Allowances for the specified life stage."
    - "It is not a substitute for veterinary nutritional consultation."
    - "Have a board-certified veterinary nutritionist review before long-term feeding."
  do_not_claim:
    - "vet approved"
    - "complete and balanced"   # AAFCO regulatory term — requires feeding trials
  do_claim:
    - "Formulated to meet NRC 2006 Recommended Allowances for [life_stage]"
    - "Nutrient targets based on peer-reviewed veterinary nutrition research"
  auto_vet_referral_triggers:
    - "BCS ≤ 2 or BCS ≥ 8"
    - "health_conditions != none"
    - "age_months < 4"
    - "reproductive_status == lactating"
    - "Copper storage breeds (Bedlington Terrier, Doberman, WHWT)"
  source: "Pipeline spec — Stage 9"
```

---

## 28. Canine "Dietary Info" Equivalent

The human prompt uses a 21-field boolean `dietary_info` object (vegetarian, vegan, keto, etc.).
These are **human dietary preferences** and do not apply to dogs.

The canine equivalent is:

```yaml
canine_suitability_info:
  life_stage_suitable:
    puppy:  "BOOLEAN"
    adult:  "BOOLEAN"
    senior: "BOOLEAN"
  allergen_free:
    beef_free:    "BOOLEAN"
    chicken_free: "BOOLEAN"
    dairy_free:   "BOOLEAN"
    wheat_free:   "BOOLEAN"
    egg_free:     "BOOLEAN"
    lamb_free:    "BOOLEAN"
    soy_free:     "BOOLEAN"
    pork_free:    "BOOLEAN"
    fish_free:    "BOOLEAN"
    corn_free:    "BOOLEAN"
  health_condition_safe:
    kidney_safe:      "BOOLEAN — protein ≤ 40 g/1000 kcal"
    pancreatitis_safe: "BOOLEAN — fat restricted"
    diabetic_safe:    "BOOLEAN — low glycemic carb sources"
  nutritional_flags:
    high_protein:     "BOOLEAN — protein ≥ 60 g/1000 kcal"
    high_omega3:      "BOOLEAN — EPA+DHA ≥ 1.0 g/1000 kcal"
    low_fat:          "BOOLEAN — fat ≤ 15 g/1000 kcal"
    novel_protein:    "BOOLEAN — tier T2 protein (bison, venison, rabbit, etc.)"
    grain_free:       "BOOLEAN — no rice, barley, oatmeal, wheat"
  note: >
    Unlike human dietary_info (vegetarian, vegan, keto, paleo, etc.),
    canine suitability is driven by allergen exclusions, life stage,
    health conditions, and nutritional profile flags.
    Dogs are facultative carnivores — "vegan" and "vegetarian" are not
    supported as safe long-term diets without extensive supplementation.
```

---

## 29. Cook Method Profiles (Cooking-Aware Model)

```yaml
cook_method_profiles:
  enum:
    - stovetop_brown      # Meat: 180°C, 8 min
    - boil                # Starch/veg: 100°C, 12 min
    - steam               # Leafy veg: 100°C, 2 min
    - bake                # Root veg: 200°C, 45 min
    - pressure_cook       # Multi-use: 120°C, 8–20 min
    - slow_cook           # Long cook: 95°C, 240 min
    - no_cook_add_after   # Supplements, oils: room temp
  source: "spec/nutrition.md — Section 6"
```

---

## Summary: Human vs Dog Constant Domains

| Domain                 | Human (`recipe_generation_v9`)         | Dog (this spec)                             |
|------------------------|----------------------------------------|---------------------------------------------|
| Identity / persona     | Culinary expert (Kenji + Myhrvold)     | Canine nutritionist (NRC 2006 / FEDIAF)     |
| Dietary preferences    | 21 booleans (vegetarian, keto, etc.)   | life_stage + allergen_free + health + flags  |
| Ingredient categories  | 11 USDA FSRG categories               | 9 canine-specific categories                |
| Culinary role          | 7 roles (consumed, extracted, etc.)    | *(not applicable — all consumed)*           |
| Yield factor           | per ingredient (0.0–1.0)              | cooking-aware model (loss_factors)          |
| Instruction categories | 6 (shopping, prep, cooking, etc.)      | *(simple step list, no category assignment)* |
| Nutrient targets       | *(none — no numeric targets)*          | 23 dimensions, NRC 2006 RA per life stage   |
| Forbidden ingredients  | *(none)*                               | 16 hard-block + user allergens              |
| Energy framework       | *(none)*                               | MER = RER × factors, per 1000 kcal basis    |
| Output units           | metric (g, kg, ml) from imperial       | metric only (g, ml, IU) — no imperial       |
| Ca:P ratio             | *(n/a)*                                | Required: 1:1–2:1 (adults), 1:1–1.6:1 (pups)|
| Tier system            | *(n/a)*                                | T1/T2/T3 availability                       |
| Size scaling           | servings count                         | Factor × (MER/1000)                         |
| Disclaimers            | *(none)*                               | Required NRC citation + vet referral triggers|
