import { DateTime } from "luxon";
import {
  DayOfWeek,
  DisplayRegularOpeningDay,
  DisplayExceptionalClosedDay,
} from "@weco/content-common/types/venue";

type NextOpeningDate = {
  open: string | undefined;
  close: string | undefined;
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
    .map((date) => date.overrideDate && new Date(date.overrideDate))
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
  return date
    .toLocaleString("en-gb", { weekday: "long" })
    .toLowerCase() as DayOfWeek;
}

function getDateWithoutTime(date: Date): string {
  return DateTime.fromJSDate(date).setZone("Europe/London").toLocaleString();
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
