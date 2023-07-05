import { articlesAggregations, articlesFilter } from "../src/queries/articles";
import {
  partitionFiltersForFacets,
  rewriteAggregationsForFacets,
} from "../src/queries/faceting";
import { SortOrder } from "@elastic/elasticsearch/lib/api/types";

describe("rewriteAggregationsForFacets", () => {
  it("rewrites aggregations correctly when other filters are present", () => {
    const { format } = articlesAggregations;
    const aggregations = { format };
    const filters = {
      format: articlesFilter.format(["test"]),
      "contributors.contributor": articlesFilter["contributors.contributor"]([
        "test",
      ]),
    };
    const facetedAggregations = rewriteAggregationsForFacets(
      aggregations,
      filters
    );

    const rewrittenFormatAgg = facetedAggregations.format;
    expect(rewrittenFormatAgg.filter).toBeDefined();
    expect(rewrittenFormatAgg.filter?.bool?.filter).toIncludeAnyMembers([
      filters["contributors.contributor"].esQuery,
    ]);
    expect(rewrittenFormatAgg.aggs?.terms).toEqual(aggregations.format);
  });

  it("does not modify aggregations when there are no other filters present", () => {
    const aggregations = {
      "contributors.contributor":
        articlesAggregations["contributors.contributor"],
    };
    const filters = {
      "contributors.contributor": articlesFilter["contributors.contributor"]([
        "test",
      ]),
    };
    const facetedAggregations = rewriteAggregationsForFacets(
      aggregations,
      filters
    );

    expect(facetedAggregations["contributors.contributor"]).toStrictEqual(
      articlesAggregations["contributors.contributor"]
    );
  });
});

describe("partitionFiltersForFacets", () => {
  it("separates filters correctly depending on whether a corresponding aggregation is present", () => {
    const { format } = articlesAggregations;
    const aggregations = { format };
    const filters = {
      format: articlesFilter.format(["test"]),
      "contributors.contributor": articlesFilter["contributors.contributor"]([
        "test",
      ]),
    };

    const { postFilters, queryFilters } = partitionFiltersForFacets(
      aggregations,
      filters
    );
    expect(postFilters).toContainAllValues([filters.format]);
    expect(queryFilters).toContainAllValues([
      filters["contributors.contributor"],
    ]);
  });
});
