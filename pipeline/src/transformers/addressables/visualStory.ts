import {
  asText,
  asTitle,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { VisualStoryPrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableVisualStory } from '@weco/content-pipeline/src/types/transformed';

export const transformAddressableVisualStory = (
  document: VisualStoryPrismicDocument
): ElasticsearchAddressableVisualStory => {
  const { data, id, uid: documentUid } = document;

  const primaryImage = data.promo?.[0]?.primary;
  const description = primaryImage?.caption && asText(primaryImage.caption);
  const title = asTitle(data.title);
  const uid = documentUid || undefined;

  return {
    id,
    uid,
    display: {
      type: 'Visual story',
      id,
      uid,
      title,
      description,
    },
    query: {
      type: 'Visual story',
      title,
      description,
    },
  };
};
