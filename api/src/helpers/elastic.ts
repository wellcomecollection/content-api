import {
  AggregationsAggregate,
  AggregationsStringTermsAggregate,
} from "@elastic/elasticsearch/lib/api/types";

export const isTermsAggregation = (
  agg: AggregationsAggregate
): agg is AggregationsStringTermsAggregate =>
  "buckets" in agg && "doc_count" in agg.buckets[0] && "key" in agg.buckets[0];
