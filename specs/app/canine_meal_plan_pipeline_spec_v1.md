
# Canine Meal Plan Pipeline Specification v1.0
# Consumer Website — User-Facing Nutrition Recommendation Engine
# 
# Context: Extension of RecipeAlchemy platform for dog nutrition.
# This spec defines the data pipeline from user inputs → nutrient targets → meal plan output.
# All formulas sourced from NRC 2006, FEDIAF 2024, and post-2006 clinical validation studies.

================================================================================
STAGE 1: USER INPUT COLLECTION
================================================================================

Required Inputs (must collect):
─────────────────────────────────────────────────────────────
  Field                  Type        Constraints / Notes
─────────────────────────────────────────────────────────────
  dog_name               string      Display only
  weight_kg              float       0.5–100 kg (convert from lbs if needed)
  weight_unit            enum        "kg" | "lbs"
  body_condition_score   int         1–9 (Laflamme 9-point scale)
  age_months             int         1–240 (derive from user entering years+months)
  breed_or_size_class    enum        "toy" | "small" | "medium" | "large" | "giant" | "mixed_unknown"
  neuter_status          enum        "intact" | "neutered"
  sex                    enum        "male" | "female"
  activity_level         enum        "sedentary" | "moderate" | "active" | "working"

Optional Inputs (improve accuracy):
─────────────────────────────────────────────────────────────
  expected_adult_weight_kg  float    Required if age < 12 months (puppy); user estimate or breed lookup
  reproductive_status       enum     "none" | "pregnant_early" | "pregnant_late" | "lactating"
  known_allergies           string[] From: ["beef","chicken","dairy","wheat","egg","lamb","soy","pork","fish","corn"]
  health_conditions         string[] From: ["none","kidney_disease","diabetes","pancreatitis","joint_issues"]
  housing                   enum     "indoor" | "outdoor" | "mixed"

UX Notes:
  - BCS: Present the WSAVA 9-point visual chart with silhouette images + 
    palpation instructions. Link to WSAVA PDF.
  - Breed: Offer autocomplete from AKC breed list → auto-map to size class.
    If "mixed/unknown", ask user to estimate adult weight range.
  - Activity: Define each level clearly:
      sedentary  = <30 min exercise/day, mostly indoor
      moderate   = 30–60 min walks/play per day  
      active     = 1–3 hr vigorous exercise per day
      working    = 3+ hr sustained physical work (herding, sled, SAR)


================================================================================
STAGE 2: LIFE STAGE CLASSIFICATION
================================================================================

Function: classifyLifeStage(age_months, breed_size_class) → LifeStage

  LifeStage enum: "puppy_early" | "puppy_late" | "adult" | "senior"

  Rules (breed-size-adjusted):
  ───────────────────────────────────────────────────────────
  Breed Size     puppy_early     puppy_late    adult         senior
  ───────────────────────────────────────────────────────────
  toy/small      < 4 mo          4–10 mo       10 mo–11 yr   ≥ 12 yr
  medium         < 4 mo          4–12 mo       12 mo–9 yr    ≥ 10 yr
  large          < 4 mo          4–15 mo       15 mo–7 yr    ≥ 8 yr
  giant          < 4 mo          4–18 mo       18 mo–5 yr    ≥ 6 yr
  ───────────────────────────────────────────────────────────

  Source: FEDIAF 2024 growth curves + aging meta-analysis (Creevy et al. 2022)


================================================================================
STAGE 3: IDEAL BODY WEIGHT DERIVATION
================================================================================

Function: calcIdealBodyWeight(current_weight_kg, bcs) → float (kg)

  Formula:
    IBW = current_weight_kg × (100 / (100 + ((bcs - 5) × 10)))

  Each BCS unit above 5 ≈ 10% excess body weight.
  Each BCS unit below 5 ≈ 10% underweight.

  Examples:
    30 kg dog at BCS 7 → IBW = 30 × (100/120) = 25.0 kg
    30 kg dog at BCS 5 → IBW = 30.0 kg (no adjustment)
    30 kg dog at BCS 3 → IBW = 30 × (100/80)  = 37.5 kg
        ↑ underweight dog: IBW is HIGHER than current weight

  Edge case: BCS 1–2 → flag for veterinary referral, do not generate meal plan.
  Edge case: BCS 9   → flag warning + generate plan targeting IBW.

  Source: Laflamme (1997) DEXA validation; German et al. (2006)


================================================================================
STAGE 4: ENERGY REQUIREMENT CALCULATION
================================================================================

Step 4a: Resting Energy Requirement (RER)
──────────────────────────────────────────
  RER = 70 × IBW^0.75   (kcal/day)

  Use IBW (not current weight) for all calculations.
  The linear shortcut (30 × BW + 70) is only valid for 2–45 kg; 
  DO NOT USE IT — the allometric formula works for all sizes.


