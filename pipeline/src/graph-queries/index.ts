import articlesQuery from './articles';
import eventDocumentsQuery from './eventDocuments';
import venueQuery from './venues';
import webcomicsQuery from './webcomics';

export const wrapQueries = (...queries: string[]) => `{
  ${queries.join('\n')}
}`;

export { articlesQuery, webcomicsQuery, eventDocumentsQuery, venueQuery };
