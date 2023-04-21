import articlesQuery from "./articles";
import webcomicsQuery from "./webcomics";

export const wrapQueries = (...queries: string[]) => `{
  ${queries.join("\n")}
}`;

export { articlesQuery, webcomicsQuery };
