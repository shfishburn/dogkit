# Canine Homemade Diet: Grocery-Sourceable Ingredient Database
## Mapped to Pipeline Constraint Dimensions

**Purpose:** Representative ingredient list for the recipe generation engine. Each ingredient is mapped to its primary nutritional role, key nutrients delivered, USDA FDC category, availability tier, and which constraint layer dimensions it serves.

**Availability Tiers:**
- **T1** = Any grocery store (Walmart, Kroger, Safeway)
- **T2** = Well-stocked grocery or Costco/Whole Foods
- **T3** = Pet specialty store, Amazon, or online supplement retailer

**Constraint Dimension Key:**

| Code | Nutrient | Code | Nutrient |
|------|----------|------|----------|
| [P] | Protein (g/1000kcal) | [I] | Iodine |
| [F] | Fat (g/1000kcal) | [VA] | Vitamin A |
| [Ca] | Calcium | [VD] | Vitamin D |
| [Ph] | Phosphorus | [VE] | Vitamin E |
| [CaPh] | Ca:P ratio | [VK] | Vitamin K |
| [Zn] | Zinc | [B] | B-complex vitamins |
| [Fe] | Iron | [Ch] | Choline |
| [Cu] | Copper | [O3] | EPA + DHA Omega-3 |
| [Se] | Selenium | [O6] | Omega-6 (linoleic) |
| [Mn] | Manganese | [Fib] | Fiber |
| [K] | Potassium | [Mg] | Magnesium |

***

## 1. Muscle Meats (Primary Protein + Fat)

Core of every recipe. Provides protein, fat, phosphorus, B vitamins, zinc, and iron. At least one animal protein source is required per recipe (SR-006).[^1]

| Ingredient | Tier | Key Nutrients per 100g (cooked) | Dimensions |
|---|---|---|---|
| Ground beef, 90% lean | T1 | 26g protein, 10g fat, 2.8mg Zn, 2.7mg Fe, 79mg Ch | [P][F][Zn][Fe][B][Ch] |
| Ground beef, 85% lean | T1 | 25g protein, 15g fat, 5.4mg Zn, 2.4mg Fe | [P][F][Zn][Fe][B] |
| Ground turkey, 93% lean | T1 | 27g protein, 8g fat, 2.4mg Zn, 1.5mg Fe, 0.03mg Se | [P][F][Zn][Se][B] |
| Ground chicken | T1 | 24g protein, 10g fat, 1.8mg Zn, 1.1mg Fe | [P][F][Zn][B] |
| Chicken thigh, boneless | T1 | 26g protein, 11g fat, 2.0mg Zn, 1.1mg Fe | [P][F][Zn][B] |
| Chicken breast, boneless | T1 | 31g protein, 3.6g fat, 1.0mg Zn, 0.5mg Fe | [P][B] |
| Pork loin | T1 | 27g protein, 8g fat, 2.0mg Zn, 0.9mg Fe | [P][F][Zn][B] |
| Pork shoulder/butt | T1 | 24g protein, 16g fat, 3.5mg Zn, 1.2mg Fe | [P][F][Zn][Fe][B] |
| Beef chuck roast | T1 | 26g protein, 14g fat, 6.4mg Zn, 2.9mg Fe | [P][F][Zn][Fe][B] |
| Beef heart | T2 | 28g protein, 4g fat, 2.1mg Zn, 4.3mg Fe, 0.4mg Cu | [P][Fe][Cu][B][Ch] |
| Lamb, ground | T1 | 25g protein, 17g fat, 3.6mg Zn, 1.6mg Fe | [P][F][Zn][Fe][B] |
| Venison, ground | T2 | 26g protein, 3g fat, 3.0mg Zn, 3.4mg Fe | [P][Zn][Fe][B] |
| Bison, ground | T2 | 25g protein, 7g fat, 4.5mg Zn, 2.8mg Fe | [P][F][Zn][Fe][B] |
| Rabbit | T2 | 29g protein, 3.5g fat, 2.0mg Zn, 1.6mg Fe | [P][B] |

