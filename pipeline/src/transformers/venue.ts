import { asDate, TimestampField } from '@prismicio/client';

import {
  DayOfWeek,
  ElasticsearchVenue,
  ExceptionalClosedDay,
  RegularOpeningDay,
} from '@weco/content-common/types/venue';
import {
  PrismicExceptionalOpeningDays,
  PrismicRegularOpeningDay,
  VenuePrismicDocument,
} from '@weco/content-pipeline/src/types/prismic/venues';

export const transformVenue = (
  document: VenuePrismicDocument
): ElasticsearchVenue => {
  const {
    data: {
      title,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
      modifiedDayOpeningTimes,
    },
    id,
  } = document;

  const formatRegularOpeningDay = (
    day: DayOfWeek,
    openingTimes: PrismicRegularOpeningDay
  ): RegularOpeningDay => {
    const formatTime = (time: TimestampField | undefined): string => {
      return time
        ? `${asDate(time).getHours()}:${String(
            asDate(time).getMinutes()
          ).padStart(2, '0')}`
        : '00:00';
    };

    return {
      dayOfWeek: day,
      opens: formatTime(openingTimes[0]?.startDateTime),
      closes: formatTime(openingTimes[0]?.endDateTime),
      isClosed: !openingTimes[0]?.startDateTime,
    };
  };

  const formatExceptionalClosedDays = (
    modifiedDayOpeningTimes: PrismicExceptionalOpeningDays
  ): ExceptionalClosedDay[] => {
    return modifiedDayOpeningTimes.map(day => {
      if (!asDate(day.overrideDate)) {
        throw new Error('Date for modified opening time is not valid');
      }

      return {
        overrideDate: asDate(day.overrideDate)?.toISOString(),
        type: day.type,
        startDateTime: '00:00',
        endDateTime: '00:00',
      };
    });
  };

  const regularOpeningDays = [
    formatRegularOpeningDay('monday', monday),
    formatRegularOpeningDay('tuesday', tuesday),
    formatRegularOpeningDay('wednesday', wednesday),
    formatRegularOpeningDay('thursday', thursday),
    formatRegularOpeningDay('friday', friday),
    formatRegularOpeningDay('saturday', saturday),
    formatRegularOpeningDay('sunday', sunday),
  ];

  const exceptionalClosedDays = formatExceptionalClosedDays(
    modifiedDayOpeningTimes
  );

  return {
    id,
    display: {
      type: 'Venue',
      id,
      title,
      regularOpeningDays,
      exceptionalClosedDays,
    },
    data: {
      regularOpeningDays,
      exceptionalClosedDays,
    },
    filter: {
      title: [
        title,
        title
          .toLowerCase()
          .replace(/[èéêë]/g, 'e')
          .replace(/\s+/g, '-'),
      ],
      id,
    },
  };
};
