import {
  asTitle,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { primaryImageCaption } from '@weco/content-pipeline/src/transformers/utils';
import { SeasonPrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableSeason } from '@weco/content-pipeline/src/types/transformed';

import { fetchAndTransformWorks } from './helpers/catalogue-api';
import {
  BodiesWithPossibleWorks,
  getWorksIdsFromDocumentBody,
} from './helpers/extract-works-ids';

export const transformAddressableSeason = async (
  document: SeasonPrismicDocument
): Promise<ElasticsearchAddressableSeason[]> => {
  const { data, id, uid, type } = document;

  const worksIds = getWorksIdsFromDocumentBody(
    (data.body as BodiesWithPossibleWorks) || []
  );
  const transformedWorks = await fetchAndTransformWorks(worksIds);

  const title = asTitle(data.title);

  const description = primaryImageCaption(data.promo);

  const standfirst = data.body?.find(b => b.slice_type === 'standfirst')
    ?.primary.text[0].text;
  const queryDescription = [description, standfirst].filter(isNotUndefined);
  const queryBody = data.body
    ?.map(slice => {
      if (['text', 'quote', 'standfirst'].includes(slice.slice_type)) {
        return slice.primary.text.map(text => text.text);
      } else {
        return [];
      }
    })
    .flat();

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
        linkedWorks: worksIds,
      },
    },
  ];
};
