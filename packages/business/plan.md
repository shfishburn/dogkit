---
title: "Dogology HealthSpan Kits — Business Plan v1.2"
version: "1.2.0"
status: "draft"
description: "Evidence-annotated business plan covering problem/solution, market opportunity, product, go-to-market strategy, financial projections, and funding ask."
category: "business"
tags: ["business", "plan", "financials", "go-to-market", "evidence-based"]
seeAlso:
  - id: "overview"
    title: "Product Overview"
  - id: "business/model"
    title: "Business Model v1.0"
  - id: "research/canine-nutrition-research-summary"
    title: "Nutrition Research Summary"
  - id: "research/deep-research-report"
    title: "Deep Research Report"
---

# Dogology HealthSpan Kits – Business Plan (V1.2, Evidence-Annotated)

*Company:* Dogology  
*Product:* Dogology HealthSpan Kits  
*Tagline:* Science‑Built Food for More Good Years  

***

## 1. Problem & Hypothesis

### 1.1 The baseline problem

1. **Homemade diets are systematically incomplete.**  
   A large analysis of 1,726 owner-formulated homemade dog diets found only about 6% had the potential to be nutritionally complete, meaning roughly 94% failed to meet essential nutrient requirements. Common deficiencies include calcium, imbalanced calcium:phosphorus, zinc, copper, and other trace minerals. [ijpefs](https://www.ijpefs.org/index.php/ijpefs/article/view/612)

2. **Restrictive feeding of commercial foods risks micronutrient under-feeding.**  
Commercial diets labeled “complete and balanced” are formulated to meet AAFCO nutrient profiles at a presumed caloric intake. When guardians or vets cut portions 20–30% for weight loss, intake of all nutrients falls proportionally, and several micronutrients can drop below recommended levels, especially minerals such as zinc and manganese. [ajol](https://www.ajol.info/index.php/ajhs/article/view/263491)

3. **Guardians want control and transparency but lack tools.**  
AAFCO-compliant foods may be nutritionally adequate but are often opaque about formulation logic, per-ingredient nutrient contributions, and sourcing. Home cooks, conversely, have control over ingredients but almost never have access to the tools needed to ensure balanced micronutrition. [cambridge](https://www.cambridge.org/core/product/identifier/S0029665124001861/type/journal_article)

**Hypothesis:** There is an underserved segment that wants to cook for their dogs, is willing to pay a premium for fresh ingredients, and would adopt a kit model that provides: (a) AAFCO-compliant nutrient completeness, (b) explicit, explainable MER-based energy targets, and (c) transparent ingredient and nutrient data.

***

## 2. Solution Overview (Scope-Adjusted)

**Dogology HealthSpan Kits** is a subscription kit service that provides:

- A **transparent MER and nutrient modeling engine** that targets AAFCO Dog Food Nutrient Profiles for adult maintenance (for labeling) while using NRC and other research as reference. [cambridge](https://www.cambridge.org/core/product/identifier/S0029665124002040/type/journal_article)
- Weekly **cook-at-home kits**: pre-portioned ingredients (meat, organs, starches, vegetables, oils) plus a matched micronutrient premix, based on a library of vetted recipes.
- A **data-forward interface** that exposes:
  - MER equations and uncertainty ranges.
  - Per-ingredient nutrient contributions, using FoodData Central and co-packer data. [fdc.nal.usda](https://fdc.nal.usda.gov)
  - Batch-level nutrient coverage vs AAFCO profile targets.

Key change vs earlier versions: individualized MER and constraints select from a **finite set of registered, AAFCO-aligned template recipes**, rather than generating an infinite space of bespoke formulas that would be impossible to label and register.

***

## 3. Scientific & Nutritional Design

### 3.1 MER engine with explicit uncertainty

- Use established canine RER and MER equations (e.g., `RER = 70 × BW^0.75`) with factors for life stage, neuter status, and activity. [cambridge](https://www.cambridge.org/core/product/identifier/S0029665124001861/type/journal_article)
- Present MER as:
  - A central estimate (e.g., 1,000 kcal/day).
  - An uncertainty band (e.g., ±15–20%) acknowledging inter-dog variation.
- Build feedback:
  - Guardians track weight and body condition score (BCS) every 2–4 weeks.
  - The system suggests controlled adjustments (e.g., ±5–10% of calories) if weight trajectory diverges.

**Why:** MER formulas are population-based; explicit uncertainty and feedback loops reduce the risk of chronic under- or over-feeding.

### 3.2 Nutrient modeling and adequacy

1. **Regulatory adequacy target:**  
   - Recipes intended as sole diets will be formulated to **meet or exceed AAFCO Dog Food Nutrient Profiles for adult maintenance**, on a per-1,000 kcal basis, before any “complete and balanced” claim is made. [academic.oup](https://academic.oup.com/jas/article/103/Supplement_3/560/8274018)
   - Products not meeting the profile will be labeled for intermittent or supplemental feeding only, in line with AAFCO/FDA guidance. [cambridge](https://www.cambridge.org/core/product/identifier/S0029665124002040/type/journal_article)

2. **Composition layer:**  
   - Ingredient nutrient profiles will be drawn from FoodData Central or equivalent databases and cross-checked with supplier analyses. [iafns](https://iafns.org/our-work/research-tools-open-data/bfpd/)
   - The engine sums nutrient contributions from each ingredient and premix per 1,000 kcal and compares against AAFCO adult-maintenance minimums and any established maximums. [academic.oup](https://academic.oup.com/jas/article/103/Supplement_3/560/8274018)

3. **Bioavailability layer (Phase 2):**  
   - Introduce ingredient-class digestibility factors for macro and select micronutrients based on canine digestibility literature. [academic.oup](https://academic.oup.com/jas/article/103/Supplement_3/601/8274208)
   - Model interactions (e.g., phytate-rich legumes reducing zinc absorption) where robust data exists. [academic.oup](https://academic.oup.com/jas/article/103/Supplement_3/601/8274208)

4. **Safety & SULs:**  
   - Use NRC and published upper limits as a check against overshooting for certain nutrients (e.g., vitamin D, selenium), even though regulatory adequacy is AAFCO-centric. [ajol](https://www.ajol.info/index.php/ajhs/article/view/263491)

### 3.3 Validation studies

Pilot program:

- 50–100 dogs on Dogology kits for 3–6 months.
- Track:
  - Weight and BCS changes vs MER predictions.
  - Owner compliance and satisfaction.
- Subcohort:
  - Serum measurements for key micronutrients (Zn, Cu, Se, vitamin D) to confirm no systematic decline relative to reference ranges. [ajol](https://www.ajol.info/index.php/ajhs/article/view/263491)

Goal: generate publishable data to show that Dogology kits avoid the systemic deficiencies seen in generic homemade diets. [hemoncim](https://hemoncim.com/jour/article/view/752)

***

## 4. Regulatory & Labeling Strategy

### 4.1 AAFCO alignment

Dogology treats AAFCO as the primary regulatory framework:

- AAFCO provides the nutrient profiles and labeling model adopted by most U.S. states. [semanticscholar](https://www.semanticscholar.org/paper/87a1b101e19e45dadb3db48be6efc57113a1b5b3)
- To label any kit-derived ration as “complete and balanced,” the underlying recipe must:
  - Meet an AAFCO Dog Food Nutrient Profile (adult maintenance initially). [cambridge](https://www.cambridge.org/core/product/identifier/S0029665124001861/type/journal_article)
  - Or, in the future, pass an AAFCO-compliant feeding trial.

Each template recipe will have:

- An ingredient statement using AAFCO-defined ingredient names. [academic.oup](https://academic.oup.com/jas/article/103/Supplement_3/560/8274018)
- Required guaranteed analysis (e.g., min crude protein, min crude fat, max moisture, etc.).  
- A nutritional adequacy statement specifying life stage (“for adult maintenance”). [academic.oup](https://academic.oup.com/jas/article/97/Supplement_3/317/5665270)

**Key constraint:** Dogology will use a finite library of template recipes, each registered as a distinct product; personalization happens via recipe selection and feeding amount, not via generating thousands of unregistered micro-variants.

### 4.2 Human-grade claims

AAFCO’s standard for “human grade” requires that **every ingredient and the finished product** be manufactured, stored, and transported according to human food regulations, with documentation across the entire supply chain. [semanticscholar](https://www.semanticscholar.org/paper/87a1b101e19e45dadb3db48be6efc57113a1b5b3)

Dogology’s stance:

- **Phase 1:** No “human grade” claims on the principal display panel or marketing materials unless and until:
  - All ingredients are certified human edible.
  - Co-packers operate under human food regulations (e.g., 21 CFR 117) and maintain documentation required by the AAFCO human-grade standard. [semanticscholar](https://www.semanticscholar.org/paper/87a1b101e19e45dadb3db48be6efc57113a1b5b3)
- Marketing will use allowed descriptors like “fresh,” “gently cooked,” “real meat and vegetables,” provided they comply with labeling guidance and are not misleading. [hemoncim](https://hemoncim.com/jour/article/view/752)

### 4.3 Legal/regulatory operations

- Retain a pet food regulatory specialist and legal counsel early to:
  - Draft and review labels and website copy for truthfulness and non-misleading claims, including nutritional adequacy and comparative language. [cambridge](https://www.cambridge.org/core/product/identifier/S0029665124001861/type/journal_article)
  - Manage state-by-state registrations, AAFCO model compliance, and recall plans.

***

## 5. Product & Operations

### 5.1 Product tiers

**Tier A – Template-based complete kits**

- ~10–20 AAFCO-aligned recipes for adult maintenance (e.g., “Beef & Sweet Potato,” “Turkey & Brown Rice”).
- Each weekly kit for a given dog:
  - Specifies the template recipe.
  - Includes:
    - Frozen meat/organ blend pouch.
    - Frozen carb/veg blend pouch.
    - Oil pouch.
    - Micronutrient premix sachet.
  - Provides feeding directions (g/day) per dog, derived from MER ± bounds.

**Tier B – Premix + recipe (DIY)**

- For DIY-inclined users:
  - Dogology supplies the premix and recipe card tailored to MER and constraints.
  - Guardian sources ingredients locally, using kitchen scales.

### 5.2 Co-manufacturing approach

- Phase 1:
  - Work with a co-packer experienced in fresh/human-grade style pet food manufacturing (e.g., United Premium Foods, Karn Meats). [unitedpremiumfoods](https://unitedpremiumfoods.com/services/)
  - Use standardized template recipes to align with batch production economics and labeling.
- Phase 2:
  - Add a second regional facility for redundancy and lower shipping distances.

**Operational simplification:**  
Multi-component boxes are assembled from a small set of standardized components (meat mix, carb/veg mix, oils, premix), rather than dog-specific unique batches.

***

## 6. Market & Competitive Dynamics

### 6.1 Target segment

Primary:

- Guardians already paying for high-end fresh or human-grade foods who:
  - Care about longevity, weight, and healthspan rather than just “premium branding.”  
  - Desire more transparency (ingredient provenance, nutrient coverage, MER math).

Secondary:

- Veterinarians and veterinary nutritionists who:
  - Need tools to create personalized feeding plans without manually formulating diets.
  - Are concerned about the demonstrated deficiencies of homemade diets and some commercial alternative foods. [ijpefs](https://www.ijpefs.org/index.php/ijpefs/article/view/612)

### 6.2 Adoption friction and research plan

Acknowledging the critique that cooking is non-trivial behavior change:

- Conduct a **willingness-to-pay and time-investment study**:
  - Survey and diary existing fresh-food buyers on:
    - Time they would allocate weekly to dog meal prep.
    - Tradeoffs among cost, convenience, transparency.
- Use this to refine SAM and design lower-friction SKUs if needed (e.g., more fully cooked components).

### 6.3 Competitive response and defensibility

- Incumbent fresh brands already have manufacturing and cold-chain infrastructure and can plausibly build MER calculators and even kits. [forbes](https://www.forbes.com/sites/forbes-personal-shopper/article/best-dog-food-delivery-service/)
- Dogology differentiation must rest on:
  - Depth and openness of modeling (equation transparency, nutrient coverage visuals).  
  - A vet-usable toolchain that incumbents may not prioritize.  
  - Eventually, **data-backed refinements** to MER and feeding guidance derived from real-world outcomes at scale.

***

## 7. Economics & Logistics

### 7.1 Cost realities

- Fresh/frozen logistics are more expensive than shelf-stable; cold-chain infrastructure is a recognized competitive advantage in fresh pet food. [semanticscholar](https://www.semanticscholar.org/paper/87a1b101e19e45dadb3db48be6efc57113a1b5b3)
- Dogology will:
  - Initially focus on one or two regions to reduce transit times and costs.
  - Encourage weekly or bi-weekly shipments to amortize packaging and freight per calorie.

### 7.2 Unit economics workup (pre-scale)

Before scaling, Dogology will build an explicit cost model including:

- Ingredient cost per kg and per 1,000 kcal for each template recipe, with sensitivity analysis on protein prices. [finance.yahoo](https://finance.yahoo.com/news/human-grade-pet-food-market-144600406.html)
- Co-packer fees per pound or kg produced.  
- Packaging (insulation, ice/gel, boxes) and shipping rates by zone, including spoilage/returns allowances. [semanticscholar](https://www.semanticscholar.org/paper/87a1b101e19e45dadb3db48be6efc57113a1b5b3)
- Customer acquisition cost estimates based on test campaigns.

Goal: ensure that subscription pricing yields sustainable gross margins after cold-chain costs and co-packing, recognizing that this is structurally more expensive than kibble and even some fresh products.

***

## 8. Data & Moat

### 8.1 What is not proprietary

- AAFCO nutrient profiles, NRC data, and FoodData Central are public. [fdc.nal.usda](https://fdc.nal.usda.gov)
- MER formulas are standard and widely published. [cambridge](https://www.cambridge.org/core/product/identifier/S0029665124001861/type/journal_article)

Dogology does not claim these as IP.

### 8.2 Potential defensible assets

1. **Real-world MER and outcome dataset:**  
   - If Dogology tracks thousands of dogs’ MER estimates vs actual weight/BCS outcomes over time, it can:
     - Fit improved MER factors that capture breed, age, neuter status, activity, etc.  
     - Quantify distributions of variance and provide better default ranges than literature averages.

2. **Clinical credibility:**  
   - Publish at least one peer-reviewed study or conference abstract demonstrating:
     - Improved nutrient adequacy vs owner-formulated homemade diets. [ijpefs](https://www.ijpefs.org/index.php/ijpefs/article/view/612)
     - Predictive accuracy of MER+feedback weight guidance compared to typical advice.

3. **Vet tooling:**  
   - Develop features specifically enabling clinicians to:
     - Configure weight-loss trajectories with explicit guardrails.  
     - Export nutrient and MER reports for medical records.  
     - Co-brand feeding plans with Dogology kits.

Moat is framed as **conditional**: it depends on successfully executing to gather and use data and clinical relationships, not on static equations.

***

## 9. Execution Roadmap

**Phase 0 (0–6 months)**  
- Regulatory consult; labeling and claims design. [academic.oup](https://academic.oup.com/jas/article/103/Supplement_3/560/8274018)
- Build MER and nutrient modeling MVP with uncertainty bands.  
- Develop 5–10 template recipes; validate against AAFCO adult maintenance profiles. [cambridge](https://www.cambridge.org/core/product/identifier/S0029665124002040/type/journal_article)
- Engage co-packers for pilot runs.

**Phase 1 (6–18 months)**  
- Regional pilot:
  - 50–100 dogs on kits; collect weight/BCS trajectories and owner feedback.  
  - Initiate small lab sub-study on micronutrient status where feasible. [ajol](https://www.ajol.info/index.php/ajhs/article/view/263491)
- Iterate recipes and UX based on data.

**Phase 2 (18–36 months)**  
- Expand to more templates and regions if unit economics validate.  
- Publish anonymized results; engage vet community more formally.  
- Explore additional life stages and condition-aware variants, with careful regulatory framing.

***

This version surfaces the main scientific, regulatory, and operational assumptions, ties them explicitly to external evidence where available, and narrows scope where earlier drafts were over-ambitious. It is designed to be attacked on specifics rather than on missing considerations.