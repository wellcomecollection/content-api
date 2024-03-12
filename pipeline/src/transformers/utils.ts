import { PrismicDocument, asDate } from "@prismicio/client";
import {
  isFilledLinkToDocumentWithData,
  asText,
  isNotUndefined,
} from "../helpers/type-guards";
import { WithSeries } from "../types/prismic/series";
import { Series } from "../types/transformed";
import { ExceptionalOpeningDays } from "../types/prismic/venues";
import {
  DayOfWeek,
  DisplayRegularOpeningDay,
} from "../types/transformed/venue";

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
  modifiedDayOpeningTimes: ExceptionalOpeningDays,
  dateList: Date[] = []
): Date[] | void {
  const now = new Date("Wed 13 Mar 2024");

  if (!dateList.length) {
    const timeSeriesStart =
      now.getHours() < 10 ? addDays(now, 1) : addDays(now, 2);
    dateList = [...Array(14).keys()].map((day) =>
      addDays(timeSeriesStart, day)
    );
  } else {
    dateList = [
      ...dateList,
      ...[...Array(14 - dateList.length).keys()].map((day) =>
        addDays(dateList[dateList.length - 1], day + 1)
      ),
    ];
  }

  const regularClosedDays = regularOpeningDays
    .filter((day) => day.isClosed)
    .map((day) => day.dayOfWeek);
  const upcomingExceptionalClosedDates = modifiedDayOpeningTimes
    .map((date) => asDate(date.overrideDate))
    .filter((date) => date && date > new Date())
    .map((date) => date && getDateWithoutTime(date));

  const upcomingRegularOpenDays = dateList.filter(
    (date) => !regularClosedDays.includes(getDayName(date))
  );
  const upcomingOpenDays = upcomingRegularOpenDays.filter(
    (date) => !upcomingExceptionalClosedDates.includes(getDateWithoutTime(date))
  );

  console.log("UPCOMING OPEN DAYS", upcomingOpenDays);

  return upcomingOpenDays.length === 14
    ? upcomingOpenDays
    : getNextOpeningDates(
        regularOpeningDays,
        modifiedDayOpeningTimes,
        upcomingOpenDays
      );
}

export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  return new Date(newDate.setDate(date.getDate() + days));
}

function getDayName(date: Date) {
  return new Date(date)
    .toLocaleString("en-gb", { weekday: "long" })
    .toLowerCase() as DayOfWeek;
}

function getDateWithoutTime(date: Date) {
  return date.toDateString().split("T")[0];
}
