import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { ExhibitionTextPrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableExhibitionText } from '@weco/content-pipeline/src/types/transformed';

export const transformAddressableExhibitionText = (
  document: ExhibitionTextPrismicDocument
): ElasticsearchAddressableExhibitionText => {
  const { data, id, uid: documentUid } = document;

  const introText = data.intro_text && asText(data.intro_text);
  const primaryImage = isFilledLinkToDocumentWithData(data.related_exhibition)
    ? data.related_exhibition.data.promo?.[0]?.primary
    : undefined;

  const promoCaption = primaryImage?.caption && asText(primaryImage.caption);

  const description = introText || promoCaption || undefined;
  const queryDescription = description ? [description] : undefined;

  const title = asTitle(data.title);
  const uid = documentUid || undefined;

  return {
    id,
    uid,
    display: {
      type: 'Exhibition text',
      id,
      uid,
      title,
      description,
    },
    query: {
      type: 'Exhibition text',
      title,
      description: queryDescription,
    },
  };
};
