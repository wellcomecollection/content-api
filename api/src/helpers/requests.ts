import { StringLiteral } from "../types";
import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { ifDefined } from "./index";

export const pickFiltersFromQuery = <
  Name extends string,
  Query extends { [key in Name]?: string },
  Filters extends {
    [key in Name]: (params: string[]) => QueryDslQueryContainer;
  }
>(
  filterNames: ReadonlyArray<StringLiteral<Name>>,
  query: Query,
  filters: Filters
): Record<string, QueryDslQueryContainer> =>
  Object.fromEntries(
    filterNames.flatMap((filterName) => {
      const maybeFilter = ifDefined(
        query[filterName]?.split(","),
        filters[filterName]
      );
      return maybeFilter ? [[filterName, maybeFilter]] : [];
    })
  );
