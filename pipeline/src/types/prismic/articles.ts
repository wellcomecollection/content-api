import * as prismic from "@prismicio/client";
import {
  WithContributors,
  WithBody,
  InferDataInterface,
  CommonPrismicFields,
  PrismicFormat,
} from "..";
import { WithSeries } from "./common/series";

type WithArticleFormat = {
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
