import util from 'util';
import yargs from 'yargs';

import {
  AddressablesAllowedTypes,
  allowedTypes,
  getGraphQuery,
  isAddressablesAllowedTypes,
} from '@weco/content-pipeline/src/helpers/getGraphQuery';
import { createPrismicClient } from '@weco/content-pipeline/src/services/prismic';

import { getDocumentId } from './documentIds';

const { type, isDetailed, id } = yargs(process.argv.slice(2))
  .usage('Usage: $0 --type [string] --isDetailed [boolean] --id [string]')
  .options({
    type: { type: 'string' },
    isDetailed: { type: 'boolean' },
    id: { type: 'string' },
  })
  .parseSync();

const getGraphQueryName = ({
  type,
  isDetailed,
}: {
  type: AddressablesAllowedTypes;
  isDetailed?: boolean;
}) => {
  switch (type) {
    case 'article':
      return isDetailed ? 'articlesQuery' : 'addressablesArticlesQuery';

    case 'webcomic':
      return 'webcomicsQuery';

    case 'event':
      return isDetailed ? 'eventDocumentsQuery' : 'addressablesEventsQuery';

    case 'venue':
      return 'venueQuery';

    case 'exhibition':
      return 'addressablesExhibitionsQuery';

    case 'book':
      return 'addressablesBooksQuery';

    case 'page':
      return 'addressablesPagesQuery';

    case 'visual-story':
      return 'addressablesVisualStoriesQuery';

    case 'exhibition-text':
      return 'addressablesExhibitionTextsQuery';

    case 'exhibition-highlight-tour':
      return 'addressablesExhibitionHighlightToursQuery';

    case 'project':
      return 'addressablesProjectsQuery';

    case 'season':
      return 'addressablesSeasonsQuery';

    default:
      console.error(`Allowed types are ${allowedTypes.join(', ')}.`);
      process.exit(1);
  }
};

async function main() {
  if (!isAddressablesAllowedTypes(type)) {
    console.error(
      `Please pass in the type you'd like to fetch, from this list ${allowedTypes.join(', ')}.\n e.g. --type=article`
    );
    process.exit(1);
  }

  const documentId = getDocumentId({ type, id });
  const graphQueryName = getGraphQueryName({ type, isDetailed });
  const graphQuery = getGraphQuery({ type, isDetailed });

  if (!documentId || !graphQueryName || !graphQuery) {
    console.error('Something went wrong with queryResult', {
      documentId,
      graphQueryName,
      hasGraphQuery: !!graphQuery,
    });
    process.exit(1);
  }

  const client = createPrismicClient();

  const doc = await client.getByID(documentId, {
    graphQuery: graphQuery.replace(/\n(\s+)/g, '\n'),
  });

  console.log(
    util.inspect(doc, { showHidden: false, depth: null, colors: true })
  );
  console.log(`\n\x1b[4mThis is the result from ${graphQueryName}.\x1b[0m\n`);
}

main();
