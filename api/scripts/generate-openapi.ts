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
import {
  AddressableArticleDisplaySchema,
  AddressableBookDisplaySchema,
  AddressableEventDisplaySchema,
  AddressableExhibitionDisplaySchema,
  AddressableExhibitionHighlightTourDisplaySchema,
  AddressableExhibitionTextDisplaySchema,
  AddressablePageDisplaySchema,
  AddressableProjectDisplaySchema,
  AddressableSeasonDisplaySchema,
  AddressableVisualStoryDisplaySchema,
  LinkedWorkSchema as CommonLinkedWorkSchema,
} from '@weco/content-common/types/addressable';
import {
  ArticleFormatSchema as CommonArticleFormatSchema,
  ArticleSchema as CommonArticleSchema,
  ContributorAgentSchema as CommonContributorAgentSchema,
  ContributorRoleSchema as CommonContributorRoleSchema,
  ContributorSchema as CommonContributorSchema,
} from '@weco/content-common/types/article';
import {
  EventDocumentSchema as CommonEventDocumentSchema,
  EventDocumentLocationsSchema as CommonEventLocationsSchema,
} from '@weco/content-common/types/eventDocument';
import {
  DimensionsSchema as CommonDimensionsSchema,
  ImageSchema as CommonImageSchema,
} from '@weco/content-common/types/image';

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
      type: z.literal('Error'),
    })
    .openapi({ title: 'Error' })
);

registry.register('Dimensions', CommonDimensionsSchema);

registry.register(
  'Image',
  CommonImageSchema.openapi({
    title: 'Image',
    description:
      'Information regarding the location, dimensions, alt-text, and copyright of an image',
  })
);

const ArticleFormatSchema = registry.register(
  'ArticleFormat',
  CommonArticleFormatSchema.openapi({
    title: 'ArticleFormat',
    description: 'The format of an article (eg article, comic)',
  })
);

registry.register(
  'ContributorRole',
  CommonContributorRoleSchema.openapi({
    title: 'ContributorRole',
    description: 'A role of a contributor (eg. author, editor)',
  })
);

const ContributorAgentSchema = registry.register(
  'ContributorAgent',
  CommonContributorAgentSchema.openapi({
    title: 'Contributor',
    description: 'A contributor',
  })
);

registry.register('Contributor', CommonContributorSchema);

const ArticleSchema = registry.register(
  'Article',
  CommonArticleSchema.openapi({
    title: 'Article',
    description: 'A piece of editorial content',
  })
);

registry.register(
  'LinkedWork',
  CommonLinkedWorkSchema.openapi({
    title: 'LinkedWork',
    description: 'A Catalogue Work linked to from the content',
  })
);

registry.register(
  'EventLocations',
  CommonEventLocationsSchema.openapi({
    description: 'Where the event takes place',
  })
);

const EventSchema = registry.register(
  'Event',
  CommonEventDocumentSchema.openapi({
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

// Addressable schemas
registry.register(
  'AddressablesArticle',
  AddressableArticleDisplaySchema.openapi({ title: 'Article' })
);
registry.register(
  'AddressablesBook',
  AddressableBookDisplaySchema.openapi({ title: 'Book' })
);
registry.register(
  'AddressablesEvent',
  AddressableEventDisplaySchema.openapi({ title: 'Event' })
);
registry.register(
  'AddressablesExhibition',
  AddressableExhibitionDisplaySchema.openapi({ title: 'Exhibition' })
);
registry.register(
  'AddressablesExhibitionText',
  AddressableExhibitionTextDisplaySchema.openapi({ title: 'Exhibition text' })
);
registry.register(
  'AddressablesExhibitionHighlightTourBSL',
  AddressableExhibitionHighlightTourDisplaySchema.openapi({
    title: 'Exhibition highlight tour',
  })
);
registry.register(
  'AddressablesExhibitionHighlightTourAudio',
  AddressableExhibitionHighlightTourDisplaySchema.openapi({
    title: 'Exhibition highlight tour',
  })
);
registry.register(
  'AddressablesPage',
  AddressablePageDisplaySchema.openapi({ title: 'Page' })
);
registry.register(
  'AddressablesProject',
  AddressableProjectDisplaySchema.openapi({ title: 'Project' })
);
registry.register(
  'AddressablesSeason',
  AddressableSeasonDisplaySchema.openapi({ title: 'Season' })
);
registry.register(
  'AddressablesVisualStory',
  AddressableVisualStoryDisplaySchema.openapi({ title: 'Visual story' })
);

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
