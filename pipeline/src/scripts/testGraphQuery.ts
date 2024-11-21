import util from 'util';
import yargs from 'yargs';

import {
  articlesQuery,
  eventDocumentsQuery,
  venueQuery,
  webcomicsQuery,
} from './../graph-queries';
import {
  addressablesArticlesQuery,
  addressablesBooksQuery,
  addressablesEventsQuery,
  addressablesExhibitionsQuery,
  addressablesExhibitionTextsQuery,
  addressablesHighlightToursQuery,
  addressablesPagesQuery,
  addressablesProjectsQuery,
  addressablesSeasonsQuery,
  addressablesVisualStoriesQuery,
} from './../graph-queries/addressables';
import { createPrismicClient } from './../services/prismic';

const { type, isDetailed, id } = yargs(process.argv.slice(2))
  .usage('Usage: $0 --type [string] --isDetailed [boolean] --id [string]')
  .options({
    type: { type: 'string' },
    isDetailed: { type: 'boolean' },
    id: { type: 'string' },
  })
  .parseSync();

const allowedTypes = [
  'article',
  'webcomic',
  'event',
  'venue',
  'exhibition',
  'book',
  'page',
  'exhibition-text',
  'highlight-tour',
  'visual-story',
  'project',
  'season',
];

async function main() {
  if (!type) {
    console.error(
      `Please pass in the type you'd like to fetch, from this list ${allowedTypes.join(', ')}.\n e.g. --type=article`
    );
    process.exit(1);
  }

  let graphQueryName;
  const query = () => {
    switch (type) {
      case 'article':
        graphQueryName = isDetailed
          ? 'articlesQuery'
          : 'addressablesArticlesQuery';

        return {
          graphQuery: `{
            ${isDetailed ? articlesQuery : addressablesArticlesQuery}
          }`,
          id: id || 'ZdSMbREAACQA3j30',
        };

      case 'webcomic':
        graphQueryName = 'webcomicsQuery';

        return {
          graphQuery: `{
            ${webcomicsQuery}
          }`,
          id: id || 'XkV9dREAAAPkNP0b',
        };

      case 'event':
        graphQueryName = isDetailed
          ? 'eventDocumentsQuery'
          : 'addressablesEventsQuery';

        return {
          graphQuery: isDetailed
            ? eventDocumentsQuery
            : `{
              ${addressablesEventsQuery}
            }`,
          id: id || 'ZfhSyxgAACQAkLPZ',
        };

      case 'venue':
        graphQueryName = 'venueQuery';

        return {
          graphQuery: venueQuery,
          id: id || 'Wsttgx8AAJeSNmJ4',
        };

      case 'exhibition':
        graphQueryName = 'addressablesExhibitionsQuery';

        return {
          graphQuery: `{
            ${addressablesExhibitionsQuery}
          }`,
          id: id || 'Yzv9ChEAABfUrkVp',
        };

      case 'book':
        graphQueryName = 'addressablesBooksQuery';

        return {
          graphQuery: `{
            ${addressablesBooksQuery}
          }`,
          id: id || 'ZijgihEAACMAtL-k',
        };

      case 'page':
        graphQueryName = 'addressablesPagesQuery';

        return {
          graphQuery: `{
            ${addressablesPagesQuery}
          }`,
          id: id || 'YdXSvhAAAIAW7YXQ',
        };

      case 'visual-story':
        graphQueryName = 'addressablesVisualStoriesQuery';

        return {
          graphQuery: `{
            ${addressablesVisualStoriesQuery}
          }`,
          id: id || 'Zs8EuRAAAB4APxrA',
        };

      case 'exhibition-text':
        graphQueryName = 'addressablesExhibitionTextsQuery';

        return {
          graphQuery: `{
            ${addressablesExhibitionTextsQuery}
          }`,
          id: id || 'Zs8mohAAAB4AP4sc',
        };

      case 'highlight-tour':
        graphQueryName = 'addressablesHighlightToursQuery';

        return {
          graphQuery: `{
            ${addressablesHighlightToursQuery}
          }`,
          id: id || 'ZthrZRIAACQALvCC',
        };

      case 'project':
        graphQueryName = 'addressablesProjectsQuery';

        return {
          graphQuery: `{
            ${addressablesProjectsQuery}
          }`,
          id: id || 'Ys1-OxEAACEAguyS',
        };

      case 'season':
        graphQueryName = 'addressablesSeasonsQuery';

        return {
          graphQuery: `{
            ${addressablesSeasonsQuery}
          }`,
          id: id || 'X84FvhIAACUAqiqp',
        };

      default:
        console.error(`Allowed types are ${allowedTypes.join(', ')}.`);
        process.exit(1);
    }
  };

  const client = createPrismicClient();

  const queryResult = query();

  if (!queryResult) {
    console.error('Something went wrong with queryResult', queryResult);
    process.exit(1);
  }

  const doc = await client.getByID(queryResult.id, {
    graphQuery: queryResult.graphQuery.replace(/\n(\s+)/g, '\n'),
  });

  console.log(
    util.inspect(doc, { showHidden: false, depth: null, colors: true })
  );
  console.log(`\n\x1b[4mThis is the result from ${graphQueryName}.\x1b[0m\n`);
}

main();
