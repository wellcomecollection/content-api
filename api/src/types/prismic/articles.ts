import {
  PrismicDocument,
  RelationField,
  RichTextField,
  TimestampField,
} from "@prismicio/types";
import { WithContributors, InferDataInterface, CommonPrismicFields } from "..";

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

export type ArticlePrismicDocument = PrismicDocument<
  {
    publishDate: TimestampField;
  } & WithContributors &
    WithArticleFormat &
    CommonPrismicFields,
  "articles" | "webcomics"
>;
