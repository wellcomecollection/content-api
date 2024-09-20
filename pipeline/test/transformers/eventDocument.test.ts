import { transformEventDocument } from "@weco/content-pipeline/src/transformers/eventDocument";
import { EventPrismicDocument } from "@weco/content-pipeline/src/types/prismic/eventDocuments";
import { forEachPrismicSnapshot } from "@weco/content-pipeline/test/fixtures/prismic-snapshots";

describe("eventDocument transformer", () => {
  forEachPrismicSnapshot<EventPrismicDocument>("events")(
    "transforms events from Prismic to the expected format",
    (prismicDocument) => {
      const transformed = transformEventDocument(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    },
  );
});
