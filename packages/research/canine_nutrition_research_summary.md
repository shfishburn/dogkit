---
title: "Canine Nutrition Science: Body Composition, Age, and Energy Algorithms"
version: "1.0.0"
status: "stable"
description: "Comprehensive research summary: RER, MER multipliers, macronutrient targets, micronutrient RAs. 47 peer-reviewed studies (2014-2025), NRC 2006, FEDIAF 2024."
category: "research"
tags: ["research", "nutrition", "rer", "mer", "nrc", "fediaf", "micronutrients"]
seeAlso:
  - id: "overview"
    title: "Product Overview"
  - id: "app/canine-meal-plan-pipeline-spec-v1"
    title: "Meal Plan Pipeline Spec"
  - id: "human/comparison"
    title: "Human vs. Canine Pipeline"
  - id: "ingredients/canine-ingredient-database"
    title: "Ingredient Database"
---
# Canine Nutrition Science: Body Composition, Age, and Energy Algorithms
> Comprehensive Research Summary with Formulas and Methodologies
> Compiled: February 2026
> Sources: NRC 2006, FEDIAF 2024, and 47 peer-reviewed studies (2014–2025)
> Purpose: Evidence base underpinning the Canine Meal Plan Pipeline Spec v1.0
> and Constraint Layer v1.0



## 1. ENERGY REQUIREMENT EQUATIONS


## 1.1 Resting Energy Requirement (RER)

The canine analog of human BMR. Derived from Kleiber's Law (1961), validated
across species from mice to elephants. The 0.75 exponent represents metabolic
body weight — accounting for the non-linear relationship between body size and
metabolic rate (surface-area-to-mass scaling).

  Formula:
    RER = 70 × BW^0.75    (kcal/day)

  Where:
    BW = body weight in kg (use Ideal Body Weight for overweight/underweight dogs)

  Notes:
    - The linear shortcut (30 × BW + 70) is only valid for dogs 2–45 kg and
      diverges significantly outside that range. DO NOT use it.
    - RER represents the energy cost of basic physiological functions at rest:
      respiration, circulation, cellular maintenance, thermoregulation.

  Source: NRC (2006) Nutrient Requirements of Dogs and Cats, Chapter 3.


## 1.2 Maintenance Energy Requirement (MER) — Standard Model

  Formula:
    MER = k × BW^0.75    (kcal/day)

  Where k varies by life stage, activity, and population:

  ┌──────────────────────────────────────┬───────────────────┬──────────────────┐
  │ Population / Life Stage              │ k (kcal/kg^0.75)  │ Source           │
  ├──────────────────────────────────────┼───────────────────┼──────────────────┤
  │ Puppy < 4 months                     │ 210 (3.0 × RER)   │ NRC 2006         │
  │ Puppy 4–12 months                    │ 140 (2.0 × RER)   │ NRC 2006         │
  │ Adult, inactive / neutered           │ 95                 │ NRC 2006         │
  │ Adult, moderate activity             │ 110                │ NRC 2006         │
  │ Adult, active (1–3 hr/day)           │ 125–130            │ NRC 2006         │
  │ Working dog (3–6 hr/day)             │ 150–175            │ NRC 2006         │
  │ Endurance sled dogs                  │ 860–1240           │ NRC 2006         │
  │ Senior (>7 yr, typical)              │ 80–95              │ FEDIAF 2024      │
  │ Obese-prone                          │ ≤ 90               │ Clinical guidance│
  │ Pregnant (weeks 1–4)                 │ 110 (= adult)      │ NRC 2006         │
  │ Pregnant (weeks 5–9)                 │ 140 (2.0 × RER)   │ NRC 2006         │
  │ Lactating (scales with litter size)  │ 210–420+           │ NRC 2006         │
  └──────────────────────────────────────┴───────────────────┴──────────────────┘

  Known limitations:
    - Derived substantially from kennel/laboratory dogs (Beagles, Labs, Great Danes).
    - Overestimates for typical companion dogs (see §1.3, §1.4).
    - Does not account for breed, neuter status, or BCS as independent variables.


## 1.3 Bermingham Meta-Analysis Model (2014)

A meta-analysis of 29 studies (n = 713 adult dogs) found the global mean MER
was 142.8 ± 55.3 kcal/kg^0.75. However, when restricted to PET DOGS ONLY,
the best-fit allometric equation was fundamentally different:

  Formula:
    MER_pet = 62.5 × BW^0.93    (kcal/day, adjusted R² = 0.79)

  Key finding: the exponent shifts from 0.75 to 0.93 in companion animals.
  This means:
    - For a 5 kg dog:  NRC (95 × 5^0.75 = 317 kcal) vs Bermingham (62.5 × 5^0.93 = 283 kcal) → 11% lower
    - For a 40 kg dog: NRC (95 × 40^0.75 = 1510 kcal) vs Bermingham (62.5 × 40^0.93 = 2015 kcal) → 33% higher
    - Crossover point is around 15–20 kg

  Interpretation: the traditional 0.75 exponent may underestimate small-dog
  needs and overestimate large-dog needs in typical household settings.

  Source: Bermingham EN et al. (2014). Energy requirements of adult dogs:
  a meta-analysis. PLoS ONE 9(10):e109681.


## 1.4 Divol & Priymenko Age-Corrected Model (2017)

Studied 319 client-owned pet dogs in France. Developed a model that explicitly
includes age as a continuous variable:

  Formula:
    MER = 128 × BW^0.730 × age^-0.050    (kcal/day, R² = 0.816)

  Where:
    BW = body weight in kg
    age = age in years (continuous)

  Additional correction factors (multiplicative):
  ┌─────────────────────────────────┬────────────┐
  │ Factor                          │ Multiplier │
  ├─────────────────────────────────┼────────────┤
  │ Spayed female                   │ 0.85       │
  │ Intact or castrated male        │ 1.00       │
  │ Breed: Labrador / Golden        │ 0.88       │
  │ Breed: Belgian / Beauce Shep.   │ 1.09       │
  │ Breed: all others               │ 1.00       │
  │ Housing: outdoor (day + night)  │ 1.05       │
  │ Housing: indoor                 │ 1.00       │
  │ Temperament: active (>1 hr/day) │ 1.05       │
  │ Temperament: normal/calm        │ 1.00       │
  └─────────────────────────────────┴────────────┘

  Final MER = 128 × BW^0.730 × age^-0.050 × k_neuter × k_breed × k_housing × k_activity

  The age exponent (-0.050) means:
    - At age 1 yr: no reduction (age^0 = 1.0)
    - At age 5 yr: factor = 5^-0.050 = 0.922 → 7.8% reduction
    - At age 10 yr: factor = 10^-0.050 = 0.891 → 10.9% reduction
    - At age 15 yr: factor = 15^-0.050 = 0.871 → 12.9% reduction

  Failure to reduce intake with age → predicted weight gain of 5.6 kg/year
  at age 5, or 7.7 kg/year at age 10, for a 30 kg dog.

  Source: Divol L, Priymenko N (2017). A new model for evaluating maintenance
  energy requirements in dogs: allometric equation from 319 pet dogs.
  Journal of Nutritional Science 6:e53.


