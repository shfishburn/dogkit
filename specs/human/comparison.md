## What Maps Cleanly

The **pipeline pattern** is nearly identical — both are `basal_rate → multiplier_chain → body_comp_correction → nutrient_targets`. Three concepts transfer directly: [perplexity](https://www.perplexity.ai/search/8931a25f-9d2b-4976-8afa-77b6bffd9cca)

- **Multiplier architecture**: TDEE = BMR × activity_factor is the same pattern as MER = RER × life_stage × neuter × activity × weight_goal. The canine version just chains more factors.
- **Body composition correction**: Human uses BF% → lean mass. Canine uses BCS → ideal body weight. Different inputs, same purpose — correcting raw weight before it enters the energy equation.
- **Fat minimum floor**: Human enforces 20% of calories. Canine enforces 13.8 g/1000 kcal (~12%). Same concept, different threshold.

## What Does NOT Map

Five major structural differences:

### Protein targeting is the biggest gap
Human HealthSpan AI anchors protein to **lean body mass** (1.6–2.4 g/kg LBM). The canine pipeline anchors protein to **energy intake** (45–75 g/1000 kcal). These are fundamentally different reference frames. When you back-calculate, dogs end up needing ~2.8 g/kg LBM vs humans at ~2.0 g/kg LBM — about 40% more protein per unit muscle, which is consistent with higher canine protein turnover and gluconeogenesis reliance. [souldogsynergy](https://souldogsynergy.com/wp-content/uploads/2022/06/2006-NRC-Nutrient-Requirements-for-Adult-Dogs-Maintenance-.pdf)

### Basal rate formula is structurally different
Mifflin-St Jeor is a 4-input **linear regression** (weight, height, age, sex). Canine RER is a 1-input **power function** (70 × BW⁰·⁷⁵). Dogs don't use height at all — a Dachshund and a Whippet at the same weight get the same RER. The closest human analog to the canine equation is actually Katch-McArdle (370 + 21.6 × LBM), which is also composition-aware and sex-independent. [pmc.ncbi.nlm.nih](https://pmc.ncbi.nlm.nih.gov/articles/PMC5672324/)

### Metabolic adaptation exists in human pipeline only
Your 3-component adaptation model (time decay τ=12 weeks, BF% protection threshold, GLP-1 adjustment, 15% cap) has **no canine equivalent**. Dogs almost certainly experience adaptive thermogenesis, but no published validated model exists. The veterinary approach is empirical: reassess BCS monthly, adjust MER ±10%. This is a product opportunity — you could build a simplified canine version using the same architecture. [pmc.ncbi.nlm.nih](https://pmc.ncbi.nlm.nih.gov/articles/PMC12345587/)

### Weight loss simulation has no canine equivalent
HealthSpan AI's weekly projection loop (recalculate BMR → adapt → partition fat/lean → update composition) could be ported to canine with some assumptions. The 7700 kcal/kg fat conversion is species-independent. Dogs on high-protein weight-loss diets lose roughly 80% fat / 20% lean. The missing piece is the adaptation model.

### Carbs are irrelevant for dogs
Dogs have no dietary carbohydrate requirement. Your human carb calculation (residual macro after protein + fat) and dietary approach modes (balanced/keto/low-carb) have no canine equivalent. The canine pipeline only tracks 2 macros instead of 3.

## What Canine Has That Human Doesn't

The canine pipeline is **more complex** in two areas that HealthSpan AI doesn't touch:

- **Micronutrient tracking**: 25 nutrients with min/max targets, Ca:P ratio enforcement, safe upper limits. Your human calculator stops at macros.
- **Toxic ingredient enforcement**: A hard-block list with no human parallel (humans don't have species-level food toxins).

## Shared Infrastructure

If both live on the same platform, these components can be shared code: [perplexity](https://www.perplexity.ai/search/889e523f-44ea-44d4-b851-7384c9923667)

- Unit conversion library
- USDA FDC ingredient database (food is food — chicken breast nutrient data is species-independent)
- Deficit/surplus math
- Weight tracking + trend visualization
- Activity level taxonomy (same concept, different factor values)