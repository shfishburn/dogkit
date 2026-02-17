// =============================================================================
// CANINE MEAL PLAN CONSTRAINT LAYER v1.0
// =============================================================================
// This file sits between the pipeline spec (Stages 1-4: user input → MER) and
// the recipe generation engine (Stage 8). It defines every constraint the
// generator must obey, in a format that can be:
//   1. Loaded as config into an LLM generation prompt
//   2. Used as validation rules in a post-generation check
//   3. Imported as TypeScript constants/functions in application code
//
// Architecture: mirrors RecipeAlchemy human constraint layer.
// All nutrient values per 1000 kcal ME unless otherwise noted.
// =============================================================================


// =============================================================================
// SECTION 1: TYPES
// =============================================================================

type BreedSize = "toy" | "small" | "medium" | "large" | "giant" | "mixed_unknown";
type LifeStage = "puppy_early" | "puppy_late" | "adult" | "senior";
type NeuterStatus = "intact" | "neutered";
type ActivityLevel = "sedentary" | "moderate" | "active" | "working";
type WeightGoal = "lose" | "maintain" | "gain";
type RecipeType = "complete_meal" | "supplemented_meal" | "treat";
type ValidationSeverity = "BLOCK" | "WARN" | "INFO";

interface DogProfile {
  dog_name: string;
  weight_kg: number;
  bcs: number;                         // 1-9
  age_months: number;
  breed_size: BreedSize;
  neuter_status: NeuterStatus;
  sex: "male" | "female";
  activity_level: ActivityLevel;
  expected_adult_weight_kg?: number;    // required if puppy
  reproductive_status?: "none" | "pregnant_early" | "pregnant_late" | "lactating";
  known_allergies: string[];
  health_conditions: string[];
  housing?: "indoor" | "outdoor" | "mixed";
}

interface NutrientTarget {
  nutrient: string;
  min_per_1000kcal: number;
  max_per_1000kcal: number | null;      // null = no upper limit
  unit: string;
  source: string;                       // citation key
}

interface ComputedTargets {
  daily_kcal: number;
  ideal_body_weight_kg: number;
  life_stage: LifeStage;
  weight_goal: WeightGoal;
  macros: NutrientTarget[];
  micros: NutrientTarget[];
  ratios: { name: string; min: number; max: number }[];
  meals_per_day: number;
}

interface RecipeConstraints {
  targets: ComputedTargets;
  forbidden_ingredients: string[];
  allergen_exclusions: string[];
  structural_rules: StructuralRule[];
  disclaimers: string[];
  vet_referral_triggered: boolean;
  vet_referral_reasons: string[];
}

interface StructuralRule {
  rule_id: string;
  description: string;
  severity: ValidationSeverity;
  check: string;                        // pseudocode or function reference
}

interface ValidationResult {
  passed: boolean;
  severity: ValidationSeverity;
  rule_id: string;
  message: string;
  actual_value?: number;
  required_value?: number;
}


// =============================================================================
// SECTION 2: CONSTANTS — TOXIC & FORBIDDEN INGREDIENTS
// =============================================================================

const TOXIC_INGREDIENTS_HARD_BLOCK: string[] = [
  // Allium family — hemolytic anemia (dose-dependent but NO safe threshold for recipes)
  "onion", "onion_powder", "onion_flakes", "shallot", "scallion",
  "garlic", "garlic_powder", "garlic_salt",
  "chives", "leeks",

  // Grapes/raisins — acute kidney failure (idiosyncratic, no safe dose identified)
  "grapes", "raisins", "currants", "sultanas",

  // Theobromine/caffeine — cardiac & CNS toxicity
  "chocolate", "cocoa", "cocoa_powder", "cacao", "cacao_nibs",
  "coffee", "coffee_grounds", "caffeine",

  // Sugar alcohols — insulin spike / hepatic necrosis
  "xylitol", "birch_sugar",

  // Other confirmed toxins
  "macadamia_nuts",        // weakness, vomiting, hyperthermia
  "alcohol", "ethanol", "wine", "beer", "spirits",
  "avocado_pit", "avocado_skin", "avocado_leaves",  // persin; flesh is debated, pit/skin/leaves are not
  "nutmeg",                // myristicin — tremors, seizures at moderate doses
  "cooked_bones",          // splintering → GI perforation (raw bones are structural rule, not hard block)
  "antifreeze", "ethylene_glycol",  // should never appear but defense-in-depth
];

// User-reported allergens — soft block (exclude from THIS dog's recipes only)
const KNOWN_ALLERGEN_PROTEINS: string[] = [
  "beef", "chicken", "dairy", "wheat", "egg",
  "lamb", "soy", "pork", "fish", "corn", "rice",
];

