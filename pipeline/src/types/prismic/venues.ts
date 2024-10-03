import * as prismic from '@prismicio/client';

export type PrismicRegularOpeningDay = prismic.GroupField<{
  startDateTime: prismic.TimestampField | null;
  endDateTime: prismic.TimestampField | null;
}>;

export type PrismicExceptionalOpeningDays = prismic.GroupField<{
  overrideDate: prismic.TimestampField;
  type: string | null;
  startDateTime: prismic.TimestampField | null;
  endDateTime: prismic.TimestampField | null;
}>;

export type VenuePrismicDocument = prismic.PrismicDocument<{
  title: string;
  monday: PrismicRegularOpeningDay;
  tuesday: PrismicRegularOpeningDay;
  wednesday: PrismicRegularOpeningDay;
  thursday: PrismicRegularOpeningDay;
  friday: PrismicRegularOpeningDay;
  saturday: PrismicRegularOpeningDay;
  sunday: PrismicRegularOpeningDay;
  modifiedDayOpeningTimes: PrismicExceptionalOpeningDays;
}>;
