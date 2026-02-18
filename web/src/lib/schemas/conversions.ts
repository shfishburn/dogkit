import { z } from "zod";

export const DensityEntrySchema = z.object({
  density_g_per_ml: z.number(),
});

export const NistConversionsSchema = z.object({
  metadata: z.object({
    version: z.string(),
    source: z.string(),
    description: z.string(),
  }),
  volume_units: z.record(z.string(), z.number()),
  densities: z.record(z.string(), DensityEntrySchema),
});

export type DensityEntry = z.infer<typeof DensityEntrySchema>;
export type NistConversions = z.infer<typeof NistConversionsSchema>;
