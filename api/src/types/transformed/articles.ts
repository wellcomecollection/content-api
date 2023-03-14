import {
  TransformedArticleFormat,
  TransformedContributor,
  TransformedImage,
} from "..";

export type TransformedArticle = {
  type: "Article";
  id: string;
  title: string;
  publicationDate: Date;
  contributors: TransformedContributor[];
  format?: TransformedArticleFormat;
  image?: TransformedImage;
  caption?: string;
};
