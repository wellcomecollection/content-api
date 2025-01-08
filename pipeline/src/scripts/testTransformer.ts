import util from 'util';
import yargs from 'yargs';

import {
  getGraphQuery,
  isAddressablesAllowedTypes,
} from '@weco/content-pipeline/src/helpers/getGraphQuery';
import { createPrismicClient } from '@weco/content-pipeline/src/services/prismic';
import { transformAddressableArticle } from '@weco/content-pipeline/src/transformers/addressables/article';
import { transformAddressableBook } from '@weco/content-pipeline/src/transformers/addressables/book';
import { transformAddressableEvent } from '@weco/content-pipeline/src/transformers/addressables/event';
import { transformAddressableExhibition } from '@weco/content-pipeline/src/transformers/addressables/exhibition';
import { transformAddressableExhibitionHighlightTour } from '@weco/content-pipeline/src/transformers/addressables/exhibitionHighlightTour';
import { transformAddressableExhibitionText } from '@weco/content-pipeline/src/transformers/addressables/exhibitionText';
import { transformAddressablePage } from '@weco/content-pipeline/src/transformers/addressables/page';
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
  PagePrismicDocument,
  ProjectPrismicDocument,
  SeasonPrismicDocument,
  VisualStoryPrismicDocument,
} from '@weco/content-pipeline/src/types/prismic';
import { BookPrismicDocument } from '@weco/content-pipeline/src/types/prismic/books';
import { VenuePrismicDocument } from '@weco/content-pipeline/src/types/prismic/venues';

import { getDocumentId } from './documentIds';

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
  if (!isAddressablesAllowedTypes(type)) {
    console.error(
      `Please pass in the type you'd like to transform, from this list ${allowedTypes.join(', ')}.\n e.g. --type=article`
    );
    process.exit(1);
  }

  const client = createPrismicClient();

  let transformerName;
  const transformDocument = async () => {
    const documentId = getDocumentId({ type, id });
    const graphQuery = getGraphQuery({ type, isDetailed }).replace(
      /\n(\s+)/g,
      '\n'
    );

    if (!documentId || !graphQuery) {
      console.error('Something went wrong with the request', {
        documentId,
        hasGraphQuery: !!graphQuery,
      });
      process.exit(1);
    }

    const doc = await client.getByID(documentId, { graphQuery });

    switch (type) {
      case 'article': {
        transformerName = isDetailed
          ? 'transformArticle'
          : 'transformAddressableArticle';

        return isDetailed
          ? transformArticle(doc as ArticlePrismicDocument)
          : transformAddressableArticle(doc as ArticlePrismicDocument);
      }

      case 'webcomic': {
        transformerName = 'transformArticle';

        return transformArticle(doc as ArticlePrismicDocument);
      }

      case 'event': {
        transformerName = isDetailed
          ? 'transformEventDocument'
          : 'transformAddressableEvent';

        return isDetailed
          ? transformEventDocument(doc as EventPrismicDocument)
          : transformAddressableEvent(doc as EventPrismicDocument);
      }

      case 'venue': {
        transformerName = 'transformVenue';

        return transformVenue(doc as VenuePrismicDocument);
      }

      case 'exhibition': {
        transformerName = 'transformAddressableExhibition';

        return transformAddressableExhibition(doc as ExhibitionPrismicDocument);
      }

      case 'book': {
        transformerName = 'transformAddressableBook';

        return transformAddressableBook(doc as BookPrismicDocument);
      }

      case 'page': {
        transformerName = 'transformAddressablePage';

        return transformAddressablePage(doc as PagePrismicDocument);
      }

      case 'visual-story': {
        transformerName = 'transformAddressableVisualStory';

        return transformAddressableVisualStory(
          doc as VisualStoryPrismicDocument
        );
      }

      case 'exhibition-text': {
        transformerName = 'transformAddressableExhibitionText';

        return transformAddressableExhibitionText(
          doc as ExhibitionTextPrismicDocument
        );
      }

      case 'exhibition-highlight-tour': {
        transformerName = 'transformAddressableExhibitionHighlightTour';

        return transformAddressableExhibitionHighlightTour(
          doc as ExhibitionHighlightTourPrismicDocument
        );
      }

      case 'project': {
        transformerName = 'transformProject';

        return transformAddressableProject(doc as ProjectPrismicDocument);
      }

      case 'season': {
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
