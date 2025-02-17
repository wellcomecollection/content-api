import {
  Field,
  QueryDslRangeQuery,
} from '@elastic/elasticsearch/lib/api/types';
import { DateTime } from 'luxon';

import { MONTHS, Timespan } from '@weco/content-api/src/controllers/events';

// TODO
// change query.times.startDateTime to filter.times.startDateTim and filter.times.endDateTime
// review lt and gt vs lte and gte
// review where should use end date vs start date
// review the sorting order, it's opposite from what's on?
// review relation param
export const getTimespanRange = (
  timespan: Timespan
): Partial<Record<Field, QueryDslRangeQuery>> | undefined => {
  const now = DateTime.local({ zone: 'Europe/London' });

  switch (timespan) {
    case 'today':
      // TODO https://github.com/wellcomecollection/content-api/issues/130#issuecomment-2656772912
      return {
        'query.times.startDateTime': {
          gte: 'now',
          lte: now.endOf('day').toISO(),
        },
      };

    // FRIDAY 5pm - SUNDAY
    // Maybe we want to pass in a different relation here? within or contain?
    // TODO will this return Friday results still if it's Saturday? "Now" isn't being used
    case 'this-weekend':
      return {
        'query.times.startDateTime': {
          gte: now.startOf('week').plus({ days: 4 }).plus({ hours: 17 }), // Friday 5pm
          lte: now.startOf('week').plus({ days: 6 }).endOf('day'), // Sunday
        },
      };

    case 'this-week':
      return {
        'query.times.startDateTime': {
          gte: 'now',
          lt: now.plus({ days: 7 }).endOf('day'),
        },
      };

    case 'this-month':
      return {
        'query.times.startDateTime': {
          gte: 'now',
          lte: now.endOf('month').toISO(),
        },
      };

    case 'future':
      return {
        'query.times.startDateTime': {
          gte: 'now',
        },
      };

    case 'past':
      return {
        'query.times.startDateTime': {
          lt: 'now',
        },
      };

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
      const startOfMonth = DateTime.local(now.year, monthNumber);
      const endOfMonth = startOfMonth.endOf('month');

      return {
        'query.times.startDateTime': {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      };
    }
  }
};
