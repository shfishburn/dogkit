# Dogology HealthSpan Kits – Full Business Model (Markdown, V1.0)

***

## 1. Concept & Vision

Dogology HealthSpan Kits is a **fresh, science-driven, cook-at-home dog food subscription** that combines:

- AAFCO-aligned nutrition (adult maintenance initially).
- A transparent MER (Metabolizable Energy Requirement) and nutrient modeling engine.
- Weekly or bi-weekly ingredient kits plus micronutrient premix.
- Data feedback loops to optimize healthspan over time.

> Positioning: “Science-built food for more good years” for dogs whose guardians are willing to cook and care about transparency, healthspan, and veterinary-grade rigor.

***

## 2. Problem, Customer, and Insight

### 2.1 Core Problem

1. **Homemade diets are systematically incomplete and risky.**  
   Most owner-formulated homemade diets fail to meet essential nutrient requirements and often have multiple mineral and vitamin deficiencies.

2. **Commercial “complete and balanced” diets are black boxes.**  
   Guardians see opaque ingredient lists and don’t understand the nutrient logic, MER assumptions, or tradeoffs.

3. **Weight management and healthspan optimization are undersolved.**  
   Cutting commercial food portions for weight loss also proportionally cuts micronutrient intake, potentially pushing below recommended intakes.

4. **Veterinarians lack practical tools.**  
   Vet nutritionists can design balanced home diets, but this is slow, expensive, and hard to scale across hundreds of patients.

### 2.2 Target Customer

**Primary segment (DTC):**

- Guardians currently paying for premium fresh/human-grade food (e.g., Farmer’s Dog, Nom Nom).
- Income: upper-middle to high.
- Motivations: longevity, healthspan, weight management, transparency, and control.
- Behaviors: already cooking for themselves with similar ingredients; receptive to guided prep for dogs if time cost is reasonable.

**Secondary segment (B2B2C):**

- Veterinarians and veterinary nutritionists who:
  - Want better weight-loss and chronic disease management tools.
  - Need safe, AAFCO-compliant recipes without manually recalculating.

### 2.3 Key Insight

There is a **gap between**:

- “I trust a label and don’t think about it” and  
- “I cook everything myself with no reliable nutritional model.”

Dogology occupies the middle: **scientifically grounded, regulatory-aligned kits** that still let guardians cook at home, with vet- and data-backed personalization overlays.

***

## 3. Product & Experience

### 3.1 Product Structure

**Core SKUs:**

1. **Full HealthSpan Kits (subscription, frozen/fresh):**
   - Pre-portioned components:
     - Meat/organ pouch.
     - Carb/veg pouch.
     - Oil pouch.
     - Micronutrient premix sachet.
   - Weekly or bi-weekly deliveries.
   - Personalized feeding plan and MER-based calories.

2. **DIY Premix + Recipe:**
   - Dry premix containing vitamins, minerals, omega-3s, etc.
   - Guardian buys fresh ingredients (meat, carbs, vegetables) locally.
   - Recipe card + MER-based feeding gram amounts.

**Future SKUs:**

- Condition-specific kits (weight loss, joint support, senior).
- Vet-clinic co-branded kits.
- Treats and add-on supplements.

### 3.2 User Flow

1. **Onboarding:**
   - Input: dog age, weight, breed, sex, neuter status, activity level, health flags.
   - MER estimate (with a visible uncertainty band).
   - Select a template recipe (from a library of AAFCO-aligned recipes) that fits preferences (e.g., beef vs poultry, grain vs grain-free).

2. **Kit & Recipe Generation:**
   - Dogology engine:
     - Applies MER to determine daily kcal target.
     - Converts kcal to gram-based feeding instructions per component.
     - Ensures nutrient coverage per 1,000 kcal meets AAFCO adult maintenance profile.

3. **Delivery & Cooking:**
   - Guardian receives:
     - Frozen/fresh components.
     - Recipe card with step-by-step instructions.
     - Feeding guideline table (grams/day, meals/day).

4. **Feedback Loop:**
   - Guardian logs:
     - Regular weight and BCS.
     - Appetite, stool quality, general energy.
   - System suggests:
     - Incremental caloric adjustments (±5–10%).
     - Recipe swaps (e.g., lower fat) if needed.

5. **Veterinary Mode (optional):**
   - Vet can configure:
     - Target weight over time.
     - Specific dietary constraints (e.g., low-fat, lower phosphorus).
   - Vet receives:
     - PDF/CSV summary of MER, nutrient coverage, and plan.

***

## 4. Science & Nutrition Model

### 4.1 MER & Caloric Model

- Uses standard canine \(RER = 70 \times BW^{0.75}\) as a baseline.
- Applies MER multipliers for:
  - Life stage (adult maintenance initially).
  - Neuter status.
  - Activity level (e.g., “couch potato” vs “active”).
- Explicitly surfaces:
  - Point estimate (e.g., 1,000 kcal/day).
  - Uncertainty band (e.g., 800–1,200 kcal/day).
