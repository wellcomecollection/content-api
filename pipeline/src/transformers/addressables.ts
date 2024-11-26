import {
  ArticlePrismicDocument,
  BookPrismicDocument,
  EventPrismicDocument,
  VisualStoryPrismicDocument,
} from '@weco/content-pipeline/src/types/prismic';
import {
  ElasticsearchAddressableBook,
  ElasticsearchAddressableVisualStory,
} from '@weco/content-pipeline/src/types/transformed';

import { transformAddressableBook } from './addressables/book';
import { transformAddressableVisualStory } from './addressables/visualStory';

export const transformAddressable = (
  document:
    | ArticlePrismicDocument
    | BookPrismicDocument
    | EventPrismicDocument
    | VisualStoryPrismicDocument
): ElasticsearchAddressableVisualStory | ElasticsearchAddressableBook => {
  const { type } = document;

  let transformedDocument;
  switch (type) {
    case 'articles':
      // transformedDocument = transformAddressableBook(document);
      break;
    case 'books':
      transformedDocument = transformAddressableBook(document);
      break;
    case 'events':
      // transformedDocument = transformAddressableBook(document);
      break;

    // case 'exhibitions':
    //   transformedDocument = transformAddressableBook(document);
    //   break;

    // case 'exhibitions-texts':
    //   transformedDocument = transformAddressableBook(document);
    //   break;

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
