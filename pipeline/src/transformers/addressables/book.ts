import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { primaryImageCaption } from '@weco/content-pipeline/src/transformers/utils';
import { BookPrismicDocument } from '@weco/content-pipeline/src/types/prismic/books';
import { ElasticsearchAddressableBook } from '@weco/content-pipeline/src/types/transformed';

export const transformAddressableBook = (
  document: BookPrismicDocument
): ElasticsearchAddressableBook[] => {
  const { data, id, uid, type } = document;
  const description = primaryImageCaption(data.promo);
  const title = asTitle(data.title);
  const subtitle = data.subtitle ? asText(data.subtitle) : undefined;
  const titleSubtitle = `${title}${subtitle ? `: ${subtitle}` : ''}`;
  const contributors = (data.contributors ?? [])
    .map(c => {
      return isFilledLinkToDocumentWithData(c.contributor)
        ? asText(c.contributor?.data.name)
        : undefined;
    })
    .filter(isNotUndefined)
    .join(', ');

  const body = data.body
    ?.map(s => {
      return s.primary.text.map(t => t.text);
    })
    .flat();

  return [
    {
      id: `${id}/${type}`,
      uid,
      display: {
        type: 'Book',
        id,
        uid,
        title: titleSubtitle,
        description,
        contributors,
      },
      query: {
        type: 'Book',
        title: titleSubtitle,
        description,
        body,
        contributors,
      },
    },
  ];
};
