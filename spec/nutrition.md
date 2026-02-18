---
title: "Scientific Nutrition Model"
version: "1.0.0"
status: "stable"
description: "Four-stage nutrient pipeline — raw composition, cooking losses, plate waste, and digestibility — with math formulation, ingredient schema extensions, and a sample cooking-aware recipe."
category: "research"
tags: ["nutrition", "cooking-losses", "digestibility", "aafco", "ingredient-schema"]
seeAlso:
  - id: "research/canine_nutrition_research_summary"
    title: "Canine Nutrition Research Summary"
  - id: "research/deep-research-report"
    title: "Deep Research Report"
---

A rigorous model (like high‑end human nutrition work) treats each nutrient as a function of: **raw composition → cooking losses (method + time + temp + medium) → plate waste → digestibility.** Below is a compact, math-style formulation plus how to plug cooking methods into it.

***

## 1. Core notation

For each ingredient \(i\), nutrient \(j\) (e.g., protein, Zn, vitamin A), and recipe \(r\):

- \(W_i\): raw weight of ingredient \(i\) in the recipe (g).  
- \(C_{i,j}^{\text{raw}}\): nutrient \(j\) per 1 g of ingredient \(i\) in its raw state (from FDC or lab).  
- \(M_i\): cooking method used for ingredient \(i\) (e.g., boil, pan_fry, pressure_cook).  
- \(L_{i,j}^{M_i}\): **fractional loss** of nutrient \(j\) for ingredient \(i\) under method \(M_i\) (0–1).  
  - Example: 0.2 means 20% of nutrient \(j\) is lost during cooking.  
- \(Y_i^{M_i}\): **yield factor** for ingredient \(i\) under method \(M_i\) (cooked weight / raw weight).  
- \(P_{i,j}\): plate waste fraction (0–1) for nutrient \(j\) from ingredient \(i\) (e.g., 0.05 = 5% of the cooked portion is not eaten).  
- \(D_{i,j}\): **digestibility coefficient** (0–1) of nutrient \(j\) from ingredient \(i\) in dogs (e.g., true fecal digestibility).

***

## 2. Step 1 – Raw nutrient load (pre-cooking)

For recipe \(r\), total raw amount of nutrient \(j\):

\[
N_{r,j}^{\text{raw}} = \sum_{i \in r} W_i \cdot C_{i,j}^{\text{raw}} \tag{1}
\]

If you use already‑cooked entries from FDC instead of raw, then \(C_{i,j}^{\text{raw}}\) is simply the composition for that “reference cooking state,” and \(L_{i,j}^{M_i}\) would be interpreted as additional deviation from that reference.

***

## 3. Step 2 – Apply cooking losses by ingredient and method

Per‑ingredient **cooked, plate-available** nutrient \(j\):

\[
N_{i,j}^{\text{cooked}} 
= W_i \cdot C_{i,j}^{\text{raw}} \cdot \bigl(1 - L_{i,j}^{M_i}\bigr) \tag{2}
\]

If you want to carry forward cooked weight explicitly:

\[
W_i^{\text{cooked}} = W_i \cdot Y_i^{M_i} \tag{3}
\]

(This is important if you normalize nutrients per 100 g cooked.)

Plate‑available (before digestion), accounting for plate waste:

\[
N_{i,j}^{\text{plate}} 
= N_{i,j}^{\text{cooked}} \cdot \bigl(1 - P_{i,j}\bigr) \tag{4}
\]

Total plate‑available nutrient in the recipe:

\[
N_{r,j}^{\text{plate}} 
= \sum_{i \in r} N_{i,j}^{\text{plate}} \tag{5}
\]

***

## 4. Step 3 – Digestible (absorbed) intake

Digestible intake of nutrient \(j\) from ingredient \(i\):

\[
N_{i,j}^{\text{dig}} 
= N_{i,j}^{\text{plate}} \cdot D_{i,j} \tag{6}
\]

Total digestible (absorbed) nutrient \(j\) for recipe \(r\):

\[
N_{r,j}^{\text{dig}} 
= \sum_{i \in r} N_{i,j}^{\text{dig}} \tag{7}
\]

