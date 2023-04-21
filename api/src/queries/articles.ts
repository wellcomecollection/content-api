import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/typesWithBodyKey";

export const articlesQuery = (queryString: string): QueryDslQueryContainer => ({
  multi_match: {
    query: queryString,
    fields: [
      "query.title.*^100",
      "query.contributors.*^10",
      "query.contributors.keyword^100",
      "query.standfirst.*^10",
      "query.body.*",
      "query.caption.*",
    ],
    operator: "or",
    type: "cross_fields",
    minimum_should_match: "-25%",
  },
});
