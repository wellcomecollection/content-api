import * as prismic from "@prismicio/client";
import {
  WithContributors,
  WithBody,
  InferDataInterface,
  CommonPrismicFields,
  PrismicArticleFormat,
} from "..";
import { WithSeries } from "./series";

type WithArticleFormat = {
  format: prismic.ContentRelationshipField<
    "article-formats",
    "en-gb",
    InferDataInterface<PrismicArticleFormat>
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