- Incorporates feedback:
  - Weight and BCS changes adjust MER estimates over time.

### 4.2 Nutrient Coverage & AAFCO Alignments

**Regulatory target:** AAFCO Dog Food Nutrient Profiles – Adult Maintenance.

- Each template recipe is formulated to:
  - Meet or exceed AAFCO minimums per 1,000 kcal.
  - Respect AAFCO maximums and appropriate Ca:P ratios.

**Ingredient database:**

- Grocery-sourceable ingredients:
  - Meats, organs, eggs, dairy, grains, legumes, vegetables, fruits, oils.
  - Each tagged with nutrient payloads, bioavailability flags, and constraint dimensions (protein, fat, minerals, vitamins, fiber, omega-3/Omega-6, etc.).
- Supplements:
  - Vitamin/mineral premixes.
  - Omega-3 (fish oil, algal), vitamin E, etc.

**Premix logic:**

- Template recipes are designed so that:
  - Whole-food ingredients supply most macronutrients and some micros.
  - Premix “tops up” vitamins, minerals, and essential fatty acids to AAFCO levels.
- Premix composition is standardized per recipe, making compliance and quality control tractable.

### 4.3 Bioavailability & Guardrails (Phase 2)

- Layer on:
  - Ingredient-specific digestibility coefficients.
  - Interaction modeling (e.g., phytates affecting mineral absorption).
- Check against:
  - NRC recommended allowances and safe upper limits (especially vitamins A, D, and trace minerals).
- Objective:
  - Avoid replicating the 90%+ deficiency rates found in homemade diets.
  - Tighten actual intake distributions relative to theoretical coverage.

***

## 5. Regulatory & Compliance Model

### 5.1 AAFCO-Compliant Labeling

Each recipe that is marketed as a sole diet must:

- Meet AAFCO adult-maintenance nutrient profiles OR pass a feeding trial.
- Include:
  - Ingredient list with AAFCO-conforming names.
  - Guaranteed analysis (protein, fat, fiber, moisture; additional as needed).
  - Nutritional adequacy statement (“for adult maintenance”).
  - Feeding directions (grams/day).

For recipes not meeting full AAFCO completeness:

- Label as “for intermittent or supplemental feeding only.”
- Used in conjunction with vet guidance (e.g., therapeutic cases).

### 5.2 Human-Grade Position

Human-grade claim will **not** be used initially because:

- Requires:
  - All ingredients human-edible.
  - All processing, storage, and transport under human food law with documentation.
- Many fresh pet brands *imply* human-grade standards without strictly meeting AAFCO human-grade definition.

Dogology strategy:

- Phase 1:
  - Focus on “fresh,” “gently cooked,” and transparency language within legal limits.
- Phase 2:
  - Evaluate full human-grade compliance for select SKUs once supply chain and documentation are robust enough.

### 5.3 Legal & Quality

- Engage pet food regulatory counsel early for:
  - Label review.
  - Website and marketing claims.
  - State-by-state registrations.
  - Recall/quality assurance plan.
- Co-packers:
  - Use facilities familiar with pet food and, where possible, human food-level hygiene and traceability.

***

## 6. Go-To-Market & Growth

### 6.1 Acquisition Channels

**Dominant channels:**

1. **Google Search (AdWords):**
   - High-intent queries:
     - “homemade dog food”
     - “fresh dog food recipes”
     - “AAFCO complete homemade dog food”
   - Strategy:
     - Direct response landing pages explaining:
       - Homemade diet deficiencies.
       - AAFCO and MER-based solution.
       - Simple quiz to personalize kit.

2. **Paid Social (Meta, TikTok, YouTube):**
   - Audience:
     - Dog owners, “pet parents,” health-conscious consumers.
   - Creative:
     - Before/after weight management.
     - Vet endorsements.
     - Ingredient transparency visuals.
     - “We fix what homemade gets wrong” narrative.

**Secondary channels:**

- Influencers and dog-focused creators.
- Partnerships with dog trainers, groomers, and behaviorists.
- Vet clinic partnerships, especially internists and nutritionists.

### 6.2 Brand Positioning

Messaging pillars:

1. **Scientifically grounded, not faddish.**
2. **Transparent and explainable MER & nutrition.**
3. **Co-designed with veterinarians and nutritionists.**
4. **You cook, we handle the math and compliance.**

***

## 7. Business & Unit Economics

### 7.1 Pricing & Revenue

Assumptions from model:

- **Full Kit:**
  - Average monthly price: $113.25 (weighted across dog sizes).
- **DIY Tier:**
  - Average monthly spend: $73.61.

Blended revenue:

- Assume 75% of customers on full kit, 25% on DIY.
- ARPU (average revenue per user) scales with dog size and optional add-ons (treats, supplements).

### 7.2 COGS & Gross Margin

Components:

- Ingredient costs (meat, organs, carbs, veg, oils).
- Premix and packaging.
- Co-packing / manufacturing.
- Cold-chain shipping and insulation.

