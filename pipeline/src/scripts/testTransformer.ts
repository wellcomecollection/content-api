import util from 'util';
import yargs from 'yargs';

import {
  articlesQuery,
  eventDocumentsQuery,
  venueQuery,
  webcomicsQuery,
} from '@weco/content-pipeline/src/graph-queries';
import {
  addressablesArticlesQuery,
  addressablesBooksQuery,
  addressablesEventsQuery,
  addressablesExhibitionHighlightToursQuery,
  addressablesExhibitionsQuery,
  addressablesExhibitionTextsQuery,
  addressablesVisualStoriesQuery,
} from '@weco/content-pipeline/src/graph-queries/addressables';
import { getGraphQuery } from '@weco/content-pipeline/src/helpers/getGraphQuery';
import { createPrismicClient } from '@weco/content-pipeline/src/services/prismic';
import { transformAddressableArticle } from '@weco/content-pipeline/src/transformers/addressables/article';
import { transformAddressableBook } from '@weco/content-pipeline/src/transformers/addressables/book';
import { transformAddressableEvent } from '@weco/content-pipeline/src/transformers/addressables/event';
import { transformAddressableExhibition } from '@weco/content-pipeline/src/transformers/addressables/exhibition';
import { transformAddressableExhibitionHighlightTour } from '@weco/content-pipeline/src/transformers/addressables/exhibitionHighlightTour';
import { transformAddressableExhibitionText } from '@weco/content-pipeline/src/transformers/addressables/exhibitionText';
import { transformAddressableProject } from '@weco/content-pipeline/src/transformers/addressables/project';
import { transformAddressableSeason } from '@weco/content-pipeline/src/transformers/addressables/season';
import { transformAddressableVisualStory } from '@weco/content-pipeline/src/transformers/addressables/visualStory';
import { transformArticle } from '@weco/content-pipeline/src/transformers/article';
import { transformEventDocument } from '@weco/content-pipeline/src/transformers/eventDocument';
import { transformVenue } from '@weco/content-pipeline/src/transformers/venue';
import {
  ArticlePrismicDocument,
  EventPrismicDocument,
  ExhibitionHighlightTourPrismicDocument,
  ExhibitionPrismicDocument,
  ExhibitionTextPrismicDocument,
  ProjectPrismicDocument,
  SeasonPrismicDocument,
  VisualStoryPrismicDocument,
} from '@weco/content-pipeline/src/types/prismic';
import { BookPrismicDocument } from '@weco/content-pipeline/src/types/prismic/books';
import { VenuePrismicDocument } from '@weco/content-pipeline/src/types/prismic/venues';

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
  'exhibition-highlight-tour',
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
          graphQuery: `{
              ${isDetailed ? articlesQuery : addressablesArticlesQuery}
            }`.replace(/\n(\s+)/g, '\n'),
        });

        transformerName = isDetailed
          ? 'transformArticle'
          : 'transformAddressableArticle';
        return isDetailed
          ? transformArticle(doc as ArticlePrismicDocument)
          : transformAddressableArticle(doc as ArticlePrismicDocument);
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
          graphQuery: (isDetailed
            ? eventDocumentsQuery
            : `{
              ${addressablesEventsQuery}
            }`
          ).replace(/\n(\s+)/g, '\n'),
        });

        transformerName = isDetailed
          ? 'transformEventDocument'
          : 'transformAddressableEvent';
        return isDetailed
          ? transformEventDocument(doc as EventPrismicDocument)
          : transformAddressableEvent(doc as EventPrismicDocument);
      }

      case 'venue': {
        const doc = await client.getByID(id || 'Wsttgx8AAJeSNmJ4', {
          graphQuery: venueQuery.replace(/\n(\s+)/g, '\n'),
        });

        transformerName = 'transformVenue';
        return transformVenue(doc as VenuePrismicDocument);
      }

      case 'exhibition': {
        const doc = await client.getByID(id || 'Yzv9ChEAABfUrkVp', {
          graphQuery: `{
            ${addressablesExhibitionsQuery.replace(/\n(\s+)/g, '\n')}
          }`,
        });

        transformerName = 'transformAddressableExhibition';
        return transformAddressableExhibition(doc as ExhibitionPrismicDocument);
      }

      case 'book': {
        const doc = await client.getByID(id || 'WwVK3CAAAHm5Exxr', {
          graphQuery: `{
            ${addressablesBooksQuery.replace(/\n(\s+)/g, '\n')}
          }`,
        });

        transformerName = 'transformAddressableBook';
        return transformAddressableBook(doc as BookPrismicDocument);
      }

      // case 'page': {
      //   const doc = await client.getByID(id || 'YdXSvhAAAIAW7YXQ', {
      //     graphQuery: venueQuery.replace(/\n(\s+)/g, '\n'),
      //   });

      //   transformerName = 'transformVenue';
      //   return transformVenue(doc as VenuePrismicDocument);
      // }

      case 'visual-story': {
        const doc = await client.getByID(id || 'Zs8EuRAAAB4APxrA', {
          graphQuery: `{
            ${addressablesVisualStoriesQuery.replace(/\n(\s+)/g, '\n')}
          }`,
        });

        transformerName = 'transformAddressableVisualStory';
        return transformAddressableVisualStory(
          doc as VisualStoryPrismicDocument
        );
      }

      case 'exhibition-text': {
        const doc = await client.getByID(id || 'Zs8mohAAAB4AP4sc', {
          graphQuery: `{
            ${addressablesExhibitionTextsQuery.replace(/\n(\s+)/g, '\n')}
          }`,
        });

        transformerName = 'transformAddressableExhibitionText';
        return transformAddressableExhibitionText(
          doc as ExhibitionTextPrismicDocument
        );
      }

      case 'exhibition-highlight-tour': {
        const doc = await client.getByID(id || 'ZthrZRIAACQALvCC', {
          graphQuery: `{
            ${addressablesExhibitionHighlightToursQuery.replace(/\n(\s+)/g, '\n')}
          }`,
        });

        transformerName = 'transformAddressableExhibitionHighlightTour';
        return transformAddressableExhibitionHighlightTour(
          doc as ExhibitionHighlightTourPrismicDocument
        );
      }

      case 'project': {
        const graphQuery = getGraphQuery({ type: 'project' });
        const doc = await client.getByID(id || 'YLokOhAAACQAf8Hd', {
          graphQuery: graphQuery.replace(/\n(\s+)/g, '\n'),
        });

        transformerName = 'transformProject';
        return transformAddressableProject(doc as ProjectPrismicDocument);
      }

      case 'season': {
        const graphQuery = getGraphQuery({ type: 'season' });
        const doc = await client.getByID(id || 'X84FvhIAACUAqiqp', {
          graphQuery: graphQuery.replace(/\n(\s+)/g, '\n'),
        });

        transformerName = 'transformSeason';
        return transformAddressableSeason(doc as SeasonPrismicDocument);
      }

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
