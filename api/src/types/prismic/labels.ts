import { ArticleFormatId } from "./formats";

export type LabelField = {
    type: "ArticleFormat";
    id?: ArticleFormatId;
    title?: string;
  };
  