import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { DateTime } from 'luxon';

import { MONTHS, Timespan } from '@weco/content-api/src/controllers/events';

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
    case 'today':
      return [
        {
          range: {
            'filter.times.startDateTime': {
              gte: 'now',
              lte: 'now/d',
            },
          },
        },
        {
          range: {
            'filter.times.endDateTime': {
              lt: 'now/d',
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
