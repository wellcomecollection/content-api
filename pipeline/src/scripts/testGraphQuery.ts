import util from 'util';
import yargs from 'yargs';

import {
  allowedTypes,
  getGraphQuery,
} from '@weco/content-pipeline/src/helpers/getGraphQuery';
import { createPrismicClient } from '@weco/content-pipeline/src/services/prismic';

const { type, isDetailed, id } = yargs(process.argv.slice(2))
  .usage('Usage: $0 --type [string] --isDetailed [boolean] --id [string]')
  .options({
    type: { type: 'string' },
    isDetailed: { type: 'boolean' },
    id: { type: 'string' },
  })
  .parseSync();

async function main() {
  if (!type) {
    console.error(
      `Please pass in the type you'd like to fetch, from this list ${allowedTypes.join(', ')}.\n e.g. --type=article`
    );
    process.exit(1);
  }

  const client = createPrismicClient();

  const getGraphInfo = ({
    type,
    isDetailed,
    id,
  }: {
    type: (typeof allowedTypes)[number];
    isDetailed?: boolean;
    id?: string;
  }) => {
    switch (type) {
      case 'article':
        return {
          graphQueryName: isDetailed
            ? 'articlesQuery'
            : 'addressablesArticlesQuery',
          id: id || 'ZdSMbREAACQA3j30',
        };

      case 'webcomic':
        return {
          graphQueryName: 'webcomicsQuery',
          id: id || 'XkV9dREAAAPkNP0b',
        };

      case 'event':
        return {
          graphQueryName: isDetailed
            ? 'eventDocumentsQuery'
            : 'addressablesEventsQuery',
          id: id || 'ZfhSyxgAACQAkLPZ',
        };

      case 'venue':
        return {
          graphQueryName: 'venueQuery',
          id: id || 'Wsttgx8AAJeSNmJ4',
        };

      case 'exhibition':
        return {
          graphQueryName: 'addressablesExhibitionsQuery',
          id: id || 'Yzv9ChEAABfUrkVp',
        };

      case 'book':
        return {
          graphQueryName: 'addressablesBooksQuery',
          id: id || 'ZijgihEAACMAtL-k',
        };

      case 'page':
        return {
          graphQueryName: 'addressablesPagesQuery',
          id: id || 'YdXSvhAAAIAW7YXQ',
        };

      case 'visual-story':
        return {
          graphQueryName: 'addressablesVisualStoriesQuery',
          id: id || 'Zs8EuRAAAB4APxrA',
        };

      case 'exhibition-text':
        return {
          graphQueryName: 'addressablesExhibitionTextsQuery',
          id: id || 'Zs8mohAAAB4AP4sc',
        };

      case 'highlight-tour':
        return {
          graphQueryName: 'addressablesHighlightToursQuery',
          id: id || 'ZthrZRIAACQALvCC',
        };

      case 'project':
        return {
          graphQueryName: 'addressablesProjectsQuery',
          id: id || 'Ys1-OxEAACEAguyS',
        };

      case 'season':
        return {
          graphQueryName: 'addressablesSeasonsQuery',
          id: id || 'X84FvhIAACUAqiqp',
        };

      default:
        console.error(`Allowed types are ${allowedTypes.join(', ')}.`);
        process.exit(1);
    }
  };

  const graphInfo = getGraphInfo({ type, isDetailed, id });
  const graphQuery = getGraphQuery({ type, isDetailed });

  if (!graphInfo || graphQuery) {
    console.error('Something went wrong with queryResult', {
      graphInfo,
      graphQuery,
    });
    process.exit(1);
  }

  const doc = await client.getByID(graphInfo.id, {
    graphQuery: graphQuery.replace(/\n(\s+)/g, '\n'),
  });

  console.log(
    util.inspect(doc, { showHidden: false, depth: null, colors: true })
  );
  console.log(
    `\n\x1b[4mThis is the result from ${graphInfo.graphQueryName}.\x1b[0m\n`
  );
}

main();
