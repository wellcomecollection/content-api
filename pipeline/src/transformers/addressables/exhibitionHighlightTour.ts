import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { primaryImageCaption } from '@weco/content-pipeline/src/transformers/utils';
import { ExhibitionHighlightTourPrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableExhibitionHighlightTour } from '@weco/content-pipeline/src/types/transformed';

import { TransformedWork } from './helpers/catalogue-api';

export const transformAddressableExhibitionHighlightTour = (
  document: ExhibitionHighlightTourPrismicDocument
): ElasticsearchAddressableExhibitionHighlightTour[] => {
  const { data, id, uid, type } = document;

  // Exhibition highlight tours don't have body content that can contain works references
  const worksIds: string[] = [];
  const transformedWorks: TransformedWork[] = [];

  const relatedExhibition = isFilledLinkToDocumentWithData(
    data.related_exhibition
  )
    ? data.related_exhibition
    : undefined;
  const exhibitionTitleField = relatedExhibition
    ? relatedExhibition.data.title
    : undefined;
  const exhibitionTitle = exhibitionTitleField && asTitle(exhibitionTitleField);
  const introText = data.intro_text && asText(data.intro_text);
  const description =
    introText ?? primaryImageCaption(relatedExhibition?.data.promo);

  const audioTitle = `${exhibitionTitle} audio highlight tour`;
  const bslTitle = `${exhibitionTitle} British Sign Language tour`;

  function getBody(type: 'audio' | 'bsl') {
    return data.slices
      ?.map(s => {
        const subtitles = s.primary.subtitles?.length
          ? s.primary.subtitles
          : undefined;
        const transcript = s.primary.transcript?.length
          ? s.primary.transcript
          : undefined;
        const texts =
          type === 'audio'
            ? (transcript ?? subtitles)
            : (subtitles ?? transcript);
        return [s.primary.title?.map(t => t.text), texts?.map(t => t.text)]
          .filter(isNotUndefined)
          .flat();
      })
      .flat();
  }

  const audioBody = getBody('audio');
  const bslBody = getBody('bsl');

  const shared = {
    uid,
    display: {
      type: 'Exhibition highlight tour' as const,
      id,
      uid,
      description,
      linkedWorks: transformedWorks,
    },
    query: {
      type: 'Exhibition highlight tour' as const,
      description,
      linkedWorks: worksIds,
    },
  };

  const audio = {
    ...shared,
    id: `${id}.${type}.audio`,
    display: {
      ...shared.display,
      highlightTourType: 'audio',
      title: audioTitle,
    },
    query: { ...shared.query, title: audioTitle, body: audioBody },
  };

  const bsl = {
    ...shared,
    id: `${id}.${type}.bsl`,
    display: { ...shared.display, highlightTourType: 'bsl', title: bslTitle },
    query: { ...shared.query, title: bslTitle, body: bslBody },
  };

  return [audio, bsl];
};
