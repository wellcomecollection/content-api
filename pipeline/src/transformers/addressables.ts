import {
  ArticlePrismicDocument,
  BookPrismicDocument,
  EventPrismicDocument,
  ExhibitionHighlightTourPrismicDocument,
  ExhibitionPrismicDocument,
  ExhibitionTextPrismicDocument,
  PagePrismicDocument,
  VisualStoryPrismicDocument,
} from '@weco/content-pipeline/src/types/prismic';
import {
  ElasticsearchAddressableArticle,
  ElasticsearchAddressableBook,
  ElasticsearchAddressableEvent,
  ElasticsearchAddressableExhibition,
  ElasticsearchAddressableExhibitionHighlightTour,
  ElasticsearchAddressableExhibitionText,
  ElasticsearchAddressablePage,
  ElasticsearchAddressableVisualStory,
} from '@weco/content-pipeline/src/types/transformed';

import { transformAddressableArticle } from './addressables/article';
import { transformAddressableBook } from './addressables/book';
import { transformAddressableEvent } from './addressables/event';
import { transformAddressableExhibition } from './addressables/exhibition';
import { transformAddressableExhibitionHighlightTour } from './addressables/exhibitionHighlightTour';
import { transformAddressableExhibitionText } from './addressables/exhibitionText';
import { transformAddressablePage } from './addressables/page';
import { transformAddressableVisualStory } from './addressables/visualStory';

export function transformAddressable(
  document: ArticlePrismicDocument
): ElasticsearchAddressableArticle[];
export function transformAddressable(
  document: BookPrismicDocument
): ElasticsearchAddressableBook[];
export function transformAddressable(
  document: EventPrismicDocument
): ElasticsearchAddressableEvent[];
export function transformAddressable(
  document: ExhibitionPrismicDocument
): ElasticsearchAddressableExhibition[];
export function transformAddressable(
  document: ExhibitionHighlightTourPrismicDocument
): ElasticsearchAddressableExhibitionHighlightTour[];
export function transformAddressable(
  document: ExhibitionTextPrismicDocument
): ElasticsearchAddressableExhibitionText[];
export function transformAddressable(
  document: PagePrismicDocument
): ElasticsearchAddressablePage[];
export function transformAddressable(
  document: VisualStoryPrismicDocument
): ElasticsearchAddressableVisualStory[];
export function transformAddressable(
  document:
    | ArticlePrismicDocument
    | BookPrismicDocument
    | EventPrismicDocument
    | ExhibitionPrismicDocument
    | ExhibitionHighlightTourPrismicDocument
    | ExhibitionTextPrismicDocument
    | PagePrismicDocument
    | VisualStoryPrismicDocument
) {
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

    case 'pages':
      transformedDocument = transformAddressablePage(document);
      break;

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
}
