import * as prismic from '@prismicio/client';

import { CommonPrismicFields, InferDataInterface, PrismicFormat } from '.';

type WithExhibitionFormat = {
  format: prismic.ContentRelationshipField<
    'exhibition-formats',
    'en-gb',
    InferDataInterface<PrismicFormat>
  >;
};

export type ExhibitionPrismicDocument = prismic.PrismicDocument<
  {
    start: prismic.TimestampField;
    end: prismic.TimestampField;
  } & WithExhibitionFormat &
    CommonPrismicFields,
  'exhibitions'
>;