// Ingredients that are allowed but need quantity caps or warnings
const RESTRICTED_INGREDIENTS: { ingredient: string; max_pct_by_weight: number; reason: string }[] = [
  { ingredient: "liver",           max_pct_by_weight: 5.0,  reason: "Vitamin A toxicity risk (hypervitaminosis A) above ~5% of diet" },
  { ingredient: "chicken_liver",   max_pct_by_weight: 5.0,  reason: "Vitamin A toxicity risk" },
  { ingredient: "beef_liver",      max_pct_by_weight: 5.0,  reason: "Vitamin A toxicity risk" },
  { ingredient: "organ_meat_total",max_pct_by_weight: 10.0, reason: "Total organ meats should not exceed 10% of recipe weight" },
  { ingredient: "salt",            max_pct_by_weight: 0.3,  reason: "Sodium toxicity; NRC max 3.75 g Na/1000 kcal" },
  { ingredient: "bone_meal",       max_pct_by_weight: 2.0,  reason: "Calcium excess risk, especially large-breed puppies" },
  { ingredient: "eggshell_powder", max_pct_by_weight: 1.0,  reason: "~1800 mg Ca per tsp; easy to overdose" },
  { ingredient: "fish_oil",        max_pct_by_weight: 2.0,  reason: "Vitamin D toxicity and fat excess at high doses" },
  { ingredient: "cod_liver_oil",   max_pct_by_weight: 0.5,  reason: "Extremely high vitamin A + D per gram" },
];


// =============================================================================
// SECTION 3: NUTRIENT TARGET TABLES
// =============================================================================

// --- 3a: Macronutrient targets per 1000 kcal ME ---

const MACRO_TARGETS: Record<LifeStage, { protein_g: number; fat_g: number; fiber_g_min: number; fiber_g_max: number }> = {
  puppy_early: { protein_g: 62.5, fat_g: 21.3, fiber_g_min: 0,  fiber_g_max: 10 },
  puppy_late:  { protein_g: 50.0, fat_g: 21.3, fiber_g_min: 0,  fiber_g_max: 15 },
  adult:       { protein_g: 45.0, fat_g: 13.8, fiber_g_min: 5,  fiber_g_max: 25 },
  senior:      { protein_g: 62.5, fat_g: 13.8, fiber_g_min: 10, fiber_g_max: 30 },
  // senior protein = puppy-level, NOT reduced. Source: Purina Institute / NRC.
  // Only override for kidney_disease → 40.0 g protein (see health condition overrides).
};

// Weight-loss override: increase protein density to preserve lean mass during deficit
const WEIGHT_LOSS_PROTEIN_OVERRIDE_G_PER_1000KCAL = 75.0;
// Source: German et al. 2015; high-protein weight-loss diets (94 g/1000 kcal)
// preserve lean body mass significantly better than standard protein.
// We use 75 as a practical minimum for home-prepared.

// --- 3b: Micronutrient targets per 1000 kcal ME ---
// Source: NRC 2006 Recommended Allowance (RA) unless noted.

interface MicroTarget {
  nutrient: string;
  adult_min: number;
  puppy_min: number;
  senior_min: number;    // same as adult unless overridden
  max: number | null;
  unit: string;
}

