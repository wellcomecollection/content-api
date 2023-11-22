import { forEachPrismicSnapshot } from "../fixtures/prismic-snapshots";
import { transformArticle } from "../../src/transformers/article";
import { ArticlePrismicDocument } from "../../src/types/prismic";

describe("article transformer", () => {
  forEachPrismicSnapshot<ArticlePrismicDocument>("articles")(
    "transforms articles from Prismic to the expected format",
    (prismicDocument) => {
      const transformed = transformArticle(prismicDocument);
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<ArticlePrismicDocument>("webcomics")(
    "also works for webcomics",
    (prismicDocument) => {
      const transformed = transformArticle(prismicDocument);
      expect(transformed).toMatchSnapshot();
    }
  );
});
