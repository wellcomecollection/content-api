import {
  AggregationsAggregate,
  AggregationsMultiBucketAggregateBase,
} from "@elastic/elasticsearch/lib/api/types";

// The built-in aggregation types are a bit inflexible, given how flexible the aggregations API is.
// This is what the buckets returning from ES look like when we make an aggregation request
// of the form in `queries/faceting.ts:rewriteAggregationsForFacets`
type TermsBucket = {
  doc_count: number;
  key: string;
  filtered?: {
    doc_count: number;
  };
};

export const isMultiBucketAggregation = (
  agg: AggregationsAggregate
): agg is AggregationsMultiBucketAggregateBase<TermsBucket> => {
  if ("buckets" in agg) {
    const zeroBuckets = agg.buckets.length === 0;
    if (zeroBuckets) {
      // Buckets might reasonably be empty, in which case obviously we can't/shouldn't
      // check their shape
      return true;
    } else {
      const firstBucket = agg.buckets[0];
      return "doc_count" in firstBucket && "key" in firstBucket;
    }
  }
  return false;
};
