import { PrismicDocument, RichTextField } from "@prismicio/types";

// These are the types we make addressable from Prismic
const contentTypes = [
  "articles",
  "books",
  "event-series",
  "events",
  "exhibitions",
  "guides",
  "pages",
  "projects",
  "seasons",
  "series",
  "webcomics",
  "guide-formats",
  "exhibition-guides",
  "stories-landing",
] as const;

export type ContentType = (typeof contentTypes)[number];

const ArticleFormatIds = {
  InPictures: "W5uKaCQAACkA3C0T",
  Article: "W7TfJRAAAJ1D0eLK",
  Comic: "W7d_ghAAALWY3Ujc",
  Podcast: "XwRZ6hQAAG4K-bbt",
  BookExtract: "W8CbPhEAAB8Nq4aG",
  LongRead: "YxcjgREAACAAkjBg",
};

export type ArticleFormatId =
  (typeof ArticleFormatIds)[keyof typeof ArticleFormatIds];

export type PrismicArticleFormat = PrismicDocument<
  {
    id: string;
    title: RichTextField;
  },
  "article-formats"
>;
