import * as prismic from '@prismicio/client';

import {
  CommonPrismicFields,
  InferDataInterface,
  PrismicFormat,
  WithContributors,
} from '.';
import { WithSeries } from './series';

export type WithEventFormat = {
  format: prismic.ContentRelationshipField<
    'event-formats',
    'en-gb',
    InferDataInterface<PrismicFormat>
  >;
};

export type PrismicLocations = prismic.GroupField<{
  location: prismic.ContentRelationshipField<
    'places',
    'en-gb',
    { title: prismic.RichTextField }
  >;
}>;
type WithLocations = {
  isOnline: boolean;
  locations: PrismicLocations;
};

export type PrismicInterpretations = prismic.GroupField<{
  interpretationType: prismic.ContentRelationshipField<
    'interpretation-types',
    'en-gb',
    { title: prismic.RichTextField }
  >;
}>;
type WithInterpretations = {
  interpretations: PrismicInterpretations;
};

export type PrismicAudiences = prismic.GroupField<{
  audience: prismic.ContentRelationshipField<
    'audience',
    'en-gb',
    { title: prismic.RichTextField }
  >;
}>;
type WithAudiences = {
  audiences: PrismicAudiences;
};

export type PrismicScheduledEvent = prismic.GroupField<{
  event: prismic.ContentRelationshipField<
    'events',
    'en-gb',
    {
      title: prismic.RichTextField;
    } & WithLocations &
      WithInterpretations &
      WithAudiences &
      WithTimes
  >;
}>;
type WithSchedule = {
  schedule: PrismicScheduledEvent;
};

export type PrismicTimes = prismic.GroupField<{
  startDateTime: prismic.TimestampField;
  endDateTime: prismic.TimestampField;
  isFullyBooked: 'yes' | null;
  onlineIsFullyBooked: 'yes' | null;
}>;
type WithTimes = {
  times: PrismicTimes;
};

export type EventPrismicDocument = prismic.PrismicDocument<
  {
    availableOnline: boolean;
  } & WithEventFormat &
    WithLocations &
    WithTimes &
    WithInterpretations &
    WithSeries &
    WithAudiences &
    WithContributors &
    WithSchedule &
    CommonPrismicFields,
  'events'
>;
