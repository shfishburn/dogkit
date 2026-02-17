#!/usr/bin/env python3
import os

FRONT_MATTERS = {
    "/Users/shf/Documents/Github/dog/packages/overview.md": """---
title: "Dogology HealthSpan Kits — Overview"
version: "1.0.0"
status: "stable"
description: "Product overview: AAFCO-aligned nutrition, transparent MER modeling, and weekly cook-at-home delivery."
category: "overview"
tags: ["product", "overview", "mer", "aafco", "subscription"]
seeAlso:
  - id: "business/model"
    title: "Business Model"
  - id: "business/plan"
    title: "Business Plan v1.2"
  - id: "app/canine-meal-plan-pipeline-spec-v1"
    title: "Meal Plan Pipeline Spec"
  - id: "research/canine-nutrition-research-summary"
    title: "Nutrition Research Summary"
---
""",
    "/Users/shf/Documents/Github/dog/packages/app/canine_meal_plan_pipeline_spec_v1.md": """---
title: "Canine Meal Plan Pipeline Specification v1.0"
version: "1.0.0"
status: "stable"
description: "Full pipeline spec: user inputs to MER calculation to nutrient targets to ingredient constraint solving. NRC 2006 / FEDIAF 2024."
category: "pipeline"
tags: ["pipeline", "mer", "nrc", "fediaf", "constraint-solver", "nutrition"]
seeAlso:
  - id: "overview"
    title: "Product Overview"
  - id: "research/canine-nutrition-research-summary"
    title: "Nutrition Research Summary"
  - id: "human/comparison"
    title: "Human vs. Canine Pipeline"
  - id: "ingredients/canine-ingredient-database"
    title: "Ingredient Database"
---
""",
    "/Users/shf/Documents/Github/dog/packages/business/model.md": """---
title: "Dogology HealthSpan Kits — Business Model v1.0"
version: "1.0.0"
status: "stable"
description: "Complete business model: concept, market sizing, customer profile, competitive landscape, revenue model, unit economics, and operational plan."
category: "business"
tags: ["business", "revenue", "market", "subscription", "unit-economics"]
seeAlso:
  - id: "overview"
    title: "Product Overview"
  - id: "business/plan"
    title: "Business Plan v1.2"
  - id: "app/canine-meal-plan-pipeline-spec-v1"
    title: "Meal Plan Pipeline Spec"
---
""",
    "/Users/shf/Documents/Github/dog/packages/business/plan.md": """---
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
""",
    "/Users/shf/Documents/Github/dog/packages/human/comparison.md": """---
title: "Human vs. Canine Pipeline: Mapping and Divergence"
version: "1.0.0"
status: "reference"
description: "What transfers from human HealthSpan AI to the canine pipeline and where they diverge: protein reference frames, basal rate formulas, body composition correction."
category: "research"
tags: ["comparison", "human", "canine", "pipeline", "tdee", "mer", "protein"]
seeAlso:
  - id: "app/canine-meal-plan-pipeline-spec-v1"
    title: "Meal Plan Pipeline Spec"
  - id: "research/canine-nutrition-research-summary"
    title: "Nutrition Research Summary"
---
""",
    "/Users/shf/Documents/Github/dog/packages/research/canine_nutrition_research_summary.md": """---
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
""",
    "/Users/shf/Documents/Github/dog/packages/research/deep-research-report.md": """---
title: "Store-Bought Dog Food and Dog Health Outcomes — Deep Research Report"
version: "1.0.0"
status: "stable"
description: "Deep research analysis: obesity burden, label opacity, recall risk, and the conversion case for fresh meal-kit alternatives. Evidence graded by strength."
category: "research"
tags: ["research", "commercial-food", "obesity", "evidence", "market-insight", "conversion"]
seeAlso:
  - id: "overview"
    title: "Product Overview"
  - id: "business/plan"
    title: "Business Plan v1.2"
  - id: "research/canine-nutrition-research-summary"
    title: "Nutrition Research Summary"
---
""",
    "/Users/shf/Documents/Github/dog/packages/ingredients/Canine Ingredient Database.md": """---
title: "Canine Homemade Diet — Ingredient Database"
version: "1.0.0"
status: "stable"
description: "76 grocery-sourceable ingredients mapped to pipeline constraint dimensions. USDA FDC references, availability tiers (T1/T2/T3), and nutrient dimension codes."
category: "reference"
tags: ["ingredients", "database", "usda", "fdc", "nutrients", "constraints", "tiers"]
seeAlso:
  - id: "overview"
    title: "Product Overview"
  - id: "app/canine-meal-plan-pipeline-spec-v1"
    title: "Meal Plan Pipeline Spec"
  - id: "research/canine-nutrition-research-summary"
    title: "Nutrition Research Summary"
---
""",
}

for filepath, fm in FRONT_MATTERS.items():
    with open(filepath, 'r') as f:
        content = f.read()
    # Skip if already has front matter
    if content.startswith('---'):
        print(f'SKIP (already has front matter): {filepath}')
        continue
    with open(filepath, 'w') as f:
        f.write(fm + content)
    print(f'OK: {filepath}')

print('Done.')
