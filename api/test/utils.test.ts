import { getNextOpeningDates } from "../src/controllers/utils";
import { RegularOpeningDay } from "@weco/content-common/types/venue";

const regularOpeningDays = [
  {
    dayOfWeek: "monday",
    opens: "10:00",
    closes: "18:00",
    isClosed: false,
  },
  {
    dayOfWeek: "tuesday",
    opens: "10:00",
    closes: "18:00",
    isClosed: false,
  },
  {
    dayOfWeek: "wednesday",
    opens: "10:00",
    closes: "18:00",
    isClosed: false,
  },
  {
    dayOfWeek: "thursday",
    opens: "10:00",
    closes: "20:00",
    isClosed: false,
  },
  {
    dayOfWeek: "friday",
    opens: "10:00",
    closes: "18:00",
    isClosed: false,
  },
  {
    dayOfWeek: "saturday",
    opens: "10:00",
    closes: "16:00",
    isClosed: false,
  },
  {
    dayOfWeek: "sunday",
    opens: "00:00",
    closes: "00:00",
    isClosed: true,
  },
] as RegularOpeningDay[];

const exceptionalClosedDays = [
  {
    overrideDate: "2024-03-28T00:00:00.000Z",
    type: "Easter",
    startDateTime: "00:00",
    endDateTime: "00:00",
  },
  {
    overrideDate: "2024-03-30T00:00:00.000Z",
    type: "Easter",
    startDateTime: "00:00",
    endDateTime: "00:00",
  },
  {
    // this is during BST so 2024-03-31T23:00:00.000Z is 2024-04-01T00:00:00.BST
    overrideDate: "2024-03-31T23:00:00.000Z",
    type: "Easter",
    startDateTime: "00:00",
    endDateTime: "00:00",
  },
  {
    // this is during BST so 2024-07-28T23:00:00.000Z is 2024-07-29T00:00:00.BST
    overrideDate: "2024-07-28T23:00:00.000Z",
    type: "Summer Bank Holiday",
    startDateTime: "00:00",
    endDateTime: "00:00",
  },
];

const mockDateNow = (dateToMock: string) => {
  jest.useFakeTimers().setSystemTime(new Date(dateToMock));
};

