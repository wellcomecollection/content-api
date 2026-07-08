import { errors as elasticErrors } from '@elastic/elasticsearch';
import { SortCombinations } from '@elastic/elasticsearch/lib/api/types';
import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';

import { Config } from '@weco/content-api/config';
import { ifDefined, pick } from '@weco/content-api/src/helpers';
import { pickFiltersFromQuery } from '@weco/content-api/src/helpers/requests';
import { resultListResponse } from '@weco/content-api/src/helpers/responses';
import { addressablesFilter } from '@weco/content-api/src/queries/addressables';
import { esQuery } from '@weco/content-api/src/queries/common';
import {
  eventsAggregations,
  eventsFilter,
  eventsQuery,
} from '@weco/content-api/src/queries/events';
import { rewriteAggregationsForFacets } from '@weco/content-api/src/queries/faceting';
import { Clients, Displayable } from '@weco/content-api/src/types';
import { ResultList } from '@weco/content-api/src/types/responses';
import { EVENT_EXHIBITION_FORMAT_ID } from '@weco/content-common/data/defaultValues';

import { HttpError } from './error';
import { paginationElasticBody } from './pagination';
import { timespans } from './utils';
import {
  commaSeparatedEnum,
  commaSeparatedPrismicIds,
  looksLikePrismicId,
  PaginationQuerySchema,
  queryStringSchema,
  workIdsSchema,
} from './validation';

type EventsHandler = RequestHandler<
  never,
  ResultList,
  never,
  Record<string, unknown>
>;

const EVENT_AGGREGATION_VALUES = [
  'format',
  'audience',
  'interpretation',
  'location',
  'isAvailableOnline',
  'timespan',
] as const;

export const EventsQuerySchema = z
  .object({
    query: queryStringSchema,
    sort: commaSeparatedEnum(
      'sort',
      ['relevance', 'times.startDateTime'] as const,
      { singleValue: true, defaultValue: 'relevance' }
    ).meta({
      description: 'Which field to sort the results on',
      enum: ['relevance', 'times.startDateTime'],
    }),
    sortOrder: commaSeparatedEnum('sortOrder', ['asc', 'desc'] as const, {
      singleValue: true,
      defaultValue: 'desc',
    }).meta({
      description: 'The order that the results should be returned in',
      enum: ['asc', 'desc'],
    }),
    aggregations: commaSeparatedEnum(
      'aggregations',
      EVENT_AGGREGATION_VALUES
    ).meta({
      description:
        'What aggregated data in relation to the results should we return',
      enum: [...EVENT_AGGREGATION_VALUES],
    }),
    format: z
      .string()
      .optional()
      .meta({
        description: [
          'Filter events by format. Supports both inclusion and exclusion.',
          '',
          '- To include: `?format=workshop` or `?format=WcKmiysAACx_A8NR`',
          '- To exclude: `?format=!exhibitions`',
          '- Multiple values: `?format=workshop,screening`',
          '',
          'Supported aliases: exhibitions, workshop, gallery-tour, screening, performance, discussion, festival, late, shopping, walking-tour, study-day, send-workshop, seminar, symposium, chill-out, installation, game, session, relaxed-opening',
        ].join('\n'),
      }),
    audience: commaSeparatedPrismicIds('audiences').meta({
      description: 'Filter the events by audience',
    }),
    interpretation: commaSeparatedPrismicIds('interpretations').meta({
      description: 'Filter the events by interpretation',
    }),
    location: commaSeparatedEnum('location', [
      'online',
      'in-our-building',
    ] as const).meta({
      description: 'Filter the events by location',
      enum: ['online', 'in-our-building'],
    }),
    isAvailableOnline: z.literal('true').optional().meta({
      description: 'Filter to catch-up events only',
    }),
    timespan: commaSeparatedEnum(
      'timespan',
      timespans as unknown as ['today', ...string[]],
      { singleValue: true }
    ).meta({
      description: 'Filter events by timespan',
      enum: [...timespans],
    }),
    linkedWork: workIdsSchema,
  })
  .extend(PaginationQuerySchema.shape);

