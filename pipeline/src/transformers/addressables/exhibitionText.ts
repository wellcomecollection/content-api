import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
} from '@weco/content-pipeline/src/helpers/type-guards';
import {
  primaryImageCaption,
  richTextLines,
} from '@weco/content-pipeline/src/transformers/utils';
import { ExhibitionTextsDocumentWithLinks } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableExhibitionText } from '@weco/content-pipeline/src/types/transformed';

import { TransformedWork } from './helpers/catalogue-api';

export const transformAddressableExhibitionText = (
  document: ExhibitionTextsDocumentWithLinks
): ElasticsearchAddressableExhibitionText[] => {
  const { data, id, uid, tags, type } = document;

  // Exhibition texts don't have body content that can contain works references
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

  const body = data.slices?.flatMap(s =>
    s.slice_type === 'guide_text_item'
      ? [
          ...richTextLines(s.primary.title),
          ...richTextLines(s.primary.tombstone),
          ...richTextLines(s.primary.caption),
        ]
      : richTextLines(s.primary.title)
  );

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
        linkedWorks: transformedWorks.map(work => work.id), // Use transformedWorks ids, in case they have been redirected from the original work id
        prismicId: id,
        tags,
      },
    },
  ];
};
