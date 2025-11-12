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

export const addressablesFilter = (
  workIds: string[]
): QueryDslQueryContainer => {
  // Use 'term' for single work ID, 'terms' for multiple work IDs
  if (workIds.length === 1) {
    return {
      term: {
        'query.linkedWorks': workIds[0],
      },
    };
  }

  return {
    terms: {
      'query.linkedWorks': workIds,
    },
  };
};
