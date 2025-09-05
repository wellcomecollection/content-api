import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { primaryImageCaption } from '@weco/content-pipeline/src/transformers/utils';
import { ExhibitionPrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableExhibition } from '@weco/content-pipeline/src/types/transformed';

import { fetchAndTransformWorks } from './helpers/catalogue-api';
import {
  BodiesWithPossibleWorks,
  getWorksIdsFromDocumentBody,
} from './helpers/extract-works-ids';

export const transformAddressableExhibition = async (
  document: ExhibitionPrismicDocument
): Promise<ElasticsearchAddressableExhibition[]> => {
  const { data, id, uid, tags, type } = document;

  const worksIds = getWorksIdsFromDocumentBody(
    (data.body as BodiesWithPossibleWorks) || []
  );
  const transformedWorks = await fetchAndTransformWorks(worksIds);

  const format = isFilledLinkToDocumentWithData(data.format)
    ? asText(data.format.data.title)
    : 'Exhibition';

  const dates = {
    start: data.start,
    end: data.end,
  };

  const description = primaryImageCaption(data.promo);
  const queryDescription = [description, format].filter(isNotUndefined);
  const title = asTitle(data.title);
  const contributors = (data.contributors ?? [])
    .map(c => {
      return isFilledLinkToDocumentWithData(c.contributor)
        ? asText(c.contributor?.data.name)
        : undefined;
    })
    .filter(isNotUndefined)
    .join(', ');

  return [
    {
      id: `${id}.${type}`,
      uid,
      display: {
        type: 'Exhibition',
        id,
        uid,
        title,
        description,
        format,
        dates,
        linkedWorks: transformedWorks,
      },
      query: {
        type: 'Exhibition',
        title,
        contributors,
        description: queryDescription,
        linkedWorks: transformedWorks.map(work => work.id), // Use transformedWorks ids, in case they have been redirected from the original work id
        prismicId: id,
        tags,
      },
    },
  ];
};
