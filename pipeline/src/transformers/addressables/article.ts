import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { ArticlePrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableArticle } from '@weco/content-pipeline/src/types/transformed';

export const transformAddressableArticle = (
  document: ArticlePrismicDocument
): ElasticsearchAddressableArticle[] => {
  const { data, id, uid: documentUid, type } = document;

  const primaryImage = data.promo?.[0]?.primary;
  const description = primaryImage?.caption && asText(primaryImage.caption);
  const title = asTitle(data.title);
  const uid = documentUid || undefined;

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
      id: `${id}-${type}`,
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
