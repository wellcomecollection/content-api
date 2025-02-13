import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';

import { TermsFilter } from './common';

export const eventsQuery = (queryString: string): QueryDslQueryContainer => ({
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
  // TODO Is this where the logic happens? What does this do?
  // timespan: (timespan: string): TermsFilter => {
  //   return {
  //     values: timespan,
  //     esQuery: {
  //       term: {
  //         'filter.timespan': timespan,
  //       },
  //     },
  //   };
  // },
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
  // TODO
  // timespan: {
  //   terms: {
  //     size: 2, // TODO figure out what this is
  //     field: 'filter.timespan', // use filter values?
  //   },
  // },
} as const;
