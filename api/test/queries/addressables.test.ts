import {
  addressablesFilter,
  addressablesQuery,
} from '@weco/content-api/src/queries/addressables';

describe('addressablesQuery', () => {
  it('creates a multi_match query for the given string', () => {
    const result = addressablesQuery('test query');

    expect(result).toEqual({
      multi_match: {
        query: 'test query',
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
  });
});

describe('addressablesFilter', () => {
  it('creates a term query for a single linkedWork', () => {
    const result = addressablesFilter(['work123']);

    expect(result).toEqual({
      term: {
        'query.linkedWorks': 'work123',
      },
    });
  });

  it('creates a terms query for multiple linkedWorks', () => {
    const result = addressablesFilter(['work123', 'work456', 'work789']);

    expect(result).toEqual({
      terms: {
        'query.linkedWorks': ['work123', 'work456', 'work789'],
      },
    });
  });
});
