import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const issues = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/issues' }),
  schema: ({ image }) =>
    z.object({
      vol: z.number().int().positive(),
      title: z.string(),
      subtitle: z.string(),
      section: z.string(),
      sectionEn: z.string(),
      date: z.coerce.date(),
      cover: image(),
      coverAlt: z.string(),
      coverCaption: z.string().optional(),
      sample: z.boolean().default(false),
    }),
});

export const collections = { issues };
