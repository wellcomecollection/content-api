import { transformAddressableSeason } from '@weco/content-pipeline/src/transformers/addressables/season';
import { SeasonPrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { forEachPrismicSnapshot } from '@weco/content-pipeline/test/fixtures/prismic-snapshots';

describe('season transformer', () => {
  forEachPrismicSnapshot<SeasonPrismicDocument>(['seasons'])(
    'transforms seasons from Prismic to the expected format',
    prismicDocument => {
      const transformed = transformAddressableSeason(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );
});
