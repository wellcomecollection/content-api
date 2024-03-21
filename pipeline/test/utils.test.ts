import { getNextOpeningDates } from "../src/transformers/utils";
import { DisplayRegularOpeningDay } from "./types/transformed/venue";

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
] as DisplayRegularOpeningDay[];

const exceptionalClosedDays = [
  {
    overrideDate: new Date("2024-03-28T00:00:00.000Z"),
    type: "Easter",
    startDateTime: "00:00",
    endDateTime: "00:00",
  },
  {
    overrideDate: new Date("2024-03-30T00:00:00.000Z"),
    type: "Easter",
    startDateTime: "00:00",
    endDateTime: "00:00",
  },
  {
    // this is during BST so 2024-03-31T23:00:00.000Z is 2024-04-01T00:00:00.BST
    overrideDate: new Date("2024-03-31T23:00:00.000Z"),
    type: "Easter",
    startDateTime: "00:00",
    endDateTime: "00:00",
  },
];

const mockDateNow = (dateToMock: string) => {
  jest.useFakeTimers().setSystemTime(new Date(dateToMock));
};

describe("getNextOpeningDates", () => {
  it("start the dateList at today + 1", () => {
    mockDateNow("2024-03-12T08:00:00.000Z");

    const expectedStart = {
      open: "2024-03-13T10:00:00.000Z",
      close: "2024-03-13T18:00:00.000Z",
    };

    expect(getNextOpeningDates(regularOpeningDays, [])[0]).toEqual(
      expectedStart
    );
  });

  it("works when there are no upcoming exceptional closures", () => {
    mockDateNow("2024-03-12T10:00:00.000Z");

    const expectedNextOpeningDates = [
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
      { open: "2024-04-02T09:00:00.000Z", close: "2024-04-02T17:00:00.000Z" },
    ];

    expect(getNextOpeningDates(regularOpeningDays, [])).toStrictEqual(
      expectedNextOpeningDates
    );
  });

  it("correctly removes exceptional closures", () => {
    mockDateNow("2024-03-12T10:00:00.000Z");

    const expectedNextOpeningDates = [
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
      { open: "2024-04-02T09:00:00.000Z", close: "2024-04-02T17:00:00.000Z" },
    ];

    expect(
      getNextOpeningDates(regularOpeningDays, exceptionalClosedDays)
    ).toStrictEqual(expectedNextOpeningDates);
  });
});
