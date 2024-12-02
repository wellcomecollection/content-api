import {
  ArticlePrismicDocument,
  BookPrismicDocument,
  EventPrismicDocument,
  ExhibitionPrismicDocument,
  ExhibitionTextPrismicDocument,
  VisualStoryPrismicDocument,
} from '@weco/content-pipeline/src/types/prismic';
import {
  ElasticsearchAddressableArticle,
  ElasticsearchAddressableBook,
  ElasticsearchAddressableEvent,
  ElasticsearchAddressableExhibition,
  ElasticsearchAddressableExhibitionText,
  ElasticsearchAddressableVisualStory,
} from '@weco/content-pipeline/src/types/transformed';

import { transformAddressableArticle } from './addressables/article';
import { transformAddressableBook } from './addressables/book';
import { transformAddressableEvent } from './addressables/event';
import { transformAddressableExhibition } from './addressables/exhibition';
import { transformAddressableExhibitionText } from './addressables/exhibitionText';
import { transformAddressableVisualStory } from './addressables/visualStory';

export const transformAddressable = (
  document:
    | ArticlePrismicDocument
    | BookPrismicDocument
    | EventPrismicDocument
    | ExhibitionPrismicDocument
    | ExhibitionTextPrismicDocument
    | VisualStoryPrismicDocument
):
  | ElasticsearchAddressableArticle
  | ElasticsearchAddressableBook
  | ElasticsearchAddressableEvent
  | ElasticsearchAddressableExhibition
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

    // case 'exhibitions-highlight-tours':
    //   transformedDocument = transformAddressableBook(document);
    //   break;

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