const formatAliasMap: Record<string, string> = {
  exhibitions: EVENT_EXHIBITION_FORMAT_ID,
  shopping: 'W-BjXhEAAASpa8Kb',
  screening: 'W5fV0iYAACYAMxF9',
  festival: 'W5fV5iYAACQAMxHb',
  'send-workshop': 'W5ZIZyYAACMALDSB',
  'walking-tour': 'WcKmcSsAACx_A8La',
  'study-day': 'WcKmeisAALN8A8MB',
  workshop: 'WcKmiysAACx_A8NR',
  discussion: 'Wd-QYCcAACcAoiJS',
  seminar: 'WlYVBiQAACcAWcu9',
  'gallery-tour': 'WmYRpCQAACUAn-Ap',
  symposium: 'Wn3NiioAACsAIdNK',
  performance: 'Wn3Q3SoAACsAIeFI',
  late: 'Ww_LyiEAAFOTlJ4-',
  'chill-out': 'Xa7NJhAAAGpKv4uR',
  installation: 'XiCd_BQAACQA36bS',
  game: 'XiCdcxQAACIA36RO',
  session: 'YzGUuBEAANURf3dM',
  'relaxed-opening': 'ZCv01hQAAOAiVLeR',
};

const transformFormat = (
  rawFormat: string | undefined
): { format?: string; excludeFormat?: string } => {
  if (!rawFormat) return {};

  const includeFormats: string[] = [];
  const excludeFormats: string[] = [];

  for (const value of rawFormat.split(',').map(v => v.trim())) {
    if (!value) continue;

    const isNegated = value.startsWith('!');
    const raw = isNegated ? value.slice(1).trim() : value;
    if (!raw) continue;

    const normalized = formatAliasMap[raw.toLowerCase()] ?? raw;
    if (!looksLikePrismicId(normalized)) {
      throw new HttpError({
        status: 400,
        label: 'Bad Request',
        description: `At least one invalid value has been passed in the formats filter: ${raw}`,
      });
    }
    (isNegated ? excludeFormats : includeFormats).push(normalized);
  }

  return {
    ...(includeFormats.length > 0 ? { format: includeFormats.join(',') } : {}),
    ...(excludeFormats.length > 0
      ? { excludeFormat: excludeFormats.join(',') }
      : {}),
  };
};

const getSortLogic = ({
  sortKey,
  sortOrder,
  pastOrFutureTimespan,
}: {
  sortKey: 'query.times.startDateTime' | '_score';
  sortOrder?: 'asc' | 'desc';
  pastOrFutureTimespan?: 'past' | 'future';
}): SortCombinations => {
  const isSortedByDateTime = sortKey === 'query.times.startDateTime';

  // Only sort by date if both of these are specified
  if (isSortedByDateTime && pastOrFutureTimespan) {
    const finalSortOrder =
      sortOrder || (pastOrFutureTimespan === 'past' ? 'desc' : 'asc');

    return {
      'query.times.startDateTime': {
        order: finalSortOrder,
        nested: {
          path: 'query.times',
          filter: {
            range: {
              'query.times.endDateTime':
                finalSortOrder === 'desc' ? { lt: 'now' } : { gt: 'now' },
            },
          },
        },
      },
    };
  }

  return {
    [sortKey]: {
      order: sortOrder,
      ...(isSortedByDateTime && { nested: { path: 'query.times' } }),
    },
  };
};

