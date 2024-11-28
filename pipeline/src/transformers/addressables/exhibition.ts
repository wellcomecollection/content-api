import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { ExhibitionPrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableExhibition } from '@weco/content-pipeline/src/types/transformed';

export const transformAddressableExhibition = (
  document: ExhibitionPrismicDocument
): ElasticsearchAddressableExhibition => {
  const { data, id, uid: documentUid } = document;
  const format = isFilledLinkToDocumentWithData(data.format)
    ? asText(data.format.data.title)
    : 'Exhibition';

  const dates = {
    start: data.start,
    end: data.end,
  };

  const primaryImage = data.promo?.[0]?.primary;
  const description = primaryImage?.caption && asText(primaryImage.caption);
  const queryDescription = [description, format].filter(isNotUndefined);
  const title = asTitle(data.title);
  const uid = documentUid || undefined;

  return {
    id,
    uid,
    display: {
      type: 'Exhibition',
      id,
      uid,
      title,
      description,
      format,
      dates,
    },
    query: {
      type: 'Exhibition',
      title,
      description: queryDescription,
    },
  };
};
