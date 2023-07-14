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

  it("gets buckets from a terms sub-aggregation if the top level aggregation is a single-bucket filter aggregation", () => {
    const elasticAggregations = {
      format: {
        doc_count: 19,
        terms: {
          doc_count_error_upper_bound: 0,
          sum_other_doc_count: 0,
          buckets: [
            {
              key: '{"type":"ArticleFormat","id":"W7TfJRAAAJ1D0eLK","label":"Article"}',
              doc_count: 14,
            },
            {
              key: '{"type":"ArticleFormat","id":"W5uKaCQAACkA3C0T","label":"In pictures"}',
              doc_count: 5,
            },
          ],
        },
      },
    };
    const mappedAggregations = mapAggregations(elasticAggregations);
    expect(mappedAggregations.format.buckets[0].count).toBe(
      elasticAggregations.format.terms.buckets[0].doc_count
    );
    expect(mappedAggregations.format.buckets[1].count).toBe(
      elasticAggregations.format.terms.buckets[1].doc_count
    );
  });

  it("adds self-filter buckets to the list", () => {
    const elasticAggregations = {
      format: {
        doc_count: 7,
        terms: {
          doc_count_error_upper_bound: 0,
          sum_other_doc_count: 0,
          buckets: [
            {
              key: '{"type":"ArticleFormat","id":"W7TfJRAAAJ1D0eLK","label":"Article"}',
              doc_count: 7,
            },
          ],
        },
        self_filter: {
          doc_count: 0,
          terms: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              {
                key: '{"type":"ArticleFormat","id":"W7d_ghAAALWY3Ujc","label":"Comic"}',
                doc_count: 1,
              },
              {
                key: '{"type":"ArticleFormat","id":"ZBH6PRQAAIrrFirA","label":"Short film"}',
                doc_count: 0,
              },
            ],
          },
        },
      },
    };

    const mappedAggregations = mapAggregations(elasticAggregations);
    expect(mappedAggregations.format.buckets).toHaveLength(3);
    expect(mappedAggregations.format.buckets).toContainEqual({
      count: 0,
      data: {
        id: "ZBH6PRQAAIrrFirA",
        label: "Short film",
        type: "ArticleFormat",
      },
      type: "AggregationBucket",
    });
    expect(mappedAggregations.format.buckets).toContainEqual({
      count: 1,
      data: {
        id: "W7d_ghAAALWY3Ujc",
        label: "Comic",
        type: "ArticleFormat",
      },
      type: "AggregationBucket",
    });
  });

  it("does not duplicate self-filter buckets", () => {
    const elasticAggregations = {
      format: {
        doc_count: 19,
        self_filters: {
          doc_count: 5,
          format: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              {
                key: '{"type":"ArticleFormat","id":"W5uKaCQAACkA3C0T","label":"In pictures"}',
                doc_count: 5,
              },
            ],
          },
        },
        terms: {
          doc_count_error_upper_bound: 0,
          sum_other_doc_count: 0,
          buckets: [
            {
              key: '{"type":"ArticleFormat","id":"W7TfJRAAAJ1D0eLK","label":"Article"}',
              doc_count: 14,
            },
            {
              key: '{"type":"ArticleFormat","id":"W5uKaCQAACkA3C0T","label":"In pictures"}',
              doc_count: 5,
            },
          ],
        },
      },
    };

    const mappedAggregations = mapAggregations(elasticAggregations);
    const bucketKeys = mappedAggregations.format.buckets.map((b) => b.data);
    expect(new Set(bucketKeys).size).toBe(bucketKeys.length);
  });

  it("returns buckets in descending order of count and ascending order of ID", () => {
    const elasticAggregations = {
      "contributors.contributor": {
        doc_count: 37,
        terms: {
          doc_count_error_upper_bound: 0,
          sum_other_doc_count: 20,
          buckets: [
            {
              key: '{"type":"Person","id":"YnjtxxAAACMAHZ_e","label":"Georgie Evans"}',
              doc_count: 6,
            },
            {
              key: '{"type":"Person","id":"Ynz5MBAAAJ-4L-MU","label":"Nicole Coffield"}',
              doc_count: 6,
            },
            {
              key: '{"type":"Person","id":"XFMf5hUAAPGIqj79","label":"Thomas S G Farnetti"}',
              doc_count: 4,
            },
            {
              key: '{"type":"Person","id":"W5e9vyYAACYAMqhi","label":"Elena Carter"}',
              doc_count: 3,
            },
            {
              key: '{"type":"Person","id":"XRShxhEAACMAMrCm","label":"Steven Pocock"}',
              doc_count: 3,
            },
            {
              key: '{"type":"Person","id":"XA5EPBEAAMr9xwoh","label":"Kate Wilkinson"}',
              doc_count: 2,
            },
            {
              key: '{"type":"Person","id":"XBvc8RAAAEpjoYeX","label":"Benjamin Gilbert"}',
              doc_count: 2,
            },
            {
              key: '{"type":"Person","id":"XF1PQhAAAJIpjoT7","label":"Camilla Greenwell"}',
              doc_count: 2,
            },
            {
              key: '{"type":"Person","id":"W-VbKhEAAJWKgZDR","label":"Stevyn Colgan"}',
              doc_count: 1,
            },
            {
              key: '{"type":"Person","id":"W18yKyYAACUAz3oo","label":"Jamie Hale"}',
              doc_count: 1,
            },
            {
              key: '{"type":"Person","id":"W1crUiYAACYArC-y","label":"Sarifa Patel"}',
              doc_count: 1,
            },
            {
              key: '{"type":"Person","id":"W2lv4yYAACQAXk5G","label":"Kristin Hohenadel"}',
              doc_count: 1,
            },
            {
              key: '{"type":"Person","id":"W2q3eCkAACkA7XGA","label":"Lil Sullivan"}',
              doc_count: 1,
            },
            {
              key: '{"type":"Person","id":"W6ooGxIAACMAoWGo","label":"Taras Young"}',
              doc_count: 1,
            },
            {
              key: '{"type":"Person","id":"W8RPPBEAAE8Eu8Gj","label":"Ken Hollings"}',
              doc_count: 1,
            },
            {
              key: '{"type":"Person","id":"WSQ9rygAAA9xtwgQ","label":"Elissavet Ntoulia"}',
              doc_count: 1,
            },
            {
              key: '{"type":"Person","id":"WSRjBCgAAKpwt6w9","label":"Helen Babbs"}',
              doc_count: 1,
            },
            {
              key: '{"type":"Person","id":"WT5y6S0AACwAdxSL","label":"Anna Faherty"}',
              doc_count: 1,
            },
            {
              key: '{"type":"Person","id":"XII-5hAAACrBKerK","label":"Giovanni Tiso"}',
              doc_count: 1,
            },
            {
              key: '{"type":"Person","id":"XS260xAAACUAEfA6","label":"Niven Govinden"}',
              doc_count: 1,
            },
          ],
        },
        self_filter: {
          doc_count: 3,
          terms: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              {
                key: '{"type":"Person","id":"XRShxhEAACMAMrCm","label":"Steven Pocock"}',
                doc_count: 3,
              },
            ],
          },
        },
      },
    };

    const mappedAggregations = mapAggregations(elasticAggregations);
    const buckets = mappedAggregations["contributors.contributor"].buckets;
    for (let i = 0; i < buckets.length - 1; i++) {
      expect(buckets[i].count).toBeGreaterThanOrEqual(buckets[i + 1].count);
      if (buckets[i].count === buckets[i + 1].count) {
        expect(
          buckets[i].data.id.localeCompare(buckets[i + 1].data.id)
        ).toBeLessThanOrEqual(0);
      }
    }
  });
});
