export type Venue = {
  type: "Venue";
  id: string;
  title: string;
  regularOpeningDays: DisplayRegularOpeningDay[];
  exceptionalOpeningDays: DisplayExceptionalOpeningDays[];
};

export type DisplayRegularOpeningDay = {
  dayOfWeek: DayOfWeek;
  opens: string;
  closes: string;
  isClosed?: boolean;
};

export type DisplayExceptionalOpeningDays = {
  overrideDate: Date;
  type: string | null;
  startDateTime: string;
  endDateTime: string;
};

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
