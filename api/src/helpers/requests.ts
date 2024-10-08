import { Filter } from '@weco/content-api/src/queries/common';
import { StringLiteral } from '@weco/content-api/src/types';

import { ifDefined } from './index';

// Given an object of query parameters, and one with the same keys
// of functions that create filter objects, apply all those functions
// to the corresponding parameters and return an object of the filters
export const pickFiltersFromQuery = <
  Name extends string,
  Query extends { [key in Name]?: string },
  Filters extends {
    [key in Name]: (params: string[]) => Filter;
  },
>(
  filterNames: readonly StringLiteral<Name>[],
  query: Query,
  filters: Filters
): Record<Name, Filter> =>
  Object.fromEntries(
    filterNames.flatMap(filterName => {
      const maybeFilter = ifDefined(
        query[filterName]?.split(','),
        filters[filterName]
      );
      return maybeFilter ? [[filterName, maybeFilter]] : [];
    })
  ) as Record<Name, Filter>;