**Key insight:** Ground beef is the single best protein for dogs due to high zinc + iron density. Turkey and chicken are significantly lower in both — recipes using poultry as sole protein almost always need zinc supplementation. Novel proteins (venison, rabbit, bison) are used for elimination diets when allergen exclusions remove beef/chicken/pork. Beef heart profiles nutritionally as a lean muscle meat despite being an organ; it's extremely high in taurine, CoQ10, and iron.[^2][^3][^4]

***

## 2. Organ Meats (Micronutrient Powerhouses)

The "multivitamin of whole-food feeding." Required by structural rule SR-003. Liver is the single most nutrient-dense food available — but **capped at 5% of recipe weight** due to vitamin A toxicity risk. Total organ meats capped at 10%.[^5][^6]

| Ingredient | Tier | Key Nutrients per 100g (raw) | Dimensions |
|---|---|---|---|
| Beef liver | T1 | 20g protein, 4.9mg Fe, 14mg Cu, 5.3mg Zn, 40mcg Se, 16814 IU vit A, 1.3mcg vit D, 310mg Ch, all B vitamins | [VA][Cu][Fe][Zn][Se][B][Ch][VD][Mn] |
| Chicken liver | T1 | 17g protein, 9mg Fe, 0.5mg Cu, 2.7mg Zn, 11078 IU vit A, 264mg Ch | [VA][Fe][B][Ch] |
| Chicken gizzard | T1 | 18g protein, 3.2mg Fe, 2.7mg Zn, high B12 | [P][Fe][Zn][B] |
| Beef kidney | T2 | 17g protein, 5mg Fe, 0.4mg Cu, 2.1mg Zn, 141mcg Se | [Se][Fe][B][Cu] |
| Pork liver | T2 | 22g protein, 18mg Fe, 0.7mg Cu, 5.8mg Zn, 17997 IU vit A | [VA][Fe][Zn][Cu][B][Ch] |
| Lamb liver | T2 | 20g protein, 7.4mg Fe, 6.4mg Cu, 4.0mg Zn | [VA][Fe][Cu][Zn][B] |

**Key insight:** Beef liver covers more constraint dimensions than any other single ingredient — >1500% NRC RA for vitamin A, >100% copper, >50% of zinc/iron/selenium/all B vitamins for a 25kg dog. This is exactly why it's capped: too much = vitamin A and copper toxicity. Chicken liver has less copper than beef liver — safer for copper-sensitive breeds (Bedlingtons, Dobermans). Kidney is the best whole-food source of selenium.[^4][^6][^5]

***

## 3. Fish & Seafood (Omega-3 EPA/DHA + Vitamin D + Selenium)

Primary source of EPA+DHA omega-3 fatty acids and the only reliable dietary source of vitamin D outside supplementation.[^1]

| Ingredient | Tier | Key Nutrients per 100g | Dimensions |
|---|---|---|---|
| Sardines, canned in water (with bones) | T1 | 25g protein, 382mg Ca, 1.5g EPA+DHA, 4.8mcg vit D, 52mcg Se | [O3][Ca][VD][Se][P][CaPh] |
| Mackerel, canned (jack) | T1 | 24g protein, 1.8g EPA+DHA, 7.8mcg vit D, 40mcg Se | [O3][VD][Se][P] |
| Salmon, canned (pink, with bones) | T1 | 20g protein, 277mg Ca, 1.0g EPA+DHA, 12.5mcg vit D, 32mcg Se | [O3][Ca][VD][Se][P] |
| Salmon, fresh (cooked) | T1 | 25g protein, 1.5g EPA+DHA, 9mcg vit D, 38mcg Se | [O3][VD][Se][P] |
| Cod, fresh (cooked) | T1 | 23g protein, 0.2g EPA+DHA, 1mcg vit D, 35mcg Se | [Se][P][VD] |
| Tilapia, fresh (cooked) | T1 | 26g protein, 0.1g EPA+DHA, 3.1mcg vit D | [P][VD] |

**Key insight:** Sardines with bones are the single best grocery ingredient for dogs — they simultaneously deliver calcium, EPA/DHA, vitamin D, selenium, and protein in one food. Canned fish with bones is the only whole-food calcium source that doesn't require grinding equipment. Tilapia and cod are low-omega-3 fish; useful as novel protein but don't meaningfully contribute to [O3]. Small fish (sardines, mackerel) have negligible mercury.[^3][^7]

***