const MICRO_TARGETS: MicroTarget[] = [
  // Minerals
  { nutrient: "calcium",      adult_min: 1.00,  puppy_min: 2.50,  senior_min: 1.00,  max: 4.50,  unit: "g" },
  { nutrient: "phosphorus",   adult_min: 0.75,  puppy_min: 2.25,  senior_min: 0.75,  max: 3.50,  unit: "g" },
  { nutrient: "sodium",       adult_min: 0.20,  puppy_min: 0.55,  senior_min: 0.20,  max: 3.75,  unit: "g" },
  { nutrient: "potassium",    adult_min: 1.00,  puppy_min: 1.10,  senior_min: 1.00,  max: null,  unit: "g" },
  { nutrient: "magnesium",    adult_min: 0.15,  puppy_min: 0.10,  senior_min: 0.15,  max: null,  unit: "g" },
  { nutrient: "iron",         adult_min: 7.50,  puppy_min: 22.0,  senior_min: 7.50,  max: null,  unit: "mg" },
  { nutrient: "zinc",         adult_min: 15.0,  puppy_min: 25.0,  senior_min: 15.0,  max: null,  unit: "mg" },
  { nutrient: "copper",       adult_min: 1.50,  puppy_min: 2.75,  senior_min: 1.50,  max: null,  unit: "mg" },
  { nutrient: "manganese",    adult_min: 1.20,  puppy_min: 1.40,  senior_min: 1.20,  max: null,  unit: "mg" },
  { nutrient: "selenium",     adult_min: 87.5,  puppy_min: 87.5,  senior_min: 87.5,  max: null,  unit: "mcg" },
  { nutrient: "iodine",       adult_min: 220,   puppy_min: 220,   senior_min: 220,   max: 2750,  unit: "mcg" },

  // Fat-soluble vitamins
  { nutrient: "vitamin_a",    adult_min: 379,   puppy_min: 379,   senior_min: 379,   max: 16000, unit: "RE" },
  { nutrient: "vitamin_d",    adult_min: 3.40,  puppy_min: 3.40,  senior_min: 3.40,  max: 20.0,  unit: "mcg" },
  { nutrient: "vitamin_e",    adult_min: 7.50,  puppy_min: 7.50,  senior_min: 12.0,  max: null,  unit: "mg" },
  { nutrient: "vitamin_k",    adult_min: 0.41,  puppy_min: 0.41,  senior_min: 0.41,  max: null,  unit: "mg" },

  // Water-soluble vitamins
  { nutrient: "thiamin_b1",   adult_min: 0.56,  puppy_min: 0.56,  senior_min: 0.56,  max: null,  unit: "mg" },
  { nutrient: "riboflavin_b2",adult_min: 1.30,  puppy_min: 1.30,  senior_min: 1.30,  max: null,  unit: "mg" },
  { nutrient: "niacin_b3",    adult_min: 4.25,  puppy_min: 4.25,  senior_min: 4.25,  max: null,  unit: "mg" },
  { nutrient: "pantothenic_acid_b5", adult_min: 3.75, puppy_min: 3.75, senior_min: 3.75, max: null, unit: "mg" },
  { nutrient: "pyridoxine_b6",adult_min: 0.375, puppy_min: 0.375, senior_min: 0.375, max: null,  unit: "mg" },
  { nutrient: "folic_acid",   adult_min: 0.068, puppy_min: 0.068, senior_min: 0.068, max: null,  unit: "mg" },
  { nutrient: "vitamin_b12",  adult_min: 8.75,  puppy_min: 8.75,  senior_min: 8.75,  max: null,  unit: "mcg" },
  { nutrient: "choline",      adult_min: 425,   puppy_min: 425,   senior_min: 425,   max: null,  unit: "mg" },

  // Conditional: seniors & joint issues
  { nutrient: "epa_dha_omega3", adult_min: 0,   puppy_min: 0,     senior_min: 1.0,   max: 3.0,   unit: "g" },
  // Source: FEDIAF SAB 2017; Bauer 2011. Also apply if health_conditions includes "joint_issues".
];

// --- 3c: Ratio constraints ---

interface RatioConstraint {
  name: string;
  numerator: string;
  denominator: string;
  min_ratio: number;
  max_ratio: number;
  life_stages: LifeStage[];
  note: string;
}

const RATIO_CONSTRAINTS: RatioConstraint[] = [
  {
    name: "ca_p_ratio_adult",
    numerator: "calcium",
    denominator: "phosphorus",
    min_ratio: 1.0,
    max_ratio: 2.0,
    life_stages: ["adult", "senior"],
    note: "NRC 2006. Ca:P outside this range impairs mineral absorption."
  },
  {
    name: "ca_p_ratio_puppy",
    numerator: "calcium",
    denominator: "phosphorus",
    min_ratio: 1.0,
    max_ratio: 1.6,
    life_stages: ["puppy_early", "puppy_late"],
    note: "NRC 2006. Tighter range for growth; excess Ca in large breeds → HOD/OCD risk."
  },
  {
    name: "omega6_omega3_ratio",
    numerator: "omega_6",
    denominator: "omega_3",
    min_ratio: 2.0,
    max_ratio: 10.0,
    life_stages: ["adult", "senior", "puppy_early", "puppy_late"],
    note: "General guidance; no strict NRC mandate but widely accepted clinical range."
  },
];


// =============================================================================
// SECTION 4: HEALTH CONDITION OVERRIDES
// =============================================================================

interface HealthOverride {
  condition: string;
  overrides: Partial<Record<string, number>>;     // nutrient → new min or max
  notes: string;
  vet_referral_required: boolean;
}

