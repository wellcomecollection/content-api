import { asDate, PrismicDocument } from '@prismicio/client';

import {
  defaultEventExhibitionFormat,
  defaultEventFormat,
} from '@weco/content-common/data/defaultValues';
import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isImageLink,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import {
  EventPrismicDocument,
  ExhibitionPrismicDocument,
  PrismicAudiences,
  PrismicInterpretations,
  PrismicLocations,
  PrismicScheduledEvent,
  PrismicTimes,
  WithEventFormat,
} from '@weco/content-pipeline/src/types/prismic';
import { WithExhibitionFormat } from '@weco/content-pipeline/src/types/prismic/eventDocuments';
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

const getUniqueValues = <T extends { id: string }>(allValues: T[]): T[] => {
  const uniqueArray: T[] = [];

  allValues.forEach(v =>
    !uniqueArray.find(u => u.id === v.id) ? uniqueArray.push(v) : undefined
  );

  return uniqueArray.filter(isNotUndefined);
};

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
function transformExhibitionFormat(
  document: PrismicDocument<WithExhibitionFormat>
): EventDocumentFormat {
  const { data } = document;
  return isFilledLinkToDocumentWithData(data.format)
    ? {
        type: 'EventFormat',
        id: data.format.id,
        label: asText(data.format.data.title),
      }
    : defaultEventExhibitionFormat;
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

const transformTimes = ({
  times,
}: {
  times: PrismicTimes;
}): EventDocumentTime[] => {
  return (times ?? [])
    .map((time): EventDocumentTime | undefined => {
      return {
        startDateTime: asDate(time.startDateTime) || undefined,
        endDateTime: asDate(time.endDateTime) || new Date(2100, 1, 1),
        isFullyBooked: {
          inVenue: !!time.isFullyBooked,
          online: !!time.onlineIsFullyBooked,
        },
      };
    })
    .filter(isNotUndefined);
};

const getScheduledEventsData = ({
  scheduledEvents,
}: {
  scheduledEvents: PrismicScheduledEvent;
}): {
  scheduledLocations: EventDocumentLocations[];
  scheduledAudiences: EventDocumentAudience[];
  scheduledInterpretations: EventDocumentInterpretation[];
  scheduledTimes: EventDocumentTime[];
} => {
  const transformedScheduledLocations: EventDocumentLocations[] = [];
  const scheduledAudiences: EventDocumentAudience[] = [];
  const scheduledInterpretations: EventDocumentInterpretation[] = [];
  const scheduledTimes: EventDocumentTime[] = [];

  (scheduledEvents || []).forEach(i => {
    if (isFilledLinkToDocumentWithData(i.event)) {
      transformedScheduledLocations.push(
        transformLocations({
          isOnline: i.event.data.isOnline,
          locations: i.event.data.locations,
        })
      );

      scheduledAudiences.push(
        ...transformAudiences({ audiences: i.event.data.audiences })
      );

      scheduledInterpretations.push(
        ...transformInterpretations({
          interpretations: i.event.data.interpretations,
        })
      );

      scheduledTimes.push(...transformTimes({ times: i.event.data.times }));
    }
  });

  return {
    scheduledLocations: transformedScheduledLocations,
    scheduledAudiences,
    scheduledInterpretations,
    scheduledTimes,
  };
};

export const transformEventDocument = (
  document: EventPrismicDocument | ExhibitionPrismicDocument
): ElasticsearchEventDocument[] => {
  const {
    data: { title, promo },
    id,
    uid,
    tags,
    type,
  } = document;

  const primaryImage = promo?.[0]?.primary;
  const image =
    primaryImage && isImageLink(primaryImage.image)
      ? { type: 'PrismicImage' as const, ...primaryImage.image }
      : undefined;

  const series = type === 'exhibitions' ? [] : transformSeries(document);

  const format =
    type === 'exhibitions'
      ? defaultEventExhibitionFormat
      : transformFormat(document);
  const exhibitionFormat =
    type === 'exhibitions' ? transformExhibitionFormat(document) : undefined;

  // If it has scheduled events, we get their data and ensure it's added to this event instead.
  const {
    scheduledLocations,
    scheduledAudiences,
    scheduledInterpretations,
    scheduledTimes,
  } = getScheduledEventsData({
    scheduledEvents: type === 'exhibitions' ? [] : document.data.schedule,
  });

  const times =
    type === 'exhibitions'
      ? [
          {
            startDateTime: asDate(document.data.start) || undefined,
            endDateTime: asDate(document.data.end) || undefined,
            isFullyBooked: { inVenue: false, online: false },
          },
        ]
      : [
          ...transformTimes({
            times: document.data.times,
          }),
          ...scheduledTimes,
        ];

  const parentLocations = transformLocations({
    isOnline: type === 'exhibitions' ? false : document.data.isOnline,
    locations: type === 'exhibitions' ? [] : document.data.locations,
  });
  const locationsPlaces = getUniqueValues(
    [parentLocations.places, ...scheduledLocations.map(s => s.places)]
      .filter(isNotUndefined)
      .flat()
  );
  const locationsAttendance = getUniqueValues(
    [
      parentLocations.attendance,
      ...scheduledLocations.map(s => s.attendance),
    ].flat()
  );
  const locations = {
    ...parentLocations,
    isOnline:
      !!scheduledLocations.find(l => l.isOnline) || parentLocations.isOnline,
    places: locationsPlaces.length > 0 ? locationsPlaces : undefined,
    attendance:
      document.type === 'exhibitions'
        ? [
            {
              id: 'in-our-building' as const,
              label: 'In our building' as const,
              type: 'EventAttendance' as const,
            },
          ]
        : locationsAttendance,
  };

  const interpretations = getUniqueValues([
    ...transformInterpretations({
      interpretations:
        type === 'exhibitions' ? [] : document.data.interpretations,
    }),
    ...scheduledInterpretations,
  ]);

  const audiences = getUniqueValues([
    ...transformAudiences({
      audiences: type === 'exhibitions' ? [] : document.data.audiences,
    }),
    ...scheduledAudiences,
  ]);

  // Events that existed before the field was added have `null` as a value
  // They should be considered as false
  const isAvailableOnline =
    type === 'exhibitions' ? false : !!document.data.availableOnline;

  // If an event has scheduled times, we don't want to have the parent's time range in the filterable times.
  const singleOrChildrenTimes =
    scheduledTimes.length > 0 ? scheduledTimes : times;
  const filterAndSortTimes = singleOrChildrenTimes
    .map(({ startDateTime, endDateTime }) => {
      return { startDateTime, endDateTime };
    })
    .filter(t => t.startDateTime || t.endDateTime);

  return [
    {
      id,
      uid,
      // Scheduled events to be treated differently; they are recognised as such if they have the 'delist' tag.
      ...(tags.includes('delist') && { isChildScheduledEvent: true }),
      display: {
        type: 'Event',
        id,
        uid,
        title: asTitle(title),
        image,
        times,
        format: (exhibitionFormat as EventDocumentFormat) || format,
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
        format:
          type === 'exhibitions'
            ? [
                ...new Set(
                  ['Exhibition', exhibitionFormat?.label].filter(isNotUndefined)
                ),
              ] // Avoids duplicates
            : format.label,
        interpretations: interpretations
          .map(interpretation => interpretation.label)
          .filter(isNotUndefined),
        audiences: audiences
          .map(audience => audience.label)
          .filter(isNotUndefined),
        times: filterAndSortTimes,
      },
      filter: {
        format: format.id,
        interpretations: interpretations.map(i => i.id),
        audiences: audiences.map(a => a.id),
        locations: locations.attendance.map(l => l.id),
        isAvailableOnline,
        times: filterAndSortTimes,
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
