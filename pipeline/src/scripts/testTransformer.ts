import util from 'util';
import yargs from 'yargs';

import {
  articlesQuery,
  eventDocumentsQuery,
  venueQuery,
  webcomicsQuery,
} from './../graph-queries';
import { addressablesBooksQuery } from './../graph-queries/addressables';
import { createPrismicClient } from './../services/prismic';
import { transformAddressableBook } from './../transformers/addressables/book';
import { transformArticle } from './../transformers/article';
import { transformEventDocument } from './../transformers/eventDocument';
import { transformVenue } from './../transformers/venue';
import {
  ArticlePrismicDocument,
  EventPrismicDocument,
} from './../types/prismic';
import { BookPrismicDocument } from './../types/prismic/books';
import { VenuePrismicDocument } from './../types/prismic/venues';

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
      `Please pass in the type you'd like to transform, from this list ${allowedTypes.join(', ')}.\n e.g. --type=article`
    );
    process.exit(1);
  }

  const client = createPrismicClient();

  let transformerName;
  const transformDocument = async () => {
    switch (type) {
      case 'article': {
        const doc = await client.getByID(id || 'ZdSMbREAACQA3j30', {
          graphQuery: (isDetailed
            ? `{
              ${articlesQuery}
            }`
            : ''
          ).replace(/\n(\s+)/g, '\n'),
        });

        // TODO add isDetailed check
        transformerName = 'transformArticle';
        return transformArticle(doc as ArticlePrismicDocument);
      }

      case 'webcomic': {
        const doc = await client.getByID(id || 'XkV9dREAAAPkNP0b', {
          graphQuery: `{
              ${webcomicsQuery}
            }`.replace(/\n(\s+)/g, '\n'),
        });

        transformerName = 'transformArticle';
        return transformArticle(doc as ArticlePrismicDocument);
      }

      case 'event': {
        const doc = await client.getByID(id || 'ZfhSyxgAACQAkLPZ', {
          graphQuery: (isDetailed ? eventDocumentsQuery : '').replace(
            /\n(\s+)/g,
            '\n'
          ),
        });

        // TODO add isDetailed check
        transformerName = 'transformEventDocument';
        return transformEventDocument(doc as EventPrismicDocument);
      }

      case 'venue': {
        const doc = await client.getByID(id || 'Wsttgx8AAJeSNmJ4', {
          graphQuery: venueQuery.replace(/\n(\s+)/g, '\n'),
        });

        transformerName = 'transformVenue';
        return transformVenue(doc as VenuePrismicDocument);
      }

      // case 'exhibition': {
      //   const doc = await client.getByID(id || 'Yzv9ChEAABfUrkVp', {
      //     graphQuery: venueQuery.replace(/\n(\s+)/g, '\n'),
      //   });

      //   transformerName = 'transformVenue';
      //   return transformVenue(doc as VenuePrismicDocument);
      // }

      case 'book': {
        const doc = await client.getByID(id || 'ZijgihEAACMAtL-k', {
          graphQuery: isDetailed
            ? ''
            : `{
            ${addressablesBooksQuery}
          }`,
        });

        transformerName = isDetailed ? '' : 'transformAddressableBook';
        return transformAddressableBook(doc as BookPrismicDocument);
      }

      // case 'page': {
      //   const doc = await client.getByID(id || 'YdXSvhAAAIAW7YXQ', {
      //     graphQuery: venueQuery.replace(/\n(\s+)/g, '\n'),
      //   });

      //   transformerName = 'transformVenue';
      //   return transformVenue(doc as VenuePrismicDocument);
      // }

      // case 'visual-story': {
      //   const doc = await client.getByID(id || 'Zs8EuRAAAB4APxrA', {
      //     graphQuery: venueQuery.replace(/\n(\s+)/g, '\n'),
      //   });

      //   transformerName = 'transformVenue';
      //   return transformVenue(doc as VenuePrismicDocument);
      // }

      // case 'exhibition-text': {
      //   const doc = await client.getByID(id || 'Zs8mohAAAB4AP4sc', {
      //     graphQuery: venueQuery.replace(/\n(\s+)/g, '\n'),
      //   });

      //   transformerName = 'transformVenue';
      //   return transformVenue(doc as VenuePrismicDocument);
      // }

      // case 'highlight-tour': {
      //   const doc = await client.getByID(id || 'ZthrZRIAACQALvCC', {
      //     graphQuery: venueQuery.replace(/\n(\s+)/g, '\n'),
      //   });

      //   transformerName = 'transformVenue';
      //   return transformVenue(doc as VenuePrismicDocument);
      // }

      // case 'project': {
      //   const doc = await client.getByID(id || 'Ys1-OxEAACEAguyS', {
      //     graphQuery: venueQuery.replace(/\n(\s+)/g, '\n'),
      //   });

      //   transformerName = 'transformVenue';
      //   return transformVenue(doc as VenuePrismicDocument);
      // }

      // case 'season': {
      //   const doc = await client.getByID(id || 'X84FvhIAACUAqiqp', {
      //     graphQuery: venueQuery.replace(/\n(\s+)/g, '\n'),
      //   });

      //   transformerName = 'transformVenue';
      //   return transformVenue(doc as VenuePrismicDocument);
      // }

      default:
        console.error(`Allowed types are ${allowedTypes.join(', ')}.`);
        process.exit(1);
    }
  };

  const transformedDocument = await transformDocument();

  if (!transformedDocument) {
    console.error('Something went wrong with transformedDocument');
    process.exit(1);
  }

  console.log(
    util.inspect(transformedDocument, {
      showHidden: false,
      depth: null,
      colors: true,
    })
  );

  console.log(`\n\x1b[4mThis is the result from ${transformerName}.\x1b[0m\n`);
}

main();
