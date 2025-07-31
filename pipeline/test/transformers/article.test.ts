import { transformArticle } from '@weco/content-pipeline/src/transformers/article';
import { ArticlePrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { forEachPrismicSnapshot } from '@weco/content-pipeline/test/fixtures/prismic-snapshots';

describe('article transformer', () => {
  forEachPrismicSnapshot<ArticlePrismicDocument>(['articles'])(
    'transforms articles from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformArticle(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<ArticlePrismicDocument>(['webcomics'])(
    'also works for webcomics',
    async prismicDocument => {
      const transformed = await transformArticle(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );
});
