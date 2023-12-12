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

export type EventPrismicDocument = prismic.PrismicDocument<
  {
    times: prismic.GroupField<{
      startDateTime: prismic.TimestampField;
      endDateTime: prismic.TimestampField;
    }>;
  } & WithEventFormat &
    WithLocations &
    WithInterpretations &
    WithSeries &
    CommonPrismicFields,
  "events"
>;