const eventsController = (clients: Clients, config: Config): EventsHandler => {
  const index = config.eventsIndex;
  const resultList = resultListResponse(config);

  return asyncHandler(async (req, res) => {
    const params = EventsQuerySchema.parse(req.query);
    const queryString = params.query;
    const { format, excludeFormat } = transformFormat(params.format);
    const sort = params.sort?.[0];
    const sortOrder = params.sortOrder?.[0];
    const aggregations = params.aggregations;

    // Build string-valued filter params for pickFiltersFromQuery
    const filterValues = {
      format,
      audience: params.audience,
      interpretation: params.interpretation,
      location: params.location?.join(','),
      isAvailableOnline: params.isAvailableOnline,
      timespan: params.timespan?.[0],
    };

    const sortKey =
      sort === 'times.startDateTime' ? 'query.times.startDateTime' : '_score';

    const initialAggregations = ifDefined(aggregations, requestedAggs =>
      pick(eventsAggregations, requestedAggs)
    );

    const postFilters = pickFiltersFromQuery(
      [
        'format',
        'audience',
        'interpretation',
        'location',
        'isAvailableOnline',
        'timespan',
      ],
      filterValues,
      eventsFilter
    );

    const facetedAggregations = ifDefined(initialAggregations, aggs =>
      rewriteAggregationsForFacets(aggs, postFilters)
    );

    // Handle linkedWork filtering - query addressables first to get event IDs
    let eventIds: string[] | undefined;
    if (params.linkedWork) {
      const workIds = Array.isArray(params.linkedWork)
        ? params.linkedWork
        : params.linkedWork.split(',').map(id => id.trim());

      const addressablesResponse = await clients.elastic.search<Displayable>({
        index: config.addressablesIndex,
        _source: ['display.id'],
        query: {
          bool: {
            must: [
              addressablesFilter(workIds),
              { terms: { 'query.type.keyword': ['Event', 'Exhibition'] } },
            ],
            must_not: [{ term: { 'query.tags': 'delist' } }],
          },
        },
        size: 1000, // Get all matching addressables. They'll never be this many so it's safe
      });

      // Extract event IDs from addressables results (includes both events and exhibitions)
      eventIds = addressablesResponse.hits.hits
        .map(hit => hit._source?.display?.id)
        .filter(Boolean);

      // If no events found, return empty results early
      if (eventIds.length === 0) {
        res.status(200).json({
          type: 'ResultList',
          results: [],
          totalResults: 0,
          pageSize: 0,
          totalPages: 0,
        });
        return;
      }
    }

    try {
      const searchResponse = await clients.elastic.search<Displayable>({
        index,
        _source: ['display'],
        aggregations: facetedAggregations,
        query: {
          bool: {
            must: ifDefined(queryString, eventsQuery),
            filter: [
              {
                bool: {
                  must_not: [
                    {
                      term: {
                        // Exclude childScheduledEvents from search
                        // https://github.com/wellcomecollection/content-api/issues/93
                        isChildScheduledEvent: true,
                      },
                    },
                    ...(excludeFormat
                      ? [
                          {
                            terms: {
                              'filter.format': excludeFormat.split(','),
                            },
                          },
                        ]
                      : []),
                  ],
                },
              },
              // Add linkedWork filter if event IDs were found
              ...(eventIds ? [{ ids: { values: eventIds } }] : []),
            ],
          },
        },
        post_filter: {
          bool: {
            filter: Object.values(postFilters).map(esQuery),
          },
        },
        sort: [
          getSortLogic({
            sortKey,
            sortOrder,
            pastOrFutureTimespan:
              filterValues.timespan === 'past' ||
              filterValues.timespan === 'future'
                ? filterValues.timespan
                : undefined,
          }),
          // Use recency as a "tie-breaker" sort, future first.
          getSortLogic({
            sortKey: 'query.times.startDateTime',
            sortOrder: 'asc',
            pastOrFutureTimespan: 'future',
          }),
        ],
        ...paginationElasticBody(req.query),
      });

      res.status(200).json(resultList(req, searchResponse));
    } catch (error) {
      if (
        error instanceof elasticErrors.ResponseError &&
        error.message.includes('too_many_nested_clauses') &&
        encodeURIComponent(queryString || '').length > 2000
      ) {
        throw new HttpError({
          status: 400,
          label: 'Bad Request',
          description:
            'Your query contained too many terms, please try again with a simpler query',
        });
      }

      throw error;
    }
  });
};

export default eventsController;
