import { asTitle } from '@weco/content-pipeline/src/helpers/type-guards';
import { primaryImageCaption } from '@weco/content-pipeline/src/transformers/utils';
import { VisualStoryPrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableVisualStory } from '@weco/content-pipeline/src/types/transformed';

import { fetchAndTransformWorks } from './helpers/catalogue-api';
import {
  BodiesWithPossibleWorks,
  getWorksIdsFromDocumentBody,
} from './helpers/extract-works-ids';

export const transformAddressableVisualStory = async (
  document: VisualStoryPrismicDocument
): Promise<ElasticsearchAddressableVisualStory[]> => {
  const { data, id, uid, type } = document;

  // Need to use types from prismicio.d.ts everywhere
  // so we don't need to cast
  const worksIds = getWorksIdsFromDocumentBody(
    (data.body as BodiesWithPossibleWorks) || []
  );
  const transformedWorks = await fetchAndTransformWorks(worksIds);

  const description = primaryImageCaption(data.promo);
  const title = asTitle(data.title);

  return [
    {
      id: `${id}/${type}`,
      uid,
      display: {
        type: 'Visual story',
        id,
        uid,
        title,
        description,
        linkedWorks: transformedWorks,
      },
      query: {
        type: 'Visual story',
        title,
        description,
        linkedWorks: worksIds,
      },
    },
  ];
};
