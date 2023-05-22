import {
  AggregationsAggregationContainer,
  QueryDslQueryContainer,
} from "@elastic/elasticsearch/lib/api/types";

const allOtherFilters = (
  filters: Record<string, QueryDslQueryContainer>,
  nameToExclude: string
): QueryDslQueryContainer => ({
  bool: {
    filter: Object.entries(filters)
      .filter(([filterName]) => filterName !== nameToExclude)
      .map(([_, filter]) => filter),
  },
});

const filtered = (
  aggregation: AggregationsAggregationContainer
): AggregationsAggregationContainer =>
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
  filters: Record<string, QueryDslQueryContainer>
): Record<string, AggregationsAggregationContainer> =>
  Object.fromEntries(
    Object.entries(aggregations).map(([name, agg]) => [
      name,
      name in filters
        ? {
            ...filtered(agg),
            aggs: {
              filtered: {
                filter: allOtherFilters(filters, name),
              },
            },
          }
        : agg,
    ])
  );

export const partitionFiltersForFacets = (
  aggregations: Record<string, AggregationsAggregationContainer>,
  filters: Record<string, QueryDslQueryContainer>
) => {
  const postFilters: QueryDslQueryContainer[] = [];
  const queryFilters: QueryDslQueryContainer[] = [];

  for (const [filterName, filter] of Object.entries(filters)) {
    if (filterName in aggregations) {
      postFilters.push(filter);
    } else {
      queryFilters.push(filter);
    }
  }

  return { postFilters, queryFilters };
};
