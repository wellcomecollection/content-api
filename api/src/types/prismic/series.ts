import {
  GroupField,
  PrismicDocument,
  RelationField,
  RichTextField,
  SelectField,
  TimestampField,
} from "@prismicio/types";
import {
  WithContributors,
  WithSeasons,
  CommonPrismicFields,
  InferDataInterface,
} from "..";

type SeriesPrismicDocument = PrismicDocument<
  {
    color: SelectField<
      "accent.blue" | "accent.salmon" | "accent.green" | "accent.purple"
    >;
    schedule: GroupField<{
      title: RichTextField;
      publishDate: TimestampField;
    }>;
  } & WithContributors &
    WithSeasons &
    CommonPrismicFields,
  "series"
>;

export type WithSeries = {
  series: GroupField<{
    series: RelationField<
      "series",
      "en-gb",
      InferDataInterface<SeriesPrismicDocument>
    >;
  }>;
};
