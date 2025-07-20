import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { AddressableSlices } from '@weco/content-pipeline/src/transformers/addressables/helpers/extract-works-ids';
import { primaryImageCaption } from '@weco/content-pipeline/src/transformers/utils';
import { ArticlePrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableArticle } from '@weco/content-pipeline/src/types/transformed';

import { fetchWorksWithLogging } from './helpers/catalogue-api';
import { getWorksIdsFromDocumentBody } from './helpers/extract-works-ids';

export const transformAddressableArticle = async (
  document: ArticlePrismicDocument
): Promise<ElasticsearchAddressableArticle[]> => {
  const { data, id, uid, type } = document;

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

  // Need to use types from prismicio.d.ts everywhere
  // so we don't need to cast
  const worksIds = getWorksIdsFromDocumentBody(
    (data.body as AddressableSlices[]) || []
  );
  const works = await fetchWorksWithLogging(worksIds);
  console.log(works);

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
      id: `${id}/${type}`,
      uid,
      display: {
        type: 'Article',
        id,
        uid,
        title,
        description,
      },
      query: {
        type: 'Article',
        title,
        description: [description, queryStandfirst, format].filter(
          isNotUndefined
        ),
        contributors,
        body: queryBody,
      },
    },
  ];
};
