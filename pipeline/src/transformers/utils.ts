import { PrismicDocument, asDate } from "@prismicio/client";
import {
  isFilledLinkToDocumentWithData,
  asText,
  isNotUndefined,
} from "../helpers/type-guards";
import { WithSeries } from "../types/prismic/series";
import { Series } from "../types/transformed";
import {
  DayOfWeek,
  DisplayRegularOpeningDay,
  DisplayExceptionalClosedDay,
  NextOpeningDate,
} from "../types/transformed/venue";
import { DateTime } from "luxon";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [Key in string]: JsonValue } & {
  [Key in string]?: JsonValue | undefined;
};

type LinkedDocumentWithData = {
  link_type: "Document";
  id: string;
  data?: any;
};

// We want to extract IDs only from linked documents (not slices) from which
// we have denormalised some `data`
const isLinkedDocumentWithData = (
  obj: JsonObject
): obj is LinkedDocumentWithData =>
  obj["link_type"] === "Document" && "id" in obj && "data" in obj;

export const linkedDocumentIdentifiers = (rootDocument: any): string[] => {
  const getLinkedIdentifiers = (
    root: JsonValue,
    identifiers: Set<string>
  ): Set<string> => {
    const descend = (arr: JsonValue[]) =>
      new Set(
        ...arr.flatMap((nextRoot) =>
          getLinkedIdentifiers(nextRoot, identifiers)
        )
      );

    if (typeof root === "object") {
      if (root === null) {
        return identifiers;
      } else if (Array.isArray(root)) {
        return descend(root);
      } else if (isLinkedDocumentWithData(root)) {
        return identifiers.add(root.id);
      } else {
        return descend(Object.values(root));
      }
    } else {
      return identifiers;
    }
  };

  return Array.from(getLinkedIdentifiers(rootDocument, new Set<string>()));
};

export const transformSeries = (
  document: PrismicDocument<WithSeries>
): Series => {
  return document.data.series.flatMap(({ series }) =>
    isFilledLinkToDocumentWithData(series)
      ? {
          id: series.id,
          title: asText(series.data.title),
          contributors: series.data.contributors
            ? series.data.contributors
                .flatMap(({ contributor }) =>
                  isFilledLinkToDocumentWithData(contributor)
                    ? asText(contributor.data.name)
                    : []
                )
                .filter(isNotUndefined)
            : [],
        }
      : []
  );
};

export function getNextOpeningDates(
  regularOpeningDays: DisplayRegularOpeningDay[],
  exceptionalClosedDays: DisplayExceptionalClosedDay[]
): NextOpeningDate[] {
  const dateNow = new Date();
  const timeSeriesStart = addDays(dateNow, 1);
  const dateList = [...Array(21).keys()].map((day) =>
    addDays(timeSeriesStart, day)
  );

  const regularClosedDays = regularOpeningDays
    .filter((day) => day.isClosed)
    .map((day) => day.dayOfWeek);
  const upcomingExceptionalClosedDates = exceptionalClosedDays
    .map((date) => date.overrideDate)
    .filter((date) => date && date > dateNow)
    .map((date) => date && getDateWithoutTime(date));

  const upcomingRegularOpenDays = dateList.filter(
    (date) => !regularClosedDays.includes(getDayName(date))
  );
  const upcomingOpenDays = upcomingRegularOpenDays.filter(
    (date) => !upcomingExceptionalClosedDates.includes(getDateWithoutTime(date))
  );

  return addOpeningHours(upcomingOpenDays, regularOpeningDays);
}

function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  return new Date(newDate.setDate(date.getDate() + days));
}

function getDayName(date: Date) {
  return new Date(date)
    .toLocaleString("en-gb", { weekday: "long" })
    .toLowerCase() as DayOfWeek;
}

function getDateWithoutTime(date: Date) {
  // when a venue is closed during BST Prismic has it as:
  // '2024-03-31T23:00:00+0000' for '2024-04-01T00:00:00 Europe/London'
  // we set the desired timezone here because we care about the day
  const dateInLondonTimezone = DateTime.fromJSDate(date)
    .setZone("Europe/London")
    .toJSDate();
  return dateInLondonTimezone.toDateString();
}

function addOpeningHours(
  upcomingOpenDays: Date[],
  regularOpeningDays: DisplayRegularOpeningDay[]
): NextOpeningDate[] {
  return upcomingOpenDays.map((date) => {
    const regularOpeningDay = regularOpeningDays.find(
      (day) => day.dayOfWeek === getDayName(date)
    );
    const openingHour = regularOpeningDay?.opens
      ? regularOpeningDay.opens
      : "00:00";
    const closingHour = regularOpeningDay?.closes
      ? regularOpeningDay.closes
      : "00:00";

    return {
      open: setHourAndMinute(date, openingHour),
      close: setHourAndMinute(date, closingHour),
    };
  });
}

function setHourAndMinute(date: Date, time: string): string | undefined {
  // we set the timezone to Europe/London before setting the time
  const dateInLondonTimezone =
    DateTime.fromJSDate(date).setZone("Europe/London");
  const withHourAndMinute = dateInLondonTimezone.set({
    hour: Number(time.split(":")[0]),
    minute: Number(time.split(":")[1]),
    second: 0,
    millisecond: 0,
  });
  // time is set in London, we can now convert back to UTC ISO string
  return withHourAndMinute.toUTC().toISO() || undefined;
}
