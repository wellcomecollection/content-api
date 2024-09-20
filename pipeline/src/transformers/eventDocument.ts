import { PrismicDocument, TimestampField, asDate } from "@prismicio/client";
import { defaultEventFormat } from "@weco/content-common/data/defaultValues";
import {
  EventPrismicDocument,
  WithEventFormat,
  WithLocations,
  WithInterpretations,
  WithAudiences,
} from "../types/prismic/eventDocuments";
import {
  EventDocumentFormat,
  EventDocumentLocations,
  EventDocumentInterpretation,
  EventDocumentAudience,
  EventDocumentPlace,
} from "../types/transformed/eventDocument";
import { ElasticsearchEventDocument } from "../types/transformed";
import {
  isFilledLinkToDocumentWithData,
  isImageLink,
  asText,
  asTitle,
  isNotUndefined,
} from "../helpers/type-guards";
import { linkedDocumentIdentifiers, transformSeries } from "./utils";

function transformFormat(
  document: PrismicDocument<WithEventFormat>,
): EventDocumentFormat {
  const { data } = document;
  return isFilledLinkToDocumentWithData(data.format)
    ? {
        type: "EventFormat",
        id: data.format.id,
        label: asText(data.format.data.title),
      }
    : (defaultEventFormat as EventDocumentFormat);
}

const transformLocations = (
  document: PrismicDocument<WithLocations>,
): EventDocumentLocations => {
  const { data } = document;

  const isOnline = !!data.isOnline;

  const physicalLocations = (data.locations ?? [])
    .map((l): EventDocumentPlace | undefined => {
      return isFilledLinkToDocumentWithData(l.location)
        ? {
            id: l.location.id,
            label: asText(l.location.data.title),
            type: "EventPlace",
          }
        : undefined;
    })
    .filter(isNotUndefined);

  return {
    type: "EventLocations",
    isOnline,
    places: physicalLocations.length > 0 ? physicalLocations : undefined,
    attendance: [
      isOnline
        ? {
            id: "online" as const,
            label: "Online" as const,
            type: "EventAttendance" as const,
          }
        : undefined,
      physicalLocations.length > 0
        ? {
            id: "in-our-building" as const,
            label: "In our building" as const,
            type: "EventAttendance" as const,
          }
        : undefined,
    ].filter(isNotUndefined),
  };
};

const transformInterpretations = (
  document: PrismicDocument<WithInterpretations>,
) => {
  const { data } = document;

  return (data.interpretations ?? [])
    .map((i): EventDocumentInterpretation | undefined => {
      return isFilledLinkToDocumentWithData(i.interpretationType)
        ? {
            type: "EventInterpretation",
            id: i.interpretationType.id,
            label: asText(i.interpretationType.data.title),
          }
        : undefined;
    })
    .filter(isNotUndefined);
};

const transformAudiences = (document: PrismicDocument<WithAudiences>) => {
  const { data } = document;

  return (data.audiences ?? [])
    .map((i): EventDocumentAudience | undefined => {
      return isFilledLinkToDocumentWithData(i.audience)
        ? {
            type: "EventAudience",
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
  isFullyBooked: "yes" | null;
  onlineIsFullyBooked: "yes" | null;
}): {
  startDateTime: Date | undefined;
  endDateTime: Date | undefined;
  isFullyBooked: { inVenue: boolean; online: boolean };
} => {
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
  document: EventPrismicDocument,
): ElasticsearchEventDocument => {
  const {
    data: { title, promo, times, availableOnline },
    id,
    tags,
  } = document;

  const documentTimes = times.map(transformTimes);

  const primaryImage = promo?.[0]?.primary;
  const image =
    primaryImage && isImageLink(primaryImage.image)
      ? { type: "PrismicImage" as const, ...primaryImage.image }
      : undefined;

  const format = transformFormat(document);

  const locations = transformLocations(document);

  const interpretations = transformInterpretations(document);

  const audiences = transformAudiences(document);

  // Events that existed before the field was added have `null` as a value
  // They should be considered as false
  const isAvailableOnline = !!availableOnline;

  return {
    id,
    ...(tags.includes("delist") && { isChildScheduledEvent: true }),
    display: {
      type: "Event",
      id,
      title: asTitle(title),
      image,
      times: times.map(transformTimes),
      format,
      locations,
      interpretations,
      audiences,
      series: transformSeries(document),
      isAvailableOnline,
    },
    query: {
      linkedIdentifiers: linkedDocumentIdentifiers(document),
      title: asTitle(title),
      caption: primaryImage?.caption && asText(primaryImage.caption),
      series: transformSeries(document),
      times: {
        startDateTime: documentTimes
          .map((time) => time.startDateTime)
          .filter(isNotUndefined),
      },
    },
    filter: {
      formatId: format.id,
      interpretationIds: interpretations.map((i) => i.id),
      audienceIds: audiences.map((a) => a.id),
      locationIds: locations.attendance.map((l) => l.id),
      isAvailableOnline,
    },
    aggregatableValues: {
      format: JSON.stringify(format),
      interpretations: interpretations.map((i) => JSON.stringify(i)),
      audiences: audiences.map((a) => JSON.stringify(a)),
      locations: locations.attendance.map((l) => JSON.stringify(l)),
      isAvailableOnline: JSON.stringify({
        type: "OnlineAvailabilityBoolean",
        value: isAvailableOnline,
        label: "Catch-up event",
      }),
    },
  };
};
