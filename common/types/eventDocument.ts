import { z } from 'zod';

import { ImageSchema } from './image';

export const EventDocumentTimeSchema = z.object({
  startDateTime: z.date().optional(),
  endDateTime: z.date().optional(),
  isFullyBooked: z.object({
    inVenue: z.boolean(),
    online: z.boolean(),
  }),
});

export const EventDocumentFormatSchema = z.object({
  type: z.enum(['EventFormat', 'ExhibitionFormat']),
  id: z.string(),
  label: z.string().optional(),
});

export const EventDocumentPlaceSchema = z.object({
  type: z.literal('EventPlace'),
  id: z.string(),
  label: z.string().optional(),
});

export const EventDocumentLocationsSchema = z.object({
  isOnline: z.boolean(),
  places: z.array(EventDocumentPlaceSchema).optional(),
  attendance: z.array(
    z.union([
      z.object({
        id: z.literal('online'),
        label: z.literal('Online'),
        type: z.literal('EventAttendance'),
      }),
      z.object({
        id: z.literal('in-our-building'),
        label: z.literal('In our building'),
        type: z.literal('EventAttendance'),
      }),
    ])
  ),
  type: z.literal('EventLocations'),
});

export const EventDocumentInterpretationSchema = z.object({
  type: z.literal('EventInterpretation'),
  id: z.string(),
  label: z.string().optional(),
});

export const EventDocumentAudienceSchema = z.object({
  type: z.literal('EventAudience'),
  id: z.string(),
  label: z.string().optional(),
});

export const SeriesSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string().optional(),
    contributors: z.array(z.string()).optional(),
  })
);

export const EventDocumentSchema = z.object({
  type: z.literal('Event'),
  id: z.string(),
  uid: z.string().nullable(),
  title: z.string(),
  image: ImageSchema.optional(),
  times: z.array(EventDocumentTimeSchema),
  isExhibition: z.boolean(),
  format: EventDocumentFormatSchema,
  locations: EventDocumentLocationsSchema,
  interpretations: z.array(EventDocumentInterpretationSchema),
  audiences: z.array(EventDocumentAudienceSchema),
  series: SeriesSchema,
  isAvailableOnline: z.boolean(),
});

export type EventDocument = z.infer<typeof EventDocumentSchema>;
export type EventDocumentTime = z.infer<typeof EventDocumentTimeSchema>;
export type EventDocumentFormat = z.infer<typeof EventDocumentFormatSchema>;
export type EventDocumentLocations = z.infer<
  typeof EventDocumentLocationsSchema
>;
export type EventDocumentPlace = z.infer<typeof EventDocumentPlaceSchema>;
export type EventDocumentInterpretation = z.infer<
  typeof EventDocumentInterpretationSchema
>;
export type EventDocumentAudience = z.infer<typeof EventDocumentAudienceSchema>;
export type Series = z.infer<typeof SeriesSchema>;
