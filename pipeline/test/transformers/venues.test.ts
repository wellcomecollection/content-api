import { forEachPrismicSnapshot } from "../fixtures/prismic-snapshots";
import { transformVenue } from "../../src/transformers/venue";
import { VenuePrismicDocument } from "../../src/types/prismic/venues";

describe("eventDocument transformer", () => {
  forEachPrismicSnapshot<VenuePrismicDocument>("collection-venue")(
    "transforms venues from Prismic to the expected format",
    (prismicDocument) => {
      jest.useFakeTimers().setSystemTime(new Date("2024-03-14T00:00:00.000Z"));
      const transformed = transformVenue(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    },
  );
});