const HEALTH_OVERRIDES: HealthOverride[] = [
  {
    condition: "kidney_disease",
    overrides: {
      "protein_g_max_per_1000kcal": 40.0,          // restrict protein
      "phosphorus_max_per_1000kcal": 1.0,           // restrict phosphorus
      "sodium_max_per_1000kcal": 0.30,              // restrict sodium
    },
    notes: "Protein and phosphorus restriction for CKD. IRIS staging determines severity. This is a FLOOR — actual targets require vet input.",
    vet_referral_required: true,
  },
  {
    condition: "pancreatitis",
    overrides: {
      "fat_g_max_per_1000kcal": 25.0,              // low-fat diet
    },
    notes: "Fat restriction is primary intervention. Acute pancreatitis requires vet management, not a website.",
    vet_referral_required: true,
  },
  {
    condition: "diabetes",
    overrides: {
      "fiber_g_min_per_1000kcal": 15.0,            // high fiber for glycemic control
    },
    notes: "High-fiber, consistent-carb diet. Insulin dosing requires vet coordination.",
    vet_referral_required: true,
  },
  {
    condition: "joint_issues",
    overrides: {
      "epa_dha_omega3_min_per_1000kcal": 1.5,      // bump omega-3 target
    },
    notes: "EPA/DHA at anti-inflammatory doses. Not a substitute for veterinary orthopedic evaluation.",
    vet_referral_required: false,
  },
];

// Breed-specific overrides
const COPPER_SENSITIVE_BREEDS: string[] = [
  "bedlington_terrier",
  "doberman_pinscher",
  "west_highland_white_terrier",
  "skye_terrier",
  "labrador_retriever",    // emerging evidence of copper accumulation susceptibility
];
// If breed matches → cap copper at 1.0 mg / 1000 kcal + flag INFO


// =============================================================================
// SECTION 5: STRUCTURAL RECIPE RULES
// =============================================================================

const STRUCTURAL_RULES: StructuralRule[] = [
  {
    rule_id: "SR-001",
    description: "No single ingredient may exceed 50% of total recipe weight",
    severity: "BLOCK",
    check: "max(ingredient_weights) / sum(ingredient_weights) <= 0.50",
  },
  {
    rule_id: "SR-002",
    description: "Recipe must include at least one calcium source",
    severity: "BLOCK",
    check: "ingredients intersect ['bone_meal','eggshell_powder','calcium_carbonate','raw_meaty_bones','sardines_with_bones','dairy'] is not empty",
  },
  {
    rule_id: "SR-003",
    description: "Recipe must include at least one organ meat OR a vitamin/mineral premix supplement",
    severity: "BLOCK",
    check: "ingredients intersect ['liver','kidney','heart','spleen','brain','vitamin_mineral_premix'] is not empty",
  },
  {
    rule_id: "SR-004",
    description: "Minimum 3 distinct ingredients (excluding supplements)",
    severity: "BLOCK",
    check: "count(non_supplement_ingredients) >= 3",
  },
  {
    rule_id: "SR-005",
    description: "Maximum 12 ingredients per recipe (practical for home cooking)",
    severity: "WARN",
    check: "count(all_ingredients) <= 12",
  },
  {
    rule_id: "SR-006",
    description: "At least one animal protein source required",
    severity: "BLOCK",
    check: "ingredients intersect ANIMAL_PROTEINS is not empty",
    // Dogs can survive on plant-based diets but this platform targets evidence-based
    // whole-food feeding; plant-only is out of scope and requires specialist formulation.
  },
  {
    rule_id: "SR-007",
    description: "Total fat must not exceed 50% of calories (even for high-energy recipes)",
    severity: "BLOCK",
    check: "(fat_g * 9) / total_kcal <= 0.50",
  },
  {
    rule_id: "SR-008",
    description: "Restricted ingredients must not exceed their weight cap",
    severity: "BLOCK",
    check: "for each restricted_ingredient: (ingredient_weight / total_weight * 100) <= max_pct_by_weight",
  },
  {
    rule_id: "SR-009",
    description: "Large/giant breed puppies: calcium must not exceed 2.5 g / 1000 kcal",
    severity: "BLOCK",
    check: "if breed_size in ['large','giant'] and life_stage starts with 'puppy': calcium <= 2.5 g/1000kcal",
  },
  {
    rule_id: "SR-010",
    description: "Every tracked micronutrient must meet >= 100% of NRC RA when summed across all daily meals",
    severity: "WARN",
    check: "for each micro in MICRO_TARGETS: daily_total >= micro.min_per_1000kcal * (daily_kcal / 1000)",
    // WARN not BLOCK: if a micro falls short, recipe is tagged "supplementation_needed"
    // and the specific gap is listed in the output. This is honest — most home recipes
    // can't hit every micro without a supplement, and we say so explicitly.
  },
  {
    rule_id: "SR-011",
    description: "Ca:P ratio must be within life-stage-specific bounds",
    severity: "BLOCK",
    check: "calcium / phosphorus >= ratio_min AND calcium / phosphorus <= ratio_max",
  },
  {
    rule_id: "SR-012",
    description: "No toxic ingredient may appear in any recipe at any quantity",
    severity: "BLOCK",
    check: "ingredients intersect TOXIC_INGREDIENTS_HARD_BLOCK is empty",
  },
  {
    rule_id: "SR-013",
    description: "User allergen exclusions must be respected",
    severity: "BLOCK",
    check: "no ingredient maps to any protein in known_allergies[]",
  },
  {
    rule_id: "SR-014",
    description: "Meal weight should be reasonable: 20-60 g per kg IBW per day (split across meals)",
    severity: "WARN",
    check: "total_daily_food_g / ideal_body_weight_kg between 20 and 60",
    // This catches recipes that are implausibly calorie-dense or calorie-dilute.
  },
];


