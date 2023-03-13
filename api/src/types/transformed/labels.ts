import { ArticleFormatId } from "../prismic/formats";

export type LabelField = {
  type: "ArticleFormat";
  id?: ArticleFormatId;
  label?: string;
};
