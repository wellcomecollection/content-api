import articlesQuery from "./articles";
import webcomicsQuery from "./webcomics";
import eventDocumentsQuery from "./eventDocuments";

export const wrapQueries = (...queries: string[]) => `{
  ${queries.join("\n")}
}`;

export { articlesQuery, webcomicsQuery, eventDocumentsQuery };
