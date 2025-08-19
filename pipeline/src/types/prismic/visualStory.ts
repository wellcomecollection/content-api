import * as prismic from '@prismicio/client';

import { CommonPrismicFields } from '@weco/content-pipeline/src/types/prismic/';

import { WithBody } from './body';

export type VisualStoryPrismicDocument = prismic.PrismicDocument<
  CommonPrismicFields & WithBody,
  'visual-stories'
>;
