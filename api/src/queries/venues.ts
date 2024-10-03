import { TermsFilter } from './common';

export const venuesFilter = {
  title: (titles: string[]): TermsFilter => ({
    values: titles,
    esQuery: {
      terms: {
        'filter.title': titles,
      },
    },
  }),
  id: (ids: string[]): TermsFilter => ({
    values: ids,
    esQuery: {
      terms: {
        'filter.id': ids,
      },
    },
  }),
};
