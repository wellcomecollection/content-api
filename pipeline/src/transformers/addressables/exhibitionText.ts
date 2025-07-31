import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { primaryImageCaption } from '@weco/content-pipeline/src/transformers/utils';
import { ExhibitionTextPrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableExhibitionText } from '@weco/content-pipeline/src/types/transformed';

import { TransformedWork } from './helpers/catalogue-api';

export const transformAddressableExhibitionText = (
  document: ExhibitionTextPrismicDocument
): ElasticsearchAddressableExhibitionText[] => {
  const { data, id, uid, type } = document;

  // Exhibition texts don't have body content that can contain works references
  const worksIds: string[] = [];
  const transformedWorks: TransformedWork[] = [];

  const relatedExhibition = isFilledLinkToDocumentWithData(
    data.related_exhibition
  )
    ? data.related_exhibition
    : undefined;
  const exhibitionTitle = relatedExhibition
    ? relatedExhibition.data.title
    : undefined;
  const introText = data.intro_text && asText(data.intro_text);
  const description =
    introText ?? primaryImageCaption(relatedExhibition?.data.promo);
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
      id: `${id}.${type}`,
      uid,
      display: {
        type: 'Exhibition text',
        id,
        uid,
        title: displayTitle,
        description,
        linkedWorks: transformedWorks,
      },
      query: {
        type: 'Exhibition text',
        title,
        body,
        description: queryDescription,
        linkedWorks: worksIds,
      },
    },
  ];
};
