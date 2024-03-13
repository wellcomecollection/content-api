import { TimestampField, asDate } from "@prismicio/client";
import { ElasticsearchVenue } from "../types/transformed";
import { getNextOpeningDates } from "./utils";
import {
  VenuePrismicDocument,
  RegularOpeningDay,
  ExceptionalOpeningDays,
} from "../types/prismic/venues";
import {
  DayOfWeek,
  DisplayRegularOpeningDay,
  DisplayExceptionalClosedDay,
} from "../types/transformed/venue";

export const transformVenue = (
  document: VenuePrismicDocument
): ElasticsearchVenue => {
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

  const formatExceptionalClosedDays = (
    modifiedDayOpeningTimes: ExceptionalOpeningDays
  ): DisplayExceptionalClosedDay[] => {
    return modifiedDayOpeningTimes.map((day) => {
      if (!asDate(day.overrideDate)) {
        throw new Error("Date for modified opening time is not valid");
      }

      return {
        overrideDate: asDate(day.overrideDate),
        type: day.type,
        startDateTime: "00:00",
        endDateTime: "00:00",
      };
    });
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

  const exceptionalClosedDays = formatExceptionalClosedDays(
    modifiedDayOpeningTimes
  );

  const nextOpeningDates = getNextOpeningDates(
    regularOpeningDays,
    exceptionalClosedDays
  );

  return {
    id,
    display: {
      type: "Venue",
      id,
      title,
      regularOpeningDays,
      exceptionalClosedDays,
    },
    filter: {
      title,
      id,
    },
    nextOpeningDates,
  };
};
