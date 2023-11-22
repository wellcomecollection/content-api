import { PrismicDocument, TimestampField, asDate } from "@prismicio/client";
import {
  EventPrismicDocument,
  WithEventFormat,
  WithLocations,
  WithInterpretations,
} from "../types/prismic/eventDocuments";
import {
  EventDocumentFormat,
  EventDocumentLocation,
  EventDocumentInterpretation,
} from "../types/transformed/eventDocument";
import { ElasticsearchEventDocument } from "../types/transformed";
import {
  isFilledLinkToDocumentWithData,
  isImageLink,
  asText,
  asTitle,
  isNotUndefined,
} from "../helpers/type-guards";
import { linkedDocumentIdentifiers, formatSeriesForQuery } from "./utils";

const onlineLocation = {
  type: "EventLocation",
  id: "ef04c8e3-26be-4fbc-9bef-f52589ebc56c",
  label: "Online",
} as EventDocumentLocation;

function transformFormat(
  document: PrismicDocument<WithEventFormat>
): EventDocumentFormat | undefined {
  const { data } = document;
  return isFilledLinkToDocumentWithData(data.format)
    ? {
        type: "EventFormat",
        id: data.format.id,
        label: asText(data.format.data.title),
      }
    : undefined; // we need a default format
}

const transformLocations = (
  document: PrismicDocument<WithLocations>
): EventDocumentLocation[] => {
  const { data } = document;

  const isOnline = data.isOnline;

  const physicalLocations = (data.locations ?? [])
    .map((l): EventDocumentLocation | undefined => {
      return isFilledLinkToDocumentWithData(l.location)
        ? {
            type: "EventLocation",
            id: l.location.id,
            label: asText(l.location.data.title),
          }
        : undefined;
    })
    .filter(isNotUndefined);

  return isOnline ? [...physicalLocations, onlineLocation] : physicalLocations;
};

const transformInterpretations = (
  document: PrismicDocument<WithInterpretations>
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

const prismicTimestampToDate = (times: {
  startDateTime: TimestampField;
  endDateTime: TimestampField;
}): { startDateTime: Date | null; endDateTime: Date | null } => {
  return {
    startDateTime: asDate(times.startDateTime),
    endDateTime: asDate(times.endDateTime),
  };
};

export const transformEventDocument = (
  document: EventPrismicDocument
): ElasticsearchEventDocument => {
  const {
    data: { title, promo, times },
    id,
  } = document;

  const primaryImage = promo?.[0]?.primary;
  const image =
    primaryImage && isImageLink(primaryImage.image)
      ? { type: "PrismicImage" as const, ...primaryImage.image }
      : undefined;

  const format = transformFormat(document);

  const locations = transformLocations(document);

  const interpretations = transformInterpretations(document);

  return {
    id,
    display: {
      type: "Event",
      id,
      title: asTitle(title),
      image,
      times: times.map(prismicTimestampToDate),
      format,
      locations,
      interpretations,
    },
    query: {
      linkedIdentifiers: linkedDocumentIdentifiers(document),
      title: asTitle(title),
      caption: primaryImage?.caption && asText(primaryImage.caption),
      series: formatSeriesForQuery(document),
    },
  };
};
