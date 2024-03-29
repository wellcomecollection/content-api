import { DateTime } from "luxon";

export type Venue = {
  type: "Venue";
  id: string;
  title: string;
  regularOpeningDays: DisplayRegularOpeningDay[];
  exceptionalClosedDays: DisplayExceptionalClosedDay[];
};

export type DisplayRegularOpeningDay = {
  dayOfWeek: DayOfWeek;
  opens: string;
  closes: string;
  isClosed: boolean;
};

export type DisplayExceptionalClosedDay = {
  overrideDate: Date | null;
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
