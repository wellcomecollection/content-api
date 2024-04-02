import { mockedApi } from "./fixtures/api";

describe("GET /venues", () => {
  it("returns a venue with added nextOpeningDates", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-04-02T08:00:00.000Z"));

    const testId = "123";
    const api = mockedApi([
      { id: testId, display: venueDisplay, data: venueData },
    ]);

    const response = await api.get(`/venues`);
    expect(response.statusCode).toBe(200);
    expect(response.body.results[0]).toEqual({
      ...venueDisplay,
      nextOpeningDates: expectedNextOpeningDates,
    });
  });

  it("returns a 404 if no document for the given ID exists", async () => {
    const api = mockedApi([]);

    const response = await api.get(`/articles/123`);
    expect(response.statusCode).toBe(404);
  });
});

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
];

const exceptionalClosedDays = [
  {
    overrideDate: "2024-01-01T00:00:00.000Z",
    type: "Christmas and New Year",
    startDateTime: "00:00",
    endDateTime: "00:00",
  },
  {
    overrideDate: "2024-03-29T00:00:00.000Z",
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
    overrideDate: "2024-03-31T23:00:00.000Z",
    type: "Easter",
    startDateTime: "00:00",
    endDateTime: "00:00",
  },
];

const venueDisplay = {
  type: "Venue",
  id: "WsuS_R8AACS1Nwlx",
  title: "Library",
  regularOpeningDays,
  exceptionalClosedDays,
};

const venueData = {
  regularOpeningDays,
  exceptionalClosedDays,
};

const expectedNextOpeningDates = [
  {
    open: "2024-04-03T09:00:00.000Z",
    close: "2024-04-03T17:00:00.000Z",
  },
  {
    open: "2024-04-04T09:00:00.000Z",
    close: "2024-04-04T19:00:00.000Z",
  },
  {
    open: "2024-04-05T09:00:00.000Z",
    close: "2024-04-05T17:00:00.000Z",
  },
  {
    open: "2024-04-06T09:00:00.000Z",
    close: "2024-04-06T15:00:00.000Z",
  },
  {
    open: "2024-04-08T09:00:00.000Z",
    close: "2024-04-08T17:00:00.000Z",
  },
  {
    open: "2024-04-09T09:00:00.000Z",
    close: "2024-04-09T17:00:00.000Z",
  },
  {
    open: "2024-04-10T09:00:00.000Z",
    close: "2024-04-10T17:00:00.000Z",
  },
  {
    open: "2024-04-11T09:00:00.000Z",
    close: "2024-04-11T19:00:00.000Z",
  },
  {
    open: "2024-04-12T09:00:00.000Z",
    close: "2024-04-12T17:00:00.000Z",
  },
  {
    open: "2024-04-13T09:00:00.000Z",
    close: "2024-04-13T15:00:00.000Z",
  },
  {
    open: "2024-04-15T09:00:00.000Z",
    close: "2024-04-15T17:00:00.000Z",
  },
  {
    open: "2024-04-16T09:00:00.000Z",
    close: "2024-04-16T17:00:00.000Z",
  },
  {
    open: "2024-04-17T09:00:00.000Z",
    close: "2024-04-17T17:00:00.000Z",
  },
  {
    open: "2024-04-18T09:00:00.000Z",
    close: "2024-04-18T19:00:00.000Z",
  },
  {
    open: "2024-04-19T09:00:00.000Z",
    close: "2024-04-19T17:00:00.000Z",
  },
  {
    open: "2024-04-20T09:00:00.000Z",
    close: "2024-04-20T15:00:00.000Z",
  },
  {
    open: "2024-04-22T09:00:00.000Z",
    close: "2024-04-22T17:00:00.000Z",
  },
  {
    open: "2024-04-23T09:00:00.000Z",
    close: "2024-04-23T17:00:00.000Z",
  },
];
