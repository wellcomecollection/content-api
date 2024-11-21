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

const { type, isAddressable, id } = yargs(process.argv.slice(2))
  .usage('Usage: $0 --type [string] --isAddressable [boolean] --id [string]')
  .options({
    type: { type: 'string' },
    isAddressable: { type: 'boolean' },
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

  const query = () => {
    switch (type) {
      case 'article':
        return {
          graphQuery: isAddressable
            ? `{
            ${addressablesArticlesQuery}
          }`
            : `{
            ${articlesQuery}
          }`,
          id: id || 'ZdSMbREAACQA3j30',
        };
      case 'webcomic':
        return {
          graphQuery: isAddressable
            ? ''
            : `{
            ${webcomicsQuery}
          }`,
          id: id || 'XkV9dREAAAPkNP0b',
        };
      case 'event':
        return {
          graphQuery: isAddressable
            ? `{
            ${addressablesEventsQuery}
          }`
            : eventDocumentsQuery,
          id: id || 'ZfhSyxgAACQAkLPZ',
        };
      case 'venue':
        return {
          graphQuery: venueQuery,
          id: id || 'Wsttgx8AAJeSNmJ4',
        };
      case 'exhibition':
        return {
          graphQuery: isAddressable
            ? `{
          ${addressablesExhibitionsQuery}
          }`
            : '',
          id: id || 'Yzv9ChEAABfUrkVp',
        };
      case 'book':
        return {
          graphQuery: isAddressable
            ? `{
            ${addressablesBooksQuery}
          }`
            : '',
          id: id || 'ZijgihEAACMAtL-k',
        };
      case 'page':
        return {
          graphQuery: isAddressable
            ? `{
          ${addressablesPagesQuery}
          }`
            : '',
          id: id || 'YdXSvhAAAIAW7YXQ',
        };
      case 'visual-story':
        return {
          graphQuery: isAddressable
            ? `{
          ${addressablesVisualStoriesQuery}
          }`
            : '',
          id: id || 'Zs8EuRAAAB4APxrA',
        };
      case 'exhibition-text':
        return {
          graphQuery: isAddressable
            ? `{
            ${addressablesExhibitionTextsQuery}
          }`
            : '',
          id: id || 'Zs8mohAAAB4AP4sc',
        };
      case 'highlight-tour':
        return {
          graphQuery: isAddressable
            ? `{
          ${addressablesHighlightToursQuery}
          }`
            : '',
          id: id || 'ZthrZRIAACQALvCC',
        };
      case 'project':
        return {
          graphQuery: isAddressable
            ? `{
        ${addressablesProjectsQuery}
        }`
            : '',
          id: id || 'Ys1-OxEAACEAguyS',
        };
      case 'season':
        return {
          graphQuery: isAddressable
            ? `{
          ${addressablesSeasonsQuery}
          }`
            : '',
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
}

main();