describe("getNextOpeningDates", () => {
  describe("when London is in UTC", () => {
    it("start the dateList from today", () => {
      mockDateNow("2024-03-12T10:00:00.000Z");

      const expectedStart = {
        open: "2024-03-12T10:00:00.000Z",
        close: "2024-03-12T18:00:00.000Z",
      };

      expect(getNextOpeningDates(regularOpeningDays, [])[0]).toEqual(
        expectedStart
      );
    });

    it("works when there are no upcoming exceptional closures", () => {
      mockDateNow("2024-03-12T10:00:00.000Z");

      const expectedNextOpeningDates = [
        { open: "2024-03-12T10:00:00.000Z", close: "2024-03-12T18:00:00.000Z" },
        { open: "2024-03-13T10:00:00.000Z", close: "2024-03-13T18:00:00.000Z" },
        { open: "2024-03-14T10:00:00.000Z", close: "2024-03-14T20:00:00.000Z" },
        { open: "2024-03-15T10:00:00.000Z", close: "2024-03-15T18:00:00.000Z" },
        { open: "2024-03-16T10:00:00.000Z", close: "2024-03-16T16:00:00.000Z" },
        { open: "2024-03-18T10:00:00.000Z", close: "2024-03-18T18:00:00.000Z" },
        { open: "2024-03-19T10:00:00.000Z", close: "2024-03-19T18:00:00.000Z" },
        { open: "2024-03-20T10:00:00.000Z", close: "2024-03-20T18:00:00.000Z" },
        { open: "2024-03-21T10:00:00.000Z", close: "2024-03-21T20:00:00.000Z" },
        { open: "2024-03-22T10:00:00.000Z", close: "2024-03-22T18:00:00.000Z" },
        { open: "2024-03-23T10:00:00.000Z", close: "2024-03-23T16:00:00.000Z" },
        { open: "2024-03-25T10:00:00.000Z", close: "2024-03-25T18:00:00.000Z" },
        { open: "2024-03-26T10:00:00.000Z", close: "2024-03-26T18:00:00.000Z" },
        { open: "2024-03-27T10:00:00.000Z", close: "2024-03-27T18:00:00.000Z" },
        { open: "2024-03-28T10:00:00.000Z", close: "2024-03-28T20:00:00.000Z" },
        { open: "2024-03-29T10:00:00.000Z", close: "2024-03-29T18:00:00.000Z" },
        { open: "2024-03-30T10:00:00.000Z", close: "2024-03-30T16:00:00.000Z" },
        { open: "2024-04-01T09:00:00.000Z", close: "2024-04-01T17:00:00.000Z" },
      ];

      expect(getNextOpeningDates(regularOpeningDays, [])).toStrictEqual(
        expectedNextOpeningDates
      );
    });

    it("correctly removes exceptional closures", () => {
      mockDateNow("2024-03-12T10:00:00.000Z");

      const expectedNextOpeningDates = [
        { open: "2024-03-12T10:00:00.000Z", close: "2024-03-12T18:00:00.000Z" },
        { open: "2024-03-13T10:00:00.000Z", close: "2024-03-13T18:00:00.000Z" },
        { open: "2024-03-14T10:00:00.000Z", close: "2024-03-14T20:00:00.000Z" },
        { open: "2024-03-15T10:00:00.000Z", close: "2024-03-15T18:00:00.000Z" },
        { open: "2024-03-16T10:00:00.000Z", close: "2024-03-16T16:00:00.000Z" },
        { open: "2024-03-18T10:00:00.000Z", close: "2024-03-18T18:00:00.000Z" },
        { open: "2024-03-19T10:00:00.000Z", close: "2024-03-19T18:00:00.000Z" },
        { open: "2024-03-20T10:00:00.000Z", close: "2024-03-20T18:00:00.000Z" },
        { open: "2024-03-21T10:00:00.000Z", close: "2024-03-21T20:00:00.000Z" },
        { open: "2024-03-22T10:00:00.000Z", close: "2024-03-22T18:00:00.000Z" },
        { open: "2024-03-23T10:00:00.000Z", close: "2024-03-23T16:00:00.000Z" },
        { open: "2024-03-25T10:00:00.000Z", close: "2024-03-25T18:00:00.000Z" },
        { open: "2024-03-26T10:00:00.000Z", close: "2024-03-26T18:00:00.000Z" },
        { open: "2024-03-27T10:00:00.000Z", close: "2024-03-27T18:00:00.000Z" },
        { open: "2024-03-29T10:00:00.000Z", close: "2024-03-29T18:00:00.000Z" },
      ];

      expect(
        getNextOpeningDates(regularOpeningDays, exceptionalClosedDays)
      ).toStrictEqual(expectedNextOpeningDates);
    });
  });

  describe("when it's British Summer Time", () => {
    it("start the dateList from today", () => {
      mockDateNow("2024-07-23T10:00:00.000Z");

      const expectedStart = {
        open: "2024-07-23T09:00:00.000Z",
        close: "2024-07-23T17:00:00.000Z",
      };

      expect(getNextOpeningDates(regularOpeningDays, [])[0]).toEqual(
        expectedStart
      );
    });

    it("works when there are no upcoming exceptional closures", () => {
      mockDateNow("2024-07-23T10:00:00.000Z");

      const expectedNextOpeningDates = [
        { open: "2024-07-23T09:00:00.000Z", close: "2024-07-23T17:00:00.000Z" },
        { open: "2024-07-24T09:00:00.000Z", close: "2024-07-24T17:00:00.000Z" },
        { open: "2024-07-25T09:00:00.000Z", close: "2024-07-25T19:00:00.000Z" },
        { open: "2024-07-26T09:00:00.000Z", close: "2024-07-26T17:00:00.000Z" },
        { open: "2024-07-27T09:00:00.000Z", close: "2024-07-27T15:00:00.000Z" },
        { open: "2024-07-29T09:00:00.000Z", close: "2024-07-29T17:00:00.000Z" },
        { open: "2024-07-30T09:00:00.000Z", close: "2024-07-30T17:00:00.000Z" },
        { open: "2024-07-31T09:00:00.000Z", close: "2024-07-31T17:00:00.000Z" },
        { open: "2024-08-01T09:00:00.000Z", close: "2024-08-01T19:00:00.000Z" },
        { open: "2024-08-02T09:00:00.000Z", close: "2024-08-02T17:00:00.000Z" },
        { open: "2024-08-03T09:00:00.000Z", close: "2024-08-03T15:00:00.000Z" },
        { open: "2024-08-05T09:00:00.000Z", close: "2024-08-05T17:00:00.000Z" },
        { open: "2024-08-06T09:00:00.000Z", close: "2024-08-06T17:00:00.000Z" },
        { open: "2024-08-07T09:00:00.000Z", close: "2024-08-07T17:00:00.000Z" },
        { open: "2024-08-08T09:00:00.000Z", close: "2024-08-08T19:00:00.000Z" },
        { open: "2024-08-09T09:00:00.000Z", close: "2024-08-09T17:00:00.000Z" },
        { open: "2024-08-10T09:00:00.000Z", close: "2024-08-10T15:00:00.000Z" },
        { open: "2024-08-12T09:00:00.000Z", close: "2024-08-12T17:00:00.000Z" },
      ];

      expect(getNextOpeningDates(regularOpeningDays, [])).toStrictEqual(
        expectedNextOpeningDates
      );
    });

    it("correctly removes exceptional closures", () => {
      mockDateNow("2024-07-23T10:00:00.000Z");

      const expectedNextOpeningDates = [
        { open: "2024-07-23T09:00:00.000Z", close: "2024-07-23T17:00:00.000Z" },
        { open: "2024-07-24T09:00:00.000Z", close: "2024-07-24T17:00:00.000Z" },
        { open: "2024-07-25T09:00:00.000Z", close: "2024-07-25T19:00:00.000Z" },
        { open: "2024-07-26T09:00:00.000Z", close: "2024-07-26T17:00:00.000Z" },
        { open: "2024-07-27T09:00:00.000Z", close: "2024-07-27T15:00:00.000Z" },
        { open: "2024-07-30T09:00:00.000Z", close: "2024-07-30T17:00:00.000Z" },
        { open: "2024-07-31T09:00:00.000Z", close: "2024-07-31T17:00:00.000Z" },
        { open: "2024-08-01T09:00:00.000Z", close: "2024-08-01T19:00:00.000Z" },
        { open: "2024-08-02T09:00:00.000Z", close: "2024-08-02T17:00:00.000Z" },
        { open: "2024-08-03T09:00:00.000Z", close: "2024-08-03T15:00:00.000Z" },
        { open: "2024-08-05T09:00:00.000Z", close: "2024-08-05T17:00:00.000Z" },
        { open: "2024-08-06T09:00:00.000Z", close: "2024-08-06T17:00:00.000Z" },
        { open: "2024-08-07T09:00:00.000Z", close: "2024-08-07T17:00:00.000Z" },
        { open: "2024-08-08T09:00:00.000Z", close: "2024-08-08T19:00:00.000Z" },
        { open: "2024-08-09T09:00:00.000Z", close: "2024-08-09T17:00:00.000Z" },
        { open: "2024-08-10T09:00:00.000Z", close: "2024-08-10T15:00:00.000Z" },
        { open: "2024-08-12T09:00:00.000Z", close: "2024-08-12T17:00:00.000Z" },
      ];

      expect(
        getNextOpeningDates(regularOpeningDays, exceptionalClosedDays)
      ).toStrictEqual(expectedNextOpeningDates);
    });

    it("works 2 days before a closed day, between 11pm and midnight", () => {
      // the day name for "2024-07-26T23:30:00.000Z" is different whether we're in UTC or BST
      // this tests that Sunday is not mistaken for Monday
      mockDateNow("2024-07-26T23:30:00.000Z");
      // "2024-07-26T23:30:00.000Z" is "2024-07-27T00:30:00.000Z" BST so 1st day is the 27th
      const expectedNextOpeningDates = [
        { open: "2024-07-27T09:00:00.000Z", close: "2024-07-27T15:00:00.000Z" },
        { open: "2024-07-30T09:00:00.000Z", close: "2024-07-30T17:00:00.000Z" },
        { open: "2024-07-31T09:00:00.000Z", close: "2024-07-31T17:00:00.000Z" },
        { open: "2024-08-01T09:00:00.000Z", close: "2024-08-01T19:00:00.000Z" },
        { open: "2024-08-02T09:00:00.000Z", close: "2024-08-02T17:00:00.000Z" },
        { open: "2024-08-03T09:00:00.000Z", close: "2024-08-03T15:00:00.000Z" },
        { open: "2024-08-05T09:00:00.000Z", close: "2024-08-05T17:00:00.000Z" },
        { open: "2024-08-06T09:00:00.000Z", close: "2024-08-06T17:00:00.000Z" },
        { open: "2024-08-07T09:00:00.000Z", close: "2024-08-07T17:00:00.000Z" },
        { open: "2024-08-08T09:00:00.000Z", close: "2024-08-08T19:00:00.000Z" },
        { open: "2024-08-09T09:00:00.000Z", close: "2024-08-09T17:00:00.000Z" },
        { open: "2024-08-10T09:00:00.000Z", close: "2024-08-10T15:00:00.000Z" },
        { open: "2024-08-12T09:00:00.000Z", close: "2024-08-12T17:00:00.000Z" },
        { open: "2024-08-13T09:00:00.000Z", close: "2024-08-13T17:00:00.000Z" },
        { open: "2024-08-14T09:00:00.000Z", close: "2024-08-14T17:00:00.000Z" },
        { open: "2024-08-15T09:00:00.000Z", close: "2024-08-15T19:00:00.000Z" },
        { open: "2024-08-16T09:00:00.000Z", close: "2024-08-16T17:00:00.000Z" },
      ];

      expect(
        getNextOpeningDates(regularOpeningDays, exceptionalClosedDays)
      ).toStrictEqual(expectedNextOpeningDates);
    });
  });
});
