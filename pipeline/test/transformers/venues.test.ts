import { forEachPrismicSnapshot } from "../fixtures/prismic-snapshots";
import { transformVenue } from "../../src/transformers/venue";
import { VenuePrismicDocument } from "../../src/types/prismic/venues";

describe("eventDocument transformer", () => {
  forEachPrismicSnapshot<VenuePrismicDocument>("collection-venue")(
    "transforms venues from Prismic to the expected format",
    (prismicDocument) => {
      jest.useFakeTimers().setSystemTime(new Date("2024-03-14T00:00:00.000Z"));
      const transformed = transformVenue(prismicDocument);
      expect(transformed).toMatchSnapshot();
    }
  );
});