Step 4b: Maintenance Energy Requirement (MER)
──────────────────────────────────────────────
  MER = RER × life_stage_factor × neuter_factor × activity_factor × weight_goal_factor

  Life Stage Factors (base multiplier on RER):
  ─────────────────────────────────────────────
  Life Stage          Factor    Source
  ─────────────────────────────────────────────
  puppy_early         3.0       NRC 2006
  puppy_late          2.0       NRC 2006
  adult               1.6       NRC 2006 (moderate)
  senior              1.4       FEDIAF 2024 / Laflamme 2005
  pregnant_early       1.6      NRC 2006 (= adult maint)
  pregnant_late        2.0      NRC 2006 (wk 5–9)
  lactating            3.0–6.0  NRC 2006 (scales with litter size)

  Neuter Factor:
  ─────────────────────────────────────────────
  intact               1.0
  neutered             0.90      Marchi et al. 2025: ~7% reduction at ideal BCS;
                                 conservative 10% applied for safety margin.

  Activity Factor (multiplicative on base):
  ─────────────────────────────────────────────
  sedentary            0.85      Divol & Priymenko 2017
  moderate             1.00      (baseline)
  active               1.15      NRC 2006
  working              1.50      NRC 2006 (light work); 
                                 heavy work (sled dogs) = 2.0–6.0 but out of scope

  Weight Goal Factor:
  ─────────────────────────────────────────────
  If BCS 6–7 (overweight):   0.90   (10% deficit for gradual loss)
  If BCS 8–9 (obese):        0.80   (20% deficit; flag vet referral)
  If BCS 1–3 (underweight):  1.10   (10% surplus)
  If BCS 4–5 (ideal):        1.00   (maintenance)

  FINAL MER (kcal/day) = RER × Π(all factors)


Step 4c: Puppy Energy (alternative formula for puppies)
───────────────────────────────────────────────────────
  If life_stage in ["puppy_early", "puppy_late"]:

    p = current_weight_kg / expected_adult_weight_kg

    ME_puppy = 130 × current_weight_kg^0.75 × 3.2 × (e^(-0.87 × p) - 0.1)

    HOWEVER: NRC overestimates for small breeds by up to 60%.
    Apply breed-size correction:
      toy/small:   ME_puppy × 0.80
      medium:      ME_puppy × 0.90
      large:       ME_puppy × 1.00  (equation was derived from large breeds)
      giant:       ME_puppy × 1.00

    Source: Norfolk Terrier study (Brenten et al. 2021); Yorkshire Terrier study (Brenten et al. 2017)


================================================================================
STAGE 5: MACRONUTRIENT TARGETS
================================================================================

All targets expressed per 1000 kcal ME (nutrient density).
Multiply by (MER / 1000) to get absolute daily amounts.

Function: getMacroTargets(life_stage, bcs, age_months) → MacroTargets

  ─────────────────────────────────────────────────────────────────────
  Nutrient        puppy_early  puppy_late  adult_maint  senior
  ─────────────────────────────────────────────────────────────────────
  Protein (g)     62.5 min     50.0 min    45.0 min     62.5 min*
  Fat (g)         21.3 min     21.3 min    13.8 min     13.8 min
  Fiber (g)       —            —           ~10–20       ~10–20
  Carbs (g)       not required not req     not req      not req
  ─────────────────────────────────────────────────────────────────────

  * Senior protein is HIGHER than adult, not lower.
    Senior dogs need ≥ 50% more protein to maintain lean body mass.
    Source: Purina Institute (Wannemacher & McCoy 1966; Kealy et al. 2002).
    DO NOT restrict protein in healthy seniors.
    ONLY restrict if user selects health_condition = "kidney_disease" → 
      drop to 40.0 g/1000 kcal and flag vet referral.


================================================================================
STAGE 6: MICRONUTRIENT TARGETS
================================================================================

Expressed per 1000 kcal ME. Source: NRC 2006 Recommended Allowance (RA).

  ─────────────────────────────────────────────────────────────────────
  Nutrient          Adult RA    Puppy RA    Max (safe upper)   Unit
  ─────────────────────────────────────────────────────────────────────
  Calcium            1.00        2.50        4.50               g
  Phosphorus         0.75        2.25        3.50               g
  Ca:P ratio         1:1–2:1     1:1–1.6:1   —                  ratio
  Sodium             0.20        0.55        3.75               g
  Potassium          1.00        1.10        —                  g
  Iron               7.50        22.0        —                  mg
  Zinc               15.0        25.0        —                  mg
  Copper             1.50        2.75        —                  mg
  Manganese          1.20        1.40        —                  mg
  Selenium           87.5        87.5        —                  mcg
  Iodine             220         220         2750               mcg
  Vitamin A          379         379         16000              RE
  Vitamin D          3.40        3.40        20.0               mcg
  Vitamin E          7.50        7.50        —                  mg
  Thiamin (B1)       0.56        0.56        —                  mg
  Riboflavin (B2)    1.30        1.30        —                  mg
  Niacin (B3)        4.25        4.25        —                  mg
  Pyridoxine (B6)    0.375       0.375       —                  mg
  Folic Acid         0.068       0.068       —                  mg
  B12                8.75        8.75        —                  mcg
  Choline            425         425         —                  mg
  ─────────────────────────────────────────────────────────────────────

  Senior adjustments (apply on top of adult RA):
    EPA + DHA (omega-3): add target of 1.0–3.0 g / 1000 kcal
    Vitamin E: increase to 12.0 mg / 1000 kcal
    Source: FEDIAF SAB 2017; Bauer 2011

  Large/Giant breed puppy adjustment:
    Calcium: CAP at 2.5 g/1000 kcal (do NOT exceed)
    Ca:P ratio: strictly 1:1–1.5:1
    Source: Factorial Ca/P study (Mack et al. 2019)