// =============================================================================
// SECTION 6: VET REFERRAL TRIGGERS
// =============================================================================

function checkVetReferral(profile: DogProfile): { triggered: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (profile.bcs <= 2) {
    reasons.push("BCS ≤ 2: severe underweight. Veterinary examination recommended before dietary changes.");
  }
  if (profile.bcs >= 8) {
    reasons.push("BCS ≥ 8: clinically obese. Veterinary-supervised weight loss program recommended.");
  }
  if (profile.age_months < 4) {
    reasons.push("Puppy under 4 months: critical growth phase. Veterinary nutritional guidance strongly recommended.");
  }
  if (profile.reproductive_status === "lactating") {
    reasons.push("Lactating: energy needs vary 3-6x RER based on litter size. Requires veterinary calculation.");
  }
  if (profile.health_conditions.some(c => c !== "none")) {
    for (const condition of profile.health_conditions.filter(c => c !== "none")) {
      const override = HEALTH_OVERRIDES.find(h => h.condition === condition);
      if (override?.vet_referral_required) {
        reasons.push(`Health condition "${condition}": ${override.notes}`);
      }
    }
  }
  if (COPPER_SENSITIVE_BREEDS.includes(profile.breed_size)) {
    // Note: in production, breed_size would be resolved to actual breed string
    reasons.push("Breed with copper storage susceptibility. Consider copper-restricted formulation with vet input.");
  }

  return { triggered: reasons.length > 0, reasons };
}


// =============================================================================
// SECTION 7: DISCLAIMER TEMPLATES
// =============================================================================

const DISCLAIMERS = {
  // Always shown on every meal plan
  standard: `This meal plan is formulated to meet NRC 2006 Recommended Allowances for the indicated life stage. It is not a substitute for veterinary nutritional consultation. Dogs with medical conditions, pregnant or lactating dogs, and puppies under 4 months require professional dietary guidance.`,

  // Shown when SR-010 triggers (micro gap detected)
  supplementation_needed: (gaps: string[]) =>
    `This recipe does not fully meet NRC Recommended Allowances for: ${gaps.join(", ")}. A canine vitamin/mineral supplement is recommended to fill these gaps. Consult your veterinarian for supplement recommendations.`,

  // Shown when any health condition is selected
  health_condition: `You indicated a health condition. The nutrient adjustments applied here are general guidelines only. Your dog's specific condition, medications, and bloodwork results require veterinary oversight to determine appropriate dietary targets.`,

  // Never claim these
  prohibited_claims: [
    "vet approved",
    "veterinarian approved",
    "complete and balanced",     // AAFCO regulatory term — requires feeding trials
    "clinically proven",
    "guaranteed",
    "cures", "treats", "prevents",  // FDA/FTC disease claims
  ],

  // Permitted claims
  permitted_claims: [
    "Formulated to meet NRC 2006 Recommended Allowances for [life_stage] dogs",
    "Nutrient targets based on peer-reviewed veterinary nutrition research",
    "Calorie target calculated using validated allometric energy equations",
  ],
};


// =============================================================================
// SECTION 8: MASTER CONSTRAINT BUILDER
// =============================================================================
// This is the function the recipe generation engine calls.
// It takes a DogProfile + computed energy targets and returns the full
// constraint object that governs recipe generation and validation.

