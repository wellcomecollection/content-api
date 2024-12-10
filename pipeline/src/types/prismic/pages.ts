import * as prismic from '@prismicio/client';

import { CommonPrismicFields } from '@weco/content-pipeline/src/types/prismic/';

import { WithBody } from './body';

export type PagePrismicDocument = prismic.PrismicDocument<
  {
    introText?: prismic.RichTextField;
  } & WithBody &
    CommonPrismicFields,
  'pages'
>;
