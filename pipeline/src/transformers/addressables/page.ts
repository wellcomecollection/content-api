import {
  asText,
  asTitle,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import {
  primaryImageCaption,
  sliceTextLines,
} from '@weco/content-pipeline/src/transformers/utils';
import { PagesDocument } from '@weco/content-pipeline/src/types/prismic/prismicio-types';
import { ElasticsearchAddressablePage } from '@weco/content-pipeline/src/types/transformed';

import { fetchAndTransformWorks } from './helpers/catalogue-api';
import { getWorksIdsFromDocumentBody } from './helpers/extract-works-ids';

export const transformAddressablePage = async (
  document: PagesDocument
): Promise<ElasticsearchAddressablePage[]> => {
  const { data, id, uid, tags, type } = document;

  const worksIds = getWorksIdsFromDocumentBody(data.body);
  const transformedWorks = await fetchAndTransformWorks(worksIds);

  const description = primaryImageCaption(data.promo);
  const introText = data.introText && asText(data.introText);
  const queryDescription = [description, introText].filter(isNotUndefined);
  const title = asTitle(data.title);
  const body = sliceTextLines(data.body);

  return [
    {
      id: `${id}.${type}`,
      uid,
      display: {
        type: 'Page',
        id,
        uid,
        title,
        description,
        tags,
        linkedWorks: transformedWorks,
      },
      query: {
        type: 'Page',
        title,
        description: queryDescription,
        body,
        linkedWorks: transformedWorks.map(work => work.id), // Use transformedWorks ids, in case they have been redirected from the original work id
        prismicId: id,
        tags,
      },
    },
  ];
};
