import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    /** Reading time of the real article; computed from the body when absent. */
    minutes: z.number().int().positive().optional(),
    /** Placeholder body (title is real, text is not). */
    sample: z.boolean().default(false),
  }),
});

export const collections = { posts };
