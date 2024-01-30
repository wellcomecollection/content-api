import * as prismic from "@prismicio/client";
import { InferDataInterface, CommonPrismicFields, PrismicFormat } from ".";
import { WithSeries } from "./series";

export type WithEventFormat = {
  format: prismic.ContentRelationshipField<
    "event-formats",
    "en-gb",
    InferDataInterface<PrismicFormat>
  >;
};

export type WithLocations = {
  isOnline: boolean;
  locations: prismic.GroupField<{
    location: prismic.ContentRelationshipField<
      "places",
      "en-gb",
      { title: prismic.RichTextField }
    >;
  }>;
};

export type WithInterpretations = {
  interpretations: prismic.GroupField<{
    interpretationType: prismic.ContentRelationshipField<
      "interpretation-types",
      "en-gb",
      { title: prismic.RichTextField }
    >;
  }>;
};

export type WithAudiences = {
  audiences: prismic.GroupField<{
    audience: prismic.ContentRelationshipField<
      "audience",
      "en-gb",
      { title: prismic.RichTextField }
    >;
  }>;
};

export type EventPrismicDocument = prismic.PrismicDocument<
  {
    times: prismic.GroupField<{
      startDateTime: prismic.TimestampField;
      endDateTime: prismic.TimestampField;
      isFullyBooked: "yes" | null;
      onlineIsFullyBooked: "yes" | null;
    }>;
  } & WithEventFormat &
    WithLocations &
    WithInterpretations &
    WithSeries &
    WithAudiences &
    CommonPrismicFields,
  "events"
>;
