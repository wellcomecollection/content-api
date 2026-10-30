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
import { ArticlesOrWebcomicsDocumentWithLinks } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableArticle } from '@weco/content-pipeline/src/types/transformed';

import { fetchAndTransformWorks } from './helpers/catalogue-api';
import { getWorksIdsFromDocumentBody } from './helpers/extract-works-ids';

export const transformAddressableArticle = async (
  document: ArticlesOrWebcomicsDocumentWithLinks
): Promise<ElasticsearchAddressableArticle[]> => {
  const { data, id, uid, tags, type } = document;

  const description = primaryImageCaption(data.promo);
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

  const worksIds = getWorksIdsFromDocumentBody(data.body);
  const transformedWorks = await fetchAndTransformWorks(worksIds);

  const queryBody = sliceTextLines(data.body, ['text', 'quote', 'standfirst']);

  const queryStandfirst = sliceTextLines(data.body, ['standfirst'])?.[0];

  return [
    {
      id: `${id}.${type}`,
      uid,
      display: {
        type: 'Article',
        id,
        uid,
        title,
        description,
        linkedWorks: transformedWorks,
      },
      query: {
        type: 'Article',
        title,
        description: [description, queryStandfirst, format].filter(
          isNotUndefined
        ),
        contributors,
        body: queryBody,
        linkedWorks: transformedWorks.map(work => work.id), // Use transformedWorks ids, in case they have been redirected from the original work id
        prismicId: id,
        tags,
      },
    },
  ];
};
