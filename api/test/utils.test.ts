import {
  getNextOpeningDates,
  getTimespanRange,
} from '@weco/content-api/src/controllers/utils';
import { RegularOpeningDay } from '@weco/content-common/types/venue';

const regularOpeningDays = [
  {
    dayOfWeek: 'monday',
    opens: '10:00',
    closes: '18:00',
    isClosed: false,
  },
  {
    dayOfWeek: 'tuesday',
    opens: '10:00',
    closes: '18:00',
    isClosed: false,
  },
  {
    dayOfWeek: 'wednesday',
    opens: '10:00',
    closes: '18:00',
    isClosed: false,
  },
  {
    dayOfWeek: 'thursday',
    opens: '10:00',
    closes: '20:00',
    isClosed: false,
  },
  {
    dayOfWeek: 'friday',
    opens: '10:00',
    closes: '18:00',
    isClosed: false,
  },
  {
    dayOfWeek: 'saturday',
    opens: '10:00',
    closes: '16:00',
    isClosed: false,
  },
  {
    dayOfWeek: 'sunday',
    opens: '00:00',
    closes: '00:00',
    isClosed: true,
  },
] as RegularOpeningDay[];

const exceptionalClosedDays = [
  {
    overrideDate: '2024-03-28T00:00:00.000Z',
    type: 'Easter',
    startDateTime: '00:00',
    endDateTime: '00:00',
  },
  {
    overrideDate: '2024-03-30T00:00:00.000Z',
    type: 'Easter',
    startDateTime: '00:00',
    endDateTime: '00:00',
  },
  {
    // this is during BST so 2024-03-31T23:00:00.000Z is 2024-04-01T00:00:00.BST
    overrideDate: '2024-03-31T23:00:00.000Z',
    type: 'Easter',
    startDateTime: '00:00',
    endDateTime: '00:00',
  },
  {
    // this is during BST so 2024-07-28T23:00:00.000Z is 2024-07-29T00:00:00.BST
    overrideDate: '2024-07-28T23:00:00.000Z',
    type: 'Summer Bank Holiday',
    startDateTime: '00:00',
    endDateTime: '00:00',
  },
];

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

