import { RegularOpeningDay } from '@weco/content-common/types/venue';

export const regularOpeningDays = [
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

export const exceptionalClosedDays = [
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
