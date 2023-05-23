import { articlesAggregations, articlesFilter } from "../src/queries/articles";
import {
  partitionFiltersForFacets,
  rewriteAggregationsForFacets,
} from "../src/queries/faceting";
import { SortOrder } from "@elastic/elasticsearch/lib/api/types";

describe("rewriteAggregationsForFacets", () => {
  it("rewrites aggregations correctly when their corresponding filters are present", () => {
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
    expect(rewrittenFormatAgg.terms?.min_doc_count).toBe(0);
    expect(
      (rewrittenFormatAgg.terms?.order as Record<string, SortOrder>).filtered
    ).toBe("desc");
    expect(rewrittenFormatAgg.aggs?.filtered.filter?.bool?.filter).toBeArray();
    expect(
      rewrittenFormatAgg.aggs?.filtered.filter?.bool?.filter
    ).toIncludeAnyMembers([filters["contributors.contributor"]]);
  });

  it("does not modify aggregations which have no corresponding filter present", () => {
    const { format } = articlesAggregations;
    const aggregations = { format };
    const filters = {
      "contributors.contributor": articlesFilter["contributors.contributor"]([
        "test",
      ]),
    };
    const facetedAggregations = rewriteAggregationsForFacets(
      aggregations,
      filters
    );

    expect(facetedAggregations.format).toStrictEqual(format);
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
    expect(postFilters).toIncludeAllMembers([filters.format]);
    expect(queryFilters).toIncludeAllMembers([
      filters["contributors.contributor"],
    ]);
  });
});
