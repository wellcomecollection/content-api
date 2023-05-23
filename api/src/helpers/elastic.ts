import {
  AggregationsAggregate,
  AggregationsTermsAggregateBase,
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

export const isTermsAggregation = (
  agg: AggregationsAggregate
): agg is AggregationsTermsAggregateBase<TermsBucket> =>
  "buckets" in agg && "doc_count" in agg.buckets[0] && "key" in agg.buckets[0];
