import { transformAddressable } from '@weco/content-pipeline/src/transformers/addressables';
import {
  ArticlePrismicDocument,
  BookPrismicDocument,
  VisualStoryPrismicDocument,
} from '@weco/content-pipeline/src/types/prismic';
import { forEachPrismicSnapshot } from '@weco/content-pipeline/test/fixtures/prismic-snapshots';

describe('addressables transformer', () => {
  const isAddressable = true;
  forEachPrismicSnapshot<ArticlePrismicDocument>(['articles'], isAddressable)(
    'transforms articles from Prismic to the expected format',
    prismicDocument => {
      const transformed = transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<BookPrismicDocument>(['books'], isAddressable)(
    'transforms books from Prismic to the expected format',
    prismicDocument => {
      const transformed = transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<VisualStoryPrismicDocument>(
    ['visual-stories'],
    isAddressable
  )(
    'transforms visual stories from Prismic to the expected format',
    prismicDocument => {
      const transformed = transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );
});
