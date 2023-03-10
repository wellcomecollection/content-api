import {
  GroupField,
  PrismicDocument,
  RelationField,
  TimestampField,
} from "@prismicio/types";
import { CommonPrismicFields, InferDataInterface } from "..";

type SeasonPrismicDocument = PrismicDocument<
  {
    start: TimestampField;
    end: TimestampField;
  } & CommonPrismicFields,
  "seasons"
>;

export type WithSeasons = {
  seasons: GroupField<{
    season: RelationField<
      "seasons",
      "en-gb",
      InferDataInterface<SeasonPrismicDocument>
    >;
  }>;
};
