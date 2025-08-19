import { transformVenue } from '@weco/content-pipeline/src/transformers/venue';
import { VenuePrismicDocument } from '@weco/content-pipeline/src/types/prismic/venues';
import { forEachPrismicSnapshot } from '@weco/content-pipeline/test/fixtures/prismic-snapshots';

describe('eventDocument transformer', () => {
  forEachPrismicSnapshot<VenuePrismicDocument>(['collection-venue'])(
    'transforms venues from Prismic to the expected format',
    async prismicDocument => {
      jest.useFakeTimers().setSystemTime(new Date('2024-03-14T00:00:00.000Z'));
      const transformed = await transformVenue(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );
});