## 4. Eggs & Dairy (Complete Protein + Calcium + Choline)

Eggs have the highest biological value protein of any food. Eggshells are a practical calcium source. Dairy provides calcium and fat.[^7]

| Ingredient | Tier | Key Nutrients | Dimensions |
|---|---|---|---|
| Whole egg (large, ~50g) | T1 | 6g protein, 5g fat, 147mg Ch, 1.1mcg vit D, 15.4mcg Se | [P][F][Ch][VD][Se][B] |
| Eggshell powder (ground) | T1 | ~2000mg Ca per 5.5g (1 tsp). Pure CaCO₃. No phosphorus. | [Ca][CaPh] |
| Plain yogurt (whole milk) | T1 | 3.5g protein, 3.3g fat, 121mg Ca, 95mg Ph | [Ca][P][F][B] |
| Cottage cheese (2%) | T1 | 11g protein, 2.3g fat, 83mg Ca, 160mg Ph | [P][Ca][B] |
| Kefir (plain, whole) | T1 | 3.3g protein, 3.5g fat, 130mg Ca, 100mg Ph | [Ca][P][F][B] |
| Cheddar cheese | T1 | 25g protein, 33g fat, 721mg Ca, 512mg Ph | [Ca][P][F] |

**Key insight:** Eggshell powder is the recommended default calcium source for home cooking. 1/4 tsp ≈ 500mg calcium — adequate for a ~13 lb dog. It provides pure calcium with no phosphorus, making it ideal for adjusting Ca:P ratio upward without adding more P. For puppies, bone meal or dicalcium phosphate is preferred because puppies need both Ca AND Ph in ratio.[^7]

***

## 5. Starchy Carbohydrates (Energy + Fiber + Texture)

Dogs have no carbohydrate requirement, but starches are practical for bulk, palatability, and cost. These are the most common ingredients in published homemade dog food recipes.[^8][^9]

| Ingredient | Tier | Key Nutrients per 100g (cooked) | Dimensions |
|---|---|---|---|
| Sweet potato (baked) | T1 | 2g protein, 3.3g fiber, 475mg K, 0.6mg Mn, 14187 IU vit A (beta-carotene) | [Fib][K][VA][Mn] |
| White potato (boiled) | T1 | 1.7g protein, 1.8g fiber, 379mg K | [Fib][K] |
| Brown rice (cooked) | T1 | 2.3g protein, 1.6g fiber, 0.9mg Mn, 1.0mg Fe | [Fib][Mn][Fe] |
| White rice (cooked) | T1 | 2.4g protein, 0.3g fiber | (energy only) |
| Oatmeal (cooked) | T1 | 2.4g protein, 1.7g fiber, 1.0mg Mn, 27mg Mg | [Fib][Mn][Mg] |
| Quinoa (cooked) | T1 | 4.4g protein, 2.8g fiber, 1.1mg Mn, 64mg Mg | [Fib][Mn][Mg][P] |
| Barley (cooked) | T1 | 2.3g protein, 3.8g fiber | [Fib] |
| Lentils (cooked) | T1 | 9g protein, 7.9g fiber, 0.5mg Mn, 3.3mg Fe, 369mg K | [Fib][Fe][K][Mn] |
| Pumpkin puree (canned) | T1 | 1g protein, 2.9g fiber, 230mg K, 17000 IU vit A | [Fib][VA][K] |

Sweet potato is the best starch for dogs: high fiber, high vitamin A (beta-carotene form = no toxicity risk unlike retinol), high potassium. White rice is used in bland/GI-upset diets because it's extremely digestible — it contributes almost nothing nutritionally but is useful as a vehicle. Pumpkin puree (NOT pumpkin pie mix) is primarily a fiber/GI supplement.[^3]

***

## 6. Non-Starchy Vegetables (Fiber + Vitamins + Antioxidants)

Should be 10–20% of recipe weight, steamed/pureed for digestibility — dogs lack cellulase to break down raw plant cell walls.[^10][^1]