================================================================================
STAGE 7: TOXIC / FORBIDDEN INGREDIENT ENFORCEMENT
================================================================================

HARD BLOCK — these never appear in any recipe, any quantity:
  ["onion", "garlic", "chives", "leeks",
   "grapes", "raisins", "currants",
   "chocolate", "cocoa", "caffeine",
   "xylitol", "erythritol",
   "macadamia_nuts",
   "alcohol",
   "avocado_skin_pit_leaves",
   "cooked_bones"]

SOFT BLOCK — user-specific allergens from input:
  Filter from known_allergies[] input.
  If user selects "beef" → exclude all beef-derived ingredients.

WARNING TIER — flag but allow (with disclaimer):
  ["raw_eggs", "raw_fish", "liver_high_qty"]
  Liver: cap at ≤5% of total recipe weight (vitamin A toxicity risk).


================================================================================
STAGE 8: MEAL PLAN GENERATION
================================================================================

Input to recipe engine:
{
  "daily_kcal_target":    MER,
  "meals_per_day":        2,              // default; puppies = 3–4
  "macro_targets_per_1000kcal": { ... },  // from Stage 5
  "micro_targets_per_1000kcal": { ... },  // from Stage 6
  "forbidden_ingredients": [ ... ],        // from Stage 7
  "allergen_exclusions":   [ ... ],        // from Stage 7
  "life_stage":            "...",
  "breed_size":            "...",
  "weight_goal":           "maintain" | "lose" | "gain"
}

Recipe constraints:
  - Each recipe must meet ≥ 100% of ALL micro RA targets when summed across daily meals.
  - Each recipe must meet ≥ 100% of macro minimums.
  - Ca:P ratio must be within specified range.
  - No single ingredient > 50% of recipe by weight (diversity).
  - Every recipe must include a calcium source (bone meal, eggshell powder, or supplement).
  - Every recipe must include an organ meat OR equivalent vitamin/mineral supplement.

Output per recipe:
  - Ingredient list with gram weights
  - Nutrition panel: kcal, protein, fat, fiber, Ca, P, Ca:P, all tracked micros
  - % of daily target met by this meal
  - Confidence flag: "complete" (meets all targets) | "supplementation_needed" (list gaps)
  - Prep instructions


================================================================================
STAGE 9: DISCLAIMERS & SAFETY RAILS
================================================================================

ALWAYS display:
  "This meal plan is generated using NRC 2006 and FEDIAF 2024 guidelines. 
   It is not a substitute for veterinary nutritional consultation. 
   Dogs with kidney disease, diabetes, pancreatitis, or other medical 
   conditions require veterinary-supervised diets."

AUTO-TRIGGER veterinary referral notice when:
  - BCS ≤ 2 or BCS ≥ 8
  - health_conditions != "none"
  - age_months < 4 (neonatal / early puppy)
  - reproductive_status = "lactating" (complex energy scaling)
  - User enters breed known for copper storage disease (Bedlington Terrier, 
    Doberman, West Highland White Terrier) → flag copper levels

DO NOT claim:
  - "vet approved" (unless actually reviewed by a board-certified veterinary nutritionist)
  - "complete and balanced" (this is an AAFCO regulatory term requiring feeding trials)

DO claim:
  - "Formulated to meet NRC 2006 Recommended Allowances for [life stage]"
  - "Nutrient targets based on peer-reviewed veterinary nutrition research"


================================================================================
PIPELINE SUMMARY (data flow)
================================================================================

  User Input
      │
      ▼
  [1] Classify Life Stage (age × breed size)
      │
      ▼
  [2] Calculate Ideal Body Weight (current weight × BCS correction)
      │
      ▼
  [3] Calculate RER (70 × IBW^0.75)
      │
      ▼
  [4] Calculate MER (RER × life_stage × neuter × activity × weight_goal)
      │     └─ Puppy override: use NRC growth equation with breed-size correction
      ▼
  [5] Derive nutrient targets (MER × nutrient density per 1000 kcal)
      │
      ▼
  [6] Apply forbidden/allergen filters
      │
      ▼
  [7] Generate recipe(s) meeting all constraints
      │
      ▼
  [8] Validate: check every micro/macro target ≥ 100% RA
      │     └─ If gaps → flag "supplementation_needed" + list specific nutrients
      ▼
  [9] Output: meal plan + nutrition panel + disclaimers

