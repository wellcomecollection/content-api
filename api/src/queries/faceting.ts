import {
  AggregationsAggregationContainer,
  QueryDslQueryContainer,
} from "@elastic/elasticsearch/lib/api/types";
import { esQuery, Filter, isTermsFilter } from "./common";

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

const includeEmptyFilterValues = (
  aggregation: AggregationsAggregationContainer,
  filter: Filter
): AggregationsAggregationContainer =>
  "terms" in aggregation && isTermsFilter(filter)
    ? {
        ...aggregation,
        terms: {
          ...aggregation.terms,
          min_doc_count: 0,
          include: filter.values.map((val) => `.*${val}.*`).join("|"),
        },
      }
    : aggregation;

export const rewriteAggregationsForFacets = (
  aggregations: Record<string, AggregationsAggregationContainer>,
  // We only need to deal with filters that aren't already applied by the query: this means post_filters.
  // These are determined below (`partitionFiltersForFacets`); they are the filters for which corresponding
  // aggregations are present and so require finer-grained application to individual aggregations,
  // in order to (a) avoid applying them to their corresponding aggregation and (b) make sure they _are_
  // applied to all other aggregations.
  postFilters: Record<string, Filter>
): Record<string, AggregationsAggregationContainer> =>
  Object.fromEntries(
    Object.entries(aggregations).map(([name, agg]) => {
      const otherFilters = excludeValue(postFilters, name);
      // No need to rewrite if there are no other filters to apply:
      // note that this branch is a short-circuit rather than containing any business logic.
      if (otherFilters.length === 0) {
        return [name, agg];
      } else {
        const filteredAgg: AggregationsAggregationContainer = {
          filter: {
            bool: {
              filter: excludeValue(postFilters, name).map(esQuery),
            },
          },
          aggs: {
            terms: agg,
          },
        };

        if (name in postFilters) {
          filteredAgg.aggs!.self_filter = {
            filter: esQuery(postFilters[name]),
            aggs: {
              terms: includeEmptyFilterValues(agg, postFilters[name]),
            },
          } as AggregationsAggregationContainer;
        }

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
  filters: Record<string, Filter>
) => {
  const postFilters: Record<string, Filter> = {};
  const queryFilters: Record<string, Filter> = {};

  for (const [filterName, filter] of Object.entries(filters)) {
    if (filterName in aggregations) {
      postFilters[filterName] = filter;
    } else {
      queryFilters[filterName] = filter;
    }
  }

  return { postFilters, queryFilters };
};
