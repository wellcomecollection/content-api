import * as prismic from "@prismicio/client";
import { InferDataInterface, CommonPrismicFields, PrismicFormat } from ".";
import { WithContributors } from "./contributors";
import { WithBody } from "./body";
import { WithSeries } from "./series";

export type WithArticleFormat = {
  format: prismic.ContentRelationshipField<
    "article-formats",
    "en-gb",
    InferDataInterface<PrismicFormat>
  >;
};

export type ArticlePrismicDocument = prismic.PrismicDocument<
  {
    publishDate: prismic.TimestampField;
  } & WithContributors &
    WithArticleFormat &
    WithBody &
    WithSeries &
    CommonPrismicFields,
  "articles" | "webcomics"
>;
