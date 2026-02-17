import { defineCollection, z } from 'astro:content';

const seeAlsoItem = z.object({
  id: z.string(),
  title: z.string(),
});

const specs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    version: z.string().optional(),
    status: z.enum(['stable', 'draft', 'reference', 'deprecated']).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    seeAlso: z.array(seeAlsoItem).optional(),
  }),
});

export const collections = { specs };