| Ingredient | Tier | Key Nutrients per 100g (cooked) | Dimensions |
|---|---|---|---|
| Broccoli (steamed) | T1 | 2.4g protein, 3.3g fiber, 102mcg VK, 0.8mg VE, 293mg K | [Fib][VK][VE][K][Mn] |
| Spinach (cooked) | T1 | 3g protein, 2.4g fiber, 483mcg VK, 2mg VE, 3.6mg Fe, 87mg Mg | [VK][VE][Fe][Mg][K][Mn] |
| Kale (cooked) | T1 | 2.9g protein, 2g fiber, 817mcg VK, 1mg VE, 135mg Ca | [VK][VE][Ca][K][Mn] |
| Green beans (steamed) | T1 | 1.8g protein, 3.2g fiber, 43mcg VK, 209mg K | [Fib][VK][K] |
| Zucchini (cooked) | T1 | 1g protein, 1g fiber, 264mg K | [Fib][K] |
| Carrots (cooked) | T1 | 0.8g protein, 3g fiber, 17000 IU VA | [Fib][VA][VK] |
| Brussels sprouts (cooked) | T1 | 3.4g protein, 3.8g fiber, 177mcg VK, 389mg K | [Fib][VK][K] |
| Peas (cooked) | T1 | 5.4g protein, 4.4g fiber, 24mcg VK, 1.5mg Mn, 271mg K | [Fib][P][VK][Mn][K] |
| Bok choy (cooked) | T1 | 1.6g protein, 1g fiber, 46mcg VK, 105mg Ca, 252mg K | [VK][Ca][K] |

**Caution:** Spinach contains oxalates that bind calcium — should NOT be relied on as a calcium source and is contraindicated for dogs with kidney issues or calcium oxalate stones. Kale is the best single vegetable by nutrient density: highest vitamin K, good non-oxalate-bound calcium, vitamin E, potassium. Green beans are commonly used as low-calorie filler in weight-loss recipes.[^1]

***

## 7. Fats & Oils (Essential Fatty Acids + Energy)

Provide linoleic acid (omega-6), EPA+DHA (omega-3), energy density, and fat-soluble vitamin absorption.[^11]

| Ingredient | Tier | Key Nutrients per 15ml/tbsp | Dimensions |
|---|---|---|---|
| Sunflower oil | T1 | 14g fat, 9g linoleic acid (O6), 5.6mg VE | [O6][F][VE] |
| Safflower oil (high-linoleic) | T1 | 14g fat, 10g linoleic acid (O6) | [O6][F] |
| Canola oil | T1 | 14g fat, 2.8g linoleic acid, 1.3g ALA | [O6][F] |
| Olive oil | T1 | 14g fat, 1.3g linoleic acid, 1.4mg VE | [F][VE] |
| Coconut oil | T1 | 14g fat (MCT-rich), 0.2g linoleic acid | [F] (MCT for seniors) |
| Hempseed oil | T2 | 14g fat, 8g linoleic acid, 2.7g ALA, 1g GLA | [O6][F] |
| Fish oil (generic, liquid) | T1 | ~1.5g EPA+DHA per tsp (5ml) | [O3] |
| Cod liver oil | T2 | ~1g EPA+DHA per tsp, 4500 IU vit A, 450 IU vit D | [O3][VA][VD] |
| Hemp hearts (hulled seeds) | T1 | 10g protein, 14g fat, 8g O6 per 30g | [O6][F][P][Mg][Mn] |
| Ground flaxseed | T1 | 3g protein, 6g fat, 3.3g ALA, 3.8g fiber per 15g | [Fib][F] |

**Critical:** Plant omega-3s (ALA from flax, hemp) do NOT meaningfully convert to EPA/DHA in dogs. Flaxseed oil does NOT satisfy the [O3] constraint. Only marine sources (fish oil, sardines, mackerel) count for EPA+DHA. Cod liver oil is extremely potent in vitamins A and D — capped at 0.5% of recipe weight to prevent toxicity. The BalanceIT recipe builder uses canola oil as its default, paired with Nordic Naturals fish oil for omega-3.[^9][^12][^13][^11]

***

## 8. Calcium Sources (Ca:P Ratio Enforcement)

The critical gap in almost every homemade dog food recipe. Meat is very high in phosphorus and very low in calcium. Without added calcium, Ca:P ratio will be ~1:15 when the requirement is 1:1 to 2:1.[^7]