function buildRecipeConstraints(
  profile: DogProfile,
  daily_kcal: number,
  ideal_body_weight_kg: number,
  life_stage: LifeStage,
  weight_goal: WeightGoal,
): RecipeConstraints {

  // 1. Resolve macro targets
  const baseMacros = MACRO_TARGETS[life_stage];
  let protein_min = baseMacros.protein_g;

  // Weight-loss protein boost
  if (weight_goal === "lose") {
    protein_min = Math.max(protein_min, WEIGHT_LOSS_PROTEIN_OVERRIDE_G_PER_1000KCAL);
  }

  // Health condition overrides
  let protein_max: number | null = null;
  let fat_max: number | null = null;
  const applied_overrides: string[] = [];

  for (const condition of profile.health_conditions) {
    const override = HEALTH_OVERRIDES.find(h => h.condition === condition);
    if (override) {
      if (override.overrides["protein_g_max_per_1000kcal"]) {
        protein_max = override.overrides["protein_g_max_per_1000kcal"];
        protein_min = Math.min(protein_min, protein_max);  // can't have min > max
      }
      if (override.overrides["fat_g_max_per_1000kcal"]) {
        fat_max = override.overrides["fat_g_max_per_1000kcal"];
      }
      applied_overrides.push(condition);
    }
  }

  const macros: NutrientTarget[] = [
    { nutrient: "protein",  min_per_1000kcal: protein_min, max_per_1000kcal: protein_max, unit: "g", source: "NRC 2006 RA" },
    { nutrient: "fat",      min_per_1000kcal: baseMacros.fat_g, max_per_1000kcal: fat_max, unit: "g", source: "NRC 2006 RA" },
    { nutrient: "fiber",    min_per_1000kcal: baseMacros.fiber_g_min, max_per_1000kcal: baseMacros.fiber_g_max, unit: "g", source: "FEDIAF 2024" },
  ];

  // 2. Resolve micro targets for this life stage
  const micros: NutrientTarget[] = MICRO_TARGETS.map(m => {
    let min_val: number;
    if (life_stage.startsWith("puppy")) {
      min_val = m.puppy_min;
    } else if (life_stage === "senior") {
      min_val = m.senior_min;
    } else {
      min_val = m.adult_min;
    }

    // Health condition micro overrides
    for (const condition of profile.health_conditions) {
      const override = HEALTH_OVERRIDES.find(h => h.condition === condition);
      if (override) {
        const maxKey = `${m.nutrient}_max_per_1000kcal`;
        const minKey = `${m.nutrient}_min_per_1000kcal`;
        if (override.overrides[maxKey]) {
          // Condition imposes a tighter max
          return { nutrient: m.nutrient, min_per_1000kcal: min_val, max_per_1000kcal: override.overrides[maxKey], unit: m.unit, source: `NRC 2006 + ${condition} override` };
        }
        if (override.overrides[minKey]) {
          min_val = Math.max(min_val, override.overrides[minKey]!);
        }
      }
    }

    return { nutrient: m.nutrient, min_per_1000kcal: min_val, max_per_1000kcal: m.max, unit: m.unit, source: "NRC 2006 RA" };
  });

  // 3. Resolve ratio constraints for this life stage
  const ratios = RATIO_CONSTRAINTS
    .filter(r => r.life_stages.includes(life_stage))
    .map(r => ({ name: r.name, min: r.min_ratio, max: r.max_ratio }));

  // 4. Build forbidden list
  const forbidden = [...TOXIC_INGREDIENTS_HARD_BLOCK];
  const allergens = profile.known_allergies.filter(a => KNOWN_ALLERGEN_PROTEINS.includes(a));

  // 5. Determine meals per day
  let meals_per_day = 2;
  if (life_stage === "puppy_early") meals_per_day = 4;
  else if (life_stage === "puppy_late") meals_per_day = 3;

  // 6. Check vet referral
  const vetCheck = checkVetReferral(profile);

  // 7. Assemble
  return {
    targets: {
      daily_kcal,
      ideal_body_weight_kg,
      life_stage,
      weight_goal,
      macros,
      micros,
      ratios,
      meals_per_day,
    },
    forbidden_ingredients: forbidden,
    allergen_exclusions: allergens,
    structural_rules: STRUCTURAL_RULES,
    disclaimers: [
      DISCLAIMERS.standard,
      ...(vetCheck.triggered ? [DISCLAIMERS.health_condition] : []),
    ],
    vet_referral_triggered: vetCheck.triggered,
    vet_referral_reasons: vetCheck.reasons,
  };
}


// =============================================================================
// SECTION 9: POST-GENERATION VALIDATOR
// =============================================================================
// After a recipe is generated, run this to produce a validation report.
// Returns an array of ValidationResult. If any severity === "BLOCK", reject.

