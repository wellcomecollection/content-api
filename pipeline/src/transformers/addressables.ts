import {
  ArticlesOrWebcomicsDocumentWithLinks,
  BooksDocumentWithLinks,
  EventsDocumentWithLinks,
  ExhibitionHighlightToursDocumentWithLinks,
  ExhibitionsDocumentWithLinks,
  ExhibitionTextsDocumentWithLinks,
  ProjectsDocumentWithLinks,
} from '@weco/content-pipeline/src/types/prismic';
import {
  PagesDocument,
  SeasonsDocument,
  VisualStoriesDocument,
} from '@weco/content-pipeline/src/types/prismic/prismicio-types';
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
  document: ArticlesOrWebcomicsDocumentWithLinks
): Promise<ElasticsearchAddressableArticle[]>;
export function transformAddressable(
  document: BooksDocumentWithLinks
): Promise<ElasticsearchAddressableBook[]>;
export function transformAddressable(
  document: EventsDocumentWithLinks
): Promise<ElasticsearchAddressableEvent[]>;
export function transformAddressable(
  document: ExhibitionsDocumentWithLinks
): Promise<ElasticsearchAddressableExhibition[]>;
export function transformAddressable(
  document: ExhibitionHighlightToursDocumentWithLinks
): Promise<ElasticsearchAddressableExhibitionHighlightTour[]>;
export function transformAddressable(
  document: ExhibitionTextsDocumentWithLinks
): Promise<ElasticsearchAddressableExhibitionText[]>;
export function transformAddressable(
  document: PagesDocument
): Promise<ElasticsearchAddressablePage[]>;
export function transformAddressable(
  document: ProjectsDocumentWithLinks
): Promise<ElasticsearchAddressableProject[]>;
export function transformAddressable(
  document: SeasonsDocument
): Promise<ElasticsearchAddressableSeason[]>;
export function transformAddressable(
  document: VisualStoriesDocument
): Promise<ElasticsearchAddressableVisualStory[]>;
export async function transformAddressable(
  document:
    | ArticlesOrWebcomicsDocumentWithLinks
    | BooksDocumentWithLinks
    | EventsDocumentWithLinks
    | ExhibitionsDocumentWithLinks
    | ExhibitionHighlightToursDocumentWithLinks
    | ExhibitionTextsDocumentWithLinks
    | PagesDocument
    | ProjectsDocumentWithLinks
    | SeasonsDocument
    | VisualStoriesDocument
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
      transformedDocument = await transformAddressableEvent(document);
      break;

    case 'exhibitions':
      transformedDocument = await transformAddressableExhibition(document);
      break;

    case 'exhibition-texts':
      transformedDocument = Promise.resolve(
        transformAddressableExhibitionText(document)
      );
      break;

    case 'exhibition-highlight-tours':
      transformedDocument = Promise.resolve(
        transformAddressableExhibitionHighlightTour(document)
      );
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
      transformedDocument = await transformAddressableVisualStory(document);
      break;
  }

  if (transformedDocument) {
    return transformedDocument;
  } else {
    throw new Error(`Type did not match any known addressable: ${type}`);
  }
}
