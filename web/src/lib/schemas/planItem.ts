import { z } from "zod";

export const PlanItemSchema = z.object({
  phase: z.string(),
  month_range: z.string(),
  task_id: z.string(),
  title: z.string(),
  description: z.string(),
});

export const PlanItemArraySchema = z.array(PlanItemSchema);

export type PlanItem = z.infer<typeof PlanItemSchema>;
