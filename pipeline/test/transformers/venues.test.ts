import { forEachPrismicSnapshot } from "../fixtures/prismic-snapshots";
import { transformVenue } from "../../src/transformers/venue";
import { VenuePrismicDocument } from "../../src/types/prismic/venues";

describe("eventDocument transformer", () => {
  forEachPrismicSnapshot<VenuePrismicDocument>("collection-venue")(
    "transforms venues from Prismic to the expected format",
    (prismicDocument) => {
      const transformed = transformVenue(prismicDocument);
      expect(transformed).toMatchSnapshot();
    }
  );
});
