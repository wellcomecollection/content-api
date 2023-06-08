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
): agg is AggregationsMultiBucketAggregateBase<TermsBucket> =>
  "buckets" in agg &&
  // Buckets might reasonably be empty, in which case obviously we can't/shouldn't
  // check their shape
  (agg.buckets.length === 0 ||
    ("doc_count" in agg.buckets[0] && "key" in agg.buckets[0]));
