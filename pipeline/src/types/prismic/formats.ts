import * as prismic from "@prismicio/client";
import {
  articleFormatIds,
  contentTypes,
} from "@weco/content-common/data/formats";

export type ContentType = (typeof contentTypes)[number];

export type ArticleFormatId =
  (typeof articleFormatIds)[keyof typeof articleFormatIds];

export type PrismicArticleFormat = prismic.PrismicDocument<
  {
    title: prismic.RichTextField;
  },
  "article-formats"
>;
