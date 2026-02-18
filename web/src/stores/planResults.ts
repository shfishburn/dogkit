import { computed } from "nanostores";
import { $dogProfile } from "./dogProfile";

export type SizeCategory = "small" | "medium" | "large";

export interface MerResult {
  rer: number;
  multiplier: number;
  reason: string;
  dailyKcal: number;
  mealsPerDay: number;
  perMeal: number;
  sizeCategory: SizeCategory;
}

function computeRER(weightKg: number): number {
  return 70 * Math.pow(weightKg, 0.75);
}

function mealsPerDay(ageMonths: number): number {
  if (ageMonths < 4) return 4;
  if (ageMonths < 12) return 3;
  return 2;
}

function merMultiplier(params: {
  ageMonths: number;
  neuterStatus: string;
  activityLevel: string;
  weightGoal: string;
  bcs: number;
}): { mult: number; reason: string } {
  const { ageMonths, neuterStatus, activityLevel, weightGoal, bcs } = params;

  if (ageMonths < 4) return { mult: 3.0, reason: "Puppy (under 4 months)" };
  if (ageMonths < 12) return { mult: 2.0, reason: "Puppy (4–12 months)" };

  let base = neuterStatus === "neutered" ? 1.6 : 1.8;
  let reason =
    neuterStatus === "neutered"
      ? "Adult neutered baseline"
      : "Adult intact baseline";

  const activity: Record<string, number> = {
    sedentary: 1.4,
    moderate: base,
    active: 2.0,
    working: 3.0,
  };
  const activityMult = activity[activityLevel] ?? base;
  if (activityLevel !== "moderate") {
    base = activityMult;
    reason = `Adult ${activityLevel}`;
  }

  if (weightGoal === "lose") {
    base = Math.min(base, 1.0);
    reason += " + weight loss";
  } else if (weightGoal === "gain") {
    base = Math.max(base, 2.0);
    reason += " + weight gain";
  }

  if (bcs >= 7) {
    base *= 0.9;
    reason += " (BCS high)";
  } else if (bcs <= 3) {
    base *= 1.1;
    reason += " (BCS low)";
  }

  return { mult: base, reason };
}

function sizeCategory(dailyKcal: number): SizeCategory {
  if (dailyKcal <= 750) return "small";
  if (dailyKcal <= 1200) return "medium";
  return "large";
}

export const $merResult = computed(
  $dogProfile,
  (profile): MerResult | null => {
    const weightKg = parseFloat(profile.weight_kg);
    const ageMonths = parseInt(profile.age_months, 10);
    const bcs = parseInt(profile.bcs, 10);

    if (isNaN(weightKg) || isNaN(ageMonths) || isNaN(bcs)) return null;

    const rer = computeRER(weightKg);
    const { mult, reason } = merMultiplier({
      ageMonths,
      neuterStatus: profile.neuter_status,
      activityLevel: profile.activity_level,
      weightGoal: profile.weight_goal,
      bcs,
    });
    const dailyKcal = rer * mult;
    const meals = mealsPerDay(ageMonths);

    return {
      rer,
      multiplier: mult,
      reason,
      dailyKcal,
      mealsPerDay: meals,
      perMeal: dailyKcal / meals,
      sizeCategory: sizeCategory(dailyKcal),
    };
  },
);
