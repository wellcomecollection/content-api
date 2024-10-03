import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';

import { TermsFilter } from './common';

export const articlesQuery = (queryString: string): QueryDslQueryContainer => ({
  multi_match: {
    query: queryString,
    fields: [
      'id',
      'query.title.*^100',
      'query.contributors.*^10',
      'query.contributors.keyword^100',
      'query.standfirst.*^10',
      'query.body.*',
      'query.caption.*',
      'query.series.id',
      'query.series.title.*^80',
      'query.series.contributors*^8',
      'query.series.contributors.keyword^80',
    ],
    operator: 'or',
    type: 'cross_fields',
    minimum_should_match: '-25%',
  },
});

export const articlesFilter = {
  'contributors.contributor': (contributors: string[]): TermsFilter => ({
    values: contributors,
    esQuery: {
      terms: {
        'filter.contributorIds': contributors,
      },
    },
  }),
  format: (formats: string[]): TermsFilter => ({
    values: formats,
    esQuery: {
      terms: {
        'filter.formatId': formats,
      },
    },
  }),
  publicationDate: (from?: Date, to?: Date): QueryDslQueryContainer => ({
    range: {
      'filter.publicationDate': {
        gte: from?.toISOString(),
        lte: to?.toISOString(),
      },
    },
  }),
};

export const articlesAggregations = {
  'contributors.contributor': {
    terms: {
      // At time of writing (2023-05-19) there are 560 contributors, too many to consider
      // returning all of them in the aggregation
      size: 20,
      field: 'aggregatableValues.contributors',
    },
  },
  format: {
    terms: {
      // At time of writing (2023-05-19) we have 10 article formats. This list is likely
      // to remain fairly stable, but I have chosen to use 20 as the size here so we have
      // some buffer if we add more formats
      size: 20,
      field: 'aggregatableValues.format',
    },
  },
} as const;
