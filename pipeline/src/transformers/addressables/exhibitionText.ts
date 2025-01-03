import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { ExhibitionTextPrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableExhibitionText } from '@weco/content-pipeline/src/types/transformed';

export const transformAddressableExhibitionText = (
  document: ExhibitionTextPrismicDocument
): ElasticsearchAddressableExhibitionText[] => {
  const { data, id, uid, type } = document;
  const relatedExhibition = isFilledLinkToDocumentWithData(
    data.related_exhibition
  )
    ? data.related_exhibition
    : undefined;
  const exhibitionTitle = relatedExhibition
    ? relatedExhibition.data.title
    : undefined;
  const introText = data.intro_text && asText(data.intro_text);
  const primaryImage = relatedExhibition
    ? relatedExhibition.data.promo?.[0]?.primary
    : undefined;

  const promoCaption = primaryImage?.caption && asText(primaryImage.caption);

  const description = introText || promoCaption || undefined;
  const queryDescription = description ? [description] : undefined;

  const title = asTitle(data.title);
  const displayTitle = exhibitionTitle
    ? `${asTitle(exhibitionTitle)} exhibition text`
    : 'Exhibition text';

  const body = data.slices
    ?.map(s => {
      return [
        s.primary.title?.map(t => t.text),
        s.primary.tombstone?.map(t => t.text),
        s.primary.caption?.map(t => t.text),
      ]
        .filter(isNotUndefined)
        .flat();
    })
    .flat();

  return [
    {
      id: `${id}/${type}`,
      uid,
      display: {
        type: 'Exhibition text',
        id,
        uid,
        title: displayTitle,
        description,
      },
      query: {
        type: 'Exhibition text',
        title,
        body,
        description: queryDescription,
      },
    },
  ];
};
