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

export type Format<IdType extends string = string> = {
  id: IdType;
  label: string;
};
