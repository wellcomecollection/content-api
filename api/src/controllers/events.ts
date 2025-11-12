import { errors as elasticErrors } from '@elastic/elasticsearch';
import { SortCombinations } from '@elastic/elasticsearch/lib/api/types';
import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

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
import { paginationElasticBody, PaginationQueryParameters } from './pagination';
import { timespans } from './utils';
import {
  prismicIdValidator,
  queryValidator,
  workIdValidator,
} from './validation';

type QueryParams = {
  query?: string;
  sort?: string;
  sortOrder?: string;
  aggregations?: string;
  format?: string;
  audience?: string;
  interpretation?: string;
  location?: string;
  isAvailableOnline?: string;
  timespan?: string;
  filterOutExhibitions?: string;
  linkedWork?: string | string[];
} & PaginationQueryParameters;

type EventsHandler = RequestHandler<never, ResultList, never, QueryParams>;

const sortValidator = queryValidator({
  name: 'sort',
  defaultValue: 'relevance',
  allowed: ['relevance', 'times.startDateTime'],
  singleValue: true,
});

const sortOrderValidator = queryValidator({
  name: 'sortOrder',
  defaultValue: 'desc',
  allowed: ['asc', 'desc'],
  singleValue: true,
});

const aggregationsValidator = queryValidator({
  name: 'aggregations',
  allowed: [
    'format',
    'audience',
    'interpretation',
    'location',
    'isAvailableOnline',
    'timespan',
  ],
});

const locationsValidator = queryValidator({
  name: 'location',
  allowed: ['online', 'in-our-building'],
});

const isAvailableOnlineValidator = queryValidator({
  name: 'isAvailableOnline',
  allowed: ['true'],
  singleValue: true,
});

const filterOutExhibitionsValidator = queryValidator({
  name: 'filterOutExhibitions',
  allowed: ['true'],
  singleValue: true,
});

const timespanValidator = queryValidator({
  name: 'timespan',
  allowed: timespans,
  singleValue: true,
});

const paramsValidator = (params: QueryParams): QueryParams => {
  const { isAvailableOnline, filterOutExhibitions, ...rest } = params;

  if (params.location)
    locationsValidator({
      location: params.location,
    });

  if (params.timespan) {
    timespanValidator({
      timespan: params.timespan,
    });
  }

  if (params.audience) prismicIdValidator(params.audience, 'audiences');
  if (params.interpretation)
    prismicIdValidator(params.interpretation, 'interpretations');
  if (params.format) prismicIdValidator(params.format, 'formats');

  // Validate linkedWork parameter(s)
  if (params.linkedWork) {
    const workIds = Array.isArray(params.linkedWork)
      ? params.linkedWork
      : params.linkedWork.split(',').map(id => id.trim());
    workIds.forEach(workId => workIdValidator(workId));
  }

  const hasIsAvailableOnline =
    isAvailableOnline &&
    isAvailableOnlineValidator({
      isAvailableOnline,
    });

  const hasFilterOutExhibitions =
    filterOutExhibitions &&
    filterOutExhibitionsValidator({
      filterOutExhibitions,
    });

  // For isAvailableOnline and filterOutExhibitions,
  // we are ignoring all values passed in but "true".
  // Anything else should remove the param from the query
  return {
    ...rest,
    ...(hasIsAvailableOnline ? { isAvailableOnline } : {}),
    ...(hasFilterOutExhibitions ? { filterOutExhibitions } : {}),
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
    const { query: queryString, ...params } = req.query;
    const sort = sortValidator(params)?.[0];
    const sortOrder = sortOrderValidator(params)?.[0];
    const aggregations = aggregationsValidator(params);
    const validParams = paramsValidator(params);

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
      validParams,
      eventsFilter
    );

    const facetedAggregations = ifDefined(initialAggregations, aggs =>
      rewriteAggregationsForFacets(aggs, postFilters)
    );

    // Handle linkedWork filtering - query addressables first to get event IDs
    let eventIds: string[] | undefined;
    if (validParams.linkedWork) {
      const workIds = Array.isArray(validParams.linkedWork)
        ? validParams.linkedWork
        : validParams.linkedWork.split(',').map(id => id.trim());

      const addressablesResponse = await clients.elastic.search<Displayable>({
        index: config.addressablesIndex,
        _source: ['display.id'],
        query: {
          bool: {
            must: [
              addressablesFilter(workIds),
              { terms: { 'display.type': ['Event', 'Exhibition'] } },
            ],
            must_not: [{ term: { 'query.tags': 'delist' } }],
          },
        },
        size: 1000, // Get all matching addressables
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
                    ...(validParams.filterOutExhibitions
                      ? [
                          {
                            term: {
                              'filter.format': EVENT_EXHIBITION_FORMAT_ID,
                            },
                          },
                        ]
                      : []),
                  ],
                },
              },
              // Add linkedWork filter if event IDs were found
              ...(eventIds ? [{ terms: { id: eventIds } }] : []),
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
              validParams.timespan === 'past' ||
              validParams.timespan === 'future'
                ? validParams.timespan
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
