import { errors as elasticErrors } from '@elastic/elasticsearch';
import { AggregationsAggregate } from '@elastic/elasticsearch/lib/api/types';
import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';

import { Config } from '@weco/content-api/config';
import { ifDefined, pick } from '@weco/content-api/src/helpers';
import { pickFiltersFromQuery } from '@weco/content-api/src/helpers/requests';
import { resultListResponse } from '@weco/content-api/src/helpers/responses';
import { addressablesFilter } from '@weco/content-api/src/queries/addressables';
import {
  articlesAggregations,
  articlesFilter,
  articlesQuery,
} from '@weco/content-api/src/queries/articles';
import { esQuery } from '@weco/content-api/src/queries/common';
import {
  partitionFiltersForFacets,
  rewriteAggregationsForFacets,
} from '@weco/content-api/src/queries/faceting';
import { Clients, Displayable } from '@weco/content-api/src/types';
import { ResultList } from '@weco/content-api/src/types/responses';

import { HttpError } from './error';
import { paginationElasticBody } from './pagination';
import {
  commaSeparatedEnum,
  commaSeparatedPrismicIds,
  dateStringSchema,
  PaginationQuerySchema,
  queryStringSchema,
  validateDate,
  workIdsSchema,
} from './validation';

export const ArticlesQuerySchema = z
  .object({
    query: queryStringSchema,
    sort: commaSeparatedEnum(
      'sort',
      ['relevance', 'publicationDate'] as const,
      {
        singleValue: true,
        defaultValue: 'relevance',
      }
    ).meta({
      description: 'Which field to sort the results on',
      enum: ['relevance', 'publicationDate'],
    }),
    sortOrder: commaSeparatedEnum('sortOrder', ['asc', 'desc'] as const, {
      singleValue: true,
      defaultValue: 'desc',
    }).meta({
      description: 'The order that the results should be returned in',
      enum: ['asc', 'desc'],
    }),
    aggregations: commaSeparatedEnum('aggregations', [
      'contributors.contributor',
      'format',
    ] as const).meta({
      description:
        'What aggregated data in relation to the results should we return',
      enum: ['contributors.contributor', 'format'],
    }),
    'contributors.contributor': commaSeparatedPrismicIds('contributors').meta({
      description: 'Filter the articles by contributor',
    }),
    format: commaSeparatedPrismicIds('formats').meta({
      description: 'Filter the articles by format',
    }),
    'publicationDate.from': dateStringSchema.meta({
      description:
        'Return all articles with a publication date after and including this date.\n\nCan be used in conjunction with `publicationDate.to` to create a range.',
      format: 'date',
    }),
    'publicationDate.to': dateStringSchema.meta({
      description:
        'Return all articles with a publication date before and including this date.\n\nCan be used in conjunction with `publicationDate.from` to create a range.',
      format: 'date',
    }),
    linkedWork: workIdsSchema,
  })
  .extend(PaginationQuerySchema.shape);

type ArticlesParams = z.infer<typeof ArticlesQuerySchema>;
type ArticlesHandler = RequestHandler<
  never,
  ResultList,
  never,
  Record<string, unknown>
>;

const articlesController = (
  clients: Clients,
  config: Config
): ArticlesHandler => {
  const index = config.articlesIndex;
  const resultList = resultListResponse(config);

  return asyncHandler(async (req, res) => {
    const params: ArticlesParams = ArticlesQuerySchema.parse(req.query);
    const queryString = params.query;
    const sort = params.sort?.[0];
    const sortOrder = params.sortOrder?.[0];
    const aggregations = params.aggregations;

    const sortKey =
      sort === 'publicationDate' ? 'query.publicationDate' : '_score';

    const initialAggregations = ifDefined(aggregations, requestedAggs =>
      pick(articlesAggregations, requestedAggs)
    );
    const initialFilters = pickFiltersFromQuery(
      ['contributors.contributor', 'format'],
      params as unknown as Record<string, string | undefined>,
      articlesFilter
    );

    // See comments in `queries/faceting.ts` for some explanation of what's going on here
    const { postFilters, queryFilters } = partitionFiltersForFacets(
      initialAggregations ?? {},
      initialFilters
    );
    const facetedAggregations = ifDefined(initialAggregations, aggs =>
      rewriteAggregationsForFacets(aggs, postFilters)
    );

    // The date filter is a special case because 2 parameters filter 1 field,
    // and it doesn't (currently) have a corresponding aggregation.
    const dateFilters =
      params['publicationDate.from'] || params['publicationDate.to']
        ? [
            articlesFilter.publicationDate(
              ifDefined(params['publicationDate.from'], validateDate),
              ifDefined(params['publicationDate.to'], validateDate)
            ),
          ]
        : [];

    // Handle linkedWork filtering - query addressables first to get article IDs
    let articleIds: string[] | undefined;
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
              { term: { 'query.type.keyword': 'Article' } },
            ],
            must_not: [{ term: { 'query.tags': 'delist' } }],
          },
        },
        size: 1000, // Get all matching addressables. They'll never be this many so it's safe
      });

      // Extract article IDs from addressables results
      articleIds = addressablesResponse.hits.hits
        .map(hit => hit._source?.display?.id)
        .filter(Boolean);

      // If no articles found, return empty results early
      if (articleIds.length === 0) {
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
      const searchResponse = await clients.elastic.search<
        Displayable,
        Partial<
          Record<keyof typeof articlesAggregations, AggregationsAggregate>
        >
      >({
        index,
        _source: ['display'],
        aggregations: facetedAggregations,
        query: {
          bool: {
            must: ifDefined(queryString, articlesQuery),
            filter: [
              Object.values(queryFilters).map(esQuery),
              dateFilters,
              // Add linkedWork filter if article IDs were found
              articleIds ? [{ ids: { values: articleIds } }] : [],
            ].flat(),
          },
        },
        post_filter: {
          bool: {
            filter: Object.values(postFilters).map(esQuery),
          },
        },
        sort: [
          { [sortKey]: { order: sortOrder } },
          // Use recency as a "tie-breaker" sort
          { 'query.publicationDate': { order: 'desc' } },
        ],
        ...paginationElasticBody(req.query),
      });

      res.status(200).json(resultList(req, searchResponse));
    } catch (e) {
      if (
        e instanceof elasticErrors.ResponseError &&
        // This is an error we see from very long (spam) queries which contain
        // many many terms and so overwhelm the multi_match query. The check
        // for length is a heuristic so that if we get legitimate `too_many_nested_clauses`
        // errors, we're still alerted to them
        e.message.includes('too_many_nested_clauses') &&
        encodeURIComponent(queryString || '').length > 2000
      ) {
        throw new HttpError({
          status: 400,
          label: 'Bad Request',
          description:
            'Your query contained too many terms, please try again with a simpler query',
        });
      }
      throw e;
    }
  });
};

export default articlesController;
