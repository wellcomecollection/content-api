import { PrismicImage } from "..";

// Main  article type
export type { Article, ArticleFormat } from "./article";

// Main eventDocument type
export type { EventDocument } from "./eventDocument";

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

export type QuerySeries = Array<{
  id: string;
  title?: string;
  contributors: string[];
}>;
