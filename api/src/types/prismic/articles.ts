import {
  PrismicDocument,
  RelationField,
  RichTextField,
  TimestampField,
} from "@prismicio/types";
import {
  WithContributors,
  InferDataInterface,
  CommonPrismicFields,
  WithSeries,
  WithSeasons,
} from "..";

export type ArticleFormat = PrismicDocument<
  {
    type: "ArticleFormat";
    id: string;
    title: RichTextField;
  },
  "article-formats"
>;

type WithArticleFormat = {
  format: RelationField<
    "article-formats",
    "en-gb",
    InferDataInterface<ArticleFormat>
  >;
};

// TODO is this all needed?
export type ArticlePrismicDocument = PrismicDocument<
  {
    publishDate: TimestampField;
  } & WithSeries &
    WithContributors &
    WithSeasons &
    WithArticleFormat &
    CommonPrismicFields,
  "articles"
>;
