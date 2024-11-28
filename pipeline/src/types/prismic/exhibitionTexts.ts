import * as prismic from '@prismicio/client';

import {
  CommonPrismicFields,
  PromoSliceZone,
} from '@weco/content-pipeline/src/types/prismic/';

import { ExhibitionPrismicDocument } from './exhibitions';

type PrismicSlices = {
  primary: {
    title?: { text: string }[];
    caption?: { text: string }[];
    tombstone?: { text: string }[];
  };
  slice_type: string;
};

type WithExhibitionTextSlices = {
  slices?: prismic.GroupField<PrismicSlices>;
};

export type ExhibitionTextPrismicDocument = prismic.PrismicDocument<
  {
    related_exhibition: prismic.ContentRelationshipField<
      ExhibitionPrismicDocument,
      'en-gb',
      { title: prismic.RichTextField; promo: PromoSliceZone }
    >;
    intro_text?: prismic.RichTextField;
  } & CommonPrismicFields &
    WithExhibitionTextSlices,
  'exhibition-texts'
>;
