import {
  ArticlePrismicDocument,
  BookPrismicDocument,
  EventPrismicDocument,
  ExhibitionHighlightTourPrismicDocument,
  ExhibitionPrismicDocument,
  ExhibitionTextPrismicDocument,
  PagePrismicDocument,
  ProjectPrismicDocument,
  SeasonPrismicDocument,
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
  ElasticsearchAddressableProject,
  ElasticsearchAddressableSeason,
  ElasticsearchAddressableVisualStory,
} from '@weco/content-pipeline/src/types/transformed';

import { transformAddressableArticle } from './addressables/article';
import { transformAddressableBook } from './addressables/book';
import { transformAddressableEvent } from './addressables/event';
import { transformAddressableExhibition } from './addressables/exhibition';
import { transformAddressableExhibitionHighlightTour } from './addressables/exhibitionHighlightTour';
import { transformAddressableExhibitionText } from './addressables/exhibitionText';
import { transformAddressablePage } from './addressables/page';
import { transformAddressableProject } from './addressables/project';
import { transformAddressableSeason } from './addressables/season';
import { transformAddressableVisualStory } from './addressables/visualStory';

export function transformAddressable(
  document: ArticlePrismicDocument
): Promise<ElasticsearchAddressableArticle[]>;
export function transformAddressable(
  document: BookPrismicDocument
): Promise<ElasticsearchAddressableBook[]>;
export function transformAddressable(
  document: EventPrismicDocument
): Promise<ElasticsearchAddressableEvent[]>;
export function transformAddressable(
  document: ExhibitionPrismicDocument
): Promise<ElasticsearchAddressableExhibition[]>;
export function transformAddressable(
  document: ExhibitionHighlightTourPrismicDocument
): Promise<ElasticsearchAddressableExhibitionHighlightTour[]>;
export function transformAddressable(
  document: ExhibitionTextPrismicDocument
): Promise<ElasticsearchAddressableExhibitionText[]>;
export function transformAddressable(
  document: PagePrismicDocument
): Promise<ElasticsearchAddressablePage[]>;
export function transformAddressable(
  document: ProjectPrismicDocument
): Promise<ElasticsearchAddressableProject[]>;
export function transformAddressable(
  document: SeasonPrismicDocument
): Promise<ElasticsearchAddressableSeason[]>;
export function transformAddressable(
  document: VisualStoryPrismicDocument
): Promise<ElasticsearchAddressableVisualStory[]>;
export async function transformAddressable(
  document:
    | ArticlePrismicDocument
    | BookPrismicDocument
    | EventPrismicDocument
    | ExhibitionPrismicDocument
    | ExhibitionHighlightTourPrismicDocument
    | ExhibitionTextPrismicDocument
    | PagePrismicDocument
    | ProjectPrismicDocument
    | SeasonPrismicDocument
    | VisualStoryPrismicDocument
): Promise<
  | ElasticsearchAddressableArticle[]
  | ElasticsearchAddressableBook[]
  | ElasticsearchAddressableEvent[]
  | ElasticsearchAddressableExhibition[]
  | ElasticsearchAddressableExhibitionHighlightTour[]
  | ElasticsearchAddressableExhibitionText[]
  | ElasticsearchAddressablePage[]
  | ElasticsearchAddressableProject[]
  | ElasticsearchAddressableSeason[]
  | ElasticsearchAddressableVisualStory[]
> {
  const { type } = document;

  let transformedDocument;

  switch (type) {
    case 'articles':
      transformedDocument = await transformAddressableArticle(document);
      break;
    case 'books':
      transformedDocument = await transformAddressableBook(document);
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
      transformedDocument = await transformAddressablePage(document);
      break;

    case 'projects':
      transformedDocument = await transformAddressableProject(document);
      break;

    case 'seasons':
      transformedDocument = await transformAddressableSeason(document);
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
}
