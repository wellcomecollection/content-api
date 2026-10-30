import {
  asTitle,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import {
  primaryImageCaption,
  sliceTextLines,
} from '@weco/content-pipeline/src/transformers/utils';
import { SeasonsDocument } from '@weco/content-pipeline/src/types/prismic/prismicio-types';
import { ElasticsearchAddressableSeason } from '@weco/content-pipeline/src/types/transformed';

import { fetchAndTransformWorks } from './helpers/catalogue-api';
import { getWorksIdsFromDocumentBody } from './helpers/extract-works-ids';

export const transformAddressableSeason = async (
  document: SeasonsDocument
): Promise<ElasticsearchAddressableSeason[]> => {
  const { data, id, uid, tags, type } = document;

  const worksIds = getWorksIdsFromDocumentBody(data.body);
  const transformedWorks = await fetchAndTransformWorks(worksIds);

  const title = asTitle(data.title);

  const description = primaryImageCaption(data.promo);

  const standfirst = sliceTextLines(data.body, ['standfirst'])?.[0];
  const queryDescription = [description, standfirst].filter(isNotUndefined);
  const queryBody = sliceTextLines(data.body, ['text', 'quote', 'standfirst']);

  return [
    {
      id: `${id}.${type}`,
      uid,
      display: {
        type: 'Season',
        id,
        uid,
        title,
        description,
        linkedWorks: transformedWorks,
      },
      query: {
        type: 'Season',
        title,
        description: queryDescription,
        body: queryBody,
        linkedWorks: transformedWorks.map(work => work.id), // Use transformedWorks ids, in case they have been redirected from the original work id
        prismicId: id,
        tags,
      },
    },
  ];
};
