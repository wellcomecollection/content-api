export type ElasticsearchVenue = {
  id: string;
  display: Venue;
  data: {
    regularOpeningDays: RegularOpeningDay[];
    exceptionalClosedDays: ExceptionalClosedDay[];
  };
  filter: {
    title: string[];
    id: string;
  };
};

export type Venue = {
  type: 'Venue';
  id: string;
  title: string;
  regularOpeningDays: RegularOpeningDay[];
  exceptionalClosedDays: ExceptionalClosedDay[];
};

export type RegularOpeningDay = {
  dayOfWeek: DayOfWeek;
  opens: string;
  closes: string;
  isClosed: boolean;
};

export type ExceptionalClosedDay = {
  overrideDate: string | undefined;
  type: string | null;
  startDateTime: string;
  endDateTime: string;
};

export type NextOpeningDate = {
  open: string | undefined;
  close: string | undefined;
};

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';
