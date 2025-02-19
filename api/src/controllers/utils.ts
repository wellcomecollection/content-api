import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { DateTime } from 'luxon';

import { MONTHS, Timespan } from '@weco/content-api/src/controllers/events';
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

// TODO
// review lt and gt vs lte and gte
// review where should use end date vs start date
// review the sorting order, it's opposite from what's on?
// review relation param
export const getTimespanRange = (
  timespan: Timespan
): QueryDslQueryContainer[] | undefined => {
  const now = DateTime.local({ zone: 'Europe/London' });

  switch (timespan) {
    // Start date: less than end of today
    // End date: greater than now
    case 'today':
      return [
        {
          range: {
            'filter.times.startDateTime': {
              lte: 'now/d',
            },
          },
        },
        {
          range: {
            'filter.times.endDateTime': {
              gt: 'now',
            },
          },
        },
      ];

    // FRIDAY 5pm - SUNDAY
    case 'this-weekend': {
      const friday5PM = now
        .startOf('week')
        .plus({ days: 4 })
        .plus({ hours: 17 });

      const isNowWeekend = now > friday5PM;

      return [
        {
          range: {
            'filter.times.startDateTime': {
              gte: isNowWeekend ? 'now' : friday5PM, // Friday 5pm or NOW
              lte: now.startOf('week').plus({ days: 6 }).endOf('day'), // Sunday
            },
          },
        },
        {
          range: {
            'filter.times.endDateTime': {
              lt: 'now',
            },
          },
        },
      ];
    }

    case 'this-week':
      return [
        {
          range: {
            'filter.times.startDateTime': {
              gte: 'now',
              lt: now.plus({ days: 6 }).endOf('day'),
            },
          },
        },
        {
          range: {
            'filter.times.endDateTime': {
              gt: 'now',
            },
          },
        },
      ];

    case 'this-month':
      return [
        {
          range: {
            'filter.times.startDateTime': {
              gte: 'now',
              lte: now.endOf('month').toISO(),
            },
          },
        },
        {
          range: {
            'filter.times.endDateTime': {
              gt: 'now',
            },
          },
        },
      ];

    case 'future':
      return [
        {
          range: {
            'filter.times.startDateTime': {
              gte: 'now',
            },
          },
        },
      ];

    case 'past':
      return [
        {
          range: {
            'filter.times.endDateTime': {
              lt: 'now',
            },
          },
        },
      ];

    case 'january':
    case 'february':
    case 'march':
    case 'april':
    case 'may':
    case 'june':
    case 'july':
    case 'august':
    case 'september':
    case 'october':
    case 'november':
    case 'december': {
      const monthNumber = MONTHS.indexOf(timespan) + 1;
      const isInPast = now.month > monthNumber;
      const isCurrentMonth = now.month === monthNumber;

      const startOfMonth = DateTime.local(
        now.year + (isInPast ? 1 : 0),
        monthNumber
      );
      const endOfMonth = startOfMonth.endOf('month');

      console.log({ isCurrentMonth, now, startOfMonth });

      return [
        {
          range: {
            'filter.times.startDateTime': {
              gte: isCurrentMonth ? 'now' : startOfMonth,
              lte: endOfMonth,
            },
          },
        },
      ];
    }
  }
};
