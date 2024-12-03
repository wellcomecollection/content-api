import {
  ArticlePrismicDocument,
  BookPrismicDocument,
  EventPrismicDocument,
  ExhibitionHighlightTourPrismicDocument,
  ExhibitionPrismicDocument,
  ExhibitionTextPrismicDocument,
  VisualStoryPrismicDocument,
} from '@weco/content-pipeline/src/types/prismic';
import {
  ElasticsearchAddressableArticle,
  ElasticsearchAddressableBook,
  ElasticsearchAddressableEvent,
  ElasticsearchAddressableExhibition,
  ElasticsearchAddressableExhibitionHighlightTour,
  ElasticsearchAddressableExhibitionText,
  ElasticsearchAddressableVisualStory,
} from '@weco/content-pipeline/src/types/transformed';

import { transformAddressableArticle } from './addressables/article';
import { transformAddressableBook } from './addressables/book';
import { transformAddressableEvent } from './addressables/event';
import { transformAddressableExhibition } from './addressables/exhibition';
import { transformAddressableExhibitionHighlightTour } from './addressables/exhibitionHighlightTour';
import { transformAddressableExhibitionText } from './addressables/exhibitionText';
import { transformAddressableVisualStory } from './addressables/visualStory';

export const transformAddressable = (
  document:
    | ArticlePrismicDocument
    | BookPrismicDocument
    | EventPrismicDocument
    | ExhibitionPrismicDocument
    | ExhibitionHighlightTourPrismicDocument
    | ExhibitionTextPrismicDocument
    | VisualStoryPrismicDocument
):
  | ElasticsearchAddressableArticle
  | ElasticsearchAddressableBook
  | ElasticsearchAddressableEvent
  | ElasticsearchAddressableExhibition
  | ElasticsearchAddressableExhibitionHighlightTour[]
  | ElasticsearchAddressableExhibitionText
  | ElasticsearchAddressableVisualStory => {
  const { type } = document;

  let transformedDocument;
  switch (type) {
    case 'articles':
      transformedDocument = transformAddressableArticle(document);
      break;
    case 'books':
      transformedDocument = transformAddressableBook(document);
      break;
    case 'events':
      transformedDocument = transformAddressableEvent(document);
      break;

    case 'exhibitions':
      transformedDocument = transformAddressableExhibition(document);
      break;

    case 'exhibition-texts':
      transformedDocument = transformAddressableExhibitionText(document);
      break;

    case 'exhibition-highlight-tours':
      transformedDocument =
        transformAddressableExhibitionHighlightTour(document);
      break;

    // case 'pages':
    //   transformedDocument = transformAddressableBook(document);
    //   break;

    // case 'projects':
    //   transformedDocument = transformAddressableBook(document);
    //   break;

    // case 'seasons':
    //   transformedDocument = transformAddressableBook(document);
    //   break;

    case 'visual-stories':
      transformedDocument = transformAddressableVisualStory(document);
      break;
  }

  if (transformedDocument) {
    return transformedDocument;
  } else {
    throw new Error(`Type did not match any known addressable: ${type}`);
  }
};
