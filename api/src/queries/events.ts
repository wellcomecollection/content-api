import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { TermsFilter } from "./common";

export const eventsQuery = (queryString: string): QueryDslQueryContainer => ({
  multi_match: {
    query: queryString,
    fields: ["id", "query.title.*^100", "query.caption.*^10"],
    operator: "or",
    type: "cross_fields",
    minimum_should_match: "-25%",
  },
});

export const eventsFilter = {
  format: (formats: string[]): TermsFilter => ({
    values: formats,
    esQuery: {
      terms: {
        "filter.formatId": formats,
      },
    },
  }),
  interpretation: (interpretations: string[]): TermsFilter => ({
    values: interpretations,
    esQuery: {
      terms: {
        "filter.interpretationIds": interpretations,
      },
    },
  }),
  audience: (audiences: string[]): TermsFilter => ({
    values: audiences,
    esQuery: {
      terms: {
        "filter.audienceIds": audiences,
      },
    },
  }),
  location: (locations: string[]): TermsFilter => ({
    values: locations,
    esQuery: {
      terms: {
        "filter.locationIds": locations,
      },
    },
  }),
  isAvailableOnline: (): QueryDslQueryContainer => {
    return {
      term: {
        "filter.isAvailableOnline": true,
      },
    };
  },
};

export const eventsAggregations = {
  format: {
    terms: {
      size: 20,
      field: "aggregatableValues.format",
    },
  },
  interpretation: {
    terms: {
      size: 20,
      field: "aggregatableValues.interpretations",
    },
  },
  audience: {
    terms: {
      size: 10,
      field: "aggregatableValues.audiences",
    },
  },
  location: {
    terms: {
      size: 3,
      field: "aggregatableValues.locations",
    },
  },
  isAvailableOnline: {
    terms: {
      size: 2,
      field: "aggregatableValues.isAvailableOnline",
    },
  },
} as const;
