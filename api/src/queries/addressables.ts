import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';

export const addressablesQuery = (
  queryString: string
): QueryDslQueryContainer => ({
  multi_match: {
    query: queryString,
    fields: [
      'id',
      'uid',
      'query.title.*^100',
      'query.contributors.*^10',
      'query.contributors.keyword^100',
      'query.body.*',
      'query.description.*',
    ],
    operator: 'or',
    type: 'cross_fields',
    minimum_should_match: '-25%',
  },
});
