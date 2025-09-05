import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { BodiesWithPossibleWorks } from '@weco/content-pipeline/src/transformers/addressables/helpers/extract-works-ids';
import { primaryImageCaption } from '@weco/content-pipeline/src/transformers/utils';
import { ArticlePrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableArticle } from '@weco/content-pipeline/src/types/transformed';

import { fetchAndTransformWorks } from './helpers/catalogue-api';
import { getWorksIdsFromDocumentBody } from './helpers/extract-works-ids';

export const transformAddressableArticle = async (
  document: ArticlePrismicDocument
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

  const worksIds = getWorksIdsFromDocumentBody(
    (data.body as BodiesWithPossibleWorks) || []
  );
  const transformedWorks = await fetchAndTransformWorks(worksIds);

  const queryBody = data.body
    ?.map(slice => {
      if (['text', 'quote', 'standfirst'].includes(slice.slice_type)) {
        return slice.primary.text.map(text => text.text);
      } else {
        return [];
      }
    })
    .flat();

  const queryStandfirst = data.body?.find(b => b.slice_type === 'standfirst')
    ?.primary.text[0].text;

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
