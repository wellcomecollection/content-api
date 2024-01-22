import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";

export const eventsQuery = (queryString: string): QueryDslQueryContainer => ({
  multi_match: {
    query: queryString,
    fields: ["id", "query.title.*^100", "query.caption.*^10"],
    operator: "or",
    type: "cross_fields",
    minimum_should_match: "-25%",
  },
});
