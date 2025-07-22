import { transformAddressable } from '@weco/content-pipeline/src/transformers/addressables';
import {
  ArticlePrismicDocument,
  BookPrismicDocument,
  EventPrismicDocument,
  ExhibitionHighlightTourPrismicDocument,
  ExhibitionTextPrismicDocument,
  PagePrismicDocument,
  ProjectPrismicDocument,
  SeasonPrismicDocument,
  VisualStoryPrismicDocument,
} from '@weco/content-pipeline/src/types/prismic';
import { forEachPrismicSnapshot } from '@weco/content-pipeline/test/fixtures/prismic-snapshots';

describe('addressables transformer', () => {
  const isAddressable = true;
  forEachPrismicSnapshot<ArticlePrismicDocument>(['articles'], isAddressable)(
    'transforms articles from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<BookPrismicDocument>(['books'], isAddressable)(
    'transforms books from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<EventPrismicDocument>(['events'], isAddressable)(
    'transforms events from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<ExhibitionTextPrismicDocument>(
    ['exhibitions'],
    isAddressable
  )(
    'transforms exhibitions from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<ExhibitionTextPrismicDocument>(
    ['exhibition-texts'],
    isAddressable
  )(
    'transforms exhibition texts from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<ExhibitionHighlightTourPrismicDocument>(
    ['exhibition-highlight-tours'],
    isAddressable
  )(
    'transforms exhibition highlight tours from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<PagePrismicDocument>(['pages'], isAddressable)(
    'transforms pages from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
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
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<ProjectPrismicDocument>(['projects'], isAddressable)(
    'transforms projects from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<SeasonPrismicDocument>(['seasons'], isAddressable)(
    'transforms seasons from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );
});
