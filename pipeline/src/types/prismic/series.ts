import * as prismic from "@prismicio/client";
import { WithContributors } from "./contributors";

export type WithSeries = {
  series: Series;
};

type Series = prismicT.GroupField<{
  series: PrismicSeries;
}>;

type PrismicSeries = prismicT.RelationField<
  "webcomic-series" | "series",
  "en-gb",
  { title: prismicT.RichTextField } & WithContributors
>;
