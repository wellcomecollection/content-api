import { PrismicDocument, TimestampField, asDate } from "@prismicio/client";
import {
  ElasticsearchEventDocument,
  ElasticsearchVenue,
} from "../types/transformed";
import {
  isFilledLinkToDocumentWithData,
  isImageLink,
  asText,
  asTitle,
  isNotUndefined,
} from "../helpers/type-guards";
import {
  linkedDocumentIdentifiers,
  transformSeries,
  getNextOpeningDates,
  addDays,
} from "./utils";
import {
  VenuePrismicDocument,
  RegularOpeningDay,
  ExceptionalOpeningDays,
} from "../types/prismic/venues";
import {
  DayOfWeek,
  DisplayRegularOpeningDay,
  DisplayExceptionalOpeningDays,
} from "../types/transformed/venue";
import { getdoc } from "../test-query";

import * as prismic from "@prismicio/client";

const libraryDoc = {
  id: "WsuS_R8AACS1Nwlx",
  uid: null,
  url: null,
  type: "collection-venue",
  href: "https://wellcomecollection.cdn.prismic.io/api/v2/documents/search?ref=Ze7JVhIAACQAvUOb&q=%5B%5B%3Ad+%3D+at%28document.id%2C+%22WsuS_R8AACS1Nwlx%22%29+%5D%5D",
  tags: ["ShortNoticeClosure"],
  first_publication_date: "2018-04-09T16:21:23+0000",
  last_publication_date: "2024-03-08T13:08:54+0000",
  slugs: ["library", "read-about-the-library"],
  linked_documents: [],
  lang: "en-gb",
  alternate_languages: [],
  data: {
    title: "Library",
    monday: [
      {
        startDateTime: "2022-01-23T10:00:00+0000",
        endDateTime: "2022-01-23T18:00:00+0000",
      },
    ],
    tuesday: [
      {
        startDateTime: "2022-01-23T10:00:00+0000",
        endDateTime: "2022-01-23T18:00:00+0000",
      },
    ],
    wednesday: [
      {
        startDateTime: "2022-01-23T10:00:00+0000",
        endDateTime: "2022-01-23T18:00:00+0000",
      },
    ],
    thursday: [
      {
        startDateTime: "2022-01-23T10:00:00+0000",
        endDateTime: "2022-01-23T20:00:00+0000",
      },
    ],
    friday: [
      {
        startDateTime: "2022-01-23T10:00:00+0000",
        endDateTime: "2022-01-23T18:00:00+0000",
      },
    ],
    saturday: [
      {
        startDateTime: "2022-01-23T10:00:00+0000",
        endDateTime: "2022-01-23T16:00:00+0000",
      },
    ],
    sunday: [{ startDateTime: null, endDateTime: null }],
    modifiedDayOpeningTimes: [
      {
        overrideDate: "2023-12-21T00:00:00+0000",
        type: "Christmas and New Year",
        startDateTime: null,
        endDateTime: null,
      },
      {
        overrideDate: "2023-12-22T00:00:00+0000",
        type: "Christmas and New Year",
        startDateTime: null,
        endDateTime: null,
      },
      {
        overrideDate: "2023-12-23T00:00:00+0000",
        type: "Christmas and New Year",
        startDateTime: null,
        endDateTime: null,
      },
      {
        overrideDate: "2023-12-24T00:00:00+0000",
        type: "Christmas and New Year",
        startDateTime: null,
        endDateTime: null,
      },
      {
        overrideDate: "2023-12-25T00:00:00+0000",
        type: "Christmas and New Year",
        startDateTime: null,
        endDateTime: null,
      },
      {
        overrideDate: "2023-12-26T00:00:00+0000",
        type: "Christmas and New Year",
        startDateTime: null,
        endDateTime: null,
      },
      {
        overrideDate: "2023-12-27T00:00:00+0000",
        type: "Christmas and New Year",
        startDateTime: null,
        endDateTime: null,
      },
      {
        overrideDate: "2023-12-28T00:00:00+0000",
        type: "Christmas and New Year",
        startDateTime: null,
        endDateTime: null,
      },
      {
        overrideDate: "2023-12-29T00:00:00+0000",
        type: "Christmas and New Year",
        startDateTime: null,
        endDateTime: null,
      },
      {
        overrideDate: "2023-12-30T00:00:00+0000",
        type: "Christmas and New Year",
        startDateTime: null,
        endDateTime: null,
      },
      {
        overrideDate: "2023-12-31T00:00:00+0000",
        type: "Christmas and New Year",
        startDateTime: null,
        endDateTime: null,
      },
      {
        overrideDate: "2024-01-01T00:00:00+0000",
        type: "Christmas and New Year",
        startDateTime: null,
        endDateTime: null,
      },
      {
        overrideDate: "2024-03-29T00:00:00+0000",
        type: "Easter",
        startDateTime: null,
        endDateTime: null,
      },
      {
        overrideDate: "2024-03-30T00:00:00+0000",
        type: "Easter",
        startDateTime: null,
        endDateTime: null,
      },
      {
        overrideDate: "2024-03-31T23:00:00+0000",
        type: "Easter",
        startDateTime: null,
        endDateTime: null,
      },
    ],
  },
} as VenuePrismicDocument;

export const transformVenue = async (
  document: VenuePrismicDocument
): Promise<ElasticsearchVenue> => {
  const {
    data: {
      title,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
      modifiedDayOpeningTimes,
    },
    id,
  } = document;

  const formatRegularOpeningDay = (
    day: DayOfWeek,
    openingTimes: RegularOpeningDay
  ): DisplayRegularOpeningDay => {
    const formatTime = (time: TimestampField | undefined): string => {
      return time
        ? `${asDate(time).getHours()}:${String(
            asDate(time).getMinutes()
          ).padStart(2, "0")}`
        : "00:00";
    };

    return {
      dayOfWeek: day,
      opens: formatTime(openingTimes[0]?.startDateTime),
      closes: formatTime(openingTimes[0]?.endDateTime),
      isClosed: !openingTimes[0]?.startDateTime,
    };
  };

  const regularOpeningDays = [
    formatRegularOpeningDay("monday", monday),
    formatRegularOpeningDay("tuesday", tuesday),
    formatRegularOpeningDay("wednesday", wednesday),
    formatRegularOpeningDay("thursday", thursday),
    formatRegularOpeningDay("friday", friday),
    formatRegularOpeningDay("saturday", saturday),
    formatRegularOpeningDay("sunday", sunday),
  ];

  // const nextOpeningDates: any = getNextOpeningDates(regularOpeningDays, modifiedDayOpeningTimes)

  console.log(getNextOpeningDates(regularOpeningDays, modifiedDayOpeningTimes));

  return {
    id,
    display: {
      type: "Venue",
      id,
      title: title,
      regularOpeningDays,
      exceptionalOpeningDays:
        modifiedDayOpeningTimes as DisplayExceptionalOpeningDays[],
    },
    query: {
      title: title,
      id,
    },
    nextOpeningDates: [{ open: new Date(), close: new Date() }],
  };
};

transformVenue(libraryDoc);
