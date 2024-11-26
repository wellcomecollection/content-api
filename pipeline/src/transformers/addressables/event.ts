import { asDate } from '@prismicio/client';

import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { EventPrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableEvent } from '@weco/content-pipeline/src/types/transformed';

export const transformAddressableEvent = (
  document: EventPrismicDocument
): ElasticsearchAddressableEvent | undefined => {
  const { data, id, tags, uid: documentUid } = document;
  const format = isFilledLinkToDocumentWithData(data.format)
    ? asText(data.format.data.title)
    : undefined;

  const startEnd = data.times
    .map(t => {
      return {
        start: asDate(t.startDateTime),
        end: asDate(t.endDateTime),
      };
    })
    .filter(d => d.start && d.end)
    .sort((a, b) => Number(a.start) - Number(b.start));

  const firstStart = startEnd?.at(0)?.start;
  const lastEnd = startEnd?.at(-1)?.end;

  const times = {
    start: firstStart,
    end: lastEnd,
  };

  const primaryImage = data.promo?.[0]?.primary;
  const description = primaryImage?.caption && asText(primaryImage.caption);
  const queryDescription = [description, format].filter(isNotUndefined);
  const title = asTitle(data.title);
  const uid = documentUid || undefined;
  const contributors = (data.contributors ?? [])
    .map(c => {
      return isFilledLinkToDocumentWithData(c.contributor)
        ? asText(c.contributor?.data.name)
        : undefined;
    })
    .filter(isNotUndefined)
    .join(', ');

  return tags.includes('delist')
    ? undefined
    : {
        id,
        uid,
        display: {
          type: 'Event',
          id,
          uid,
          title,
          description,
          format,
          times,
        },
        query: {
          type: 'Event',
          title,
          description: queryDescription,
          contributors,
        },
      };
};