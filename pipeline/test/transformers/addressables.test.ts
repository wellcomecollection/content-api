import { transformAddressable } from '@weco/content-pipeline/src/transformers/addressables';
import {
  BookPrismicDocument,
  VisualStoryPrismicDocument,
} from '@weco/content-pipeline/src/types/prismic';
import { forEachPrismicSnapshot } from '@weco/content-pipeline/test/fixtures/prismic-snapshots';

describe('addressables transformer', () => {
  forEachPrismicSnapshot<BookPrismicDocument>('books')(
    'transforms books from Prismic to the expected format',
    prismicDocument => {
      const transformed = transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<VisualStoryPrismicDocument>('visual-stories')(
    'transforms visual stories from Prismic to the expected format',
    prismicDocument => {
      const transformed = transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );
});
