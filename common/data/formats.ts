// These are the types we make addressable from Prismic
export const contentTypes = [
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

export const articleFormatIds = {
  InPictures: "W5uKaCQAACkA3C0T",
  Article: "W7TfJRAAAJ1D0eLK",
  Comic: "W7d_ghAAALWY3Ujc",
  Podcast: "XwRZ6hQAAG4K-bbt",
  BookExtract: "W8CbPhEAAB8Nq4aG",
  LongRead: "YxcjgREAACAAkjBg",
};

export const defaultArticleFormat = {
  type: "ArticleFormat",
  id: "W7TfJRAAAJ1D0eLK",
  label: "Article",
};