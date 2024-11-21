import {
  asText,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { BooksAddressablePrismicDocument } from '@weco/content-pipeline/src/types/prismic/addressables/books';

export const transformAddressableBook = (
  document: BooksAddressablePrismicDocument
) => {
  const { data, id, uid } = document;
  const primaryImage = data.promo?.[0]?.primary;
  const description = primaryImage?.caption && asText(primaryImage.caption);
  const titleSubtitle = `${asText(data.title)} ${asText(data.subtitle)}`;
  const contributors = (data.contributors ?? [])
    .map(c => {
      return isFilledLinkToDocumentWithData(c.contributor)
        ? asText(c.contributor?.data.name)
        : undefined;
    })
    .filter(isNotUndefined);

  const body = data.body
    ?.map(s => {
      return s.primary.text.map(t => t.text);
    })
    .flat()
    .join(' ');

  return {
    id,
    uid,
    display: {
      type: 'Book',
      id,
      uid,
      title: asText(data.title),
      description,
    },
    query: {
      type: 'Book',
      title: titleSubtitle,
      description,
      contributors,
      body,
    },
  };
};
