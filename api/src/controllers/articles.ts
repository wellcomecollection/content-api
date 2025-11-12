import { errors as elasticErrors } from '@elastic/elasticsearch';
import { AggregationsAggregate } from '@elastic/elasticsearch/lib/api/types';
import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

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
import { paginationElasticBody, PaginationQueryParameters } from './pagination';
import {
  dateValidator,
  prismicIdValidator,
  queryValidator,
  validateDate,
  workIdValidator,
} from './validation';

type QueryParams = {
  query?: string;
  sort?: string;
  sortOrder?: string;
  aggregations?: string;
  'contributors.contributor'?: string;
  'publicationDate.from'?: string;
  'publicationDate.to'?: string;
  format?: string;
  linkedWork?: string | string[];
} & PaginationQueryParameters;

type ArticlesHandler = RequestHandler<never, ResultList, never, QueryParams>;

const sortValidator = queryValidator({
  name: 'sort',
  defaultValue: 'relevance',
  allowed: ['relevance', 'publicationDate'],
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
  allowed: ['contributors.contributor', 'format'],
});

const paramsValidator = (params: QueryParams): QueryParams => {
  if (params.format) prismicIdValidator(params.format, 'formats');
  if (params['contributors.contributor'])
    prismicIdValidator(params['contributors.contributor'], 'contributors');

  if (params['publicationDate.from'])
    dateValidator(params['publicationDate.from']);
  if (params['publicationDate.to']) dateValidator(params['publicationDate.to']);

  // Validate linkedWork parameter(s)
  if (params.linkedWork) {
    const workIds = Array.isArray(params.linkedWork)
      ? params.linkedWork
      : params.linkedWork.split(',').map(id => id.trim());
    workIds.forEach(workId => workIdValidator(workId));
  }

  // We are ignoring all other values passed in but "true".
  // Anything else should remove the param from the query
  return params;
};

const articlesController = (
  clients: Clients,
  config: Config
): ArticlesHandler => {
  const index = config.articlesIndex;
  const resultList = resultListResponse(config);

  return asyncHandler(async (req, res) => {
    const { query: queryString, ...params } = req.query;
    const sort = sortValidator(params)?.[0];
    const sortOrder = sortOrderValidator(params)?.[0];
    const aggregations = aggregationsValidator(params);
    const validParams = paramsValidator(params);

    const sortKey =
      sort === 'publicationDate' ? 'query.publicationDate' : '_score';

    const initialAggregations = ifDefined(aggregations, requestedAggs =>
      pick(articlesAggregations, requestedAggs)
    );
    const initialFilters = pickFiltersFromQuery(
      ['contributors.contributor', 'format'],
      validParams,
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
      validParams['publicationDate.from'] || params['publicationDate.to']
        ? [
            articlesFilter.publicationDate(
              ifDefined(validParams['publicationDate.from'], validateDate),
              ifDefined(validParams['publicationDate.to'], validateDate)
            ),
          ]
        : [];

    // Handle linkedWork filtering - query addressables first to get article IDs
    let articleIds: string[] | undefined;
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
              { term: { 'query.type.keyword': 'Article' } },
            ],
            must_not: [{ term: { 'query.tags': 'delist' } }],
          },
        },
        size: 1000, // Get all matching addressables
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
