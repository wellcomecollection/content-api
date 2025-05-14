import * as prismic from '@prismicio/client';

import {
  CommonPrismicFields,
  PromoSliceZone,
} from '@weco/content-pipeline/src/types/prismic/';

type PrismicSlices = {
  primary: {
    title?: { text: string }[];
    transcript?: { text: string }[];
    subtitles?: { text: string }[];
  };
  slice_type: string;
};

type WithExhibitionHighlightTourSlices = {
  slices?: prismic.GroupField<PrismicSlices>;
};

export type ExhibitionHighlightTourPrismicDocument = prismic.PrismicDocument<
  {
    related_exhibition: prismic.ContentRelationshipField<
      'exhibitions',
      'en-gb',
      { title: prismic.RichTextField; promo: PromoSliceZone }
    >;
    intro_text?: prismic.RichTextField;
  } & CommonPrismicFields &
    WithExhibitionHighlightTourSlices,
  'exhibition-highlight-tours'
>;
