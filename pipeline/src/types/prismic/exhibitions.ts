import * as prismic from '@prismicio/client';

import {
  CommonPrismicFields,
  InferDataInterface,
  PrismicFormat,
  WithContributors,
} from '.';

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
  } & WithContributors &
    WithExhibitionFormat &
    CommonPrismicFields,
  'exhibitions'
>;
