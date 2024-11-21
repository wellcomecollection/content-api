import * as prismic from '@prismicio/client';

import { CommonPrismicFields } from '@weco/content-pipeline/src/types/prismic/';
import { WithBody } from '@weco/content-pipeline/src/types/prismic/body';
import { WithContributors } from '@weco/content-pipeline/src/types/prismic/contributors';

export type BooksAddressablePrismicDocument = prismic.PrismicDocument<
  { subtitle: prismic.RichTextField } & WithContributors &
    WithBody &
    CommonPrismicFields,
  'books'
>;