//
//    September 2022
// Su Mo Tu We Th Fr Sa
//              1  2  3
//  4  5  6  7  8  9 10
// 11 12 13 14 15 16 17
// 18 19 20 21 22 23 24
//
describe('getTimespanRange', () => {
  describe('today', () => {
    it('return events from today that are still ongoing or upcoming at the time of the request', () => {
      mockDateNow('2022-09-05T14:00:00.000Z');

      const expectedRange = JSON.stringify([
        {
          range: {
            'filter.times.startDateTime': {
              lte: 'now/d',
            },
          },
        },
        { range: { 'filter.times.endDateTime': { gt: 'now' } } },
      ]);

      expect(JSON.stringify(getTimespanRange('today'))).toEqual(expectedRange);
    });
  });

  describe('this-weekend', () => {
    it("returns that weeks' weekend", () => {
      mockDateNow('2022-09-05T10:00:00.000Z');

      const expectedRange = JSON.stringify([
        {
          range: {
            'filter.times.startDateTime': {
              gte: '2022-09-09T17:00:00.000+01:00',
              lte: '2022-09-11T23:59:59.999+01:00',
              relation: 'contains',
            },
          },
        },
        { range: { 'filter.times.endDateTime': { gt: 'now' } } },
      ]);

      expect(JSON.stringify(getTimespanRange('this-weekend'))).toEqual(
        expectedRange
      );
    });

    it('if it is the weekend, it returns results that are upcoming at the time of the request', () => {
      mockDateNow('2022-09-10T15:00:00.000Z');

      const expectedRange = JSON.stringify([
        {
          range: {
            'filter.times.startDateTime': {
              gte: 'now',
              lte: '2022-09-11T23:59:59.999+01:00',
              relation: 'contains',
            },
          },
        },
        { range: { 'filter.times.endDateTime': { gt: 'now' } } },
      ]);

      expect(JSON.stringify(getTimespanRange('this-weekend'))).toEqual(
        expectedRange
      );
    });

    it("returns that weeks' weekend until the end of the Sunday", () => {
      mockDateNow('2022-09-11T22:59:00.000Z');

      const expectedRange = JSON.stringify([
        {
          range: {
            'filter.times.startDateTime': {
              gte: 'now',
              lte: '2022-09-11T23:59:59.999+01:00',
              relation: 'contains',
            },
          },
        },
        { range: { 'filter.times.endDateTime': { gt: 'now' } } },
      ]);

      expect(JSON.stringify(getTimespanRange('this-weekend'))).toEqual(
        expectedRange
      );
    });
  });

  describe('this-week', () => {
    it('return events from the next seven days from the time of the request', () => {
      mockDateNow('2022-09-05T10:00:00.000Z');

      const expectedRange = JSON.stringify([
        {
          range: {
            'filter.times.startDateTime': {
              gte: 'now',
              lt: '2022-09-11T23:59:59.999+01:00',
            },
          },
        },
        {
          range: {
            'filter.times.endDateTime': { gt: 'now' },
          },
        },
      ]);

      expect(JSON.stringify(getTimespanRange('this-week'))).toEqual(
        expectedRange
      );
    });
  });

  describe('this-month', () => {
    it('return events from the time of the request to the end of the named month', () => {
      mockDateNow('2022-09-05T10:00:00.000Z');

      const expectedRange = JSON.stringify([
        {
          range: {
            'filter.times.startDateTime': {
              gte: 'now',
              lte: '2022-09-30T23:59:59.999+01:00',
            },
          },
        },
        {
          range: {
            'filter.times.endDateTime': { gt: 'now' },
          },
        },
      ]);

      expect(JSON.stringify(getTimespanRange('this-month'))).toEqual(
        expectedRange
      );
    });
  });

  describe('future', () => {
    it('return events from the time of the request to infinity', () => {
      mockDateNow('2022-09-05T10:00:00.000Z');

      const expectedRange = JSON.stringify([
        {
          range: {
            'filter.times.startDateTime': {
              gte: 'now',
            },
          },
        },
      ]);

      expect(JSON.stringify(getTimespanRange('future'))).toEqual(expectedRange);
    });
  });

  describe('past', () => {
    it('return events that ended before the time of the request', () => {
      mockDateNow('2022-09-05T10:00:00.000Z');

      const expectedRange = JSON.stringify([
        {
          range: {
            'filter.times.endDateTime': {
              lt: 'now',
            },
          },
        },
      ]);

      expect(JSON.stringify(getTimespanRange('past'))).toEqual(expectedRange);
    });
  });

  describe('monthly', () => {
    it('returns events from an entire named month', () => {
      mockDateNow('2022-09-05T10:00:00.000Z');

      const expectedRange = JSON.stringify([
        {
          range: {
            'filter.times.startDateTime': {
              gte: '2022-10-01T00:00:00.000+01:00',
              lte: '2022-10-31T23:59:59.999+00:00',
            },
          },
        },
      ]);

      expect(JSON.stringify(getTimespanRange('october'))).toEqual(
        expectedRange
      );
    });

    it('returns events from the future only, so the year changes if a past month is requested', () => {
      mockDateNow('2022-09-05T10:00:00.000Z');

      const expectedRange = JSON.stringify([
        {
          range: {
            'filter.times.startDateTime': {
              gte: '2023-08-01T00:00:00.000+01:00',
              lte: '2023-08-31T23:59:59.999+01:00',
            },
          },
        },
      ]);

      expect(JSON.stringify(getTimespanRange('august'))).toEqual(expectedRange);
    });

    it('returns events from the next year if requested around the end of it', () => {
      mockDateNow('2022-11-30T10:00:00.000Z');

      const expectedJanuaryRange = JSON.stringify([
        {
          range: {
            'filter.times.startDateTime': {
              gte: '2023-01-01T00:00:00.000+00:00',
              lte: '2023-01-31T23:59:59.999+00:00',
            },
          },
        },
      ]);

      expect(JSON.stringify(getTimespanRange('january'))).toEqual(
        expectedJanuaryRange
      );

      const expectedDecemberRange = JSON.stringify([
        {
          range: {
            'filter.times.startDateTime': {
              gte: '2022-12-01T00:00:00.000+00:00',
              lte: '2022-12-31T23:59:59.999+00:00',
            },
          },
        },
      ]);

      expect(JSON.stringify(getTimespanRange('december'))).toEqual(
        expectedDecemberRange
      );
    });

    it('if it is the current month, returns events starting at the time of the request until the end of the month', () => {
      mockDateNow('2022-09-05T10:00:00.000Z');

      const expectedRange = JSON.stringify([
        {
          range: {
            'filter.times.startDateTime': {
              gte: 'now',
              lte: '2022-09-30T23:59:59.999+01:00',
            },
          },
        },
      ]);

      expect(JSON.stringify(getTimespanRange('september'))).toEqual(
        expectedRange
      );
    });
  });
});
