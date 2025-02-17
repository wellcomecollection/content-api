import parseDuration from 'parse-duration';

export type WindowEvent = {
  contentType: 'addressables' | 'articles' | 'events' | 'venues' | 'all';
  start?: string;
  end?: string;
  duration?: string;
};

export type TimeWindow = {
  start?: Date;
  end?: Date;
};

const dateOrUndefined = (str?: string): Date | undefined => {
  if (!str) {
    return undefined;
  }
  const d = new Date(str);
  if (isNaN(d.getTime())) {
    return undefined;
  }
  return d;
};

export const toBoundedWindow = (event: WindowEvent): TimeWindow => {
  const start = dateOrUndefined(event.start);
  const end = dateOrUndefined(event.end);
  if (event.duration) {
    // 900000 is the default duration as defined in infrastructure/pipeline_stack/scheduled_window_event.tf
    const durationMs = parseDuration(event.duration) || 900000;
    if (start) {
      return {
        start,
        end: new Date(start.getTime() + durationMs),
      };
    }
    if (end) {
      return {
        start: new Date(end.getTime() - durationMs),
        end,
      };
    }
    throw new Error(
      'Window duration must be specified alongside a start or end time'
    );
  }

  return { start, end };
};

export const describeWindow = ({ start, end }: TimeWindow): string => {
  if (start && end) {
    return `between ${start.toISOString()} and ${end.toISOString()}`;
  }
  if (start) {
    return `after ${start.toISOString()}`;
  }
  if (end) {
    return `before ${end?.toISOString()}`;
  }
  return 'at any time';
};
