import * as prismic from '@prismicio/client';

import { CommonPrismicFields } from '.';
import { WithBody } from './body';

export type SeasonPrismicDocument = prismic.PrismicDocument<
  {
    start: prismic.TimestampField;
    end: prismic.TimestampField;
  } & WithBody &
    CommonPrismicFields,
  'seasons'
>;
