import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';

import {
  getTimespanRange,
  isValidTimespan,
} from '@weco/content-api/src/controllers/utils';

import { TermsFilter } from './common';

const getDateRange = (
  timespan?: string | string[]
): QueryDslQueryContainer[] | undefined => {
  let queryRange;

  if (timespan) {
    const isArray = Array.isArray(timespan);

    if (isArray && isValidTimespan(timespan[0]))
      queryRange = getTimespanRange(timespan[0]);

    if (!isArray && isValidTimespan(timespan))
      queryRange = getTimespanRange(timespan);
  }

  return queryRange;
};

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
  timespan: (timespan: string[]): QueryDslQueryContainer => ({
    nested: {
      path: 'filter.times',
      query: {
        bool: {
          must: getDateRange(timespan),
        },
      },
    },
  }),
};

export const eventsExclusionsFilter = {
  excludeFormats: (excludeFormats: string[]): TermsFilter => ({
    values: excludeFormats,
    esQuery: {
      terms: {
        'query.format.keyword': excludeFormats,
      },
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
  timespan: {
    nested: {
      path: 'filter.times',
    },
    aggs: {
      all: {
        filter: {
          match_all: {},
        },
        aggs: {
          count_parent: {
            reverse_nested: {},
          },
        },
      },
      past: {
        filter: {
          bool: {
            filter: getTimespanRange('past'),
          },
        },
        aggs: {
          count_parent: {
            reverse_nested: {},
          },
        },
      },
      future: {
        filter: {
          bool: {
            filter: getTimespanRange('future'),
          },
        },
        aggs: {
          count_parent: {
            reverse_nested: {},
          },
        },
      },
    },
  },
} as const;
