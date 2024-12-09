import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { ProjectPrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableProject } from '@weco/content-pipeline/src/types/transformed';

export const transformAddressableProject = (
  document: ProjectPrismicDocument
): ElasticsearchAddressableProject[] => {
  const { data, id, uid: documentUid } = document;

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
  const primaryImage = data.promo?.[0]?.primary;
  const promoCaption = primaryImage?.caption && asText(primaryImage.caption);
  const displayDescription = promoCaption;
  const queryDescription = [promoCaption, format].filter(isNotUndefined);
  const queryBody = data.body
    ?.map(slice => {
      if (['text', 'quote', 'standfirst'].includes(slice.slice_type)) {
        return slice.primary.text.map(text => text.text);
      } else {
        return [];
      }
    })
    .flat();

  return [
    {
      id,
      uid,
      display: {
        type: 'Project',
        id,
        uid,
        title,
        format,
        description: displayDescription,
      },
      query: {
        type: 'Project',
        title,
        description: queryDescription,
        contributors,
        body: queryBody,
      },
    },
  ];
};