| Ingredient | Tier | Calcium Content + Notes | Dimensions |
|---|---|---|---|
| Eggshell powder (homemade) | T1 | ~2000mg Ca per 5.5g (1 level tsp). Pure CaCO₃. No phosphorus. | [Ca][CaPh] |
| Calcium carbonate (supplement) | T1 | ~400mg Ca per 1g (40% elemental Ca). No phosphorus. | [Ca][CaPh] |
| Bone meal (food-grade) | T3 | ~280mg Ca + ~140mg Ph per 1g. Ca:P ≈ 2:1. | [Ca][Ph][CaPh] |
| Dicalcium phosphate | T3 | ~230mg Ca + ~180mg Ph per 1g. Ca:P ≈ 1.3:1. | [Ca][Ph][CaPh] |
| Sardines with bones | T1 | ~382mg Ca per 100g. Also delivers O3, VD, Se. | [Ca][O3][VD][Se] |
| Canned salmon with bones | T1 | ~277mg Ca per 100g. Also delivers O3 and VD. | [Ca][O3][VD] |

For puppies, bone meal or dicalcium phosphate is preferred over eggshell because puppies need both Ca AND Ph in ratio (1:1 to 1.6:1). Eggshell provides Ca with no Ph, which can throw off the puppy Ca:P requirement. Never use garden-grade bone meal — it may contain lead and heavy metals. Commercial premixes (BalanceIT, Chef's Canine Complete) use dicalcium phosphate + calcium carbonate as their calcium backbone.[^14][^15][^16][^7]

***

## 9. Supplements

Most home-prepared diets are deficient in 3–7 micronutrients even with optimal ingredient selection. Supplements fill the remaining gaps.[^17][^2]

### 9A: Commercial Vitamin/Mineral Premixes

| Product | Tier | Price | Key Ingredients | Dimensions |
|---|---|---|---|---|
| BalanceIT Canine [^15] | T3 | ~$30/600g | Tricalcium phosphate, KCl, choline, MgSO₄, Zn/Fe/Cu/Mn/Se, all B vitamins, vitamins A/D/E/K | All micros except [O3] |
| Chef's Canine Complete [^14] | T3 | ~$40/lb | DiCa phosphate, CaCO₃, choline, taurine, Zn/Fe/Cu/Mn proteinate, vit E/A/D, all B vitamins, Ca iodate | All micros except [O3] |
| Azestfor Homemade Dog Vitamins [^18] | T3 | ~$35/lb | Tricalcium phosphate, chicken liver, chia seeds, KCl, kelp, CaCO₃, MgSO₄, choline, all trace minerals + vitamins | All micros except [O3] |
| Holistic Vet Blend Regular [^19] | T3 | ~$33/8.47oz | CaCO₃, dried beef liver, DiCa phosphate, pumpkin, psyllium, kelp, ZnSO₄, taurine, Cu gluconate, vit D₃ | All micros except [O3] |
| Wynwood Vitamineral Mix [^20] | T3 | ~$25/4.9oz | DiCa phosphate, CaCO₃, taurine, KCl, choline, MgO, Zn/Fe/Cu, all B vitamins, Se yeast, vit D₃/A | All micros except [O3] |

All commercial premixes cover the same core gaps with nearly identical ingredient lists. None include omega-3 EPA+DHA — fish oil must be added separately. BalanceIT is the gold standard, formulated by a board-certified veterinary nutritionist with a free online recipe builder that calculates exact per-recipe doses.[^15][^11]

### 9B: Individual Supplements (à la carte gap-filling)

| Supplement | Tier | What It Provides | Dimensions |
|---|---|---|---|
| Fish oil (Nordic Naturals Omega-3 Pet) [^13] | T1 | ~1.5g EPA+DHA per tsp. Dose: 75–100mg EPA+DHA per kg BW/day | [O3] |
| Kelp powder (organic) [^21][^22] | T2 | Iodine (646–1259 mcg/g), trace Mn/Se/Mg. Dose: 1/4 tsp per 25 lbs. Caution: iodine content varies widely by species/batch | [I][Se][Mn][Mg] |
| Vitamin E (d-alpha tocopherol) | T1 | 1 IU = 0.67mg. Dose: 1–2 IU per lb BW/day. Critical when feeding fish oil (prevents PUFA oxidation) | [VE] |
| Zinc gluconate/picolinate | T1 | 15–25mg elemental Zn per tablet. Needed when primary protein is poultry | [Zn] |
| Taurine | T2 | 250–500mg per 25 lbs BW/day. Cardiac function. In all commercial premixes | (cardiac support) |
| Ground ginger | T1 | Anti-inflammatory, GI support. 1/4 tsp per 25 lbs | (GI support) |
| Psyllium husk powder | T1 | Soluble fiber. 1/2–1 tsp per meal for GI regularity | [Fib] |
| Vitamin D₃ (cholecalciferol) | T1 | 500–1000 IU per 25 lbs BW/day. Critical gap if recipe has no fish. SUL = 20mcg/1000kcal | [VD] |
| Nutritional yeast | T2 | 8g protein, 5mg Zn, all B vitamins per 2 tbsp. Dogs love the taste | [B][Zn] |
| Iodized salt | T1 | ~77mcg iodine per 1/4 tsp. Use if not using kelp | [I][Na] |

***

## 10. Dimension Gap Coverage Matrix

For each constraint dimension, which ingredients are the primary, secondary, and supplement fallback sources. This tells the recipe engine where to look first.

| Dimension | Primary Source | Secondary Source | Supplement Fallback |
|---|---|---|---|
| **[P] Protein** | Ground beef, turkey, pork | Chicken thigh, eggs, fish | — |
| **[F] Fat** | Meat fat, added oil | Eggs, dairy, hemp hearts | — |
| **[Ca] Calcium** | Eggshell powder | Sardines w/ bones, dairy | CaCO₃, bone meal, DiCaPh |
| **[Ph] Phosphorus** | Meat (inherently high) | Eggs, dairy, fish | Bone meal, DiCaPh |
| **[CaPh] Ca:P Ratio** | Eggshell powder (Ca only) | Sardines w/ bones | CaCO₃ (pure Ca, no Ph) |
| **[Zn] Zinc** | Ground beef, beef chuck | Lamb, bison, beef liver | Zinc supplement, premix |
| **[Fe] Iron** | Beef liver, chicken liver | Ground beef, lentils | Iron in premix |
| **[Cu] Copper** | Beef liver (very high) | Lamb liver | Copper in premix |
| **[Se] Selenium** | Beef kidney, sardines | Ground turkey, eggs, cod | Se yeast or premix |
| **[I] Iodine** | Kelp powder | Iodized salt, fish | Calcium iodate in premix |
| **[VA] Vitamin A** | Beef liver (retinol) | Sweet potato, carrots, pumpkin (beta-carotene) | Cod liver oil, premix |
| **[VD] Vitamin D** | Sardines, mackerel, salmon | Eggs (small amount) | Vit D₃ supplement, premix |
| **[VE] Vitamin E** | Sunflower oil, spinach | Hemp hearts, kale | Vit E gel caps |
| **[VK] Vitamin K** | Kale, spinach, broccoli | Brussels sprouts, peas | Premix (minimal) |
| **[B] B Vitamins** | Beef liver, nutritional yeast | Meat, eggs, dairy | Premix (all B vits) |
| **[Ch] Choline** | Beef liver, eggs | Chicken liver, meat | Choline bitartrate in premix |
| **[O3] EPA+DHA** | Sardines, mackerel | Salmon, fish oil | Nordic Naturals Omega-3 Pet |
| **[O6] Linoleic** | Sunflower/safflower oil | Hemp hearts/oil, canola | — |
| **[Fib] Fiber** | Sweet potato, pumpkin, lentils | Green beans, broccoli, oatmeal | Psyllium husk |
| **[Mn] Manganese** | Oatmeal, quinoa, brown rice | Spinach, peas, kale | MnSO₄ in premix |
| **[K] Potassium** | Sweet potato, spinach | Lentils, Brussels sprouts | KCl in premix |
| **[Mg] Magnesium** | Spinach, quinoa | Hemp hearts, oatmeal | MgO in premix |

***

## 11. Minimum Viable Recipe Template

The simplest recipe that can pass all constraint layer validation for an adult dog at maintenance (25 kg, BCS 5, no allergies):

| # | Ingredient | % Weight | Dimensions Covered |
|---|---|---|---|
| 1 | Ground beef 90% lean | 60% | [P][F][Zn][Fe][B][Ch] |
| 2 | Beef liver | 5% (at cap) | [VA][Cu][Se][B][Ch][Fe][Zn] |
| 3 | Sweet potato (baked) | 20% | [Fib][VA][K][Mn] |
| 4 | Broccoli (steamed) | 10% | [Fib][VK][VE][K] |
| 5 | Eggshell powder | ~1 tsp per 500g food | [Ca][CaPh] |
| 6 | Fish oil | Per weight chart | [O3] |
| + | Vitamin/mineral premix OR: kelp (1/4 tsp) + Vit E + Vit D | — | [I][VE][VD] + remaining micros |

**Likely remaining gaps even with optimal food selection:**
- Vitamin D (if no oily fish — most common gap)
- Iodine (if no kelp or iodized salt)
- Vitamin E (marginal without supplementation)
- Manganese (marginal — brown rice or oatmeal helps)

This is why SR-010 is a WARN, not BLOCK. The honest answer is: most home-cooked diets need a premix.[^2][^17]

**Total ingredient count:** 6 whole foods + 1–3 supplements = 7–9 items. This satisfies SR-004 (min 3 ingredients), SR-005 (max 12), SR-006 (animal protein), SR-002 (calcium source), SR-003 (organ meat), and all macro/micro targets with premix supplementation.

***

## 12. USDA FDC Integration Notes

All nutrient values in this document are approximate and should be replaced with exact USDA FDC API calls in production. Key FDC IDs:[^23]

| Ingredient | FDC ID |
|---|---|
| Ground beef 90% lean (cooked) | 174036 |
| Ground turkey 93% lean (cooked) | 171498 |
| Chicken thigh boneless (cooked) | 171477 |
| Beef liver (raw) | 169451 |
| Chicken liver (raw) | 171060 |
| Egg, whole, raw | 171287 |
| Sardines, canned in water | 175139 |
| Sweet potato, baked | 168482 |
| Broccoli, cooked | 170379 |
| Spinach, cooked | 168462 |
| Brown rice, cooked | 169704 |
| Canola oil | 172336 |
| Sunflower oil | 171028 |

**Production implementation should:**
1. Pull full nutrient profiles from FDC API for each ingredient
2. Apply cooking retention factors (USDA Nutrient Retention Factors table)
3. Apply moisture correction (raw → cooked weight change)
4. Sum across all ingredients and validate against constraint layer targets
5. Flag any dimension where whole-food total < NRC RA as `"supplementation_needed"`

---

## References

1. [Homemade Dog Food Ingredients: 3 Essential Foods for Dogs](https://www.whole-dog-journal.com/food/homemade-dog-food-ingredients-3-essential-foods-for-dogs/) - 3 Essential Ingredients for Homemade Dog Food: 1. Muscle meat 2. Raw meaty bones and offal (animal o...

2. [Analysis of recipes of home-prepared diets for dogs and cats published in Portuguese](https://pmc.ncbi.nlm.nih.gov/articles/PMC5672303/) - ...Nutritional Guidelines for Complete and Complementary Pet Food for Cats and Dogs (Fédération Euro...

3. [Balanced Homemade Dog Food - Stellanspice](https://stellanspice.com/balanced-dog-food/) - Begin by mixing together the ground beef (or chicken or turkey), eggs, kelp, ground ginger, hempseed...

4. [Nutrient Analysis of Raw United States Beef Offal Items](https://pmc.ncbi.nlm.nih.gov/articles/PMC11435426/) - Nutrient composition of beef offal was evaluated to expand availability of nutrient data for the fol...

5. [Beef liver: Nutrition, benefits, and risks - Medical News Today](https://www.medicalnewstoday.com/articles/beef-liver-nutrition) - 133 calories · 20.35 g of protein · 4.78 milligrams (mg) of iron · 16,814 international units of vit...

6. [Beef Liver Nutrients - Nutrivore](https://nutrivore.com/foods/beef-liver-nutrients/) - Beef Liver Provides 36% DV Zinc. Beef liver is an excellent source of zinc, providing 36% of the dai...

7. [Calcium in Homemade Dog Food - Whole Dog Journal](https://www.whole-dog-journal.com/food/calcium-in-homemade-dog-food/) - 1/4 tsp eggshell powder provides approximately 500 mg calcium. That amount is adequate to meet NRC g...

8. [Easy Homemade Dog Food Recipe | This Mess is Ours](https://thismessisours.com/easy-homemade-dog-food-recipe/) - My easy homemade dog food recipe combines lean ground sirloin, wholesome brown rice, fresh vegetable...

9. [6 custom recipes, created just for your Adult Dog - Balance It](https://balance.it/recipes/922396) - 6 custom recipes, created just for your Adult Dog. Here are a few options we think Adult Dog will lo...

10. [The Farmer's Dog Ingredients and Recipes](https://www.thefarmersdog.com/digest/farmers-dog-ingredients-recipes/) - The Farmer's Dog food is made from whole, human-grade meat, and vegetables like broccoli, carrots, a...

11. [Creating Dog Food Recipe Using BalanceIT - Tutorial (Part 1)](https://www.youtube.com/watch?v=79pMPcSzPkw) - ... dog-food-consultations/ BALANCEIT EZ RECIPE GENERATOR: https://secure.balanceit.com/ez/?rotator=...

12. [Nordic Naturals Omega-3 Liquid - Cat / Small Dog](https://www.onlynaturalpet.com/products/nordic-naturals-omega-3-liquid) - Nordic Naturals Omega-3 Supplements for Dogs and Cats are considered essential fatty acids (EPA and ...

13. [Omega-3 Pet | Fish Oil for Dogs and Cats - Nordic Naturals](https://www.nordic.com/products/omega-3-pet/) - Made from sustainably sourced wild-caught fish, Omega-3 Pet™ safely provides the omega-3s your dog o...

14. [Chef's Canine Complete | Vitamin & Trace Mineral Mix | 1lb Bag](https://mypetgrocer.com/products/chefs-canine-complete) - A veterinary nutritionist-formulated vitamin & mineral mix that ensures every homemade meal is 100% ...

15. [Balance It® Canine](https://shop.balance.it/products/balance-it-canine) - INGREDIENTS: Tricalcium Phosphate, Potassium Citrate, Powdered Cellulose, Choline Bitartrate, Magnes...

16. [Alternatives to Bones for the Raw-Fed Dog - Feed Real](https://www.feedreal.com/articles/alternatives-to-bones-for-the-rawfed-dog) - Bone meal naturally contains phosphorus, an essential nutrient for maintaining the correct calcium-t...

17. [Influence of number of ingredients, use of supplement and vegetarian or vegan preparation on the composition of homemade diets for dogs and cats](https://pmc.ncbi.nlm.nih.gov/articles/PMC8605502/) - BMC Vet Res. 2021 Nov 20;17:358. doi: 10.1186/s12917-021-03068-5

# Influence of number of ingredien...

18. [Vitamins For Homemade Dog Food - Azestfor](https://azestfor.com/products/vitamins-for-homemade-dog-food) - Vitamin Mineral Premix Powder to Make Fresh DIY Dog Food Nutritionally Complete and Balanced. Just m...

19. [HOLISTIC VET BLEND Canine Regular Premix Powder Nutritional ...](https://www.chewy.com/holistic-vet-blend-canine-regular/dp/1720646) - Nutritional supplement complements a variety of recipes—create customized meals for your dog by mixi...

20. [VITAMINERAL MIX (Cook-at-Home Kit) - Wynwood Dog Food Co.](https://wynwooddogfood.com/products/yellow-kit) - Vitamineral Mix for balanced homemade dog meals. Includes essential vitamins and minerals for comple...

21. [Sea Kelp Powder for Dogs and Cats | Seapet Animal Health MFG](https://seapet.com/sea-kelp-powder-for-dogs-and-cats/) - Rich in iodine, natural salts, and helpful minerals and vitamins, Sea Kelp Powder from SeaPet can su...

22. [Animal Essentials Sea-Vital | Organic Ocean Kelp + Trace Minerals](https://theorganicdogshop.com/products/animal-essentials-organic-ocean-kelp-trace-minerals) - Animal Essentials Organic Ocean Kelp provides your dog with a clean, sustainably harvested source of...

23. [USDA FoodData Central](https://fdc.nal.usda.gov) - USDA FoodData Central produces thorough resources for navigating and understanding nutritional info ...

