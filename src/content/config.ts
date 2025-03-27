import { defineCollection, z } from "astro:content";

const restaurants = defineCollection({
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    // description: z.string(),

    // Transform string to Date object
    reviewDate: z.coerce.date(),
    heroImage: z.string().optional(),
    wins: z.number(),
    defeatedBy: z.string().optional(),
  }),
});

const matchups = defineCollection({
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    // description: z.string(),

    // Transform string to Date object
    reviewDate: z.coerce.date(),
    winner: z.string(),
  }),
});

export const collections = { restaurants, matchups };
