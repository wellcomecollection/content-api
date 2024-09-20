import * as prismic from "@prismicio/client";

import { CommonPrismicFields, InferDataInterface, PrismicFormat } from ".";
import { WithBody } from "./body";
import { WithContributors } from "./contributors";
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
