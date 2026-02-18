import { readFile } from "node:fs/promises";
import path from "node:path";
import type { z } from "zod";
import { WeeklyMealPlanSchema } from "./schemas/mealPlan";
import { IngredientDbSchema } from "./schemas/ingredient";
import { ManufacturerDbSchema } from "./schemas/manufacturer";
import { PlanItemArraySchema } from "./schemas/planItem";
import { FdcMappingDbSchema } from "./schemas/fdc";
import { NutrientDbSchema } from "./schemas/fdc";
import { NistConversionsSchema } from "./schemas/conversions";

const DATA_ROOT = path.resolve(process.cwd(), "..", "data");
const PLAN_ROOT = path.resolve(process.cwd(), "..", "plan");

async function loadAndParse<T>(filePath: string, schema: z.ZodType<T>): Promise<T> {
  const raw = await readFile(filePath, "utf-8");
  return schema.parse(JSON.parse(raw));
}

export function loadWeeklyMealPlan() {
  return loadAndParse(
    path.join(DATA_ROOT, "recipes", "weekly_meal_plan.json"),
    WeeklyMealPlanSchema,
  );
}

export function loadIngredientDb() {
  return loadAndParse(
    path.join(DATA_ROOT, "ingredients", "ingredients.json"),
    IngredientDbSchema,
  );
}

export function loadManufacturerDb() {
  return loadAndParse(
    path.join(DATA_ROOT, "app", "manufacturer", "manufacturer.json"),
    ManufacturerDbSchema,
  );
}

export function loadPlanItems() {
  return loadAndParse(
    path.join(PLAN_ROOT, "plan.json"),
    PlanItemArraySchema,
  );
}

export function loadFdcMapping() {
  return loadAndParse(
    path.join(DATA_ROOT, "ingredients", "fdc_mapping.json"),
    FdcMappingDbSchema,
  );
}

export function loadNutrientDb() {
  return loadAndParse(
    path.join(DATA_ROOT, "ingredients", "nutrients.json"),
    NutrientDbSchema,
  );
}

export function loadNistConversions() {
  return loadAndParse(
    path.join(DATA_ROOT, "conversions", "nist_conversions.json"),
    NistConversionsSchema,
  );
}
