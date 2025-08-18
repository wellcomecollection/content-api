import {
  asText,
  asTitle,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { primaryImageCaption } from '@weco/content-pipeline/src/transformers/utils';
import { PagePrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressablePage } from '@weco/content-pipeline/src/types/transformed';

import { fetchAndTransformWorks } from './helpers/catalogue-api';
import {
  BodiesWithPossibleWorks,
  getWorksIdsFromDocumentBody,
} from './helpers/extract-works-ids';

export const transformAddressablePage = async (
  document: PagePrismicDocument
): Promise<ElasticsearchAddressablePage[]> => {
  const { data, id, uid, tags, type } = document;

  // Need to use types from prismicio.d.ts everywhere
  // so we don't need to cast
  const worksIds = getWorksIdsFromDocumentBody(
    (data.body as BodiesWithPossibleWorks) || []
  );
  const transformedWorks = await fetchAndTransformWorks(worksIds);

  const description = primaryImageCaption(data.promo);
  const introText = data.introText && asText(data.introText);
  const queryDescription = [description, introText].filter(isNotUndefined);
  const title = asTitle(data.title);
  const body = data.body
    ?.map(s => {
      return s.primary.text?.map(t => t.text);
    })
    .flat()
    .filter(isNotUndefined);

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
        linkedWorks: worksIds,
      },
    },
  ];
};
