import {
  PrismicDocument,
  RelationField,
  TimestampField,
} from "@prismicio/types";
import {
  WithContributors,
  InferDataInterface,
  CommonPrismicFields,
  PrismicArticleFormat,
} from "..";

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
    CommonPrismicFields,
  "articles" | "webcomics"
>;
