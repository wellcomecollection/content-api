import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';

import { TermsFilter } from './common';

export const eventsQuery = ({
  queryString,
  timespan,
}: {
  queryString?: string;
  timespan?: QueryDslQueryContainer[];
}): QueryDslQueryContainer => ({
  ...(queryString && {
    multi_match: {
      query: queryString,
      fields: [
        'id',
        'query.title.*^100',
        'query.caption.*^10',
        'query.series.*^80',
        'query.series.contributors*^8',
        'query.series.contributors.keyword^80',
        'query.format.*^80',
        'query.audiences.*^80',
        'query.interpretations.*^80',
      ],
      operator: 'or',
      type: 'cross_fields',
      minimum_should_match: '-25%',
    },
  }),
  ...(timespan && {
    nested: {
      path: 'filter.times',
      query: {
        bool: {
          must: timespan,
        },
      },
    },
  }),
});

export const eventsFilter = {
  format: (formats: string[]): TermsFilter => ({
    values: formats,
    esQuery: {
      terms: {
        'filter.format': formats,
      },
    },
  }),
  interpretation: (interpretations: string[]): TermsFilter => ({
    values: interpretations,
    esQuery: {
      terms: {
        'filter.interpretations': interpretations,
      },
    },
  }),
  audience: (audiences: string[]): TermsFilter => ({
    values: audiences,
    esQuery: {
      terms: {
        'filter.audiences': audiences,
      },
    },
  }),
  location: (locations: string[]): TermsFilter => ({
    values: locations,
    esQuery: {
      terms: {
        'filter.locations': locations,
      },
    },
  }),
  isAvailableOnline: (): QueryDslQueryContainer => ({
    term: {
      'filter.isAvailableOnline': true,
    },
  }),
};

export const eventsAggregations = {
  format: {
    terms: {
      size: 20,
      field: 'aggregatableValues.format',
    },
  },
  interpretation: {
    terms: {
      size: 20,
      field: 'aggregatableValues.interpretations',
    },
  },
  audience: {
    terms: {
      size: 10,
      field: 'aggregatableValues.audiences',
    },
  },
  location: {
    terms: {
      size: 3,
      field: 'aggregatableValues.locations',
    },
  },
  isAvailableOnline: {
    terms: {
      size: 2,
      field: 'aggregatableValues.isAvailableOnline',
    },
  },
  // https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-daterange-aggregation.html
  timespan: {
    terms: {
      size: 20, // TODO figure out what this is https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-significantterms-aggregation.html#sig-terms-shard-size
      field: 'filter.timespan', // use filter values and not create aggregations for it
    },
  },
} as const;
