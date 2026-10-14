import {
  AggregationsAggregate,
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

// The client types aggregation results as a wide union (including null keys),
// which doesn't describe what our queries return. These types describe the
// shapes we actually build in the queries.
type TermsBucket = {
  key: string;
  doc_count: number;
};

type TermsAggregation = {
  buckets?: TermsBucket[];
  terms?: { buckets: TermsBucket[] };
  self_filter?: { terms: { buckets: TermsBucket[] } };
};

type TimespanAggregation = {
  timespan: Record<string, { count_parent: { doc_count: number } } | undefined>;
};

const mapBucket = (bucket: TermsBucket): AggregationBucket => ({
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

const timespanAggregations = (
  aggregation: TimespanAggregation
): AggregationBucket[] =>
  Object.keys(aggregation.timespan)
    .filter(
      key => key !== 'doc_count' && isNotUndefined(aggregation.timespan[key])
    )
    .map(key => ({
      data: {
        type: 'EventTimespan',
        id: key,
        label: `${String(key).charAt(0).toUpperCase() + String(key).slice(1)} events`,
      },
      count: aggregation.timespan[key]!.count_parent?.doc_count,
      type: 'AggregationBucket',
    }));

const termBucketAggregations = (
  aggregation: TermsAggregation
): AggregationBucket[] => {
  const buckets: TermsBucket[] =
    aggregation.buckets ?? aggregation.terms!.buckets;
  const selfFilterBuckets: TermsBucket[] =
    aggregation.self_filter?.terms.buckets ?? [];

  const bucketKeys = new Set<string>(); // prevent duplicates from the self-filter

  return [...buckets, ...selfFilterBuckets]
    .filter(b => {
      const result = isNotUndefined(b) && !bucketKeys.has(b.key);
      bucketKeys.add(b?.key);
      return result;
    })
    .map(mapBucket)
    .sort(compareBucket);
};

export const mapAggregations = (
  elasticAggs: Record<string, AggregationsAggregate>
): Aggregations =>
  Object.fromEntries(
    Object.entries(elasticAggs).map(([name, aggregation]) => [
      name,
      {
        buckets:
          name === 'timespan'
            ? timespanAggregations(
                aggregation as unknown as TimespanAggregation
              )
            : termBucketAggregations(
                aggregation as unknown as TermsAggregation
              ),
        type: 'Aggregation',
      },
    ])
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
