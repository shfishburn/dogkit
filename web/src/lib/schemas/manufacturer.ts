import { z } from "zod";

export const ManufacturerCandidateSchema = z.object({
  rank: z.number(),
  name: z.string(),
  website: z.string().optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  ideal_stage: z.string().optional(),
  description: z.string().optional(),
  fit_notes: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
});

export const ManufacturerDbSchema = z.object({
  candidates: z.array(ManufacturerCandidateSchema),
});

export type ManufacturerCandidate = z.infer<typeof ManufacturerCandidateSchema>;
export type ManufacturerDb = z.infer<typeof ManufacturerDbSchema>;
