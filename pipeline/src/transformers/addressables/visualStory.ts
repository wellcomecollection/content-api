import { asTitle } from '@weco/content-pipeline/src/helpers/type-guards';
import { primaryImageCaption } from '@weco/content-pipeline/src/transformers/utils';
import { VisualStoryPrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableVisualStory } from '@weco/content-pipeline/src/types/transformed';

import { TransformedWork } from './helpers/catalogue-api';

export const transformAddressableVisualStory = (
  document: VisualStoryPrismicDocument
): ElasticsearchAddressableVisualStory[] => {
  const { data, id, uid, type } = document;

  // Visual stories don't have body content that can contain works references
  const worksIds: string[] = [];
  const transformedWorks: TransformedWork[] = [];

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
