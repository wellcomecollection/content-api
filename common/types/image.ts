import { z } from 'zod';

export const DimensionsSchema = z.object({
  width: z.number().int(),
  height: z.number().int(),
});

// Thumbnail crops have the same shape as a full image but without nested crops
const ThumbnailSchema = z.object({
  dimensions: DimensionsSchema,
  alt: z.string().nullable().optional(),
  copyright: z.string().nullable().optional(),
  url: z.string(),
});

export const ImageSchema = z.object({
  type: z.literal('PrismicImage'),
  dimensions: DimensionsSchema,
  alt: z.string().nullable().optional(),
  copyright: z.string().nullable().optional(),
  url: z.string(),
  '32:15': ThumbnailSchema.optional(),
  '16:9': ThumbnailSchema.optional(),
  square: ThumbnailSchema.optional(),
});

export type Image = z.infer<typeof ImageSchema>;
