import { wrapQueries } from '..';
import addressablesArticlesQuery from './articles';
import addressablesBooksQuery from './books';
import addressablesEventsQuery from './events';
import addressablesExhibitionHighlightToursQuery from './exhibitionHighlightTours';
import addressablesExhibitionsQuery from './exhibitions';
import addressablesExhibitionTextsQuery from './exhibitionTexts';
import addressablesPagesQuery from './pages';
import addressablesProjectsQuery from './projects';
import addressablesSeasonsQuery from './seasons';
import addressablesVisualStoriesQuery from './visualStories';

const addressablesQuery = wrapQueries(
  addressablesArticlesQuery,
  addressablesBooksQuery,
  addressablesEventsQuery,
  addressablesExhibitionsQuery,
  addressablesExhibitionTextsQuery,
  addressablesExhibitionHighlightToursQuery,
  addressablesPagesQuery,
  addressablesProjectsQuery,
  addressablesSeasonsQuery,
  addressablesVisualStoriesQuery
);

export {
  addressablesQuery,
  addressablesArticlesQuery,
  addressablesBooksQuery,
  addressablesEventsQuery,
  addressablesExhibitionsQuery,
  addressablesExhibitionTextsQuery,
  addressablesExhibitionHighlightToursQuery,
  addressablesPagesQuery,
  addressablesProjectsQuery,
  addressablesSeasonsQuery,
  addressablesVisualStoriesQuery,
};
