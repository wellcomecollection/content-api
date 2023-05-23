import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/typesWithBodyKey";
export const articlesQuery = (queryString: string): QueryDslQueryContainer => ({
  multi_match: {
    query: queryString,
    fields: [
      "id",
      "query.title.*^100",
      "query.contributors.*^10",
      "query.contributors.keyword^100",
      "query.standfirst.*^10",
      "query.body.*",
      "query.caption.*",
      "query.series.id",
      "query.series.title.*^80",
      "query.series.contributors*^8",
      "query.series.contributors.keyword^80",
    ],
    operator: "or",
    type: "cross_fields",
    minimum_should_match: "-25%",
  },
});

export const articlesFilter = {
  contributors: (contributors: string[]): QueryDslQueryContainer => ({
    terms: {
      "filter.contributorIds": contributors,
    },
  }),
  format: (formats: string[]): QueryDslQueryContainer => ({
    terms: {
      "filter.formatId": formats,
    },
  }),
  publicationDate: (from?: Date, to?: Date): QueryDslQueryContainer => ({
    range: {
      "filter.publicationDate": {
        gte: from?.toISOString(),
        lte: to?.toISOString(),
      },
    },
  }),
};
