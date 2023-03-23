// TODO keep?
import { ArticleFormatId, PrismicImage } from "../../../pipeline/src/types";

// Main article type
export type Article = {
  type: "Article";
  id: string;
  title: string;
  publicationDate: string;
  contributors: Contributor[];
  format?: ArticleFormat;
  image?: Image;
  caption?: string;
};

// Image
export type Image = PrismicImage & {
  type: "PrismicImage";
};

// Contributors (e.g. author, photographer)
type BasicContributorInformation = {
  id: string;
  label?: string;
};

export type Contributor = {
  type: "Contributor";
  contributor?: BasicContributorInformation & {
    type: "Person" | "Organisation";
  };
  role?: BasicContributorInformation & {
    type: "EditorialContributorRole";
  };
};

// Article formats (e.g. webcomics, podcast, interview)
export type ArticleFormat = {
  type: "ArticleFormat";
  id: ArticleFormatId;
  label?: string;
};

// Generic types
export type Displayable<T = any> = {
  display: T;
};

export type ResultList<Result> = {
  type: "ResultList";
  results: Result[];
  totalResults: number;
  totalPages: number;
  pageSize: number;
};
