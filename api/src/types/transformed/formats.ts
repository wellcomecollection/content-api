import { ArticleFormatId } from "..";

export type TransformedArticleFormat = {
  type: "ArticleFormat";
  id: ArticleFormatId;
  label?: string;
};
