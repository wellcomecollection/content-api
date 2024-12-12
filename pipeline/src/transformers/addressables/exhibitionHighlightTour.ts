import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { ExhibitionHighlightTourPrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableExhibitionHighlightTour } from '@weco/content-pipeline/src/types/transformed';

export const transformAddressableExhibitionHighlightTour = (
  document: ExhibitionHighlightTourPrismicDocument
): ElasticsearchAddressableExhibitionHighlightTour[] => {
  const { data, id, uid: documentUid, type } = document;
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
  const primaryImage = relatedExhibition
    ? relatedExhibition.data.promo?.[0]?.primary
    : undefined;

  const promoCaption = primaryImage?.caption && asText(primaryImage.caption);

  const description = introText ?? promoCaption;

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

  const uid = documentUid || undefined;

  const shared = {
    uid,
    display: {
      type: 'Exhibition highlight tour' as const,
      id,
      uid,
      description,
    },
    query: {
      type: 'Exhibition highlight tour' as const,
      description: introText,
    },
  };

  const audio = {
    ...shared,
    id: `${id}/${type}/audio`,
    display: { ...shared.display, title: audioTitle },
    query: { ...shared.query, title: audioTitle, body: audioBody },
  };

  const bsl = {
    ...shared,
    id: `${id}/${type}/bsl`,
    display: { ...shared.display, title: bslTitle },
    query: { ...shared.query, title: bslTitle, body: bslBody },
  };

  return [audio, bsl];
};
