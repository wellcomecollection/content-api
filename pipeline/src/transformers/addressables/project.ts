import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import {
  primaryImageCaption,
  sliceTextLines,
} from '@weco/content-pipeline/src/transformers/utils';
import { ProjectsDocumentWithLinks } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableProject } from '@weco/content-pipeline/src/types/transformed';

import { fetchAndTransformWorks } from './helpers/catalogue-api';
import { getWorksIdsFromDocumentBody } from './helpers/extract-works-ids';

export const transformAddressableProject = async (
  document: ProjectsDocumentWithLinks
): Promise<ElasticsearchAddressableProject[]> => {
  const { data, id, uid, tags, type } = document;

  const worksIds = getWorksIdsFromDocumentBody(data.body);
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
  const queryBody = sliceTextLines(data.body, ['text', 'quote', 'standfirst']);

  return [
    {
      id: `${id}.${type}`,
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
        linkedWorks: transformedWorks.map(work => work.id), // Use transformedWorks ids, in case they have been redirected from the original work id
        prismicId: id,
        tags,
      },
    },
  ];
};
