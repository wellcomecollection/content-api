import { ArticleFormatId } from "..";

export type LabelField = {
  type: "ArticleFormat";
  id?: ArticleFormatId;
  label?: string;
};
