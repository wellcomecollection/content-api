import { DateTime } from 'luxon';

import {
  DayOfWeek,
  ExceptionalClosedDay,
  NextOpeningDate,
  RegularOpeningDay,
} from '@weco/content-common/types/venue';

export function getNextOpeningDates(
  regularOpeningDays: RegularOpeningDay[],
  exceptionalClosedDays: ExceptionalClosedDay[]
): NextOpeningDate[] {
  // create a dateList of 50 consecutive days starting today
  // 50 is somewhat arbitrary,
  // we just need to have at least 12 once all the closed days and/or delivery time have been removed
  const dateNow = new Date();
  const dateList = [...Array(50).keys()].map(day => addDays(dateNow, day));

  // day(s) of the week when the venue is normally closed, as ["monday", "sunday", ...]
  const regularClosedDays = regularOpeningDays
    .filter(day => day.isClosed)
    .map(day => day.dayOfWeek);

  // format exceptionalClosedDates as DD/MM/YYYY for easy comparison later
  const exceptionalClosedDates = exceptionalClosedDays.map(
    date => date.overrideDate && getDateWithoutTime(new Date(date.overrideDate))
  );

  // remove regular closed days from our dateList
  const upcomingRegularOpenDays = dateList.filter(
    date => !regularClosedDays.includes(getDayName(date))
  );

  // now remove exceptional closed days from the above filtered list
  const upcomingOpenDays = upcomingRegularOpenDays.filter(
    date => !exceptionalClosedDates.includes(getDateWithoutTime(date))
  );

  // we only care about dates until now, when we add opening times/hours
  return addOpeningHours(upcomingOpenDays, regularOpeningDays);
}

function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  return new Date(newDate.setDate(date.getDate() + days));
}

function getDayName(date: Date) {
  return date
    .toLocaleString('en-gb', { weekday: 'long', timeZone: 'Europe/London' })
    .toLowerCase() as DayOfWeek;
}

// format date as DD/MM/YYYY
// Prismic overrideDates are timestamps for midnight in London on the day of closure but converted to UTC
// that means overrideDate of 2024-03-31T23:00:00.000Z actually means the venue is closed on 2024-04-01
// we force the zone to Europe/London so as to get the correct day
function getDateWithoutTime(date: Date): string {
  return DateTime.fromJSDate(date).setZone('Europe/London').toLocaleString();
}

function addOpeningHours(
  upcomingOpenDays: Date[],
  regularOpeningDays: RegularOpeningDay[]
): NextOpeningDate[] {
  return upcomingOpenDays.map(date => {
    const regularOpeningDay = regularOpeningDays.find(
      day => day.dayOfWeek === getDayName(date)
    );
    const openingHour = regularOpeningDay?.opens
      ? regularOpeningDay.opens
      : '00:00';
    const closingHour = regularOpeningDay?.closes
      ? regularOpeningDay.closes
      : '00:00';

    return {
      open: setHourAndMinute(date, openingHour),
      close: setHourAndMinute(date, closingHour),
    };
  });
}

// regular opening hours are expressed as a string "HH:mm", with no notion of timezone or DST
// we need to explicitly set the timezone to Europe/London before setting the hours and minute for the nextOpeningDates
function setHourAndMinute(date: Date, time: string): string | undefined {
  const dateInLondonTimezone =
    DateTime.fromJSDate(date).setZone('Europe/London');
  const withHourAndMinute = dateInLondonTimezone.set({
    hour: Number(time.split(':')[0]),
    minute: Number(time.split(':')[1]),
    second: 0,
    millisecond: 0,
  });
  // time is set in London, we can now convert back to UTC ISO string
  return withHourAndMinute.toUTC().toISO() || undefined;
}
