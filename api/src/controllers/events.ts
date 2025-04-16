import { errors as elasticErrors } from '@elastic/elasticsearch';
import { SortCombinations } from '@elastic/elasticsearch/lib/api/types';
import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import { Config } from '@weco/content-api/config';
import { ifDefined, pick } from '@weco/content-api/src/helpers';
import { pickFiltersFromQuery } from '@weco/content-api/src/helpers/requests';
import { resultListResponse } from '@weco/content-api/src/helpers/responses';
import { esQuery } from '@weco/content-api/src/queries/common';
import {
  eventsAggregations,
  eventsFilter,
  eventsQuery,
} from '@weco/content-api/src/queries/events';
import { rewriteAggregationsForFacets } from '@weco/content-api/src/queries/faceting';
import { Clients, Displayable } from '@weco/content-api/src/types';
import { ResultList } from '@weco/content-api/src/types/responses';

import { HttpError } from './error';
import { paginationElasticBody, PaginationQueryParameters } from './pagination';
import { timespans } from './utils';
import { queryValidator } from './validation';

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

const timespanValidator = queryValidator({
  name: 'timespan',
  allowed: timespans,
  singleValue: true,
});

const paramsValidator = (params: QueryParams): QueryParams => {
  const { isAvailableOnline, ...rest } = params;

  if (params.location)
    locationsValidator({
      location: params.location,
    });

  if (params.timespan) {
    timespanValidator({
      timespan: params.timespan,
    });
  }

  const hasIsAvailableOnline =
    isAvailableOnline &&
    isAvailableOnlineValidator({
      isAvailableOnline,
    });

  // We are ignoring all other values passed in but "true".
  // Anything else should remove the param from the query
  return hasIsAvailableOnline ? { ...params } : { ...rest };
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

    try {
      const searchResponse = await clients.elastic.search<Displayable>({
        index,
        _source: ['display'],
        aggregations: facetedAggregations,
        query: {
          bool: {
            must: ifDefined(queryString, eventsQuery),
            must_not: {
              term: {
                // exclude childScheduledEvents from search
                // https://github.com/wellcomecollection/content-api/issues/93
                isChildScheduledEvent: true,
              },
            },
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
