import * as prismic from "@prismicio/client";

export type RegularOpeningDay = prismic.GroupField<{
  startDateTime: prismic.TimestampField | null;
  endDateTime: prismic.TimestampField | null;
}>;

export type ExceptionalOpeningDays = prismic.GroupField<{
  overrideDate: prismic.TimestampField;
  type: string | null;
  startDateTime: prismic.TimestampField | null;
  endDateTime: prismic.TimestampField | null;
}>;

export type VenuePrismicDocument = prismic.PrismicDocument<{
  title: string;
  monday: RegularOpeningDay;
  tuesday: RegularOpeningDay;
  wednesday: RegularOpeningDay;
  thursday: RegularOpeningDay;
  friday: RegularOpeningDay;
  saturday: RegularOpeningDay;
  sunday: RegularOpeningDay;
  modifiedDayOpeningTimes: ExceptionalOpeningDays;
}>;
