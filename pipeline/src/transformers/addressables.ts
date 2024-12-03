import {
  ArticlePrismicDocument,
  BookPrismicDocument,
  EventPrismicDocument,
  ProjectPrismicDocument,
  SeasonPrismicDocument,
  VisualStoryPrismicDocument,
} from '@weco/content-pipeline/src/types/prismic';
import {
  ElasticsearchAddressableArticle,
  ElasticsearchAddressableBook,
  ElasticsearchAddressableEvent,
  ElasticsearchAddressableProject,
  ElasticsearchAddressableSeason,
  ElasticsearchAddressableVisualStory,
} from '@weco/content-pipeline/src/types/transformed';

import { transformAddressableArticle } from './addressables/article';
import { transformAddressableBook } from './addressables/book';
import { transformAddressableEvent } from './addressables/event';
import { transformAddressableProject } from './addressables/project';
import { transformAddressableSeason } from './addressables/season';
import { transformAddressableVisualStory } from './addressables/visualStory';

export const transformAddressable = (
  document:
    | ArticlePrismicDocument
    | BookPrismicDocument
    | EventPrismicDocument
    | VisualStoryPrismicDocument
    | ProjectPrismicDocument
    | SeasonPrismicDocument
):
  | ElasticsearchAddressableArticle
  | ElasticsearchAddressableBook
  | ElasticsearchAddressableEvent
  | ElasticsearchAddressableProject
  | ElasticsearchAddressableSeason
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

    case 'projects':
      transformedDocument = transformAddressableProject(document);
      break;

    case 'seasons':
      transformedDocument = transformAddressableSeason(document);
      break;

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
