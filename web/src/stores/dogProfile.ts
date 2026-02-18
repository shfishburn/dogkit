import { persistentMap } from "@nanostores/persistent";

export type DogProfile = Record<string, string>;

const DEFAULTS: DogProfile = {
  weight_kg: "10",
  age_months: "24",
  bcs: "5",
  neuter_status: "neutered",
  activity_level: "moderate",
  weight_goal: "maintain",
  breed: "Mixed Breed",
};

const KEYS = Object.keys(DEFAULTS);

export const $dogProfile = persistentMap<DogProfile>(
  "dogology:profile:",
  DEFAULTS,
);

/** Set all fields at once from URL params or form data */
export function setProfileFromParams(params: URLSearchParams): void {
  const updates: DogProfile = { ...DEFAULTS };
  for (const key of KEYS) {
    const val = params.get(key);
    if (val !== null) updates[key] = val;
  }
  $dogProfile.set(updates);
}

/** Export current profile as URLSearchParams */
export function profileToParams(): URLSearchParams {
  return new URLSearchParams($dogProfile.get());
}
