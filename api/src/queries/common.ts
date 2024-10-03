import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';

export type TermsFilter = {
  values: string[];
  esQuery: QueryDslQueryContainer;
};

export type Filter = TermsFilter | QueryDslQueryContainer;

export const isTermsFilter = (filter: Filter): filter is TermsFilter =>
  'values' in filter && 'esQuery' in filter;

export const esQuery = (filter: Filter): QueryDslQueryContainer =>
  isTermsFilter(filter) ? filter.esQuery : filter;
