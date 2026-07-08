import { z } from 'zod';

import { ImageSchema } from './image';

export const ContributorAgentSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  type: z.enum(['Person', 'Organisation']),
});

export const ContributorRoleSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  type: z.literal('EditorialContributorRole'),
});

export const ContributorSchema = z.object({
  type: z.literal('Contributor'),
  contributor: ContributorAgentSchema.optional(),
  role: ContributorRoleSchema.optional(),
});

export const ArticleFormatSchema = z.object({
  type: z.literal('ArticleFormat'),
  id: z.string(),
  label: z.string(),
});

export const ArticleSchema = z.object({
  type: z.literal('Article'),
  id: z.string(),
  uid: z.string().optional(),
  title: z.string(),
  publicationDate: z.string(),
  contributors: z.array(ContributorSchema),
  format: ArticleFormatSchema,
  image: ImageSchema.optional(),
  caption: z.string().optional(),
  seriesTitle: z.string().optional(),
});

export type Article = z.infer<typeof ArticleSchema>;
export type ArticleFormat = z.infer<typeof ArticleFormatSchema>;
export type Contributor = z.infer<typeof ContributorSchema>;
