import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { DateTime } from 'luxon';

import {
  getNextOpeningDates,
  getTimespanRange,
} from '@weco/content-api/src/controllers/utils';
import { isNotUndefined } from '@weco/content-api/src/helpers';

import {
  MockEvent,
  mockEventsForMonthlyAugust,
  mockEventsForMonthlySeptember,
  mockEventsForPastAndFuture,
  mockEventsForThisMonth,
  mockEventsForThisWeek,
  mockEventsForThisWeekend,
  mockEventsForToday,
} from './fixtures/events';
import {
  exceptionalClosedDays,
  regularOpeningDays,
} from './fixtures/opening-times';

const mockDateNow = (dateToMock: string) => {
  jest.useFakeTimers().setSystemTime(new Date(dateToMock));
};

describe('getNextOpeningDates', () => {
  describe('when London is in UTC', () => {
    it('start the dateList from today', () => {
      mockDateNow('2024-03-12T10:00:00.000Z');

      const expectedStart = {
        open: '2024-03-12T10:00:00.000Z',
        close: '2024-03-12T18:00:00.000Z',
      };

      expect(getNextOpeningDates(regularOpeningDays, [])[0]).toEqual(
        expectedStart
      );
    });

    it('works when there are no upcoming exceptional closures', () => {
      mockDateNow('2024-03-12T10:00:00.000Z');

      const expectedNextOpeningDates = [
        { open: '2024-03-12T10:00:00.000Z', close: '2024-03-12T18:00:00.000Z' },
        { open: '2024-03-13T10:00:00.000Z', close: '2024-03-13T18:00:00.000Z' },
        { open: '2024-03-14T10:00:00.000Z', close: '2024-03-14T20:00:00.000Z' },
        { open: '2024-03-15T10:00:00.000Z', close: '2024-03-15T18:00:00.000Z' },
        { open: '2024-03-16T10:00:00.000Z', close: '2024-03-16T16:00:00.000Z' },
        { open: '2024-03-18T10:00:00.000Z', close: '2024-03-18T18:00:00.000Z' },
        { open: '2024-03-19T10:00:00.000Z', close: '2024-03-19T18:00:00.000Z' },
        { open: '2024-03-20T10:00:00.000Z', close: '2024-03-20T18:00:00.000Z' },
        { open: '2024-03-21T10:00:00.000Z', close: '2024-03-21T20:00:00.000Z' },
        { open: '2024-03-22T10:00:00.000Z', close: '2024-03-22T18:00:00.000Z' },
        { open: '2024-03-23T10:00:00.000Z', close: '2024-03-23T16:00:00.000Z' },
        { open: '2024-03-25T10:00:00.000Z', close: '2024-03-25T18:00:00.000Z' },
        { open: '2024-03-26T10:00:00.000Z', close: '2024-03-26T18:00:00.000Z' },
        { open: '2024-03-27T10:00:00.000Z', close: '2024-03-27T18:00:00.000Z' },
        { open: '2024-03-28T10:00:00.000Z', close: '2024-03-28T20:00:00.000Z' },
      ];

      expect(
        getNextOpeningDates(regularOpeningDays, []).slice(0, 15)
      ).toStrictEqual(expectedNextOpeningDates);
    });

    it('correctly removes exceptional closures', () => {
      mockDateNow('2024-03-12T10:00:00.000Z');

      const expectedNextOpeningDates = [
        { open: '2024-03-12T10:00:00.000Z', close: '2024-03-12T18:00:00.000Z' },
        { open: '2024-03-13T10:00:00.000Z', close: '2024-03-13T18:00:00.000Z' },
        { open: '2024-03-14T10:00:00.000Z', close: '2024-03-14T20:00:00.000Z' },
        { open: '2024-03-15T10:00:00.000Z', close: '2024-03-15T18:00:00.000Z' },
        { open: '2024-03-16T10:00:00.000Z', close: '2024-03-16T16:00:00.000Z' },
        { open: '2024-03-18T10:00:00.000Z', close: '2024-03-18T18:00:00.000Z' },
        { open: '2024-03-19T10:00:00.000Z', close: '2024-03-19T18:00:00.000Z' },
        { open: '2024-03-20T10:00:00.000Z', close: '2024-03-20T18:00:00.000Z' },
        { open: '2024-03-21T10:00:00.000Z', close: '2024-03-21T20:00:00.000Z' },
        { open: '2024-03-22T10:00:00.000Z', close: '2024-03-22T18:00:00.000Z' },
        { open: '2024-03-23T10:00:00.000Z', close: '2024-03-23T16:00:00.000Z' },
        { open: '2024-03-25T10:00:00.000Z', close: '2024-03-25T18:00:00.000Z' },
        { open: '2024-03-26T10:00:00.000Z', close: '2024-03-26T18:00:00.000Z' },
        { open: '2024-03-27T10:00:00.000Z', close: '2024-03-27T18:00:00.000Z' },
        { open: '2024-03-29T10:00:00.000Z', close: '2024-03-29T18:00:00.000Z' },
      ];

      expect(
        getNextOpeningDates(regularOpeningDays, exceptionalClosedDays).slice(
          0,
          15
        )
      ).toStrictEqual(expectedNextOpeningDates);
    });
  });

  describe("when it's British Summer Time", () => {
    it('start the dateList from today', () => {
      mockDateNow('2024-07-23T10:00:00.000Z');

      const expectedStart = {
        open: '2024-07-23T09:00:00.000Z',
        close: '2024-07-23T17:00:00.000Z',
      };

      expect(getNextOpeningDates(regularOpeningDays, [])[0]).toEqual(
        expectedStart
      );
    });

    it('works when there are no upcoming exceptional closures', () => {
      mockDateNow('2024-07-23T10:00:00.000Z');

      const expectedNextOpeningDates = [
        { open: '2024-07-23T09:00:00.000Z', close: '2024-07-23T17:00:00.000Z' },
        { open: '2024-07-24T09:00:00.000Z', close: '2024-07-24T17:00:00.000Z' },
        { open: '2024-07-25T09:00:00.000Z', close: '2024-07-25T19:00:00.000Z' },
        { open: '2024-07-26T09:00:00.000Z', close: '2024-07-26T17:00:00.000Z' },
        { open: '2024-07-27T09:00:00.000Z', close: '2024-07-27T15:00:00.000Z' },
        { open: '2024-07-29T09:00:00.000Z', close: '2024-07-29T17:00:00.000Z' },
        { open: '2024-07-30T09:00:00.000Z', close: '2024-07-30T17:00:00.000Z' },
        { open: '2024-07-31T09:00:00.000Z', close: '2024-07-31T17:00:00.000Z' },
        { open: '2024-08-01T09:00:00.000Z', close: '2024-08-01T19:00:00.000Z' },
        { open: '2024-08-02T09:00:00.000Z', close: '2024-08-02T17:00:00.000Z' },
        { open: '2024-08-03T09:00:00.000Z', close: '2024-08-03T15:00:00.000Z' },
        { open: '2024-08-05T09:00:00.000Z', close: '2024-08-05T17:00:00.000Z' },
        { open: '2024-08-06T09:00:00.000Z', close: '2024-08-06T17:00:00.000Z' },
        { open: '2024-08-07T09:00:00.000Z', close: '2024-08-07T17:00:00.000Z' },
        { open: '2024-08-08T09:00:00.000Z', close: '2024-08-08T19:00:00.000Z' },
      ];

      expect(
        getNextOpeningDates(regularOpeningDays, []).slice(0, 15)
      ).toStrictEqual(expectedNextOpeningDates);
    });

    it('correctly removes exceptional closures', () => {
      mockDateNow('2024-07-23T10:00:00.000Z');

      const expectedNextOpeningDates = [
        { open: '2024-07-23T09:00:00.000Z', close: '2024-07-23T17:00:00.000Z' },
        { open: '2024-07-24T09:00:00.000Z', close: '2024-07-24T17:00:00.000Z' },
        { open: '2024-07-25T09:00:00.000Z', close: '2024-07-25T19:00:00.000Z' },
        { open: '2024-07-26T09:00:00.000Z', close: '2024-07-26T17:00:00.000Z' },
        { open: '2024-07-27T09:00:00.000Z', close: '2024-07-27T15:00:00.000Z' },
        { open: '2024-07-30T09:00:00.000Z', close: '2024-07-30T17:00:00.000Z' },
        { open: '2024-07-31T09:00:00.000Z', close: '2024-07-31T17:00:00.000Z' },
        { open: '2024-08-01T09:00:00.000Z', close: '2024-08-01T19:00:00.000Z' },
        { open: '2024-08-02T09:00:00.000Z', close: '2024-08-02T17:00:00.000Z' },
        { open: '2024-08-03T09:00:00.000Z', close: '2024-08-03T15:00:00.000Z' },
        { open: '2024-08-05T09:00:00.000Z', close: '2024-08-05T17:00:00.000Z' },
        { open: '2024-08-06T09:00:00.000Z', close: '2024-08-06T17:00:00.000Z' },
        { open: '2024-08-07T09:00:00.000Z', close: '2024-08-07T17:00:00.000Z' },
        { open: '2024-08-08T09:00:00.000Z', close: '2024-08-08T19:00:00.000Z' },
        { open: '2024-08-09T09:00:00.000Z', close: '2024-08-09T17:00:00.000Z' },
      ];

      expect(
        getNextOpeningDates(regularOpeningDays, exceptionalClosedDays).slice(
          0,
          15
        )
      ).toStrictEqual(expectedNextOpeningDates);
    });

    it('works between midnight and 1am BST', () => {
      // the day name for "2024-07-23T00:30:00+01:00" is different whether we're in UTC or BST
      // this tests that Sunday is not mistaken for Monday
      mockDateNow('2024-07-23T00:30:00+01:00');
      const expectedNextOpeningDates = [
        { open: '2024-07-23T09:00:00.000Z', close: '2024-07-23T17:00:00.000Z' },
        { open: '2024-07-24T09:00:00.000Z', close: '2024-07-24T17:00:00.000Z' },
        { open: '2024-07-25T09:00:00.000Z', close: '2024-07-25T19:00:00.000Z' },
        { open: '2024-07-26T09:00:00.000Z', close: '2024-07-26T17:00:00.000Z' },
        { open: '2024-07-27T09:00:00.000Z', close: '2024-07-27T15:00:00.000Z' },
        { open: '2024-07-30T09:00:00.000Z', close: '2024-07-30T17:00:00.000Z' },
        { open: '2024-07-31T09:00:00.000Z', close: '2024-07-31T17:00:00.000Z' },
        { open: '2024-08-01T09:00:00.000Z', close: '2024-08-01T19:00:00.000Z' },
        { open: '2024-08-02T09:00:00.000Z', close: '2024-08-02T17:00:00.000Z' },
        { open: '2024-08-03T09:00:00.000Z', close: '2024-08-03T15:00:00.000Z' },
        { open: '2024-08-05T09:00:00.000Z', close: '2024-08-05T17:00:00.000Z' },
        { open: '2024-08-06T09:00:00.000Z', close: '2024-08-06T17:00:00.000Z' },
        { open: '2024-08-07T09:00:00.000Z', close: '2024-08-07T17:00:00.000Z' },
        { open: '2024-08-08T09:00:00.000Z', close: '2024-08-08T19:00:00.000Z' },
        { open: '2024-08-09T09:00:00.000Z', close: '2024-08-09T17:00:00.000Z' },
      ];

      expect(
        getNextOpeningDates(regularOpeningDays, exceptionalClosedDays).slice(
          0,
          15
        )
      ).toStrictEqual(expectedNextOpeningDates);
    });
  });
});