Model assumptions:

- Full kit COGS ~42% of revenue.
- DIY COGS ~35%.
- Average shipping cost: $12.50 per box.
- Blended gross margin: ~47.2%.

### 7.3 Acquisition & LTV

**CAC:**

- Blended CAC: $75.
- Based on pet industry PPC metrics:
  - High conversion rates (search & social).
  - Strong targeting and retargeting.

**Retention and LTV:**

- Month 4+ retention: 94% (stabilized).
- Average lifetime: 18 months.
- Blended LTV: ~$1,827 per customer.
- LTV:CAC ratio: ~24.4x.

This ratio supports aggressive scaling and continued reinvestment in growth.

***

## 8. 3-Year Financial Model (High-Level)

### 8.1 Growth Trajectory

Customer acquisition curve:

- Months 1–6: Pilot (70–170 new customers/month).
- Months 7–18: Regional expansion (300–1,400 new customers/month).
- Months 19–36: Scale (1,650–4,350 new customers/month).

### 8.2 Annual Summary (from model)

**Year 1:**

- Revenue: $1.31M
- COGS: $0.69M
- Gross Profit: $0.62M
- Marketing Spend: $0.30M
- OpEx: $0.67M
- EBITDA: -$0.35M
- Ending customers: 3,008
- New customers: 4,020

**Year 2:**

- Revenue: $10.32M
- COGS: $5.46M
- Gross Profit: $4.87M
- Marketing Spend: $1.43M
- OpEx: $0.89M
- EBITDA: $2.55M
- Ending customers: 14,317
- New customers: 19,050

**Year 3:**

- Revenue: $29.89M
- COGS: $15.80M
- Gross Profit: $14.09M
- Marketing Spend: $3.04M
- OpEx: $1.36M
- EBITDA: $9.70M
- Ending customers: 33,153
- New customers: 40,500

Monthly-level details and CSVs exist in the underlying model.

***

## 9. Operations & Supply Chain

### 9.1 Production

- Use contract manufacturers familiar with:
  - Fresh/frozen pet food and/or human food production.
  - Batch-based production of pre-portioned mixes.
- Standardize on:
  - Meat/organ base mixes.
  - Carb/veg mixes.
  - Premix for each template recipe.

### 9.2 Fulfillment

- Cold chain:
  - Insulated packaging and frozen gel packs.
  - Regional distribution centers (Phase 2) to reduce transit times and costs.
- Frequency:
  - Weekly or bi-weekly shipments.
  - Option for multi-week shipments for smaller dogs.

***

## 10. Data, Moat, and Defensibility

### 10.1 What’s Non-Proprietary

- AAFCO nutrient tables.
- FoodData Central.
- MER equations.
- Generic homemade diet literature.

### 10.2 Differentiating Assets

1. **Proprietary MER and outcome dataset:**
   - Weight, BCS, and health metrics at scale.
   - Model improvements that lower average error vs literature defaults.

2. **Real-world nutrient intake distributions:**
   - Actual variance in intake vs modeled AAFCO coverage, by recipe and dog segment.
   - Empirically validated recipes and feeding guidelines.

3. **Veterinary tooling and integrations:**
   - Vet-specific dashboards.
   - Integration into practice management systems.
   - Co-branded or white-labeled plans.

4. **Regulatory and QA infrastructure:**
   - Reputation for conservative, compliant labeling and safety.
   - Faster introduction of new recipes under known frameworks.

***

## 11. Roadmap

### Phase 0 (0–6 months)

- Finalize concept, regulatory consult, ingredient and nutrient database.
- Build MER and nutrient modeling engine MVP.
- Design 5–10 AAFCO-compliant recipes (adult maintenance).
- Co-packer selection and pilot runs.

### Phase 1 (6–18 months)

- Soft launch in one or two metros.
- 50–100 pilot dogs with deep tracking.
- Iterate recipes, UX, and logistics based on feedback.
- Prepare initial clinical data outputs.

### Phase 2 (18–36 months)

- Geographic expansion, additional template recipes.
- Vet-clinic partnership development.
- Explore human-grade compliance for select SKUs.
- Publish initial clinical or outcomes data.
- Prepare for Series B or growth-equity round.

***

## 12. Investor Narrative

- **Market:** Fresh and human-grade pet food is a fast-growing, multi-billion dollar market with strong unit economics and resilient consumer demand.
- **Problem:** Homemade diets are nutritionally unreliable; commercial foods are opaque; weight and healthspan are undersolved.
- **Solution:** Dogology combines:
  - AAFCO compliance.
  - Transparency and MER modeling.
  - Kits that transform “I want to cook for my dog” from risky to safe and optimized.
- **Economics:** 47% gross margins, 24.4x LTV:CAC, EBITDA positive in Year 2.
- **Defensibility:** Data flywheel, vet integration, compliance credibility, and a novel product category between commercial ready-to-eat foods and ad-hoc homemade diets.
