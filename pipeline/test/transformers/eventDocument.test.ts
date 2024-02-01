import { forEachPrismicSnapshot } from "../fixtures/prismic-snapshots";
import { transformEventDocument } from "../../src/transformers/eventDocument";
import { EventPrismicDocument } from "../../src/types/prismic/eventDocuments";

describe("eventDocument transformer", () => {
  forEachPrismicSnapshot<EventPrismicDocument>("events")(
    "transforms events from Prismic to the expected format",
    (prismicDocument) => {
      const transformed = transformEventDocument(prismicDocument);
      expect(transformed).toMatchSnapshot();
    }
  );
});
