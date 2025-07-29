import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { primaryImageCaption } from '@weco/content-pipeline/src/transformers/utils';
import { ProjectPrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableProject } from '@weco/content-pipeline/src/types/transformed';

import { fetchAndTransformWorks } from './helpers/catalogue-api';
import {
  BodiesWithPossibleWorks,
  getWorksIdsFromDocumentBody,
} from './helpers/extract-works-ids';

export const transformAddressableProject = async (
  document: ProjectPrismicDocument
): Promise<ElasticsearchAddressableProject[]> => {
  const { data, id, uid, type } = document;

  // Need to use types from prismicio.d.ts everywhere
  // so we don't need to cast
  const worksIds = getWorksIdsFromDocumentBody(
    (data.body as BodiesWithPossibleWorks) || []
  );
  const transformedWorks = await fetchAndTransformWorks(worksIds);

  const title = asTitle(data.title);
  const format = isFilledLinkToDocumentWithData(data.format)
    ? asText(data.format.data.title)
    : undefined;
  const contributors = (data.contributors ?? [])
    .map(c => {
      return isFilledLinkToDocumentWithData(c.contributor)
        ? asText(c.contributor?.data.name)
        : undefined;
    })
    .filter(isNotUndefined)
    .join(', ');
  const description = primaryImageCaption(data.promo);
  const queryDescription = [description, format].filter(isNotUndefined);
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
      id: `${id}/${type}`,
      uid,
      display: {
        type: 'Project',
        id,
        uid,
        title,
        format,
        description,
        linkedWorks: transformedWorks,
      },
      query: {
        type: 'Project',
        title,
        description: queryDescription,
        contributors,
        body: queryBody,
        linkedWorks: worksIds,
      },
    },
  ];
};
