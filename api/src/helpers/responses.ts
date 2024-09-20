import { Request } from "express";
import {
  AggregationsAggregate,
  AggregationsStringTermsBucket,
  SearchResponse,
} from "@elastic/elasticsearch/lib/api/types";
import { Displayable } from "../types";
import {
  AggregationBucket,
  Aggregations,
  ResultList,
} from "../types/responses";
import { Config } from "../../config";
import { paginationResponseGetter } from "../controllers/pagination";
import { isNotUndefined } from "./index";

const mapBucket = (
  bucket: AggregationsStringTermsBucket,
): AggregationBucket => ({
  // This should always be a JSONified string, so if we can't
  // parse it something has gone wrong in the pipeline and we
  // should know about it
  data: JSON.parse(bucket.key),
  count: bucket.doc_count,
  type: "AggregationBucket",
});

// Sort by count (descending) and then by ID (ascending)
const compareBucket = (a: AggregationBucket, b: AggregationBucket) =>
  b.count - a.count || (a.data.id ?? "").localeCompare(b.data.id ?? "");

export const mapAggregations = (
  elasticAggs: AggregationsAggregate,
): Aggregations =>
  Object.fromEntries(
    Object.entries(elasticAggs).flatMap(([name, aggregation]) => {
      const buckets: AggregationsStringTermsBucket[] =
        aggregation.buckets ?? aggregation.terms.buckets;
      const selfFilterBuckets: AggregationsStringTermsBucket[] =
        aggregation.self_filter?.terms.buckets ?? [];

      const bucketKeys = new Set<string>(); // prevent duplicates from the self-filter
      const allBuckets = [...buckets, ...selfFilterBuckets]
        .filter((b) => {
          const result = isNotUndefined(b) && !bucketKeys.has(b.key);
          bucketKeys.add(b?.key);
          return result;
        })
        .map(mapBucket)
        .sort(compareBucket);
      return [[name, { buckets: allBuckets, type: "Aggregation" }]];
    }),
  );

export const resultListResponse = (config: Config) => {
  const getPaginationResponse = paginationResponseGetter(config.publicRootUrl);

  return <R extends Request<any, any, any, any>>(
    req: R,
    searchResponse: SearchResponse<Displayable>,
  ): ResultList => {
    const results = searchResponse.hits.hits.flatMap((hit) =>
      hit._source ? [hit._source.display] : [],
    );

    const aggregations: Aggregations | undefined = searchResponse.aggregations
      ? mapAggregations(searchResponse.aggregations)
      : undefined;

    const requestUrl = new URL(
      req.url,
      `${req.protocol}://${req.headers.host}`,
    );

    const totalResults =
      typeof searchResponse.hits.total === "number"
        ? searchResponse.hits.total
        : (searchResponse.hits.total?.value ?? 0);

    const paginationResponse = getPaginationResponse({
      requestUrl,
      totalResults,
    });

    return {
      type: "ResultList",
      results,
      aggregations,
      ...paginationResponse,
    };
  };
};
