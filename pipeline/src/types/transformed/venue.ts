export type Venue = {
  type: "Venue";
  id: string;
  title: string;
  regularOpeningDays: {
    dayOfWeek: DayOfWeek;
    opens: string;
    closes: string;
    isClosed?: boolean;
  }[];
  exceptionalOpeningDays: {
    overrideDate: Date;
    opens: string;
    closes: string;
    isClosed?: boolean;
  }[];
};

type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wesdnesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
