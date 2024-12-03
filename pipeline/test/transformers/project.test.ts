import { transformAddressableProject } from '@weco/content-pipeline/src/transformers/addressables/project';
import { ProjectPrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { forEachPrismicSnapshot } from '@weco/content-pipeline/test/fixtures/prismic-snapshots';

describe('project transformer', () => {
  forEachPrismicSnapshot<ProjectPrismicDocument>(['projects'])(
    'transforms projects from Prismic to the expected format',
    prismicDocument => {
      const transformed = transformAddressableProject(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );
});