type CT = 'lte' | 'lt' | 'gt' | 'gte';
type TimeCompare = {
  [key in CT]?: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const getMatchingMockEvents = ({
  now,
  query,
  mockEvents,
}: {
  now: DateTime;
  query?: QueryDslQueryContainer[];
  mockEvents: MockEvent[];
}) => {
  if (!query) return mockEvents.map(me => me.title);

  // Change Elasticsearch's "date math" into something we can use to compare
  const transformQuery = (): { start: any; end: any } => {
    const nowTimesReplacedQuery = JSON.parse(
      JSON.stringify(query)
        .replaceAll('now/d', String(now.endOf('day')))
        .replaceAll('now', String(now))
    );

    // Flatten the query into only what we need: a start and an end filter
    const mergedQueries: { start: any; end: any } = {
      start: undefined,
      end: undefined,
    };
    nowTimesReplacedQuery.forEach(
      (q: { range: { [x: string]: TimeCompare[] | undefined } }) => {
        if (q.range?.['filter.times.startDateTime'])
          mergedQueries.start = q.range?.['filter.times.startDateTime'];
        if (q.range?.['filter.times.endDateTime'])
          mergedQueries.end = q.range?.['filter.times.endDateTime'];
      }
    );

    return mergedQueries;
  };

  const transformedQuery = transformQuery();

  // Compare mock events' times' against the filters. A single event may have more than one time.
  return mockEvents
    .map(mockEvent => {
      const isMatch = !!mockEvent.times?.find(time => {
        const timeStartDate = new Date(time.startDateTime);
        const timeEndDate = time.endDateTime
          ? new Date(time.endDateTime)
          : false;

        return (
          (transformedQuery.start?.lte
            ? timeStartDate <= new Date(transformedQuery.start?.lte)
            : true) &&
          (transformedQuery.start?.lt
            ? timeStartDate < new Date(transformedQuery.start?.lt)
            : true) &&
          (transformedQuery.start?.gt
            ? timeStartDate > new Date(transformedQuery.start?.gt)
            : true) &&
          (transformedQuery.start?.gte
            ? timeStartDate >= new Date(transformedQuery.start?.gte)
            : true) &&
          (time.endDateTime
            ? (transformedQuery.end?.lte
                ? timeEndDate <= new Date(transformedQuery.end?.lte)
                : true) &&
              (transformedQuery.end?.lt
                ? timeEndDate < new Date(transformedQuery.end?.lt)
                : true) &&
              (transformedQuery.end?.gt
                ? timeEndDate > new Date(transformedQuery.end?.gt)
                : true) &&
              (transformedQuery.end?.gte
                ? timeEndDate >= new Date(transformedQuery.end?.gte)
                : true)
            : true)
        );
      });

      return isMatch ? mockEvent.title : undefined;
    })
    .filter(isNotUndefined)
    .sort();
};

//
//    September 2022
// Su Mo Tu We Th Fr Sa
//              1  2  3
//  4  5  6  7  8  9 10
// 11 12 13 14 15 16 17
// 18 19 20 21 22 23 24
//
describe('getTimespanRange', () => {
  describe(`Today: returns today's events that are ongoing or upcoming at the time of the request`, () => {
    it(`Time of request is 05/09/22, 2pm.`, () => {
      mockDateNow('2022-09-05T15:00:00.000+01:00');

      const matches = getMatchingMockEvents({
        now: DateTime.fromJSDate(new Date()),
        query: getTimespanRange('today'),
        mockEvents: mockEventsForToday,
      });

      expect(matches).toEqual(
        [
          'May to September exhibition',
          'Permanent exhibition from May 2022 with mock end time',
          'Today, 1-3pm',
          'Today, 4-5pm',
        ].sort()
      );

      expect(
        matches.some(m =>
          ['Yesterday, 8-10am', 'Today, 8-10am', 'Tomorrow, 8-10am'].includes(m)
        )
      ).toBeFalse();
    });
  });

  describe('This weekend', () => {
    it(`Time of request is 05/09/22, 2pm, returns next weekend`, () => {
      mockDateNow('2022-09-05T15:00:00.000+01:00');

      const matches = getMatchingMockEvents({
        now: DateTime.fromJSDate(new Date()),
        query: getTimespanRange('this-weekend'),
        mockEvents: mockEventsForThisWeekend,
      });

      expect(matches).toEqual(
        [
          'May to September exhibition',
          'Permanent exhibition from May 2022 with mock end time',
          'Thursday to Saturday',
          'Friday, 5pm',
          'Saturday, 8-10am',
          'Sunday, 12-4pm',
          'Sunday to Monday',
        ].sort()
      );

      expect(
        matches.some(m => ['Friday, 4pm', 'Next Monday, 8-10am'].includes(m))
      ).toBeFalse();
    });

    it(`Time of request is 10/09/22 (Saturday) 2pm, returns only upcoming results until end of day Sunday`, () => {
      mockDateNow('2022-09-10T15:00:00.000+01:00');

      const matches = getMatchingMockEvents({
        now: DateTime.fromJSDate(new Date()),
        query: getTimespanRange('this-weekend'),
        mockEvents: mockEventsForThisWeekend,
      });

      expect(matches).toEqual(
        [
          'May to September exhibition',
          'Permanent exhibition from May 2022 with mock end time',
          'Thursday to Saturday',
          'Sunday, 12-4pm',
          'Sunday to Monday',
        ].sort()
      );

      expect(
        matches.some(m =>
          [
            'Friday, 4pm',
            'Friday, 5pm',
            'Saturday, 8-10am',
            'Next Monday, 8-10am',
          ].includes(m)
        )
      ).toBeFalse();
    });

    it(`Time of request is 11/09/22 (Sunday) 23:59, still returns upcoming from current weekend`, () => {
      mockDateNow('2022-09-11T22:59:00.000+01:00');

      const matches = getMatchingMockEvents({
        now: DateTime.fromJSDate(new Date()),
        query: getTimespanRange('this-weekend'),
        mockEvents: mockEventsForThisWeekend,
      });

      expect(matches).toEqual(
        [
          'May to September exhibition',
          'Permanent exhibition from May 2022 with mock end time',
          'Sunday to Monday',
        ].sort()
      );

      expect(
        matches.some(m =>
          [
            'Friday, 4pm',
            'Friday, 5pm',
            'Saturday, 8-10am',
            'Thursday to Saturday',
            'Sunday, 12-4pm',
            'Next Monday, 8-10am',
          ].includes(m)
        )
      ).toBeFalse();
    });
  });

  describe(`This week: returns events from the next seven days from the time of the request, even if they started in the past and haven't ended yet`, () => {
    it(`Time of request is 05/09/22, 2pm`, () => {
      mockDateNow('2022-09-05T15:00:00.000+01:00');

      const matches = getMatchingMockEvents({
        now: DateTime.fromJSDate(new Date()),
        query: getTimespanRange('this-week'),
        mockEvents: mockEventsForThisWeek,
      });

      expect(matches).toEqual(
        [
          'May to September exhibition',
          'Permanent exhibition from May 2022 with mock end time',
          'Today, 1-3pm',
          'Today, 4-5pm',
        ].sort()
      );

      expect(
        matches.some(m =>
          [
            'Today, 8-10am',
            'Yesterday, 8-10am',
            'Next Monday, 8-10am',
          ].includes(m)
        )
      ).toBeFalse();
    });
  });

  describe('This month: returns events from the time of the request to the end of the named month', () => {
    it(`Time of request is 05/09/22, 2pm.`, () => {
      mockDateNow('2022-09-05T15:00:00.000+01:00');

      const matches = getMatchingMockEvents({
        now: DateTime.fromJSDate(new Date()),
        query: getTimespanRange('this-month'),
        mockEvents: mockEventsForThisMonth,
      });

      expect(matches).toEqual(
        [
          'May to September exhibition',
          'Permanent exhibition from May 2022 with mock end time',
          'Today, 1-3pm',
          'Today, 4-5pm',
          'Repeated event (one every month)',
        ].sort()
      );
      expect(
        matches.some(m =>
          ['Today, 8-10am', 'Yesterday, 8-10am', 'Next month'].includes(m)
        )
      ).toBeFalse();
    });
  });

  describe('Future: returns events that are ongoing or upcoming from the time of the request to infinity', () => {
    it(`Time of request is 05/09/22, 2pm.`, () => {
      mockDateNow('2022-09-05T15:00:00.000+01:00');

      const matches = getMatchingMockEvents({
        now: DateTime.fromJSDate(new Date()),
        query: getTimespanRange('future'),
        mockEvents: mockEventsForPastAndFuture,
      });

      expect(matches).toEqual(
        [
          'May to September exhibition',
          'Permanent exhibition from May 2022 with mock end time',
          'Today, 1-3pm',
          'Today, 4-5pm',
          'Repeated event (one every month)',
        ].sort()
      );

      expect(
        matches.some(m => ['Today, 8-10am', 'Yesterday, 8-10am'].includes(m))
      ).toBeFalse();
    });
  });

  describe('Past: returns events that ended before the time of the request', () => {
    it(`Time of request is 05/09/22, 2pm.`, () => {
      mockDateNow('2022-09-05T15:00:00.000+01:00');

      const matches = getMatchingMockEvents({
        now: DateTime.fromJSDate(new Date()),
        query: getTimespanRange('past'),
        mockEvents: mockEventsForPastAndFuture,
      });

      expect(matches).toEqual(
        [
          'Yesterday, 8-10am',
          'Today, 8-10am',
          'Repeated event (one every month)',
        ].sort()
      );

      expect(
        matches.some(m =>
          [
            'May to September exhibition',
            'Permanent exhibition from May 2022 with mock end time',
            'Today, 4-5pm',
            'Today, 1-3pm',
          ].includes(m)
        )
      ).toBeFalse();
    });
  });

  describe('Monthly: returns events from a named month period that are ongoing or upcoming at the time of the request', () => {
    it(`Time of request is 05/09/22, 2pm.`, () => {
      mockDateNow('2022-09-05T15:00:00.000+01:00');

      const matches = getMatchingMockEvents({
        now: DateTime.fromJSDate(new Date()),
        query: getTimespanRange('september'),
        mockEvents: mockEventsForMonthlySeptember,
      });

      expect(matches).toEqual(
        [
          'May to September exhibition',
          'Permanent exhibition from May 2022 with mock end time',
          'August to September',
          'Today, 1-3pm',
          'Today, 4-5pm',
          'Repeated event (one every month)',
        ].sort()
      );
      expect(
        matches.some(m =>
          ['Yesterday, 8-10am', 'Today, 8-10am', 'Next month'].includes(m)
        )
      ).toBeFalse();
    });

    it('Time of request is 05/09/22, 2pm, so if August is requested, it returns August 2023.', () => {
      mockDateNow('2022-09-05T10:00:00.000+01:00');

      const matches = getMatchingMockEvents({
        now: DateTime.fromJSDate(new Date()),
        query: getTimespanRange('august'),
        mockEvents: mockEventsForMonthlyAugust,
      });

      expect(matches).toEqual(
        [
          'Permanent exhibition from May 2022 with mock end time',
          'June to August 2023',
          'August 2023',
        ].sort()
      );
      expect(
        matches.some(m => ['August 2022', 'September 2023'].includes(m))
      ).toBeFalse();
    });
  });
});
