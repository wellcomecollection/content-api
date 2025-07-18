import type * as prismic from '@prismicio/client';

import {
  EditorialImageSlice,
  TextSlice,
} from '@weco/content-pipeline/src/types/prismic/prismicio-types';

export type AddressableSlices =
  | prismic.Content.ArticlesDocumentDataBodySlice
  | prismic.Content.BooksDocumentDataBodySlice
  | prismic.Content.EventsDocumentDataBodySlice
  | prismic.Content.ExhibitionsDocumentDataBodySlice
  | prismic.Content.ExhibitionHighlightToursDocumentDataSlicesSlice
  | prismic.Content.ExhibitionTextsDocumentDataSlicesSlice
  | prismic.Content.PagesDocumentDataBodySlice
  | prismic.Content.ProjectsDocumentDataBodySlice
  | prismic.Content.SeasonsDocumentDataBodySlice
  | prismic.Content.VisualStoriesDocumentDataBodySlice;
