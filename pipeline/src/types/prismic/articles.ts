import * as prismicT from "@prismicio/types";
import {
  WithContributors,
  WithBody,
  InferDataInterface,
  CommonPrismicFields,
  PrismicArticleFormat,
} from "..";
import { WithSeries } from "./series";

type WithArticleFormat = {
  format: prismic.RelationField<
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
