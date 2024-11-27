import * as prismic from '@prismicio/client';

import {
  CommonPrismicFields,
  PromoSliceZone,
} from '@weco/content-pipeline/src/types/prismic/';

import { ExhibitionPrismicDocument } from './exhibitions';

export type ExhibitionTextPrismicDocument = prismic.PrismicDocument<
  {
    related_exhibition: prismic.ContentRelationshipField<
      ExhibitionPrismicDocument,
      'en-gb',
      { promo: PromoSliceZone }
    >;
    intro_text?: prismic.RichTextField;
  } & CommonPrismicFields,
  'exhibition-texts'
>;
