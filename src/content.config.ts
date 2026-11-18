import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  // Files whose name starts with "_" are ignored (scratch notes, templates).
  loader: glob({ pattern: ['**/*.md', '!**/_*'], base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    /** Reading time in minutes; computed from the body when absent. */
    minutes: z.number().int().positive().optional(),
    description: z.string().optional(),
    /** Drafts build locally (`pnpm dev`) but never ship. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
