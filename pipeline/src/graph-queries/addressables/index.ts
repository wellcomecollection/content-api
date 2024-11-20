import { wrapQueries } from '..';
import articlesQuery from './articles';
import booksQuery from './books';
import eventsQuery from './events';
import exhibitionsQuery from './exhibitions';
import exhibitionTextsQuery from './exhibitionTexts';
import highlightToursQuery from './highlightTours';
import pagesQuery from './pages';
import projectsQuery from './projects';
import seasonsQuery from './seasons';
import visualStoriesQuery from './visualStories';

const addressablesQuery = wrapQueries(
  articlesQuery,
  booksQuery,
  eventsQuery,
  exhibitionsQuery,
  exhibitionTextsQuery,
  highlightToursQuery,
  pagesQuery,
  projectsQuery,
  seasonsQuery,
  visualStoriesQuery
);

export { addressablesQuery };