This \(N_{r,j}^{\text{dig}}\) is the **closest analog to human nutrition intake models** that use true digestibility (e.g., DIAAS‑type metrics for protein). [pmc.ncbi.nlm.nih](https://pmc.ncbi.nlm.nih.gov/articles/PMC9624197/)

***

## 5. Step 4 – Energy normalization (per 1,000 kcal)

Let \(E_r\) be the total metabolisable energy (kcal) of the recipe, modeled with your ME system:

\[
E_r = \sum_{i \in r} W_i \cdot \text{ME}_i \tag{8}
\]

where \(\text{ME}_i\) is metabolisable energy per gram of ingredient \(i\).

Then AAFCO‑style per‑energy metrics:

- **Formulation‑level (pre-digestion) nutrient per 1,000 kcal:**

\[
A_{r,j}^{\text{form}} 
= \frac{N_{r,j}^{\text{plate}}}{E_r} \times 1000 \quad \text{(units of nutrient } j \text{ per 1,000 kcal)} \tag{9}
\]

- **Digestible nutrient per 1,000 kcal:**

\[
A_{r,j}^{\text{dig}} 
= \frac{N_{r,j}^{\text{dig}}}{E_r} \times 1000 \tag{10}
\]

You would compare \(A_{r,j}^{\text{form}}\) directly to AAFCO minima (which are defined on a formulated basis), but internally you can monitor \(A_{r,j}^{\text{dig}}\) as a **safety margin check**.

***

## 6. Encoding cooking methods explicitly

In your schema, each ingredient entry gets a **cooking profile** keyed by method, e.g.:

```json
{
  "ingredient_id": "sweet_potato",
  "base_state": "raw",
  "nutrient_profile_raw": { "VA": 14187, "K": 337, "...": "..." },
  "cooking_profiles": [
    {
      "method": "boil",
      "temperature_c": 100,
      "typical_time_min": 12,
      "yield_factor": 0.80,
      "loss_factors": {
        "VA": 0.10,
        "VB1": 0.20,
        "VB2": 0.15,
        "VC": 0.40,
        "minerals_generic": 0.05
      }
    },
    {
      "method": "bake",
      "temperature_c": 200,
      "typical_time_min": 45,
      "yield_factor": 0.75,
      "loss_factors": {
        "VA": 0.15,
        "VB1": 0.30,
        "VB2": 0.25,
        "VC": 0.50,
        "minerals_generic": 0.05
      }
    },
    {
      "method": "pressure_cook",
      "temperature_c": 120,
      "typical_time_min": 8,
      "yield_factor": 0.82,
      "loss_factors": {
        "VA": 0.12,
        "VB1": 0.18,
        "VB2": 0.18,
        "VC": 0.35,
        "minerals_generic": 0.04
      }
    },
    {
      "method": "slow_cook",
      "temperature_c": 95,
      "typical_time_min": 240,
      "yield_factor": 0.85,
      "loss_factors": {
        "VA": 0.18,
        "VB1": 0.25,
        "VB2": 0.22,
        "VC": 0.45,
        "minerals_generic": 0.06
      }
    }
  ],
  "digestibility_profile": {
    "protein": 0.85,
    "starch": 0.95,
    "fiber": 0.20,
    "minerals_generic": 0.90
  }
}
```

At runtime, your engine:

1. Reads the recipe’s specified `cook_method` for each ingredient.  
2. Pulls the corresponding `yield_factor` and `loss_factors`.  
3. Applies equations (2)–(7) for each nutrient.  
4. Outputs both \(A_{r,j}^{\text{form}}\) and \(A_{r,j}^{\text{dig}}\) per recipe.

You can build similar profiles for:

- `pan_fry`, `grill`, `stovetop_brown`, `sous_vide`, etc.  
- Pressure cooker vs slow cooker vs instant pot as separate `method` keys with different loss patterns.

***

## 7. How this shows up in the UI

Because your whole thesis is transparency, you can surface:

- “Formulated coverage” vs “modeled post‑cooking coverage (range)” vs “digestible coverage estimate.”  
- A simple band like:  
  - “Zinc: 130% of AAFCO by formulation; 100–120% after modeled cooking and absorption with your chosen method.”

That makes your critique of standard “table‑only” practice concrete and turns this model into a **visible differentiator** rather than invisible math.

The sections below extend the model into concrete, implementable schema additions, example ingredient profiles, and a sample recipe wired to the equations above.

***

## 8. Schema extensions (per ingredient)

Add these fields to your ingredient objects:

```jsonc
{
  "ingredient_id": "string",
  "name": "string",
  "base_state": "raw_or_reference_cooked",
  "fdc_id": "optional_USDA_FDC_or_lab_id",
  "nutrient_profile_raw": {
    "energy_kcal": 0,
    "protein_g": 0,
    "fat_g": 0,
    "carb_g": 0,
    "fiber_g": 0,
    "Ca_mg": 0,
    "P_mg": 0,
    "Zn_mg": 0,
    "Fe_mg": 0,
    "Cu_mg": 0,
    "Se_ug": 0,
    "I_ug": 0,
    "VA_IU": 0,
    "VD_IU": 0,
    "VE_mg": 0,
    "VB_complex_mg": 0,
    "Ch_mg": 0,
    "EPA_DHA_mg": 0,
    "K_mg": 0,
    "Mg_mg": 0,
    "Na_mg": 0
  },
  "cooking_profiles": [
    {
      "method": "stovetop_brown",
      "temperature_c": 180,
      "typical_time_min": 8,
      "yield_factor": 0.75,
      "loss_factors": {
        "protein": 0.00,
        "fat": 0.05,
        "VB_complex": 0.10,
        "VA": 0.05,
        "VE": 0.10,
        "minerals_generic": 0.00
      }
    }
    // other methods...
  ],
  "digestibility_profile": {
    "protein": 0.95,
    "fat": 0.95,
    "starch": 0.98,
    "fiber": 0.20,
    "minerals_generic": 0.90,
    "VA": 0.90,
    "VE": 0.90
  }
}
```

Values below are **illustrative defaults** (not lab-precise) but give implementable starting points consistent with published ranges. [merckvetmanual](https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/nutritional-requirements-of-small-animals)

> **Unit convention.** In `nutrient_profile_raw`, macros and energy are expressed **per gram** of raw ingredient (e.g., `protein_g: 0.20` = 20 g protein per 100 g). Minerals and vitamins use **mg, µg, or IU per 100 g** (matching the standard USDA/FDC presentation). The engine must divide mineral/vitamin values by 100 before applying equations (1)–(10).

***

## 9. Example ingredient profiles

### 9.1 Ground beef, 90% lean

```json
{
  "ingredient_id": "muscle_meat_ground_beef_90_lean",
  "name": "Ground beef, 90% lean",
  "base_state": "raw",
  "fdc_id": null,
  "nutrient_profile_raw": {
    "energy_kcal": 1.76,
    "protein_g": 0.20,
    "fat_g": 0.10,
    "carb_g": 0.00,
    "fiber_g": 0.00,
    "Ca_mg": 2.0,
    "P_mg": 170.0,
    "Zn_mg": 4.0,
    "Fe_mg": 2.3,
    "Cu_mg": 0.06,
    "Se_ug": 15.0,
    "I_ug": 0.0,
    "VA_IU": 0.0,
    "VD_IU": 0.0,
    "VE_mg": 0.2,
    "VB_complex_mg": 0.5,
    "Ch_mg": 80.0,
    "EPA_DHA_mg": 0.0,
    "K_mg": 270.0,
    "Mg_mg": 20.0,
    "Na_mg": 70.0
  },
  "cooking_profiles": [
    {
      "method": "stovetop_brown",
      "temperature_c": 180,
      "typical_time_min": 8,
      "yield_factor": 0.75,
      "loss_factors": {
        "protein": 0.00,
        "fat": 0.10,
        "VB_complex": 0.10,
        "VA": 0.00,
        "VE": 0.10,
        "minerals_generic": 0.00
      }
    },
    {
      "method": "pressure_cook",
      "temperature_c": 120,
      "typical_time_min": 20,
      "yield_factor": 0.80,
      "loss_factors": {
        "protein": 0.00,
        "fat": 0.05,
        "VB_complex": 0.15,
        "VA": 0.00,
        "VE": 0.15,
        "minerals_generic": 0.00
      }
    },
    {
      "method": "slow_cook",
      "temperature_c": 95,
      "typical_time_min": 240,
      "yield_factor": 0.78,
      "loss_factors": {
        "protein": 0.00,
        "fat": 0.10,
        "VB_complex": 0.20,
        "VA": 0.00,
        "VE": 0.20,
        "minerals_generic": 0.00
      }
    }
  ],
  "digestibility_profile": {
    "protein": 0.95,
    "fat": 0.95,
    "starch": 0.00,
    "fiber": 0.00,
    "minerals_generic": 0.90,
    "VA": 0.90,
    "VE": 0.90
  }
}
```

***

### 9.2 Beef liver

```json
{
  "ingredient_id": "organ_meat_beef_liver",
  "name": "Beef liver",
  "base_state": "raw",
  "fdc_id": null,
  "nutrient_profile_raw": {
    "energy_kcal": 1.35,
    "protein_g": 0.20,
    "fat_g": 0.04,
    "carb_g": 0.05,
    "fiber_g": 0.00,
    "Ca_mg": 5.0,
    "P_mg": 330.0,
    "Zn_mg": 4.0,
    "Fe_mg": 6.0,
    "Cu_mg": 12.0,
    "Se_ug": 40.0,
    "I_ug": 3.0,
    "VA_IU": 16000.0,
    "VD_IU": 40.0,
    "VE_mg": 0.6,
    "VB_complex_mg": 2.0,
    "Ch_mg": 330.0,
    "EPA_DHA_mg": 0.0,
    "K_mg": 290.0,
    "Mg_mg": 18.0,
    "Na_mg": 70.0
  },
  "cooking_profiles": [
    {
      "method": "stovetop_brown",
      "temperature_c": 180,
      "typical_time_min": 5,
      "yield_factor": 0.75,
      "loss_factors": {
        "protein": 0.00,
        "fat": 0.05,
        "VB_complex": 0.20,
        "VA": 0.10,
        "VE": 0.20,
        "minerals_generic": 0.00
      }
    },
    {
      "method": "pressure_cook",
      "temperature_c": 120,
      "typical_time_min": 10,
      "yield_factor": 0.80,
      "loss_factors": {
        "protein": 0.00,
        "fat": 0.05,
        "VB_complex": 0.25,
        "VA": 0.15,
        "VE": 0.25,
        "minerals_generic": 0.00
      }
    }
  ],
  "digestibility_profile": {
    "protein": 0.95,
    "fat": 0.95,
    "starch": 0.00,
    "fiber": 0.00,
    "minerals_generic": 0.90,
    "VA": 0.90,
    "VE": 0.90
  }
}
```

***

### 9.3 Sweet potato

```json
{
  "ingredient_id": "starchy_carbohydrates_sweet_potato",
  "name": "Sweet potato",
  "base_state": "raw",
  "fdc_id": null,
  "nutrient_profile_raw": {
    "energy_kcal": 0.86,
    "protein_g": 0.016,
    "fat_g": 0.001,
    "carb_g": 0.20,
    "fiber_g": 0.03,
    "Ca_mg": 30.0,
    "P_mg": 47.0,
    "Zn_mg": 0.30,
    "Fe_mg": 0.60,
    "Cu_mg": 0.15,
    "Se_ug": 0.6,
    "I_ug": 0.0,
    "VA_IU": 14187.0,
    "VD_IU": 0.0,
    "VE_mg": 0.3,
    "VB_complex_mg": 0.2,
    "Ch_mg": 12.0,
    "EPA_DHA_mg": 0.0,
    "K_mg": 337.0,
    "Mg_mg": 25.0,
    "Na_mg": 55.0
  },
  "cooking_profiles": [
    {
      "method": "boil",
      "temperature_c": 100,
      "typical_time_min": 12,
      "yield_factor": 0.80,
      "loss_factors": {
        "protein": 0.00,
        "fat": 0.00,
        "VB_complex": 0.20,
        "VA": 0.10,
        "VE": 0.10,
        "minerals_generic": 0.05
      }
    },
    {
      "method": "bake",
      "temperature_c": 200,
      "typical_time_min": 45,
      "yield_factor": 0.75,
      "loss_factors": {
        "protein": 0.00,
        "fat": 0.00,
        "VB_complex": 0.25,
        "VA": 0.15,
        "VE": 0.15,
        "minerals_generic": 0.05
      }
    },
    {
      "method": "pressure_cook",
      "temperature_c": 120,
      "typical_time_min": 8,
      "yield_factor": 0.82,
      "loss_factors": {
        "protein": 0.00,
        "fat": 0.00,
        "VB_complex": 0.18,
        "VA": 0.12,
        "VE": 0.12,
        "minerals_generic": 0.04
      }
    },
    {
      "method": "slow_cook",
      "temperature_c": 95,
      "typical_time_min": 240,
      "yield_factor": 0.85,
      "loss_factors": {
        "protein": 0.00,
        "fat": 0.00,
        "VB_complex": 0.25,
        "VA": 0.18,
        "VE": 0.18,
        "minerals_generic": 0.06
      }
    }
  ],
  "digestibility_profile": {
    "protein": 0.80,
    "fat": 0.95,
    "starch": 0.97,
    "fiber": 0.20,
    "minerals_generic": 0.90,
    "VA": 0.90,
    "VE": 0.90
  }
}
```

***

### 9.4 Spinach

```json
{
  "ingredient_id": "non_starchy_vegetables_spinach",
  "name": "Spinach",
  "base_state": "raw",
  "fdc_id": null,
  "nutrient_profile_raw": {
    "energy_kcal": 0.23,
    "protein_g": 0.029,
    "fat_g": 0.004,
    "carb_g": 0.036,
    "fiber_g": 0.022,
    "Ca_mg": 99.0,
    "P_mg": 49.0,
    "Zn_mg": 0.53,
    "Fe_mg": 2.7,
    "Cu_mg": 0.13,
    "Se_ug": 1.0,
    "I_ug": 0.0,
    "VA_IU": 9377.0,
    "VD_IU": 0.0,
    "VE_mg": 2.0,
    "VB_complex_mg": 0.6,
    "Ch_mg": 19.0,
    "EPA_DHA_mg": 0.0,
    "K_mg": 558.0,
    "Mg_mg": 79.0,
    "Na_mg": 79.0
  },
  "cooking_profiles": [
    {
      "method": "steam",
      "temperature_c": 100,
      "typical_time_min": 2,
      "yield_factor": 0.30,
      "loss_factors": {
        "protein": 0.00,
        "fat": 0.00,
        "VB_complex": 0.20,
        "VA": 0.10,
        "VE": 0.15,
        "minerals_generic": 0.05
      }
    },
    {
      "method": "boil",
      "temperature_c": 100,
      "typical_time_min": 3,
      "yield_factor": 0.20,
      "loss_factors": {
        "protein": 0.00,
        "fat": 0.00,
        "VB_complex": 0.25,
        "VA": 0.15,
        "VE": 0.20,
        "minerals_generic": 0.08
      }
    }
  ],
  "digestibility_profile": {
    "protein": 0.75,
    "fat": 0.95,
    "starch": 0.50,
    "fiber": 0.10,
    "minerals_generic": 0.80,
    "VA": 0.85,
    "VE": 0.85
  }
}
```

***

### 9.5 Eggshell powder

```json
{
  "ingredient_id": "calcium_sources_eggshell_powder",
  "name": "Eggshell powder",
  "base_state": "raw",
  "fdc_id": null,
  "nutrient_profile_raw": {
    "energy_kcal": 0.00,
    "protein_g": 0.00,
    "fat_g": 0.00,
    "carb_g": 0.00,
    "fiber_g": 0.00,
    "Ca_mg": 380.0,
    "P_mg": 0.0,
    "Zn_mg": 0.0,
    "Fe_mg": 0.0,
    "Cu_mg": 0.0,
    "Se_ug": 0.0,
    "I_ug": 0.0,
    "VA_IU": 0.0,
    "VD_IU": 0.0,
    "VE_mg": 0.0,
    "VB_complex_mg": 0.0,
    "Ch_mg": 0.0,
    "EPA_DHA_mg": 0.0,
    "K_mg": 0.0,
    "Mg_mg": 0.0,
    "Na_mg": 0.0
  },
  "cooking_profiles": [
    {
      "method": "no_cook_add_after",
      "temperature_c": 25,
      "typical_time_min": 0,
      "yield_factor": 1.00,
      "loss_factors": {
        "protein": 0.00,
        "fat": 0.00,
        "VB_complex": 0.00,
        "VA": 0.00,
        "VE": 0.00,
        "minerals_generic": 0.00
      }
    }
  ],
  "digestibility_profile": {
    "protein": 0.00,
    "fat": 0.00,
    "starch": 0.00,
    "fiber": 0.00,
    "minerals_generic": 0.40,
    "VA": 0.00,
    "VE": 0.00
  }
}
```

***

### 9.6 Fish oil

```json
{
  "ingredient_id": "fats_oils_fish_oil",
  "name": "Fish oil",
  "base_state": "raw",
  "fdc_id": null,
  "nutrient_profile_raw": {
    "energy_kcal": 9.0,
    "protein_g": 0.00,
    "fat_g": 1.00,
    "carb_g": 0.00,
    "fiber_g": 0.00,
    "Ca_mg": 0.0,
    "P_mg": 0.0,
    "Zn_mg": 0.0,
    "Fe_mg": 0.0,
    "Cu_mg": 0.0,
    "Se_ug": 0.0,
    "I_ug": 0.0,
    "VA_IU": 0.0,
    "VD_IU": 0.0,
    "VE_mg": 0.0,
    "VB_complex_mg": 0.0,
    "Ch_mg": 0.0,
    "EPA_DHA_mg": 300.0,
    "K_mg": 0.0,
    "Mg_mg": 0.0,
    "Na_mg": 0.0
  },
  "cooking_profiles": [
    {
      "method": "no_cook_add_after",
      "temperature_c": 25,
      "typical_time_min": 0,
      "yield_factor": 1.00,
      "loss_factors": {
        "protein": 0.00,
        "fat": 0.00,
        "VB_complex": 0.00,
        "VA": 0.00,
        "VE": 0.00,
        "minerals_generic": 0.00
      }
    }
  ],
  "digestibility_profile": {
    "protein": 0.00,
    "fat": 0.98,
    "starch": 0.00,
    "fiber": 0.00,
    "minerals_generic": 0.00,
    "VA": 0.00,
    "VE": 0.00
  }
}
```

***

## 10. Implementation checklist

For each recipe:

1. For each ingredient, read `cook_method` (e.g., `"stovetop"` → map to `"stovetop_brown"` for beef, `"boil"` for sweet potato, `"steam"` for spinach).
2. Pull that ingredient’s `cooking_profile` with that `method`.
3. Apply the equations you already have:
   - Raw → cooked using `loss_factors` and `yield_factor`.
   - Plate waste (for now, you can set \(P_{i,j} = 0\) and add later).
   - Digestible intake using `digestibility_profile`.
4. Compute:
   - Formulated nutrient per 1,000 kcal \(A_{r,j}^{\text{form}}\).
   - Digestible nutrient per 1,000 kcal \(A_{r,j}^{\text{dig}}\).

In the UI, show **both** values and explicitly label each set of assumptions. This makes the critique of standard "table‑only" practice concrete and productized.

***

## 11. Sample recipe with cooking-aware modeling

The recipe below demonstrates the full schema in action: per-ingredient `cook_method` hooks, a `modeling` block, and a `per_1000kcal_estimate` split into `formulated` vs `digestible_estimate`.

```json
{
  "id": "beef_sweet_potato_spinach",
  "name": "Beef & Sweet Potato with Spinach",
  "overview": "A mineral-rich staple built on lean ground beef. Sweet potato delivers vitamin A and potassium, spinach adds vitamin K, iron, and magnesium. Beef liver covers copper, B-vitamins, and choline.",
  "image_url": "https://zrlplilzpwsxqxskeoqc.supabase.co/storage/v1/object/public/recipe-images/beef_sweet_potato_spinach.png",
  "modeling": {
    "cooking_aware_model_enabled": true,
    "notes": "Nutrients are modeled from ingredient-specific raw profiles, cooking loss factors, and digestibility coefficients, then normalized per 1000 kcal."
  },
  "tags": {
    "protein_type": "beef",
    "primary_carb": "sweet_potato",
    "primary_veggie": "spinach",
    "cook_method": "stovetop",
    "prep_time_min": 30,
    "tier": "T1",
    "dimensions_covered": [
      "P",
      "F",
      "Zn",
      "Fe",
      "B",
      "Ch",
      "VA",
      "VK",
      "VE",
      "Ca",
      "K",
      "Mg",
      "Se",
      "O3",
      "Fib",
      "Cu"
    ]
  },
  "ingredients": [
    {
      "ingredient_id": "muscle_meat_ground_beef_90_lean",
      "name": "Ground beef, 90% lean",
      "base_g": 220,
      "unit": "g",
      "prep": "raw weight",
      "cook_method": "stovetop_brown"
    },
    {
      "ingredient_id": "organ_meat_beef_liver",
      "name": "Beef liver",
      "base_g": 25,
      "unit": "g",
      "prep": "raw, diced small",
      "cook_method": "stovetop_brown"
    },
    {
      "ingredient_id": "starchy_carbohydrates_sweet_potato",
      "name": "Sweet potato",
      "base_g": 180,
      "unit": "g",
      "prep": "peeled, cubed, target cooked weight",
      "cook_method": "boil"
    },
    {
      "ingredient_id": "non_starchy_vegetables_spinach",
      "name": "Spinach",
      "base_g": 80,
      "unit": "g",
      "prep": "target cooked weight (steamed or wilted)",
      "cook_method": "steam"
    },
    {
      "ingredient_id": "fats_oils_fish_oil",
      "name": "Fish oil",
      "base_g": 5,
      "unit": "ml",
      "prep": "~1 tsp, add after cooking",
      "cook_method": "no_cook_add_after"
    },
    {
      "ingredient_id": "calcium_sources_eggshell_powder",
      "name": "Eggshell powder",
      "base_g": 3,
      "unit": "g",
      "prep": "~½ tsp, stir into finished food",
      "cook_method": "no_cook_add_after"
    },
    {
      "ingredient_id": "supplements_vitamin_e_premix",
      "name": "Vitamin E premix (fixed per kit)",
      "base_g": null,
      "unit": "g",
      "prep": "Add full sachet after cooking; dose is pre-calculated for this kit size.",
      "cook_method": "no_cook_add_after"
    }
  ],
  "instructions": [
    "Peel and cube the sweet potato. Boil until fork-tender, about 12 minutes, then drain. Do not discard sweet potato pieces.",
    "Brown the ground beef in a skillet over medium heat, breaking into small pieces. Do not discard the pan juices.",
    "Dice the beef liver small and add to the skillet for the last 3–4 minutes until cooked through.",
    "Steam or wilt the spinach in a separate pot (1–2 minutes). Drain lightly and chop roughly.",
    "Combine meat, sweet potato, and spinach in a bowl. Let cool to room temperature.",
    "Stir in fish oil, eggshell powder, and the full vitamin E premix sachet. Mix well.",
    "Divide into 2 equal portions for AM and PM meals. Refrigerate the PM portion."
  ],
  "per_1000kcal_estimate": {
    "model_version": "v2_cooking_aware",
    "assumptions": {
      "beef_cook_profile": "stovetop_brown",
      "sweet_potato_cook_profile": "boil",
      "spinach_cook_profile": "steam",
      "plate_waste_fraction": 0.0,
      "uses_digestible_intake": true
    },
    "formulated": {
      "protein_g": 52,
      "fat_g": 20,
      "fiber_g": 6,
      "calcium_mg": 1100,
      "phosphorus_mg": 850,
      "ca_p_ratio": "1.3:1"
    },
    "digestible_estimate": {
      "protein_g": 48,
      "fat_g": 19,
      "fiber_g": 1,
      "calcium_mg": 850,
      "phosphorus_mg": 780,
      "ca_p_ratio": "1.1:1"
    }
  }
}
```

**Next steps:** Apply the same pattern to the remaining recipes and wire the MER/nutrient engine to read `cook_method` per ingredient, run equations (2)–(10), and emit both `formulated` and `digestible_estimate` outputs.