## 1.5 Marchi et al. Clinical MER Data (2025)

Retrospective study of 438 client-owned dogs seen at veterinary teaching
hospitals in Brazil. Key contribution: quantified the BCS × neuter status
interaction on actual MER.

  Population mean MER: 86.09 kcal/BW^0.75 (significantly lower than NRC's 95)

  MER by BCS and neuter status (kcal/kg^0.75 ± SE):
  ┌──────────────────┬──────────────────┬──────────────────┬────────────┐
  │ BCS Category     │ Intact Dogs      │ Neutered Dogs    │ Delta      │
  ├──────────────────┼──────────────────┼──────────────────┼────────────┤
  │ 4–5 (ideal)      │ 103.42 ± 2.21    │ 96.70 ± 1.85     │ −6.5%      │
  │ 6–7 (overweight) │ 81.34 ± 2.92     │ 82.78 ± 1.65     │ +1.8% (ns) │
  │ 8–9 (obese)      │ 66.90 ± 3.03     │ 70.13 ± 1.56     │ +4.8%      │
  └──────────────────┴──────────────────┴──────────────────┴────────────┘

  The BCS × neuter interaction was statistically significant (p = 0.0089).

  Key insight: the neutering penalty is most pronounced in dogs at ideal
  condition (~6.5% reduction) and essentially disappears in overweight/obese
  dogs, where excess fat already suppresses metabolic rate.

  Practical implication: the NRC's 95 kcal/kg^0.75 overestimates MER for
  ~47% of neutered pet dogs at ideal BCS.

  Source: Marchi PH et al. (2025). Retrospective study of energy requirement
  recommendations for maintenance in healthy dogs. Journal of Animal Science.


## 1.6 Puppy Growth Energy Equation

The NRC provides an exponential decay model for growing puppies:

  Formula:
    ME_puppy = 130 × BW^0.75 × 3.2 × (e^(-0.87 × p) - 0.1)    (kcal/day)

  Where:
    BW = current body weight in kg
    p = current BW / expected mature BW (proportion of adult size, 0 to 1)
    e = Euler's number (2.71828...)

  This models the decreasing caloric multiplier as the puppy approaches adult
  size. At p = 0.2 (20% of adult weight), the multiplier is ~2.6× RER.
  At p = 0.8 (80% of adult weight), it drops to ~1.2× RER.

  BREED-SIZE CORRECTIONS (the NRC equation overestimates for small breeds):
  ┌──────────────────┬───────────────┬──────────────────────────────────────────┐
  │ Breed Size       │ Correction    │ Source                                   │
  ├──────────────────┼───────────────┼──────────────────────────────────────────┤
  │ Toy / Small      │ × 0.80        │ Norfolk Terrier (Brenten 2021): NRC      │
  │                  │               │ overestimated by up to 285 kJ/kg^0.75    │
  │ Medium           │ × 0.90        │ Yorkshire Terrier (Brenten 2017): NRC    │
  │                  │               │ overestimated by up to 324 kJ at 10–20 wk│
  │ Large            │ × 1.00        │ Equation derived from large breed data   │
  │ Giant            │ × 1.00        │ (Great Danes)                            │
  └──────────────────┴───────────────┴──────────────────────────────────────────┘

  Source: NRC (2006); Brenten T et al. (2021) Energy requirements for growth
  in the Norfolk Terrier. Animals 11(5):1313; Brenten T et al. (2017) Energy
  requirements for growth in the Yorkshire terrier. J Nutr Sci 6:e24.


## 1.7 FEDIAF Puppy Growth Curves

FEDIAF (2024) provides logarithmic functions to predict expected % of mature
body weight at a given age, used for monitoring growth rate:

  Formula (general form):
    % mature BW = a × ln(age_weeks) + b

  ┌──────────────────────┬─────────┬──────────┐
  │ Adult Weight Category│ a       │ b        │
  ├──────────────────────┼─────────┼──────────┤
  │ ≤ 7 kg               │ 36.92   │ -43.57   │
  │ 7–15 kg              │ 39.88   │ -60.70   │
  │ 15–27.5 kg           │ 36.86   │ -48.22   │
  │ 27.5–47.5 kg         │ 36.96   │ -56.18   │
  │ > 47.5 kg            │ 36.61   │ -62.39   │
  └──────────────────────┴─────────┴──────────┘

  Source: FEDIAF (2024) Nutritional Guidelines for Complete and Complementary
  Pet Food for Cats and Dogs, Section 4.



## 2. BODY COMPOSITION: SCIENCE AND MEASUREMENT


## 2.1 Why Body Weight Alone Is Insufficient

The fundamental biophysical reality: lean body mass (LBM), not total body
weight, is the strongest predictor of metabolic rate. Fat-free mass represents
the body's total respiring cell mass; adipose tissue is comparatively
metabolically inert.

  Evidence:
    - Labrador Retriever BMR study (Speakman et al. 2019): fat mass had a
      significant NEGATIVE linear relationship with BMR. More fat → lower
      metabolic rate per kg total BW.
    - Male dogs: BMR = 136 kcal/kg^0.75 vs female: 125 kcal/kg^0.75
    - Intact dogs: BMR = 121 vs neutered: 109 kcal/kg^0.75
    - Senior dogs (7+): BMR = 120 vs young adult: 136 kcal/kg^0.75

  Source: Speakman JR et al. (2019). Effect of age, sex, reproductive status,
  body composition, and environmental temperature on the basal metabolic rate
  of working Labrador Retrievers. J Anim Sci 97(Suppl 3):317.


## 2.2 Body Composition Changes with Age (DEXA Data)

Landmark retrospective analysis: 6,973 DEXA scans from 1,273 dogs (ages ≤1
to 16.1 years) at Hill's Pet Nutrition Center, Topeka, Kansas.

  Key findings:
    - Lean body mass peaks at approximately age 6.3 years, then declines
    - Fat mass increases until peaking at approximately age 9.3 years, then decreases
    - Bone mineral content follows a separate trajectory
    - The 3-year gap (ages ~6–9) between lean-mass decline onset and fat-mass
      peak creates a window of "sarcopenic obesity" risk — simultaneous muscle
      loss and fat gain while total body weight appears stable

  Clinical significance:
    - Sarcopenia begins in MIDDLE AGE, not just in senior dogs
    - Stable body weight ≠ stable body composition
    - A 30 kg dog at age 4 vs age 8 may have lost 2–3 kg muscle and gained
      2–3 kg fat, with lower metabolic rate and higher protein needs

  Source: McGrath S et al. (2024). Retrospective analysis of dual-energy
  x-ray absorptiometry data demonstrates body composition changes with age
  in dogs and cats. Am J Vet Res 85(12). PMID: 39393400.


## 2.3 Body Composition Measurement Methods

### 2.3.1 Body Condition Scoring (BCS) — 9-Point Laflamme Scale

  The clinical standard. Validated against DEXA with r = 0.90.

  ┌─────┬────────────────┬───────────────┬────────────────────────────────────┐
  │ BCS │ Classification │ Approx Body   │ Clinical Landmarks                 │
  │     │                │ Fat %         │                                    │
  ├─────┼────────────────┼───────────────┼────────────────────────────────────┤
  │ 1   │ Emaciated      │ < 5%          │ Ribs, spine, hip bones prominent;  │
  │     │                │               │ severe muscle wasting              │
  │ 2   │ Very thin      │ 5–10%         │ Ribs easily visible; no palpable   │
  │     │                │               │ fat; obvious waist                 │
  │ 3   │ Thin           │ 10–15%        │ Ribs easily palpable, minimal fat; │
  │     │                │               │ clear waist and tuck               │
  │ 4   │ Lean ideal     │ 15–20%        │ Ribs palpable with slight cover;   │
  │     │                │               │ waist visible from above           │
  │ 5   │ Ideal          │ 20–25%        │ Ribs palpable without excess fat;  │
  │     │                │               │ waist observed; abdominal tuck     │
  │ 6   │ Mildly over    │ 25–30%        │ Ribs palpable with slight excess;  │
  │     │                │               │ waist discernible but not prominent│
  │ 7   │ Overweight     │ 30–35%        │ Ribs difficult to palpate; fat     │
  │     │                │               │ deposits over lumbar area; waist   │
  │     │                │               │ barely visible                     │
  │ 8   │ Obese          │ 35–40%        │ Ribs buried; heavy fat deposits;   │
  │     │                │               │ no waist; abdominal distension     │
  │ 9   │ Morbidly obese │ > 40–45%      │ Massive fat deposits; no bony      │
  │     │                │               │ landmarks palpable                 │
  └─────┴────────────────┴───────────────┴────────────────────────────────────┘

  Each BCS unit ≈ 5% body fat ≈ 10% body weight deviation from ideal.

  Source: Laflamme DP (1997). Development and validation of a body condition
  score system for dogs. Canine Practice 22:10-15.


### 2.3.2 Ideal Body Weight Derivation from BCS

  Formula:
    IBW = Current BW × (100 / (100 + ((BCS - 5) × 10)))

  Worked examples:
    30 kg dog, BCS 7 → IBW = 30 × (100 / 120) = 25.0 kg
    30 kg dog, BCS 5 → IBW = 30 × (100 / 100) = 30.0 kg (no change)
    22 kg dog, BCS 3 → IBW = 22 × (100 / 80)  = 27.5 kg (underweight)
    50 kg dog, BCS 9 → IBW = 50 × (100 / 140) = 35.7 kg

  Source: German AJ et al. (2006). A simple, reliable tool for owners to
  assess the body condition of their dog or cat. Journal of Nutrition 136:2031S.


### 2.3.3 Muscle Condition Scoring (MCS)

  4-point subjective scale: Normal / Mild loss / Moderate loss / Severe loss.
  Assessed by palpation of temporal muscles, scapulae, lumbar vertebrae,
  and pelvic bones.

  Only 33.9% of veterinary teams use MCS despite AAHA/WSAVA recommendation.
  Not yet formally validated against DEXA in dogs (validated in cats).
  Critical for detecting sarcopenia in seniors who may have normal BCS.

  Source: WSAVA Global Nutrition Committee (2011). Nutritional Assessment
  Guidelines for Dogs and Cats.


### 2.3.4 Morphometric (Tape Measure) Methods

  Chest-to-abdominal girth ratio:
    - Chest > Abdomen → likely BCS 4–5 (ideal)
    - Chest ≈ Abdomen → likely BCS 6–7 (overweight)
    - Chest < Abdomen → likely BCS 8–9 (obese)
    - Correlation with BCS: p < 0.01

  Source: Chun JL et al. (2019). A simple method to evaluate body condition
  score to maintain the optimal body weight in dogs. J Anim Sci Technol
  61(6):366-370.

  Body Fat Index (BFI) system:
    - Uses pelvic circumference + body length + visual assessment
    - More accurate than BCS for obese dogs when compared to DEXA

  Source: Witzel AL et al. (2014). Use of a novel morphometric method and
  body fat index system for estimation of body composition in overweight
  and obese dogs. JAVMA 244(11):1279-1284.


### 2.3.5 Ultrasonography

  Measures subcutaneous fat thickness (SFT) at specific anatomical sites.

  Optimal measurement sites and correlations with BCS:
  ┌──────────────────┬───────────────────┬───────────────────┐
  │ Anatomical Site  │ Mean SFT (mm)     │ Correlation (r)   │
  ├──────────────────┼───────────────────┼───────────────────┤
  │ Abdomen          │ 3.15              │ 0.799**           │
  │ Lumbar           │ 2.89              │ 0.781**           │
  │ Flank            │ 2.28              │ 0.815**           │
  │ Thigh            │ 2.63              │ 0.708**           │
  │ Chest            │ 2.39              │ 0.776**           │
  └──────────────────┴───────────────────┴───────────────────┘

  Mid-lumbar SFT predicts total body fat with r = 0.87 (p < 0.001).

  Source: Payan-Carreira R et al. (2016). In vivo assessment of subcutaneous
  fat in dogs by real-time ultrasonography and image analysis. Acta Vet Scand
  58(Suppl 1):58. // Wilkinson MJ, McEwan NA (1991). J Small Anim Pract.


### 2.3.6 Dual-Energy X-Ray Absorptiometry (DEXA)

  Gold standard for body composition in live dogs.
  Three-compartment model: fat mass, lean soft tissue, bone mineral content.
  Validated against chemical carcass analysis: r² = 0.96 for fat mass.

  Equipment used: standard human clinical DEXA systems
    - GE Lunar Prodigy with ENCORE small animal software (v13.60+)
    - Hologic QDR series (pencil-beam and fan-beam)
    - GE Lunar iDXA

  Precision: CV ≤ 1.52% for body fat, ≤ 0.89% for lean tissue.
  Requires general anesthesia (10–20 min scan).
  Available only at university veterinary hospitals and pet food R&D centers.

  Known offset: DEXA estimates body fat ~15.8% higher than D₂O dilution on
  average, but correlation is excellent (r = 0.84, slope = 1.04).

  Key facilities with canine DEXA:
    - Hill's Pet Nutrition Center, Topeka, Kansas
    - University of Liverpool Royal Canin Obesity Care Clinic
    - Waltham Petcare Science Institute, UK
    - University of Copenhagen
    - University of São Paulo HOVET (Latin America's first, funded 2025)

  Source: Speakman JR et al. (2001). J Nutr 131:2469S; Toll PW et al. (2005);
  Raffan E et al. (2017). J Nutr Sci 6:e17.


### 2.3.7 Deuterium Oxide (D₂O) Dilution

  Criterion method for total body water (TBW).
  Two-compartment model: fat mass vs fat-free mass.

  Formula:
    Fat Mass = BW - (TBW / 0.732)

  Assumption: fat-free mass is 73.2% water.
  Validated against carcass analysis: r² = 0.95.

  Procedure: inject known dose of D₂O → wait 2–4 hours for equilibration →
  measure plasma D₂O concentration via FTIR or mass spectrometry → calculate
  dilution space.

  Source: Speakman JR et al. (2001). DEXA vs D₂O comparison. J Nutr 131:2469S.


### 2.3.8 Bioelectrical Impedance Analysis (BIA)

  Passes low-intensity current through body; measures resistance/reactance.
  Lean tissue (high water) conducts better than fat.

  CRITICAL LIMITATION: equations are breed-specific.
  Equations developed for Beagles FAILED when applied to other breeds:
    - Overestimated TBW by 14.4–22.2% vs D₂O dilution (p = 0.005)
    - Breed morphology (limb length, coat, body shape) causes systematic error

  Currently unreliable for cross-breed clinical use without breed-specific
  validated equations, which largely do not exist.

  Source: Yaguiyan-Colliard L et al. (2015). Evaluation of total body water in
  canine breeds by single-frequency bioelectrical impedance analysis method.
  BMC Vet Res 11:203.


### 2.3.9 Computed Tomography (CT)

  Three-dimensional tissue quantification using Hounsfield Unit attenuation:
    Fat: -214 to +7 HU
    Lean: +8 to +187 HU
    Bone: +188 to +3072 HU

  CT fat at L3 vertebra correlated with D₂O body fat at r = 0.98.
  Can distinguish subcutaneous from visceral fat.
  Greyhounds: lean:fat ratio 7.5:1 vs Beagles 2.2:1 (p < 0.01).
  Requires general anesthesia; radiation exposure; $500–2000/scan.

  Source: Purushothaman D et al. (2013). Whole body computed tomography with
  advanced imaging techniques: a research tool for measuring body composition
  in dogs. J Vet Med 2013:610654.


### 2.3.10 Method Comparison Table

  ┌─────────────────┬───────────────────────┬─────────────┬──────────┬──────────┐
  │ Method          │ Accuracy vs Gold Std  │ Cost/Scan   │ Sedation │ Clinical │
  │                 │                       │             │          │ Feasiblty│
  ├─────────────────┼───────────────────────┼─────────────┼──────────┼──────────┤
  │ BCS (9-pt)      │ r = 0.90 vs DEXA      │ Free        │ No       │ ★★★★★   │
  │ Morphometrics   │ Better than BCS (obese)│ Free        │ No       │ ★★★★☆   │
  │ Girth ratio     │ p < 0.01 vs BCS       │ Free        │ No       │ ★★★★★   │
  │ Ultrasonography │ r = 0.71–0.87         │ $50–150     │ No       │ ★★★☆☆   │
  │ BIA             │ 14–22% error (generic)│ $200–2000   │ No       │ ★★☆☆☆   │
  │ CT              │ r = 0.98 (L3 vs D₂O)  │ $500–2000   │ Yes      │ ★☆☆☆☆   │
  │ DEXA            │ r² = 0.96 vs carcass  │ $200–500    │ Yes      │ ★★☆☆☆   │
  │ D₂O dilution    │ r² = 0.95 vs carcass  │ $100–300    │ No*      │ ★★☆☆☆   │
  │ QMR             │ Strong vs DEXA/D₂O    │ >$100K equip│ No       │ ★☆☆☆☆   │
  └─────────────────┴───────────────────────┴─────────────┴──────────┴──────────┘
  * D₂O requires injection + blood draw (invasive, not sedation).



## 3. LIFE STAGE CLASSIFICATION


## 3.1 Breed-Size-Adjusted Life Stage Thresholds

Traditional "7 years = senior" is not scientifically supported across breed sizes.
Based on aging meta-analysis (Creevy et al. 2022, ~6.4M veterinary records):

  ┌──────────────┬─────────────┬─────────────┬───────────┬──────────────┐
  │ Breed Size   │ Youth       │ Midlife     │ Senior    │ Super-Senior │
  ├──────────────┼─────────────┼─────────────┼───────────┼──────────────┤
  │ Toy (< 7 kg) │ 1–6 yr      │ 7–11 yr     │ 12–13 yr  │ ≥ 14 yr      │
  │ Small (7-15) │ 1–6 yr      │ 7–11 yr     │ 12–13 yr  │ ≥ 14 yr      │
  │ Medium(15-27)│ 1–5 yr      │ 6–9 yr      │ 10–13 yr  │ ≥ 14 yr      │
  │ Large(27-45) │ 1–5 yr      │ 6–9 yr      │ 10–11 yr  │ ≥ 12 yr      │
  │ Giant (>45)  │ 1–4 yr      │ 5–7 yr      │ 8–10 yr   │ ≥ 11 yr      │
  └──────────────┴─────────────┴─────────────┴───────────┴──────────────┘

  Source: Creevy KE et al. (2022). Aging in dogs. Animal Frontiers 14(3):5-16.
  Also: FEDIAF (2024) Nutritional Guidelines, Section 2.


## 3.2 Growth Completion by Breed Size

  ┌──────────────┬───────────────────────┐
  │ Breed Size   │ Growth Complete (approx)│
  ├──────────────┼───────────────────────┤
  │ Toy          │ 8–10 months           │
  │ Small        │ 10–12 months          │
  │ Medium       │ 12–14 months          │
  │ Large        │ 14–18 months          │
  │ Giant        │ 18–24 months          │
  └──────────────┴───────────────────────┘

  Source: FEDIAF (2024); Hawthorne AJ et al. (2004). Body-weight changes
  during growth in puppies of different breeds. J Nutr 134:2027S.



## 4. MACRONUTRIENT REQUIREMENTS


## 4.1 Minimum Macronutrient Targets (per 1000 kcal ME)

  ┌──────────────┬──────────────┬─────────────┬──────────────┬──────────────┐
  │ Nutrient     │ Puppy <14 wk │ Puppy ≥14 wk│ Adult Maint. │ Senior       │
  ├──────────────┼──────────────┼─────────────┼──────────────┼──────────────┤
  │ Protein (g)  │ 62.5         │ 50.0        │ 45.0 (FEDIAF)│ 62.5*        │
  │ Fat (g)      │ 21.3         │ 21.3        │ 13.8         │ 13.8         │
  │ Fiber (g)    │ 0–10         │ 0–15        │ 5–25         │ 10–30        │
  │ Carbs (g)    │ Not required │ Not required│ Not required │ Not required │
  └──────────────┴──────────────┴─────────────┴──────────────┴──────────────┘

  * Senior protein is HIGHER than adult — not lower. See §4.2.

  Notes:
    - AAFCO minimum for adult protein is 45 g/1000 kcal (18% DM basis).
    - NRC RA for adult protein is 25 g/1000 kcal, but this is a MINIMUM
      REQUIREMENT, not an optimal intake. FEDIAF recommends 45–52 g/1000 kcal.
    - Dogs have no dietary carbohydrate requirement. Gluconeogenesis from
      protein and glycerol is sufficient. Carbs are used as an energy source
      and for fiber but are not essential.

  Source: NRC (2006) Chapter 5; FEDIAF (2024) Table III.1; AAFCO (2024)
  Dog Food Nutrient Profiles.


## 4.2 Senior Protein Requirements — The Evidence

  The outdated paradigm of restricting protein in senior dogs has been
  thoroughly overturned:

  Key evidence:
    1. Old dogs need ~50% more protein than young dogs to maintain nitrogen
       balance AND protein/DNA ratio (Wannemacher & McCoy, 1966).
    2. Nitrogen balance UNDERESTIMATES true protein needs. Cats need 1.5 g
       protein/kg BW for nitrogen balance but >5 g/kg to maintain lean mass.
       The ratio is similar in dogs.
    3. Purina longitudinal research: older dogs fed high-protein diets had
       slower age-related loss of lean body mass.
    4. During weight loss: high-protein diets (94 g/1000 kcal) preserved LBM
       significantly better than standard protein (60 g/1000 kcal).
    5. Protein should NOT be restricted in healthy seniors. Restriction
       accelerates sarcopenia. Only restrict for confirmed advanced renal
       disease (IRIS Stage 3–4).

  Recommended range for healthy seniors: 62.5–75+ g protein / 1000 kcal
  (approximately 25–30% on dry-matter basis).

  Source: Purina Institute (2023). Lean Body Mass & Protein. // Laflamme DP
  (2005). Nutrition for aging cats and dogs. Vet Clin N Am 35:713. //
  German AJ et al. (2015). Quality of life and owners' satisfaction after
  weight loss in dogs. J Vet Intern Med 29(3):458.


## 4.3 Weight-Loss Protein Override

  When a dog is in caloric deficit for weight loss, protein density should
  increase to ≥ 75 g/1000 kcal to preserve lean body mass.

  At-goal caloric deficit: 10–20% below maintenance MER.
    BCS 6–7 (overweight): 10% deficit (× 0.90 on MER)
    BCS 8–9 (obese): 20% deficit (× 0.80 on MER) + vet referral

  Source: German AJ et al. (2015); Brooks D et al. (2014). AAHA weight
  management guidelines for dogs and cats. JAAHA 50:1-11.



## 5. MICRONUTRIENT REQUIREMENTS


## 5.1 NRC 2006 Recommended Allowances (per 1000 kcal ME)

  ┌────────────────────┬───────────┬───────────┬───────────┬────────┐
  │ Nutrient           │ Adult RA  │ Puppy RA  │ Senior RA*│ Max    │
  │                    │           │           │ (modified)│ (SUL)  │
  ├────────────────────┼───────────┼───────────┼───────────┼────────┤
  │ MINERALS           │           │           │           │        │
  │ Calcium (g)        │ 1.00      │ 2.50      │ 1.00      │ 4.50   │
  │ Phosphorus (g)     │ 0.75      │ 2.25      │ 0.75      │ 3.50   │
  │ Ca:P ratio         │ 1:1–2:1   │ 1:1–1.6:1 │ 1:1–2:1   │ —      │
  │ Sodium (g)         │ 0.20      │ 0.55      │ 0.20      │ 3.75   │
  │ Potassium (g)      │ 1.00      │ 1.10      │ 1.00      │ —      │
  │ Magnesium (g)      │ 0.15      │ 0.10      │ 0.15      │ —      │
  │ Iron (mg)          │ 7.50      │ 22.0      │ 7.50      │ —      │
  │ Zinc (mg)          │ 15.0      │ 25.0      │ 15.0      │ —      │
  │ Copper (mg)        │ 1.50      │ 2.75      │ 1.50      │ —      │
  │ Manganese (mg)     │ 1.20      │ 1.40      │ 1.20      │ —      │
  │ Selenium (mcg)     │ 87.5      │ 87.5      │ 87.5      │ —      │
  │ Iodine (mcg)       │ 220       │ 220       │ 220       │ 2750   │
  │                    │           │           │           │        │
  │ FAT-SOLUBLE VITAMINS│          │           │           │        │
  │ Vitamin A (RE)     │ 379       │ 379       │ 379       │ 16000  │
  │ Vitamin D (mcg)    │ 3.40      │ 3.40      │ 3.40      │ 20.0   │
  │ Vitamin E (mg)     │ 7.50      │ 7.50      │ 12.0†     │ —      │
  │ Vitamin K (mg)     │ 0.41      │ 0.41      │ 0.41      │ —      │
  │                    │           │           │           │        │
  │ WATER-SOLUBLE VITAMINS│        │           │           │        │
  │ Thiamin B1 (mg)    │ 0.56      │ 0.56      │ 0.56      │ —      │
  │ Riboflavin B2 (mg) │ 1.30      │ 1.30      │ 1.30      │ —      │
  │ Niacin B3 (mg)     │ 4.25      │ 4.25      │ 4.25      │ —      │
  │ Pantothenic Acid(mg)│ 3.75     │ 3.75      │ 3.75      │ —      │
  │ Pyridoxine B6 (mg) │ 0.375     │ 0.375     │ 0.375     │ —      │
  │ Folic Acid (mg)    │ 0.068     │ 0.068     │ 0.068     │ —      │
  │ Vitamin B12 (mcg)  │ 8.75      │ 8.75      │ 8.75      │ —      │
  │ Choline (mg)       │ 425       │ 425       │ 425       │ —      │
  │                    │           │           │           │        │
  │ ESSENTIAL FATTY ACIDS│         │           │           │        │
  │ Linoleic acid (g)  │ 2.80      │ 3.30      │ 2.80      │ —      │
  │ EPA + DHA (g)      │ —         │ —         │ 1.0–3.0†  │ 3.0    │
  └────────────────────┴───────────┴───────────┴───────────┴────────┘

  * NRC/FEDIAF/AAFCO do not define separate "senior" profiles. The senior
    column reflects the adult RA with modifications (†) from FEDIAF SAB (2017)
    and clinical literature.
  † Senior modifications: increased vitamin E (antioxidant); EPA+DHA added
    for anti-inflammatory and cognitive support.

  Source: NRC (2006) Tables 15.2, 15.3; FEDIAF (2024) Tables III.1–III.4;
  FEDIAF SAB (2017) Statement on Nutrition of Senior Dogs; Bauer JE (2011).
  Therapeutic use of fish oils in companion animals. JAVMA 239(11):1441-1451.


## 5.2 Key Amino Acid Requirements (NRC RA, adults, per 1000 kcal ME)

  ┌───────────────────────┬──────────────────┬───────────────┐
  │ Amino Acid            │ Recommended (g)  │ Minimum (g)   │
  ├───────────────────────┼──────────────────┼───────────────┤
  │ Arginine              │ 0.88             │ 0.70          │
  │ Histidine             │ 0.48             │ 0.38          │
  │ Isoleucine            │ 0.95             │ 0.76          │
  │ Leucine               │ 1.70             │ 1.35          │
  │ Lysine                │ 0.88             │ 0.70          │
  │ Methionine            │ 0.83             │ 0.66          │
  │ Methionine + Cystine  │ 1.63             │ 1.30          │
  │ Phenylalanine + Tyr   │ 1.85             │ 1.48          │
  │ Threonine             │ 1.08             │ 0.86          │
  │ Tryptophan            │ 0.35             │ 0.28          │
  │ Valine                │ 1.23             │ 0.98          │
  └───────────────────────┴──────────────────┴───────────────┘

  Source: NRC (2006) Table 5.4.


## 5.3 Calcium and Phosphorus — Growth Phase Specifics

  A 2019 factorial calculation study (LMU Munich) demonstrated that the NRC's
  extrapolation method overestimates Ca needs for small/medium breed puppies:

  ┌───────────────┬────────┬──────────────┬───────────────────┬───────────────┐
  │ Mature BW     │ Age    │ NRC Ca req   │ Factorial Ca req  │ Overestimation│
  ├───────────────┼────────┼──────────────┼───────────────────┼───────────────┤
  │ 60 kg         │ 13 wk  │ ~2400 mg/d   │ ~2260 mg/d        │ ~6%           │
  │ 20 kg         │ 35 wk  │ ~2100 mg/d   │ ~1300 mg/d        │ ~62%          │
  │ 5 kg          │ 22 wk  │ ~600 mg/d    │ ~250 mg/d         │ ~140%         │
  └───────────────┴────────┴──────────────┴───────────────────┴───────────────┘

  Factorial approach accounts for:
    - Endogenous losses (~30 mg Ca/kg BW/day in growing dogs)
    - Tissue accretion rates (varies by growth phase)
    - Expected nutrient availability

  Large/giant breed puppies: calcium MUST NOT exceed 2.5 g/1000 kcal.
  Excess calcium in large breeds → hypertrophic osteodystrophy (HOD),
  osteochondritis dissecans (OCD).

  Source: Mack JK et al. (2019). Factorial calculation of calcium and
  phosphorus requirements of growing dogs. PLoS ONE 14(8):e0220305.



## 6. SARCOPENIA AND AGING


## 6.1 Muscle Loss Trajectory

  - 15–25% of muscle mass lost between ages 7 and 12 years
  - Sarcopenia can co-occur with fat gain ("sarcopenic obesity")
  - Body weight may remain stable while composition shifts dramatically
  - Lean body mass is the strongest independent predictor of lifespan

  Source: Freeman LM (2012). Sarcopenia in dogs. J Am Vet Med Assoc
  240(5):483; Kealy RD et al. (2002). Effects of diet restriction on life
  span and age-related changes in dogs. JAVMA 220:1315-1320.

## 6.2 Nutritional Interventions for Sarcopenia

  - Increase protein to ≥ 62.5 g/1000 kcal (see §4.2)
  - Lysine may independently slow LBM loss
  - EPA + DHA omega-3 fatty acids at 1.0–3.0 g/1000 kcal:
    anti-inflammatory, joint support, cognitive support
    (must be from marine sources — plant ALA has poor conversion to EPA/DHA)
  - Medium-chain triglycerides (MCT) at ~6.5% of diet: cognitive benefits
    demonstrated in dogs aged 9–16 years
  - Vitamin E increased to 12.0 mg/1000 kcal: antioxidant support

  Source: FEDIAF SAB (2017); Bauer JE (2011); Pan Y et al. (2010). Dietary
  supplementation with MCT improves cognition in aged dogs. Neurobiol Aging
  31(3):519-527.



## 7. TOXIC INGREDIENTS AND ALLERGENS


## 7.1 Absolute Toxins (Zero Tolerance — No Safe Dose)

  ┌─────────────────────┬───────────────────────────────────────────────────────┐
  │ Ingredient          │ Mechanism / Toxicity                                  │
  ├─────────────────────┼───────────────────────────────────────────────────────┤
  │ Onion, garlic, chives│ Allium family: N-propyl disulfide causes oxidative  │
  │ leeks, scallions    │ damage to RBCs → hemolytic anemia. Dose-dependent    │
  │                     │ but NO safe threshold established for recipe use.     │
  │ Grapes, raisins,    │ Tartaric acid (proposed mechanism): acute kidney     │
  │ currants, sultanas  │ failure. Idiosyncratic — some dogs collapse at tiny  │
  │                     │ doses, others tolerate more. No safe dose identified. │
  │ Chocolate, cocoa    │ Theobromine: cardiac arrhythmia, CNS stimulation.    │
  │                     │ Dark chocolate: ~15 mg theobromine/g. LD50 ~100 mg/kg│
  │ Xylitol (birch sugar)│ Rapid insulin release → hypoglycemia → hepatic      │
  │                     │ necrosis. As little as 0.1 g/kg BW can cause effects.│
  │ Macadamia nuts      │ Unknown mechanism: weakness, vomiting, hyperthermia.  │
  │ Alcohol             │ Ethanol: same effects as humans but much lower dose.  │
  │ Nutmeg              │ Myristicin: tremors, seizures at moderate doses.      │
  │ Cooked bones        │ Splintering → GI perforation, obstruction.            │
  └─────────────────────┴───────────────────────────────────────────────────────┘

  Source: ASPCA Animal Poison Control; Cortinovis C, Caloni F (2016).
  Household food items toxic to dogs and cats. Front Vet Sci 3:26.


## 7.2 Allergen Epidemiology

  True food allergy prevalence in ALL dogs: approximately 1–2%.
  Among the ~1–2% with confirmed cutaneous adverse food reactions (CAFR):

  ┌─────────────────┬────────────────────┬──────────────────────────┐
  │ Protein Source   │ % of Allergic Dogs │ Est. Prevalence (all dogs)│
  ├─────────────────┼────────────────────┼──────────────────────────┤
  │ Beef             │ 34%                │ ~0.3–0.7%                │
  │ Dairy            │ 17%                │ ~0.17–0.34%              │
  │ Chicken          │ 15%                │ ~0.15–0.30%              │
  │ Wheat            │ 13%                │ ~0.13–0.26%              │
  │ Lamb             │ 5%                 │ ~0.05–0.10%              │
  │ Soy              │ 6%                 │ ~0.06–0.12%              │
  │ Corn             │ 4%                 │ ~0.04–0.08%              │
  │ Egg              │ 4%                 │ ~0.04–0.08%              │
  │ Pork             │ 2%                 │ ~0.02–0.04%              │
  │ Fish             │ 2%                 │ ~0.02–0.04%              │
  └─────────────────┴────────────────────┴──────────────────────────┘

  IMPORTANT: "34% beef" means 34% of the ~1–2% of dogs with a confirmed food
  allergy react to beef. It does NOT mean 34% of all dogs are allergic to beef.
  Population prevalence of beef allergy is approximately 0.3–0.7%.

  Source: Mueller RS, Olivry T, Prélaud P (2016). Critically appraised topic
  on adverse food reactions of companion animals (2): common food allergen
  sources in dogs and cats. BMC Vet Res 12:9.



## 8. ALGORITHM: PUTTING IT ALL TOGETHER


## 8.1 Complete Pipeline (pseudocode)

  INPUT: DogProfile {
    weight_kg, bcs, age_months, breed_size, neuter_status,
    sex, activity_level, expected_adult_weight_kg?,
    reproductive_status?, known_allergies[], health_conditions[]
  }

  STEP 1: Classify Life Stage
    life_stage = classifyLifeStage(age_months, breed_size)
    // See §3.1 for thresholds

  STEP 2: Calculate Ideal Body Weight
    IBW = weight_kg × (100 / (100 + ((bcs - 5) × 10)))
    // See §2.3.2

  STEP 3: Calculate RER
    RER = 70 × IBW^0.75
    // See §1.1

  STEP 4: Calculate MER
    IF life_stage is puppy:
      p = weight_kg / expected_adult_weight_kg
      MER = 130 × weight_kg^0.75 × 3.2 × (e^(-0.87 × p) - 0.1)
      Apply breed-size correction (§1.6)
    ELSE:
      life_stage_factor = lookup(life_stage)    // §1.2 table
      neuter_factor = (neutered ? 0.90 : 1.00)  // §1.5
      activity_factor = lookup(activity_level)   // §1.2 table
      weight_goal_factor:
        BCS 6–7 → 0.90 (10% deficit)
        BCS 8–9 → 0.80 (20% deficit, + vet referral)
        BCS 1–3 → 1.10 (10% surplus)
        BCS 4–5 → 1.00

      MER = RER × life_stage_factor × neuter_factor × activity_factor × weight_goal_factor

  STEP 5: Derive Nutrient Targets
    FOR each nutrient in (macros ∪ micros):
      daily_target = nutrient_per_1000kcal × (MER / 1000)
    // See §4.1, §5.1 for tables

  STEP 6: Apply Health Condition Overrides
    FOR each condition in health_conditions:
      Apply overrides (§ Constraint Layer Section 4)
    Check vet referral triggers

  STEP 7: Apply Forbidden/Allergen Filters
    forbidden = TOXIC_INGREDIENTS + known_allergies mapped to ingredient families
    // See §7.1, §7.2

  STEP 8: Generate Recipe
    Pass { MER, nutrient_targets, forbidden, structural_rules } to recipe engine
    Recipe must satisfy all constraints

  STEP 9: Validate
    Run post-generation validator against all constraints
    IF any BLOCK → reject and regenerate
    IF any WARN → tag "supplementation_needed" with specific gaps
    Output: recipe + nutrition panel + disclaimers


## 8.2 Alternative MER Model (Advanced)

  For platforms wanting maximum accuracy over the NRC standard model, use
  Divol & Priymenko (2017) with multiplicative correction factors:

    MER = 128 × IBW^0.730 × age_years^-0.050 × k_neuter × k_breed × k_housing × k_activity

  This model:
    - Includes age as a continuous variable (not a step function)
    - Accounts for breed-specific metabolic variation
    - Has R² = 0.816 (vs ~0.65 for simple k × BW^0.75)
    - Requires age in years (continuous), not just life stage

  See §1.4 for full factor table.



## 9. KEY FINDINGS SUMMARY


  1. Most pet dogs need 10–30% less energy than NRC predicts, depending on
     neuter status and BCS. (Marchi 2025, Bermingham 2014, Divol 2017)

  2. Body weight must be corrected to Ideal Body Weight before entering any
     energy equation. Using raw BW for overweight dogs perpetuates caloric
     surplus. (Laflamme 1997, German 2006)

  3. Age is a continuous modifier, not a binary step function. Breed size
     determines where "senior" begins. (Divol 2017, Creevy 2022)

  4. Protein requirements INCREASE with age. Senior dogs need ≥ 50% more
     protein than young adults to maintain lean body mass. DO NOT restrict
     protein in healthy seniors. (Purina Institute, Wannemacher 1966)

  5. The allometric exponent (0.75) may not be optimal for companion dogs.
     Reported exponents range from 0.67 to 0.93 depending on population.
     (Bermingham 2014, Divol 2017)

  6. Lean body mass peaks at ~6.3 years in dogs; fat mass peaks at ~9.3 years.
     The 3-year gap creates a sarcopenic obesity risk window where total weight
     appears stable but composition is shifting. (McGrath 2024)

  7. The NRC puppy growth equation overestimates energy by up to 60% for
     small/medium breeds. Breed-size corrections are necessary. (Brenten 2021)

  8. There are NO official regulatory nutritional guidelines for "senior" pets
     from either AAFCO or FEDIAF. The "senior" label on commercial food is
     essentially unregulated. (Animal Frontiers 2024)

  9. Most home-prepared dog diets are deficient in multiple micronutrients.
     Any honest platform must flag gaps and recommend supplementation rather
     than pretend whole-food recipes are always nutritionally complete.
     (Stockman et al. 2013; Heinze et al. 2012)



## 10. REFERENCES


NRC (2006). Nutrient Requirements of Dogs and Cats. National Academies Press.

FEDIAF (2024). Nutritional Guidelines for Complete and Complementary Pet Food
  for Cats and Dogs. European Pet Food Industry Federation.

FEDIAF SAB (2017). Statement on Nutrition of Senior Dogs. Scientific Advisory Board.

AAFCO (2024). Official Publication. Association of American Feed Control Officials.

Bauer JE (2011). Therapeutic use of fish oils in companion animals. J Am Vet
  Med Assoc 239(11):1441-1451.

Bermingham EN, Thomas DG, Cave NJ, et al. (2014). Energy requirements of
  adult dogs: a meta-analysis. PLoS ONE 9(10):e109681.

Brenten T, Morris PJ, Salt C, et al. (2017). Energy requirements for growth
  in the Yorkshire terrier. J Nutr Sci 6:e24.

Brenten T, Morris PJ, Salt C, et al. (2021). Energy requirements for growth
  in the Norfolk Terrier. Animals 11(5):1313.

Brooks D, Churchill J, Fein K, et al. (2014). AAHA weight management guidelines
  for dogs and cats. J Am Anim Hosp Assoc 50:1-11.

Chun JL, Bang HT, Ji SY, et al. (2019). A simple method to evaluate body
  condition score to maintain optimal body weight in dogs. J Anim Sci Technol
  61(6):366-370.

Cortinovis C, Caloni F (2016). Household food items toxic to dogs and cats.
  Front Vet Sci 3:26.

Creevy KE, Akey JM, Kaeberlein M, et al. (2022). An open science study of
  ageing in companion dogs. Nature 602:51-57.

Divol L, Priymenko N (2017). A new model for evaluating maintenance energy
  requirements in dogs: allometric equation from 319 pet dogs. J Nutr Sci 6:e53.

Freeman LM (2012). Cachexia and sarcopenia: emerging syndromes of importance
  in dogs and cats. J Vet Intern Med 26(1):3-17.

German AJ, Holden SL, Morris PJ, Biourge V (2006). A simple, reliable tool
  for owners to assess the body condition of their dog or cat. J Nutr 136:2031S.

German AJ, Holden SL, Wiseman-Orr ML, et al. (2015). Quality of life is
  reduced in obese dogs but improves after successful weight management.
  Vet J 206(1):77-82.

Heinze CR, Gomez FC, Freeman LM (2012). Assessment of commercial diets and
  recipes for home-prepared diets recommended for dogs with cancer. J Am Vet
  Med Assoc 241(11):1453-1460.

Kealy RD, Lawler DF, Ballam JM, et al. (2002). Effects of diet restriction on
  life span and age-related changes in dogs. J Am Vet Med Assoc 220:1315-1320.

Laflamme DP (1997). Development and validation of a body condition score system
  for dogs. Canine Practice 22:10-15.

Mack JK, Alexander LG, Morris PJ, et al. (2019). Factorial calculation of
  calcium and phosphorus requirements of growing dogs. PLoS ONE 14(8):e0220305.

Marchi PH, Vendramini THA, Perini MP, et al. (2025). Retrospective study of
  energy requirement recommendations for maintenance in healthy dogs. J Anim Sci.

McGrath S, et al. (2024). Retrospective analysis of dual-energy x-ray
  absorptiometry data demonstrates body composition changes with age in dogs
  and cats. Am J Vet Res 85(12).

Mueller RS, Olivry T, Prélaud P (2016). Critically appraised topic on adverse
  food reactions of companion animals (2): common food allergen sources in dogs
  and cats. BMC Vet Res 12:9.

Pan Y, Larson B, Araujo JA, et al. (2010). Dietary supplementation with
  medium-chain TAG has long-lasting cognition-enhancing effects in aged dogs.
  Br J Nutr 103(12):1746-1754.

Payan-Carreira R, Sargo T, Nascimento D (2016). In vivo assessment of
  subcutaneous fat in dogs by real-time ultrasonography. Acta Vet Scand 58(1):58.

Purushothaman D, Vanselow BA, Wu SB, et al. (2013). Whole body CT with advanced
  imaging: a research tool for measuring body composition in dogs. J Vet Med
  2013:610654.

Speakman JR, van Acker A, Harper EJ (2003). Age and sex related changes in BMR
  of Labrador Retrievers. J Anim Sci 97(Suppl 3):317.

Stockman J, Fascetti AJ, Kass PH, Larsen JA (2013). Evaluation of recipes of
  home-prepared maintenance diets for dogs. J Am Vet Med Assoc 242(11):1500-1505.

Witzel AL, Kirk CA, Henry GA, et al. (2014). Use of a novel morphometric method
  and body fat index system for estimation of body composition in overweight and
  obese dogs. J Am Vet Med Assoc 244(11):1279-1284.

Yaguiyan-Colliard L, et al. (2015). Evaluation of total body water in canine
  breeds by single-frequency BIA. BMC Vet Res 11:203.

WSAVA (2011). Global Nutrition Committee Nutritional Assessment Guidelines
  for Dogs and Cats. J Small Anim Pract 52(7):385-396.