function validateRecipe(
  recipe: { ingredients: { name: string; weight_g: number; nutrients: Record<string, number> }[]; total_kcal: number },
  constraints: RecipeConstraints,
): ValidationResult[] {
  const results: ValidationResult[] = [];
  const total_weight = recipe.ingredients.reduce((sum, i) => sum + i.weight_g, 0);
  const kcal_factor = recipe.total_kcal / 1000;

  // Check SR-012: toxic ingredients
  for (const ing of recipe.ingredients) {
    if (constraints.forbidden_ingredients.includes(ing.name)) {
      results.push({
        passed: false,
        severity: "BLOCK",
        rule_id: "SR-012",
        message: `Toxic ingredient "${ing.name}" found in recipe. REJECTED.`,
      });
    }
  }

  // Check SR-013: allergen exclusions
  for (const ing of recipe.ingredients) {
    for (const allergen of constraints.allergen_exclusions) {
      if (ing.name.includes(allergen)) {
        results.push({
          passed: false,
          severity: "BLOCK",
          rule_id: "SR-013",
          message: `Allergen "${allergen}" detected in ingredient "${ing.name}". REJECTED.`,
        });
      }
    }
  }

  // Check SR-001: no single ingredient > 50%
  for (const ing of recipe.ingredients) {
    const pct = (ing.weight_g / total_weight) * 100;
    if (pct > 50) {
      results.push({
        passed: false,
        severity: "BLOCK",
        rule_id: "SR-001",
        message: `"${ing.name}" is ${pct.toFixed(1)}% of recipe (max 50%).`,
        actual_value: pct,
        required_value: 50,
      });
    }
  }

  // Check SR-008: restricted ingredient caps
  for (const restriction of RESTRICTED_INGREDIENTS) {
    const matched = recipe.ingredients.filter(i => i.name.includes(restriction.ingredient));
    const total_restricted_g = matched.reduce((sum, i) => sum + i.weight_g, 0);
    const pct = (total_restricted_g / total_weight) * 100;
    if (pct > restriction.max_pct_by_weight) {
      results.push({
        passed: false,
        severity: "BLOCK",
        rule_id: "SR-008",
        message: `"${restriction.ingredient}" at ${pct.toFixed(1)}% exceeds cap of ${restriction.max_pct_by_weight}%. Reason: ${restriction.reason}`,
        actual_value: pct,
        required_value: restriction.max_pct_by_weight,
      });
    }
  }

  // Check macro targets
  for (const macro of constraints.targets.macros) {
    const total_nutrient = recipe.ingredients.reduce((sum, i) => sum + (i.nutrients[macro.nutrient] || 0), 0);
    const per_1000 = total_nutrient / kcal_factor;
    if (per_1000 < macro.min_per_1000kcal) {
      results.push({
        passed: false,
        severity: "BLOCK",
        rule_id: "MACRO-MIN",
        message: `${macro.nutrient}: ${per_1000.toFixed(1)} ${macro.unit}/1000kcal < minimum ${macro.min_per_1000kcal}`,
        actual_value: per_1000,
        required_value: macro.min_per_1000kcal,
      });
    }
    if (macro.max_per_1000kcal !== null && per_1000 > macro.max_per_1000kcal) {
      results.push({
        passed: false,
        severity: "BLOCK",
        rule_id: "MACRO-MAX",
        message: `${macro.nutrient}: ${per_1000.toFixed(1)} ${macro.unit}/1000kcal > maximum ${macro.max_per_1000kcal}`,
        actual_value: per_1000,
        required_value: macro.max_per_1000kcal,
      });
    }
  }

  // Check micro targets (WARN, not BLOCK)
  const micro_gaps: string[] = [];
  for (const micro of constraints.targets.micros) {
    const total_nutrient = recipe.ingredients.reduce((sum, i) => sum + (i.nutrients[micro.nutrient] || 0), 0);
    const per_1000 = total_nutrient / kcal_factor;
    if (per_1000 < micro.min_per_1000kcal) {
      micro_gaps.push(micro.nutrient);
      results.push({
        passed: false,
        severity: "WARN",
        rule_id: "SR-010",
        message: `${micro.nutrient}: ${per_1000.toFixed(2)} ${micro.unit}/1000kcal < NRC RA of ${micro.min_per_1000kcal}`,
        actual_value: per_1000,
        required_value: micro.min_per_1000kcal,
      });
    }
    if (micro.max_per_1000kcal !== null && per_1000 > micro.max_per_1000kcal) {
      results.push({
        passed: false,
        severity: "BLOCK",
        rule_id: "MICRO-MAX",
        message: `${micro.nutrient}: ${per_1000.toFixed(2)} ${micro.unit}/1000kcal EXCEEDS safe upper limit of ${micro.max_per_1000kcal}. Toxicity risk.`,
        actual_value: per_1000,
        required_value: micro.max_per_1000kcal,
      });
    }
  }

  // Check ratio constraints
  for (const ratio of constraints.targets.ratios) {
    const rc = RATIO_CONSTRAINTS.find(r => r.name === ratio.name);
    if (!rc) continue;
    const num = recipe.ingredients.reduce((sum, i) => sum + (i.nutrients[rc.numerator] || 0), 0);
    const den = recipe.ingredients.reduce((sum, i) => sum + (i.nutrients[rc.denominator] || 0), 0);
    if (den > 0) {
      const actual_ratio = num / den;
      if (actual_ratio < ratio.min || actual_ratio > ratio.max) {
        results.push({
          passed: false,
          severity: "BLOCK",
          rule_id: "SR-011",
          message: `${rc.name}: ratio ${actual_ratio.toFixed(2)}:1 outside required range ${ratio.min}:1 – ${ratio.max}:1`,
          actual_value: actual_ratio,
          required_value: ratio.min,
        });
      }
    }
  }

  // If micro gaps exist, add supplementation disclaimer
  if (micro_gaps.length > 0) {
    // This doesn't block the recipe but tags it
    results.push({
      passed: true,
      severity: "INFO",
      rule_id: "SUPPLEMENT-FLAG",
      message: DISCLAIMERS.supplementation_needed(micro_gaps),
    });
  }

  return results;
}


