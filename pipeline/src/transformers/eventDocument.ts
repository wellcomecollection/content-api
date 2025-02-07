import { asDate, PrismicDocument, TimestampField } from '@prismicio/client';

import { defaultEventFormat } from '@weco/content-common/data/defaultValues';
import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isImageLink,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import {
  EventPrismicDocument,
  PrismicAudiences,
  PrismicInterpretations,
  PrismicLocations,
  WithEventFormat,
} from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchEventDocument } from '@weco/content-pipeline/src/types/transformed';
import {
  EventDocumentAudience,
  EventDocumentFormat,
  EventDocumentInterpretation,
  EventDocumentLocations,
  EventDocumentPlace,
  EventDocumentTime,
} from '@weco/content-pipeline/src/types/transformed/eventDocument';

import { linkedDocumentIdentifiers, transformSeries } from './utils';

function transformFormat(
  document: PrismicDocument<WithEventFormat>
): EventDocumentFormat {
  const { data } = document;
  return isFilledLinkToDocumentWithData(data.format)
    ? {
        type: 'EventFormat',
        id: data.format.id,
        label: asText(data.format.data.title),
      }
    : (defaultEventFormat as EventDocumentFormat);
}

const transformLocations = ({
  isOnline,
  locations,
}: {
  isOnline?: boolean;
  locations: PrismicLocations;
}): EventDocumentLocations => {
  const physicalLocations = (locations ?? [])
    .map((l): EventDocumentPlace | undefined => {
      return isFilledLinkToDocumentWithData(l.location)
        ? {
            id: l.location.id,
            label: asText(l.location.data.title),
            type: 'EventPlace',
          }
        : undefined;
    })
    .filter(isNotUndefined);

  return {
    type: 'EventLocations',
    isOnline: !!isOnline,
    places: physicalLocations.length > 0 ? physicalLocations : undefined,
    attendance: [
      isOnline
        ? {
            id: 'online' as const,
            label: 'Online' as const,
            type: 'EventAttendance' as const,
          }
        : undefined,
      physicalLocations.length > 0
        ? {
            id: 'in-our-building' as const,
            label: 'In our building' as const,
            type: 'EventAttendance' as const,
          }
        : undefined,
    ].filter(isNotUndefined),
  };
};

const transformInterpretations = ({
  interpretations,
}: {
  interpretations: PrismicInterpretations;
}): EventDocumentInterpretation[] => {
  return (interpretations ?? [])
    .map((i): EventDocumentInterpretation | undefined => {
      return isFilledLinkToDocumentWithData(i.interpretationType)
        ? {
            type: 'EventInterpretation',
            id: i.interpretationType.id,
            label: asText(i.interpretationType.data.title),
          }
        : undefined;
    })
    .filter(isNotUndefined);
};

const transformAudiences = ({
  audiences,
}: {
  audiences: PrismicAudiences;
}): EventDocumentAudience[] => {
  return (audiences ?? [])
    .map((i): EventDocumentAudience | undefined => {
      return isFilledLinkToDocumentWithData(i.audience)
        ? {
            type: 'EventAudience',
            id: i.audience.id,
            label: asText(i.audience.data.title),
          }
        : undefined;
    })
    .filter(isNotUndefined);
};

const transformTimes = (times: {
  startDateTime: TimestampField;
  endDateTime: TimestampField;
  isFullyBooked: 'yes' | null;
  onlineIsFullyBooked: 'yes' | null;
}): EventDocumentTime => {
  return {
    startDateTime: asDate(times.startDateTime) || undefined,
    endDateTime: asDate(times.endDateTime) || undefined,
    isFullyBooked: {
      inVenue: !!times.isFullyBooked,
      online: !!times.onlineIsFullyBooked,
    },
  };
};

export const transformEventDocument = (
  document: EventPrismicDocument
): ElasticsearchEventDocument[] => {
  const {
    data: { title, promo, times, availableOnline },
    id,
    uid,
    tags,
  } = document;

  const documentTimes = times.map(transformTimes);

  const primaryImage = promo?.[0]?.primary;
  const image =
    primaryImage && isImageLink(primaryImage.image)
      ? { type: 'PrismicImage' as const, ...primaryImage.image }
      : undefined;

  const series = transformSeries(document);

  const format = transformFormat(document);

  const locations = transformLocations({
    isOnline: document.data.isOnline,
    locations: document.data.locations,
  });

  const interpretations = transformInterpretations({
    interpretations: document.data.interpretations,
  });

  const audiences = transformAudiences({ audiences: document.data.audiences });

  // Events that existed before the field was added have `null` as a value
  // They should be considered as false
  const isAvailableOnline = !!availableOnline;

  // Scheduled events to be treated differently, they are recognised as such
  // if they have the 'delist' tag.
  const isChildPrismicScheduledEvent = tags.includes('delist') || undefined;

  return [
    {
      id,
      uid,
      ...(isChildPrismicScheduledEvent && { isChildPrismicScheduledEvent }),
      display: {
        type: 'Event',
        id,
        uid,
        title: asTitle(title),
        image,
        times: times.map(transformTimes),
        format,
        locations,
        interpretations,
        audiences,
        series,
        isAvailableOnline,
      },
      query: {
        linkedIdentifiers: linkedDocumentIdentifiers(document),
        title: asTitle(title),
        caption: primaryImage?.caption && asText(primaryImage.caption),
        series,
        format: format.label,
        audiences: audiences
          .map(audience => audience.label)
          .filter(isNotUndefined),
        times: {
          startDateTime: documentTimes
            .map(time => time.startDateTime)
            .filter(isNotUndefined),
        },
      },
      filter: {
        format: format.id,
        interpretations: interpretations.map(i => i.id),
        audiences: audiences.map(a => a.id),
        locations: locations.attendance.map(l => l.id),
        isAvailableOnline,
      },
      aggregatableValues: {
        format: JSON.stringify(format),
        interpretations: interpretations.map(i => JSON.stringify(i)),
        audiences: audiences.map(a => JSON.stringify(a)),
        locations: locations.attendance.map(l => JSON.stringify(l)),
        isAvailableOnline: JSON.stringify({
          type: 'OnlineAvailabilityBoolean',
          value: isAvailableOnline,
          label: 'Catch-up event',
        }),
      },
    },
  ];
};
