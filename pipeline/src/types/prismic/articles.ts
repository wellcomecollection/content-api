import {
  PrismicDocument,
  RelationField,
  TimestampField,
} from "@prismicio/types";
import {
  WithContributors,
  WithBody,
  InferDataInterface,
  CommonPrismicFields,
  PrismicArticleFormat,
} from "..";
import { WithSeries } from "./series";

type WithArticleFormat = {
  format: RelationField<
    "article-formats",
    "en-gb",
    InferDataInterface<PrismicArticleFormat>
  >;
};

export type ArticlePrismicDocument = PrismicDocument<
  {
    publishDate: TimestampField;
  } & WithContributors &
    WithArticleFormat &
    WithBody &
    WithSeries &
    CommonPrismicFields,
  "articles" | "webcomics"
>;
