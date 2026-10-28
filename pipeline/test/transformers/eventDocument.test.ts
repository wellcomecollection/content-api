import { transformEventDocument } from '@weco/content-pipeline/src/transformers/eventDocument';
import { EventsDocumentWithLinks } from '@weco/content-pipeline/src/types/prismic';
import { forEachPrismicSnapshot } from '@weco/content-pipeline/test/fixtures/prismic-snapshots';

describe('eventDocument transformer', () => {
  forEachPrismicSnapshot<EventsDocumentWithLinks>(['events'])(
    'transforms events from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformEventDocument(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );
});