// =============================================================================
// SECTION 10: LLM PROMPT CONSTRAINT INJECTION
// =============================================================================
// When using an LLM to generate recipes, this function serializes the constraints
// into a system-prompt-compatible format that the model must obey.

function buildGenerationPromptConstraints(constraints: RecipeConstraints): string {
  const c = constraints;
  const t = c.targets;

  return `
<canine-recipe-constraints>
  <energy>
    <daily_kcal_target>${t.daily_kcal}</daily_kcal_target>
    <meals_per_day>${t.meals_per_day}</meals_per_day>
    <kcal_per_meal>${Math.round(t.daily_kcal / t.meals_per_day)}</kcal_per_meal>
  </energy>

  <context>
    <life_stage>${t.life_stage}</life_stage>
    <ideal_body_weight_kg>${t.ideal_body_weight_kg.toFixed(1)}</ideal_body_weight_kg>
    <weight_goal>${t.weight_goal}</weight_goal>
  </context>

  <macronutrient_targets unit="per 1000 kcal ME">
    ${t.macros.map(m =>
      `<${m.nutrient} min="${m.min_per_1000kcal}" max="${m.max_per_1000kcal ?? 'none'}" unit="${m.unit}" />`
    ).join("\n    ")}
  </macronutrient_targets>

  <micronutrient_targets unit="per 1000 kcal ME">
    ${t.micros.map(m =>
      `<${m.nutrient} min="${m.min_per_1000kcal}" max="${m.max_per_1000kcal ?? 'none'}" unit="${m.unit}" />`
    ).join("\n    ")}
  </micronutrient_targets>

  <ratio_constraints>
    ${t.ratios.map(r =>
      `<ratio name="${r.name}" min="${r.min}" max="${r.max}" />`
    ).join("\n    ")}
  </ratio_constraints>

  <forbidden_ingredients>
    ${c.forbidden_ingredients.map(i => `<ingredient>${i}</ingredient>`).join("\n    ")}
  </forbidden_ingredients>

  <allergen_exclusions>
    ${c.allergen_exclusions.map(a => `<allergen>${a}</allergen>`).join("\n    ")}
  </allergen_exclusions>

  <structural_rules>
    - No single ingredient may exceed 50% of recipe weight.
    - Must include at least one calcium source (bone meal, eggshell powder, sardines w/ bones, or calcium supplement).
    - Must include at least one organ meat OR vitamin/mineral premix.
    - Minimum 3 distinct whole-food ingredients.
    - Maximum 12 ingredients total.
    - Must include at least one animal protein source.
    - Liver/organ meats capped at 5%/10% of recipe weight respectively.
    - Output exact gram weights for every ingredient.
    - Output a nutrition panel with: kcal, protein_g, fat_g, fiber_g, calcium_g, phosphorus_g, ca_p_ratio, and all tracked micronutrients.
    - If any micronutrient cannot meet the minimum target, explicitly state which ones and recommend supplementation.
  </structural_rules>

  <output_format>
    Return a JSON object with this structure:
    {
      "recipe_name": "string",
      "servings_per_day": number,
      "ingredients": [
        { "name": "string", "weight_g": number, "notes": "string (optional: e.g. 'raw', 'cooked', 'ground')" }
      ],
      "prep_instructions": ["string"],
      "nutrition_per_serving": {
        "kcal": number,
        "protein_g": number,
        "fat_g": number,
        "fiber_g": number,
        "calcium_g": number,
        "phosphorus_g": number,
        "ca_p_ratio": number,
        // ... all tracked micros
      },
      "nutrition_daily_total": { /* same structure */ },
      "pct_nrc_ra_met": { /* nutrient: percentage */ },
      "completeness": "complete" | "supplementation_needed",
      "gaps": ["nutrient names where < 100% NRC RA"],
      "supplement_recommendations": ["string"]
    }
  </output_format>
</canine-recipe-constraints>`;
}
