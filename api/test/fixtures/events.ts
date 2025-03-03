//
//    September 2022
// Su Mo Tu We Th Fr Sa
//              1  2  3
//  4  5  6  7  8  9 10
// 11 12 13 14 15 16 17
// 18 19 20 21 22 23 24
// 25 26 27 28 29 30
//
export type MockEvent = {
  title: string;
  times?: {
    startDateTime: Date;
    endDateTime?: Date;
  }[];
};

export const mockEvents: Record<string, MockEvent> = {
  'May exhibition with no end time (permanent)': {
    title: 'May exhibition with no end time (permanent)',
    times: [
      {
        startDateTime: new Date('2022-05-22T09:00:00.000+01:00'),
      },
    ],
  },
  'May to September exhibition': {
    title: 'May to September exhibition',
    times: [
      {
        startDateTime: new Date('2022-05-01T09:00:00.000+01:00'),
        endDateTime: new Date('2022-09-30T19:00:00.000+01:00'),
      },
    ],
  },
  'Repeated event (one every month)': {
    title: 'Repeated event (one every month)',
    times: [
      {
        startDateTime: new Date('2022-09-22T12:00:00.000Z'),
        endDateTime: new Date('2022-09-22T14:00:00.000Z'),
      },
      {
        startDateTime: new Date('2022-10-22T12:00:00.000Z'),
        endDateTime: new Date('2022-10-23T14:00:00.000Z'),
      },
      {
        startDateTime: new Date('2022-11-22T12:00:00.000Z'),
        endDateTime: new Date('2022-11-23T14:00:00.000Z'),
      },
    ],
  },
  //
  // Assuming today is 05/09/22
  //
  'Yesterday, 8-10am': {
    title: 'Yesterday, 8-10am',
    times: [
      {
        startDateTime: new Date('2022-09-04T09:00:00.000+01:00'),
        endDateTime: new Date('2022-09-04T11:00:00.000+01:00'),
      },
    ],
  },
  'Today, 4-5pm': {
    title: 'Today, 4-5pm',
    times: [
      {
        startDateTime: new Date('2022-09-05T17:00:00.000+01:00'),
        endDateTime: new Date('2022-09-05T18:00:00.000+01:00'),
      },
    ],
  },
  'Today, 1-3pm': {
    title: 'Today, 1-3pm',
    times: [
      {
        startDateTime: new Date('2022-09-05T14:00:00.000+01:00'),
        endDateTime: new Date('2022-09-05T16:00:00.000+01:00'),
      },
    ],
  },
  'Today, 8-10am': {
    title: 'Today, 8-10am',
    times: [
      {
        startDateTime: new Date('2022-09-05T09:00:00.000+01:00'),
        endDateTime: new Date('2022-09-05T11:00:00.000+01:00'),
      },
    ],
  },
  'Tomorrow, 8-10am': {
    title: 'Tomorrow, 8-10am',
    times: [
      {
        startDateTime: new Date('2022-09-06T09:00:00.000+01:00'),
        endDateTime: new Date('2022-09-06T11:00:00.000+01:00'),
      },
    ],
  },
  'Next Monday, 8-10am': {
    title: 'Next Monday, 8-10am',
    times: [
      {
        startDateTime: new Date('2022-09-12T09:00:00.000+01:00'),
        endDateTime: new Date('2022-09-12T11:00:00.000+01:00'),
      },
    ],
  },
};

export const mockEventsForToday: MockEvent[] = [
  mockEvents['May to September exhibition'],
  mockEvents['May exhibition with no end time (permanent)'],
  mockEvents['Yesterday, 8-10am'],
  mockEvents['Today, 8-10am'],
  mockEvents['Today, 1-3pm'],
  mockEvents['Today, 4-5pm'],
  mockEvents['Tomorrow, 8-10am'],
];

export const mockEventsForThisWeekend: MockEvent[] = [
  mockEvents['Next Monday, 8-10am'],
  mockEvents['May to September exhibition'],
  mockEvents['May exhibition with no end time (permanent)'],
  {
    title: 'Thursday to Saturday',
    times: [
      {
        startDateTime: new Date('2022-09-08T16:00:00.000+01:00'),
        endDateTime: new Date('2022-09-10T17:00:00.000+01:00'),
      },
    ],
  },
  {
    title: 'Friday, 4pm',
    times: [
      {
        startDateTime: new Date('2022-09-09T16:00:00.000+01:00'),
        endDateTime: new Date('2022-09-09T17:00:00.000+01:00'),
      },
    ],
  },
  {
    title: 'Friday, 5pm',
    times: [
      {
        startDateTime: new Date('2022-09-09T17:00:00.000+01:00'),
        endDateTime: new Date('2022-09-09T18:00:00.000+01:00'),
      },
    ],
  },
  {
    title: 'Saturday',
    times: [
      {
        startDateTime: new Date('2022-09-10T08:00:00.000+01:00'),
        endDateTime: new Date('2022-09-10T10:00:00.000+01:00'),
      },
    ],
  },
  {
    title: 'Sunday',
    times: [
      {
        startDateTime: new Date('2022-09-11T08:00:00.000+01:00'),
        endDateTime: new Date('2022-09-11T10:00:00.000+01:00'),
      },
    ],
  },
];

export const mockEventsForThisWeek: MockEvent[] = [
  mockEvents['May to September exhibition'],
  mockEvents['May exhibition with no end time (permanent)'],
  mockEvents['Yesterday, 8-10am'],
  mockEvents['Today, 8-10am'],
  mockEvents['Today, 1-3pm'],
  mockEvents['Today, 4-5pm'],
  mockEvents['Next Monday, 8-10am'],
];

export const mockEventsForThisMonth: MockEvent[] = [
  mockEvents['May to September exhibition'],
  mockEvents['May exhibition with no end time (permanent)'],
  mockEvents['Yesterday, 8-10am'],
  mockEvents['Today, 8-10am'],
  mockEvents['Today, 1-3pm'],
  mockEvents['Today, 4-5pm'],
  mockEvents['Repeated event (one every month)'],
  {
    title: 'Next month',
    times: [
      {
        startDateTime: new Date('2022-10-01T09:00:00.000+01:00'),
        endDateTime: new Date('2022-10-01T19:00:00.000+01:00'),
      },
    ],
  },
];

export const mockEventsForFuture: MockEvent[] = [
  mockEvents['May to September exhibition'],
  mockEvents['May exhibition with no end time (permanent)'],
  mockEvents['Yesterday, 8-10am'],
  mockEvents['Today, 8-10am'],
  mockEvents['Today, 1-3pm'],
  mockEvents['Today, 4-5pm'],
  mockEvents['Repeated event (one every month)'],
];
