/**
 * Generates the OpenAPI 3.1 spec for the Content API and writes it to stdout.
 * Usage: npx tsx api/scripts/generate-openapi.ts
 */
import {
  extendZodWithOpenApi,
  OpenApiGeneratorV31,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import { stringify } from 'yaml';
import { z } from 'zod';

import { AddressablesQuerySchema } from '@weco/content-api/src/controllers/addressables';
import { ArticlesQuerySchema } from '@weco/content-api/src/controllers/articles';
import { EventsQuerySchema } from '@weco/content-api/src/controllers/events';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function errorRef() {
  return { $ref: '#/components/schemas/Error' };
}

function stdErrors() {
  const body = (description: string) => ({
    description,
    content: { '*/*': { schema: errorRef() } },
  });
  return {
    400: body('Bad Request Error'),
    404: body('Not Found Error'),
    410: body('Gone Error'),
    500: body('Internal Server Error'),
  };
}

// ─── Component schemas ────────────────────────────────────────────────────────

registry.register(
  'Error',
  z
    .object({
      errorType: z.enum(['http']).openapi({ description: 'The type of error' }),
      httpStatus: z.number().int().openapi({
        description: 'The HTTP response status code',
        format: 'int32',
      }),
      label: z
        .string()
        .openapi({ description: 'The title or other short name of the error' }),
      description: z
        .string()
        .optional()
        .openapi({ description: 'The specific error' }),
      type: z.string(),
    })
    .openapi({ title: 'Error' })
);

const DimensionsSchema = registry.register(
  'Dimensions',
  z.object({
    width: z.number().int(),
    height: z.number().int(),
  })
);

const ImageSchema = registry.register(
  'Image',
  z
    .object({
      dimensions: DimensionsSchema.openapi({
        description: 'The intrinsic dimensions of an image',
      }),
      alt: z.string().optional().openapi({
        description:
          'Alternative text to display in place of the image if it cannot be rendered',
      }),
      copyright: z.string().optional().openapi({
        description:
          'Copyright information about the image, including the copyright holder',
      }),
      url: z
        .string()
        .openapi({ description: 'The URL of the image', format: 'uri' }),
      '32:15': DimensionsSchema.optional().openapi({
        description: 'Dimensions of the image for 32:15 aspect ratio',
      }),
      '16:9': DimensionsSchema.optional().openapi({
        description: 'Dimensions of the image for 16:9 aspect ratio',
      }),
      square: DimensionsSchema.optional().openapi({
        description: 'Dimensions of the image for a square aspect ratio',
      }),
      type: z.string(),
    })
    .openapi({
      title: 'Image',
      description:
        'Information regarding the location, dimensions, alt-text, and copyright of an image',
      required: ['dimensions', 'type', 'url'],
    })
);

const ArticleFormatSchema = registry.register(
  'ArticleFormat',
  z
    .object({
      id: z.string().openapi({ description: 'The identifier of the format' }),
      label: z
        .string()
        .openapi({ description: 'The short label of the format' }),
      type: z.string(),
    })
    .openapi({
      title: 'ArticleFormat',
      description: 'The format of an article (eg article, comic)',
    })
);

const ContributorRoleSchema = registry.register(
  'ContributorRole',
  z
    .object({
      id: z
        .string()
        .openapi({ description: 'The identifier of the contributor role' }),
      label: z
        .string()
        .openapi({ description: 'The short label of the contributor role' }),
      type: z.string(),
    })
    .openapi({
      title: 'ContributorRole',
      description: 'A role of a contributor (eg. author, editor)',
    })
);

const ContributorAgentSchema = registry.register(
  'ContributorAgent',
  z
    .object({
      id: z
        .string()
        .openapi({ description: 'The identifier of the contributor' }),
      label: z.string().openapi({
        description: 'The name or other short label of the contributor',
      }),
      type: z.enum(['Person', 'Organisation']),
    })
    .openapi({ title: 'Contributor', description: 'A contributor' })
);

const ContributorSchema = registry.register(
  'Contributor',
  z.object({
    contributor: ContributorAgentSchema,
    role: ContributorRoleSchema.optional(),
  })
);

const ArticleSchema = registry.register(
  'Article',
  z
    .object({
      id: z.string().openapi({ description: 'The identifier of the article' }),
      uid: z.string().openapi({
        description: 'The human-readable identifier of the article',
      }),
      title: z.string().openapi({ description: 'The title of the article' }),
      publicationDate: z.string().openapi({
        description: 'The date on which the article was published',
        format: 'date-time',
      }),
      contributors: z.array(ContributorSchema).openapi({
        description:
          'Relates an article to its author, editor, and any other contributors',
      }),
      format: ArticleFormatSchema,
      caption: z.string().optional().openapi({
        description: "A short description of the article's content",
      }),
      image: ImageSchema.optional(),
      type: z.string(),
    })
    .openapi({ title: 'Article', description: 'A piece of editorial content' })
);

const LinkedWorkSchema = registry.register(
  'LinkedWork',
  z
    .object({
      id: z
        .string()
        .openapi({ description: 'The identifier of the linked work' }),
      title: z
        .string()
        .openapi({ description: 'The title of the linked work' }),
      type: z.string().openapi({ description: 'The type of the linked work' }),
      thumbnailUrl: z.string().optional().openapi({
        description: 'URL of the thumbnail image for the linked work',
      }),
      date: z
        .string()
        .optional()
        .openapi({ description: 'The date associated with the linked work' }),
      mainContributor: z
        .string()
        .openapi({ description: 'The main contributor of the linked work' }),
      workType: z.string().optional().openapi({
        description: 'The type of the work, e.g. Books, Digital Images',
      }),
    })
    .openapi({
      title: 'LinkedWork',
      description: 'A Catalogue Work linked to from the content',
      required: ['id', 'title', 'type', 'mainContributor'],
    })
);

const EventLocationsSchema = registry.register(
  'EventLocations',
  z
    .object({
      isOnline: z.boolean().openapi({
        description: 'Whether or not the event takes place online',
      }),
      attendance: z
        .array(
          z.object({
            id: z.enum(['in-our-building', 'online']).openapi({
              description: 'The identifier of the place',
            }),
            label: z.enum(['In our building', 'Online']).openapi({
              description: 'The short label of the place',
            }),
            type: z.string(),
          })
        )
        .openapi({
          description: 'The general location (e.g. in our building or online)',
        }),
      places: z
        .array(
          z.object({
            id: z
              .string()
              .openapi({ description: 'The identifier of the place' }),
            label: z
              .string()
              .openapi({ description: 'The short label of the place' }),
            type: z.string(),
          })
        )
        .openapi({ description: 'The physical location of the event' }),
      type: z.string(),
    })
    .openapi({ description: 'Where the event takes place' })
);

const EventSchema = registry.register(
  'Event',
  z
    .object({
      id: z.string().openapi({ description: 'The identifier of the event' }),
      uid: z
        .string()
        .openapi({ description: 'The human-readable identifier of the event' }),
      title: z.string().openapi({ description: 'The title of the event' }),
      image: ImageSchema.optional(),
      format: z
        .object({
          id: z
            .string()
            .openapi({ description: 'The identifier of the format' }),
          label: z
            .string()
            .openapi({ description: 'The short label of the format' }),
          type: z.string(),
        })
        .openapi({
          title: 'EventFormat',
          description: 'The format of an event (eg discussion)',
        }),
      locations: EventLocationsSchema,
      interpretations: z.array(
        z
          .object({
            id: z
              .string()
              .openapi({ description: 'The identifier of the format' }),
            label: z
              .string()
              .openapi({ description: 'The short label of the format' }),
            type: z.string(),
          })
          .openapi({
            title: 'EventInterpretation',
            description: 'Which accessibility features the event offers',
          })
      ),
      audiences: z
        .array(
          z
            .object({
              id: z
                .string()
                .openapi({ description: 'The identifier of the audience' }),
              label: z
                .string()
                .openapi({ description: 'The short label of the audience' }),
              type: z.string(),
            })
            .openapi({ title: 'EventAudience' })
        )
        .openapi({ description: 'Which audiences the event is for' }),
      series: z
        .array(
          z.object({
            id: z
              .string()
              .openapi({ description: 'The identifier of the series' }),
            title: z
              .string()
              .openapi({ description: 'The title of the series' }),
            contributors: z.array(z.string()),
          })
        )
        .openapi({ description: 'Which series the event is part of' }),
      isAvailableOnline: z
        .boolean()
        .openapi({ description: 'Whether or not it is a catch-up event' }),
      type: z.string(),
    })
    .openapi({
      title: 'Event',
      description: 'A Wellcome Collection event (on location or online)',
    })
);

const AggregationBucketSchema = registry.register(
  'AggregationBucket',
  z
    .object({
      data: z
        .union([ContributorAgentSchema, ArticleFormatSchema])
        .openapi({ discriminator: { propertyName: 'type' } }),
      count: z.number().int().openapi({
        description:
          'The count of how often this data occurs in this set of results.',
        format: 'int32',
      }),
      type: z.string(),
    })
    .openapi({
      title: 'AggregationBucket',
      description: 'An individual bucket within an aggregation.',
    })
);

const AggregationSchema = registry.register(
  'Aggregation',
  z
    .object({
      buckets: z.array(AggregationBucketSchema),
      type: z.string(),
    })
    .openapi({
      title: 'Aggregation',
      description: 'An aggregation over the results.',
    })
);

const ArticleAggregationsSchema = registry.register(
  'ArticleAggregations',
  z
    .object({
      format: AggregationSchema.optional(),
      'contributors.contributor': AggregationSchema.optional(),
      type: z.string(),
    })
    .openapi({
      title: 'ArticleAggregations',
      description: 'A map containing the requested aggregations.',
    })
);

registry.register(
  'ArticleResultList',
  z
    .object({
      type: z.string(),
      pageSize: z.number().int().openapi({ format: 'int32' }),
      totalPages: z.number().int().openapi({ format: 'int32' }),
      totalResults: z.number().int().openapi({ format: 'int32' }),
      results: z.array(ArticleSchema),
      prevPage: z.string().optional(),
      nextPage: z.string().optional(),
      aggregations: ArticleAggregationsSchema.optional(),
    })
    .openapi({
      title: 'ArticleResultList',
      description: 'A paginated list of articles.',
    })
);

const EventAggregationsSchema = registry.register(
  'EventAggregations',
  z
    .object({
      audience: AggregationSchema.optional(),
      interpretation: AggregationSchema.optional(),
      format: AggregationSchema.optional(),
      isAvailableOnline: AggregationSchema.optional(),
      location: AggregationSchema.optional(),
      type: z.string(),
    })
    .openapi({
      title: 'EventAggregations',
      description: 'A map containing the requested aggregations.',
    })
);

registry.register(
  'EventResultList',
  z
    .object({
      type: z.string(),
      pageSize: z.number().int().openapi({ format: 'int32' }),
      totalPages: z.number().int().openapi({ format: 'int32' }),
      totalResults: z.number().int().openapi({ format: 'int32' }),
      results: z.array(EventSchema),
      prevPage: z.string().optional(),
      nextPage: z.string().optional(),
      aggregations: EventAggregationsSchema.optional(),
    })
    .openapi({
      title: 'EventResultList',
      description: 'A paginated list of events.',
    })
);

// Addressable schemas (flattened — live spec uses nested Addressables/* keys)
function makeAddressable(
  name: string,
  typeLabel: string,
  extra?: z.ZodRawShape
): void {
  registry.register(
    name,
    z
      .object({
        type: z.literal(typeLabel),
        id: z.string().openapi({
          description: `The identifier of the ${typeLabel.toLowerCase()}`,
        }),
        uid: z.string().openapi({
          description: `The human-readable identifier of the ${typeLabel.toLowerCase()}`,
        }),
        title: z.string().openapi({
          description: `The title of the ${typeLabel.toLowerCase()}`,
        }),
        description: z.string().openapi({
          description: `A short description of the ${typeLabel.toLowerCase()}'s content`,
        }),
        linkedWorks: z.array(LinkedWorkSchema).openapi({
          description: 'An array of Catalogue Works linked to from the content',
        }),
        ...(extra ?? {}),
      })
      .openapi({
        title: typeLabel,
        description:
          'A reduced piece of editorial content, limited to the parts necessary to render a summary',
        required: ['type', 'id', 'uid', 'title', 'description', 'linkedWorks'],
      })
  );
}

makeAddressable('AddressablesArticle', 'Article');
makeAddressable('AddressablesBook', 'Book', {
  contributors: z.string().optional().openapi({
    description: 'The name or other short label of the contributor',
  }),
});
makeAddressable('AddressablesEvent', 'Event', {
  format: z
    .string()
    .optional()
    .openapi({ description: 'The short label of the format' }),
  times: z
    .object({
      start: z.string().openapi({
        description: 'The date and time of the start of the event',
        format: 'date-time',
      }),
      end: z.string().openapi({
        description: 'The date and time of the end of the event',
        format: 'date-time',
      }),
    })
    .optional(),
});
makeAddressable('AddressablesExhibition', 'Exhibition', {
  format: z
    .string()
    .optional()
    .openapi({ description: 'The short label of the format' }),
  times: z
    .object({
      start: z.string().openapi({
        description: 'The date and time of the start of the exhibition',
        format: 'date-time',
      }),
      end: z.string().openapi({
        description: 'The date and time of the end of the exhibition',
        format: 'date-time',
      }),
    })
    .optional()
    .openapi({ required: ['times'] }),
});
makeAddressable('AddressablesExhibitionText', 'Exhibition text');
makeAddressable(
  'AddressablesExhibitionHighlightTourBSL',
  'Exhibition highlight tour'
);
makeAddressable(
  'AddressablesExhibitionHighlightTourAudio',
  'Exhibition highlight tour'
);
makeAddressable('AddressablesPage', 'Page', {
  tags: z
    .array(z.string())
    .optional()
    .openapi({ description: 'A list of document tags' }),
});
makeAddressable('AddressablesProject', 'Project', {
  format: z
    .string()
    .optional()
    .openapi({ description: 'The short label of the format' }),
});
makeAddressable('AddressablesSeason', 'Season');
makeAddressable('AddressablesVisualStory', 'Visual story');

const allAddressableSchemaNames = [
  'AddressablesArticle',
  'AddressablesBook',
  'AddressablesEvent',
  'AddressablesExhibition',
  'AddressablesExhibitionText',
  'AddressablesExhibitionHighlightTourBSL',
  'AddressablesExhibitionHighlightTourAudio',
  'AddressablesPage',
  'AddressablesProject',
  'AddressablesSeason',
  'AddressablesVisualStory',
] as const;

const allAddressableRefs = allAddressableSchemaNames.map(name => ({
  $ref: `#/components/schemas/${name}`,
}));

registry.register(
  'AllResultsList',
  z
    .object({
      type: z.string(),
      pageSize: z.number().int().openapi({ format: 'int32' }),
      totalPages: z.number().int().openapi({ format: 'int32' }),
      totalResults: z.number().int().openapi({ format: 'int32' }),
      prevPage: z.string().optional(),
      nextPage: z.string().optional(),
      results: z.array(z.any()).openapi({
        items: { oneOf: allAddressableRefs },
      }),
    })
    .openapi({
      title: 'AllResultList',
      description: 'A paginated list of various types of editorial content',
    })
);

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /articles
registry.registerPath({
  method: 'get',
  path: '/articles',
  operationId: 'getArticles',
  tags: ['Articles'],
  summary: '/articles',
  description: 'Returns a paginated list of articles',
  request: {
    query: ArticlesQuerySchema,
  },
  responses: {
    200: {
      description: 'The articles',
      content: {
        '*/*': { schema: { $ref: '#/components/schemas/ArticleResultList' } },
      },
    },
    ...stdErrors(),
  },
});

// GET /articles/{id}
registry.registerPath({
  method: 'get',
  path: '/articles/{id}',
  operationId: 'getArticle',
  tags: ['Articles'],
  summary: '/articles/{id}',
  description: 'Returns a single article',
  request: {
    params: z.object({
      id: z.string().openapi({
        description: 'The article to return',
        param: { required: true },
      }),
    }),
  },
  responses: {
    200: {
      description: 'The article',
      content: { '*/*': { schema: { $ref: '#/components/schemas/Article' } } },
    },
    ...stdErrors(),
  },
});

// GET /events
registry.registerPath({
  method: 'get',
  path: '/events',
  operationId: 'getEvents',
  tags: ['Events'],
  summary: '/events',
  description: 'Returns a paginated list of events',
  request: {
    query: EventsQuerySchema,
  },
  responses: {
    200: {
      description: 'The events',
      content: {
        '*/*': { schema: { $ref: '#/components/schemas/EventResultList' } },
      },
    },
    ...stdErrors(),
  },
});

// GET /events/{id}
registry.registerPath({
  method: 'get',
  path: '/events/{id}',
  operationId: 'getEvent',
  tags: ['Events'],
  summary: '/events/{id}',
  description: 'Returns a single event',
  request: {
    params: z.object({
      id: z.string().openapi({
        description: 'The event to return',
        param: { required: true },
      }),
    }),
  },
  responses: {
    200: {
      description: 'The event',
      content: { '*/*': { schema: { $ref: '#/components/schemas/Event' } } },
    },
    ...stdErrors(),
  },
});

// GET /all
registry.registerPath({
  method: 'get',
  path: '/all',
  operationId: 'getAll',
  tags: ['All'],
  summary: '/all',
  description:
    'Returns a paginated list of our non-catalogue content, i.e. (articles, books, events, exhibitions, exhibition texts, exhibition highlight tours (BSL), exhibition highlight tours (audio), pages, projects, seasons, and visual stories)',
  request: {
    query: AddressablesQuerySchema,
  },
  responses: {
    200: {
      description: 'The editorial content',
      content: {
        '*/*': { schema: { $ref: '#/components/schemas/AllResultsList' } },
      },
    },
    ...stdErrors(),
  },
});

// GET /all/{id}
registry.registerPath({
  method: 'get',
  path: '/all/{id}',
  operationId: 'getAllById',
  tags: ['All'],
  summary: '/all/{id}',
  description: 'Returns a single piece of our non-catalogue content',
  request: {
    params: z.object({
      id: z.string().openapi({
        description: 'The id of the content to return',
        param: { required: true },
      }),
    }),
  },
  responses: {
    200: {
      description: 'The content',
      content: {
        '*/*': {
          schema: {
            oneOf: allAddressableRefs,
          },
        },
      },
    },
    ...stdErrors(),
  },
});

// ─── Generate ─────────────────────────────────────────────────────────────────

const generator = new OpenApiGeneratorV31(registry.definitions);
const document = generator.generateDocument({
  openapi: '3.1.0',
  info: {
    title: 'Content',
    description: 'Search our non-catalogue content',
    version: 'v0',
    contact: {},
  },
  servers: [{ url: 'https://api.wellcomecollection.org/content/v0' }],
  tags: [{ name: 'Articles' }, { name: 'Events' }, { name: 'All' }],
});

process.stdout.write(stringify(document));
