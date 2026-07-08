import { z } from 'zod';

export const LinkedWorkSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  workType: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  date: z.string().optional(),
  mainContributor: z.string().optional(),
});

const addressableBase = {
  id: z.string(),
  uid: z.string().nullable(),
  title: z.string(),
  description: z.string().optional(),
  linkedWorks: z.array(LinkedWorkSchema),
};

export const AddressableArticleDisplaySchema = z.object({
  type: z.literal('Article'),
  ...addressableBase,
});

export const AddressableBookDisplaySchema = z.object({
  type: z.literal('Book'),
  ...addressableBase,
  contributors: z.string().optional(),
});

export const AddressableEventDisplaySchema = z.object({
  type: z.literal('Event'),
  ...addressableBase,
  format: z.string().optional(),
  times: z.object({ start: z.date(), end: z.date() }).optional(),
});

export const AddressableExhibitionDisplaySchema = z.object({
  type: z.literal('Exhibition'),
  ...addressableBase,
  format: z.string().optional(),
  dates: z
    .object({
      start: z.string().nullable(),
      end: z.string().nullable(),
    })
    .optional(),
});

export const AddressableExhibitionTextDisplaySchema = z.object({
  type: z.literal('Exhibition text'),
  ...addressableBase,
});

export const AddressableExhibitionHighlightTourDisplaySchema = z.object({
  type: z.literal('Exhibition highlight tour'),
  ...addressableBase,
  highlightTourType: z.string().optional(),
});

export const AddressablePageDisplaySchema = z.object({
  type: z.literal('Page'),
  ...addressableBase,
  tags: z.array(z.string()).optional(),
});

export const AddressableProjectDisplaySchema = z.object({
  type: z.literal('Project'),
  ...addressableBase,
  format: z.string().optional(),
});

export const AddressableSeasonDisplaySchema = z.object({
  type: z.literal('Season'),
  ...addressableBase,
});

export const AddressableVisualStoryDisplaySchema = z.object({
  type: z.literal('Visual story'),
  ...addressableBase,
});

export type LinkedWork = z.infer<typeof LinkedWorkSchema>;
export type AddressableArticleDisplay = z.infer<
  typeof AddressableArticleDisplaySchema
>;
export type AddressableBookDisplay = z.infer<
  typeof AddressableBookDisplaySchema
>;
export type AddressableEventDisplay = z.infer<
  typeof AddressableEventDisplaySchema
>;
export type AddressableExhibitionDisplay = z.infer<
  typeof AddressableExhibitionDisplaySchema
>;
export type AddressableExhibitionTextDisplay = z.infer<
  typeof AddressableExhibitionTextDisplaySchema
>;
export type AddressableExhibitionHighlightTourDisplay = z.infer<
  typeof AddressableExhibitionHighlightTourDisplaySchema
>;
export type AddressablePageDisplay = z.infer<
  typeof AddressablePageDisplaySchema
>;
export type AddressableProjectDisplay = z.infer<
  typeof AddressableProjectDisplaySchema
>;
export type AddressableSeasonDisplay = z.infer<
  typeof AddressableSeasonDisplaySchema
>;
export type AddressableVisualStoryDisplay = z.infer<
  typeof AddressableVisualStoryDisplaySchema
>;
