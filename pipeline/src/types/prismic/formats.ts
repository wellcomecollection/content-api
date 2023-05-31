import * as prismicT from "@prismicio/types";
import {
  articleFormatIds,
  contentTypes,
} from "@weco/content-common/data/formats";

export type ContentType = (typeof contentTypes)[number];

export type ArticleFormatId =
  (typeof articleFormatIds)[keyof typeof articleFormatIds];

export type PrismicArticleFormat = prismicT.PrismicDocument<
  {
    title: prismicT.RichTextField;
  },
  "article-formats"
>;
