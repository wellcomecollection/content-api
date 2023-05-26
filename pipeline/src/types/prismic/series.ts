import * as prismicT from "@prismicio/types";
import { WithContributors } from "./contributors";

export type WithSeries = {
  series: Series;
};

type Series = GroupField<{
  series: PrismicSeries;
}>;

type PrismicSeries = RelationField<
  "webcomic-series" | "series",
  "en-gb",
  { title: RichTextField } & WithContributors
>;
