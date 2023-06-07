import {
  AggregationsAggregationContainer,
  QueryDslQueryContainer,
} from "@elastic/elasticsearch/lib/api/types";

// This file contains functions to rewrite terms aggregations and filters
// in order to fulfil the requirements of a faceting interface as documented
// in the RFC, "API faceting principles & expectations":
// https://github.com/wellcomecollection/docs/tree/main/rfcs/037-api-faceting-principles
// Refer to the RFC for motivation regarding expected behaviour, and refer to
// comments in this file for motivation regarding implementation.

const excludeValue = <T>(
  record: Record<string, T>,
  keyToExclude: string
): T[] =>
  Object.entries(record)
    .filter(([key]) => key !== keyToExclude)
    .map(([_, value]) => value);

// If we are adding a `filter` sub-aggregation to a `terms` aggregation, this means
// that we have also applied the filter corresponding to the aggregated value, and
// so we want to tweak the aggregation in a couple of ways:
// 1. `min_doc_count: 0`: necessary to fulfil point (6) of the RFC,
//    "When a filter and its paired aggregation are both applied, the bucket corresponding to the filtered value is always present"
// 2. `order.filtered: "desc"`: we want buckets to be ordered by the filtered value
//     because this will be the value returned to consumers of the API.
//
// see also:
// https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#_minimum_document_count_4
// https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#_ordering_by_a_sub_aggregation
const filtered = (
  aggregation: AggregationsAggregationContainer
): AggregationsAggregationContainer =>
  // See https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html
  "terms" in aggregation
    ? {
        ...aggregation,
        terms: {
          ...aggregation.terms,
          min_doc_count: 0,
          order: {
            filtered: "desc",
          },
        },
      }
    : aggregation;

export const rewriteAggregationsForFacets = (
  aggregations: Record<string, AggregationsAggregationContainer>,
  postFilters: Record<string, QueryDslQueryContainer>
): Record<string, AggregationsAggregationContainer> =>
  Object.fromEntries(
    Object.entries(aggregations).map(([name, agg]) => {
      const otherFilters = excludeValue(postFilters, name);
      // No need to rewrite if there are no other filters to apply
      if (otherFilters.length === 0) {
        return [name, agg];
      } else {
        const filteredAgg = {
          ...filtered(agg), // See above
          aggs: {
            // The sub-aggregation has a fixed name, `filtered`, and applies all requested
            // filters _except_ for the one it corresponds to. This is to fulfil point (5) of the RFC:
            // "When a filter and its paired aggregation are both applied, that aggregation's buckets are not filtered"
            filtered: {
              // See https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-filter-aggregation.html
              filter: {
                bool: {
                  filter: excludeValue(postFilters, name),
                },
              },
            },
          },
        };
        return [name, filteredAgg];
      }
    })
  );

// While we do want all requested filters to apply to our search results, we don't
// necessarily want them to apply to all aggregations. ES provides `post_filter` for
// this purpose, and recommends its use for building faceted search interfaces.
// See https://www.elastic.co/guide/en/elasticsearch/reference/current/filter-search-results.html#post-filter
//
// This just separates the requested filters into those for which a corresponding aggregation
// has been requested (to be used in `post_filter`) and those which have no corresponding aggregation
// (to be used in the normal `query`).
export const partitionFiltersForFacets = (
  aggregations: Record<string, AggregationsAggregationContainer>,
  filters: Record<string, QueryDslQueryContainer>
) => {
  const postFilters: Record<string, QueryDslQueryContainer> = {};
  const queryFilters: Record<string, QueryDslQueryContainer> = {};

  for (const [filterName, filter] of Object.entries(filters)) {
    if (filterName in aggregations) {
      postFilters[filterName] = filter;
    } else {
      queryFilters[filterName] = filter;
    }
  }

  return { postFilters, queryFilters };
};
