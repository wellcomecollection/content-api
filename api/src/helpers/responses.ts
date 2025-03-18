import {
  AggregationsAggregate,
  AggregationsStringTermsBucket,
  SearchResponse,
} from '@elastic/elasticsearch/lib/api/types';
import { Request } from 'express';

import { Config } from '@weco/content-api/config';
import { paginationResponseGetter } from '@weco/content-api/src/controllers/pagination';
import { Displayable } from '@weco/content-api/src/types';
import {
  AggregationBucket,
  Aggregations,
  ResultList,
} from '@weco/content-api/src/types/responses';

import { isNotUndefined } from './index';

const mapBucket = (
  bucket: AggregationsStringTermsBucket
): AggregationBucket => ({
  // This should always be a JSONified string, so if we can't
  // parse it something has gone wrong in the pipeline and we
  // should know about it
  data: JSON.parse(bucket.key),
  count: bucket.doc_count,
  type: 'AggregationBucket',
});

// Sort by count (descending) and then by ID (ascending)
const compareBucket = (a: AggregationBucket, b: AggregationBucket) =>
  b.count - a.count || (a.data.id ?? '').localeCompare(b.data.id ?? '');

export const mapAggregations = (
  elasticAggs: AggregationsAggregate
): Aggregations =>
  Object.fromEntries(
    Object.entries(elasticAggs).flatMap(([name, aggregation]) => {
      if (name !== 'timespan') {
        const buckets: AggregationsStringTermsBucket[] =
          aggregation.buckets ?? aggregation.terms.buckets;
        const selfFilterBuckets: AggregationsStringTermsBucket[] =
          aggregation.self_filter?.terms.buckets ?? [];

        const bucketKeys = new Set<string>(); // prevent duplicates from the self-filter
        const allBuckets = [...buckets, ...selfFilterBuckets]
          .filter(b => {
            const result = isNotUndefined(b) && !bucketKeys.has(b.key);
            bucketKeys.add(b?.key);
            return result;
          })
          .map(mapBucket)
          .sort(compareBucket);

        return [[name, { buckets: allBuckets, type: 'Aggregation' }]];
      } else {
        const transformedAgg: AggregationBucket[] = Object.keys(
          aggregation.timespan
        )
          .filter(
            key =>
              key !== 'doc_count' && isNotUndefined(aggregation.timespan[key])
          )
          .map(key => ({
            data: {
              type: 'EventTimespan',
              id: key,
              label: String(key).charAt(0).toUpperCase() + String(key).slice(1),
            },
            count: aggregation.timespan[key].count_parent?.doc_count,
            type: 'AggregationBucket',
          }));

        return [[name, { buckets: transformedAgg, type: 'Aggregation' }]];
      }
    })
  );

export const resultListResponse = (config: Config) => {
  const getPaginationResponse = paginationResponseGetter(config.publicRootUrl);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <R extends Request<any, any, any, any>>(
    req: R,
    searchResponse: SearchResponse<Displayable>
  ): ResultList => {
    const results = searchResponse.hits.hits.flatMap(hit =>
      hit._source ? [hit._source.display] : []
    );

    const aggregations: Aggregations | undefined = searchResponse.aggregations
      ? mapAggregations(searchResponse.aggregations)
      : undefined;

    const requestUrl = new URL(
      req.url,
      `${req.protocol}://${req.headers.host}`
    );

    const totalResults =
      typeof searchResponse.hits.total === 'number'
        ? searchResponse.hits.total
        : (searchResponse.hits.total?.value ?? 0);

    const paginationResponse = getPaginationResponse({
      requestUrl,
      totalResults,
    });

    return {
      type: 'ResultList',
      results,
      aggregations,
      ...paginationResponse,
    };
  };
};
