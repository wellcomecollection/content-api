import { mapAggregations } from "../src/helpers/responses";

describe("mapAggregations", () => {
  it("maps aggregations responses from ES to our expected response format", () => {
    const elasticAggregations = {
      format: {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0,
        buckets: [
          {
            key: '{"type":"ArticleFormat","id":"W7TfJRAAAJ1D0eLK","label":"Article"}',
            doc_count: 595,
          },
          {
            key: '{"type":"ArticleFormat","id":"W7d_ghAAALWY3Ujc","label":"Comic"}',
            doc_count: 271,
          },
          {
            key: '{"type":"ArticleFormat","id":"W5uKaCQAACkA3C0T","label":"In pictures"}',
            doc_count: 137,
          },
          {
            key: '{"type":"ArticleFormat","id":"W8CbPhEAAB8Nq4aG","label":"Book extract"}',
            doc_count: 38,
          },
          {
            key: '{"type":"ArticleFormat","id":"XTYCkRAAACUANeph","label":"Photo story"}',
            doc_count: 19,
          },
          {
            key: '{"type":"ArticleFormat","id":"XwRZ6hQAAG4K-bbt","label":"Podcast"}',
            doc_count: 16,
          },
          {
            key: '{"type":"ArticleFormat","id":"W9BoHhIAANBp1EXg","label":"Interview"}',
            doc_count: 10,
          },
          {
            key: '{"type":"ArticleFormat","id":"ZBH6PRQAAIrrFirA","label":"Short film"}',
            doc_count: 3,
          },
          {
            key: '{"type":"ArticleFormat","id":"YxcjgREAACAAkjBg","label":"Long read"}',
            doc_count: 2,
          },
          {
            key: '{"type":"ArticleFormat","id":"YrwCTxEAACUALJQ0","label":"Prose poem"}',
            doc_count: 1,
          },
        ],
      },
    };
    const mappedAggregations = mapAggregations(elasticAggregations);
    expect(mappedAggregations.format.buckets).toHaveLength(
      elasticAggregations.format.buckets.length
    );
    expect(mappedAggregations).toMatchSnapshot();
  });

  it("uses the count from a bucket sub-aggregation named 'filtered' if it is present", () => {
    const elasticAggregationsWithSubAgg = {
      format: {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0,
        buckets: [
          {
            key: '{"type":"ArticleFormat","id":"W7d_ghAAALWY3Ujc","label":"Comic"}',
            doc_count: 271,
            filtered: { doc_count: 159 },
          },
        ],
      },
    };
    const mappedAggregations = mapAggregations(elasticAggregationsWithSubAgg);
    expect(mappedAggregations.format.buckets[0].count).toBe(
      elasticAggregationsWithSubAgg.format.buckets[0].filtered.doc_count
    );
    // Putting this inverse test case here to catch if the test data changes to make doc_count and filtered.doc_count
    // equal - this is a perfectly valid/likely scenario but this test needs them to be different!
    expect(mappedAggregations.format.buckets[0].count).not.toBe(
      elasticAggregationsWithSubAgg.format.buckets[0].doc_count
    );
  });

  it("handles the case where the aggregation returns zero buckets", () => {
    const elasticAggregations = {
      format: {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0,
        buckets: [],
      },
    };
    const mappedAggregations = mapAggregations(elasticAggregations);

    expect(mappedAggregations.format.buckets).toHaveLength(0);
  });
});
