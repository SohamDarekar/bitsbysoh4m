import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Date must be in ISO format (YYYY-MM-DDTHH:MM:SS.sssZ or YYYY-MM-DD)',
    }),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    draft: z.boolean().default(false),
    customSlug: z.string().optional(), // Rename slug field to customSlug
  }),
});

const about = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { blog, about };