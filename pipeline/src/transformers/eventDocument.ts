import { asDate, PrismicDocument } from '@prismicio/client';

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
  PrismicScheduledEvent,
  PrismicTimes,
  WithEventFormat,
} from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchEventDocument } from '@weco/content-pipeline/src/types/transformed';
import {
  EventDocumentAttendance,
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

const getUniqueLocationValues = ({
  parentLocations,
  scheduledLocations,
}: {
  parentLocations: EventDocumentLocations;
  scheduledLocations: EventDocumentLocations[];
}) => {
  const places: EventDocumentPlace[] = [];
  const attendance: EventDocumentAttendance[] = [];

  const allPlaces = [
    parentLocations.places,
    ...scheduledLocations.map(s => s.places),
  ].flat();

  // Ensure we only pass in each places once
  allPlaces.forEach(place =>
    !places.find(u => u.id === place?.id) && !!place
      ? places.push(place)
      : undefined
  );

  const allAttendance = [
    parentLocations.attendance,
    ...scheduledLocations.map(s => s.attendance),
  ].flat();

  // Ensure we only pass in each attendance once
  allAttendance.forEach(att =>
    !attendance.find(u => u.id === att.id) ? attendance.push(att) : undefined
  );

  return {
    places: places.filter(isNotUndefined),
    attendance: attendance.filter(isNotUndefined),
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
        endDateTime: asDate(time.endDateTime) || undefined,
        isFullyBooked: {
          inVenue: !!time.isFullyBooked,
          online: !!time.onlineIsFullyBooked,
        },
      };
    })
    .filter(isNotUndefined);
};

const transformSchedule = ({
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

  const allScheduledAudiences: EventDocumentAudience[] = [];
  const uniqueScheduledAudiences: EventDocumentAudience[] = [];

  const allScheduledInterpretations: EventDocumentInterpretation[] = [];
  const uniqueScheduledInterpretations: EventDocumentInterpretation[] = [];

  const scheduledTimes: EventDocumentTime[] = [];

  (scheduledEvents || []).forEach(i => {
    if (isFilledLinkToDocumentWithData(i.event)) {
      transformedScheduledLocations.push(
        transformLocations({
          isOnline: i.event.data.isOnline,
          locations: i.event.data.locations,
        })
      );

      allScheduledAudiences.push(
        ...transformAudiences({ audiences: i.event.data.audiences })
      );

      allScheduledInterpretations.push(
        ...transformInterpretations({
          interpretations: i.event.data.interpretations,
        })
      );

      scheduledTimes.push(...transformTimes({ times: i.event.data.times }));
    }
  });

  // TODO move this out, we'll need to re-do it anyway when we add the parent ones, might as well only do it once.
  // Ensure we only pass in each audience once
  allScheduledAudiences.forEach(aud =>
    !uniqueScheduledAudiences.find(u => u.id === aud.id)
      ? uniqueScheduledAudiences.push(aud)
      : undefined
  );
  // TODO same
  // Ensure we only pass in each interpetation once
  allScheduledInterpretations.forEach(int =>
    !uniqueScheduledInterpretations.find(u => u.id === int.id)
      ? uniqueScheduledInterpretations.push(int)
      : undefined
  );

  return {
    scheduledLocations: transformedScheduledLocations,
    scheduledAudiences: uniqueScheduledAudiences.filter(isNotUndefined),
    scheduledInterpretations:
      uniqueScheduledInterpretations.filter(isNotUndefined),
    scheduledTimes,
  };
};

export const transformEventDocument = (
  document: EventPrismicDocument
): ElasticsearchEventDocument[] => {
  const {
    data: { title, promo, availableOnline },
    id,
    uid,
    tags,
  } = document;

  const primaryImage = promo?.[0]?.primary;
  const image =
    primaryImage && isImageLink(primaryImage.image)
      ? { type: 'PrismicImage' as const, ...primaryImage.image }
      : undefined;

  const series = transformSeries(document);

  const format = transformFormat(document);

  // Scheduled events to be treated differently, they are recognised as such
  // if they have the 'delist' tag.
  const isChildPrismicScheduledEvent = tags.includes('delist') || undefined;

  // If it has scheduled events, we get their data and ensure it's added to this event instead.
  const {
    scheduledLocations,
    scheduledAudiences,
    scheduledInterpretations,
    scheduledTimes,
  } = transformSchedule({
    scheduledEvents: document.data.schedule,
  });

  const times = [
    ...transformTimes({ times: document.data.times }),
    ...scheduledTimes,
  ];

  const parentLocations = transformLocations({
    isOnline: document.data.isOnline,
    locations: document.data.locations,
  });
  const locations = {
    ...parentLocations,
    isOnline:
      !!scheduledLocations.find(l => l.isOnline) && parentLocations.isOnline,
    ...getUniqueLocationValues({ parentLocations, scheduledLocations }),
  };

  const interpretations = [
    ...transformInterpretations({
      interpretations: document.data.interpretations,
    }),
    ...scheduledInterpretations,
  ];

  const audiences = [
    ...transformAudiences({ audiences: document.data.audiences }),
    ...scheduledAudiences,
  ];

  // Events that existed before the field was added have `null` as a value
  // They should be considered as false
  const isAvailableOnline = !!availableOnline;

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
        times,
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
          startDateTime: times
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
