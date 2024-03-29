import { ArticleFormatId } from "../prismic";
import { Contributor, Image } from ".";

// Main article type
export type Article = {
  type: "Article";
  id: string;
  title: string;
  publicationDate: string;
  contributors: Contributor[];
  format: ArticleFormat;
  image?: Image;
  caption?: string;
};

// Article formats (e.g. webcomics, podcast, interview)
export type ArticleFormat = {
  type: "ArticleFormat";
  id: ArticleFormatId;
  label: string;
};
