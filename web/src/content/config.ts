import { defineCollection, z } from 'astro:content';

const specs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
  }),
});

export const collections = { specs };
