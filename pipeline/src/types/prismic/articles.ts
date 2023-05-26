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
  format: prismicT.RelationField<
    "article-formats",
    "en-gb",
    InferDataInterface<PrismicArticleFormat>
  >;
};

export type ArticlePrismicDocument = prismicT.PrismicDocument<
  {
    publishDate: prismicT.TimestampField;
  } & WithContributors &
    WithArticleFormat &
    WithBody &
    WithSeries &
    CommonPrismicFields,
  "articles" | "webcomics"
>;
