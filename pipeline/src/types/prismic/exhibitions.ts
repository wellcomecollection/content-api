import * as prismic from '@prismicio/client';

import { CommonPrismicFields } from '@weco/content-pipeline/src/types/prismic/';

export type ExhibitionPrismicDocument = prismic.PrismicDocument<
  CommonPrismicFields,
  'exhibitions'
>;
